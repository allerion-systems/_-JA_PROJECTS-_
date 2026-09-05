#!/usr/bin/env node
/**
 * Misty Valley Supply — MCP over HTTP.
 *
 * Stateless streamable-HTTP transport: a fresh server and transport per
 * request, which is what lets this run behind a load balancer or on a
 * scale-to-zero container without sticky sessions.
 *
 *   POST /mcp                          the MCP endpoint (bearer auth)
 *   GET  /health                       liveness
 *   GET  /.well-known/offer-manifest.json   who we are, machine-readable
 *   GET  /api/catalog.json             the whole catalog
 *
 * Env:
 *   PORT        default 8080
 *   MCP_TOKEN   if set, POST /mcp requires `Authorization: Bearer <token>`
 */

import { createServer } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { buildServer, CATALOG } from "./server.js";

const PORT = Number(process.env.PORT || 8080);
const TOKEN = process.env.MCP_TOKEN || "";

const MANIFEST = {
  name: "misty-valley-supply",
  version: "0.1.0",
  seller: CATALOG.seller,
  catalog_lines: CATALOG.products.length,
  categories: CATALOG.categories.map((c) => ({ id: c.id, name: c.name })),
  fulfilment: ["dropship", "fabricate"],
  ships: "US, Canada, Mexico — quote for rest of world",
  standards_indexed: [
    "ANSI/ISEA Z87.1", "ANSI/ISEA Z89.1", "ANSI/ISEA 105",
    "ANSI/ISEA 107", "ANSI/ASSP Z359", "OSHA 29 CFR 1926 subpart M",
  ],
  endpoints: { mcp: "/mcp", catalog: "/api/catalog.json", health: "/health" },
  transport: "streamable-http",
  auth: TOKEN ? "bearer" : "none",
  ordering: { requires_human_po: true, auto_execute: false },
  differentiator:
    "Every line carries the consensus standard and the OSHA citation as structured data. Call check_compliance.",
};

const json = (res, code, body, extra = {}) => {
  const s = JSON.stringify(body, null, 2);
  res.writeHead(code, {
    "content-type": "application/json",
    "content-length": Buffer.byteLength(s),
    "access-control-allow-origin": "*",
    ...extra,
  });
  res.end(s);
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > 1_000_000) { reject(new Error("payload too large")); req.destroy(); return; }
      chunks.push(c);
    });
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve(undefined);
      try { resolve(JSON.parse(raw)); } catch (e) { reject(e); }
    });
    req.on("error", reject);
  });

const rpcError = (res, code, httpCode, message) =>
  json(res, httpCode, { jsonrpc: "2.0", error: { code, message }, id: null });

export const handler = async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const path = url.pathname.replace(/\/+$/, "") || "/";

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, POST, OPTIONS",
      "access-control-allow-headers": "content-type, authorization, mcp-session-id, mcp-protocol-version",
    });
    return res.end();
  }

  if (req.method === "GET" && path === "/health") {
    return json(res, 200, { ok: true, lines: CATALOG.products.length, uptime_s: Math.round(process.uptime()) });
  }
  if (req.method === "GET" && (path === "/.well-known/offer-manifest.json" || path === "/manifest")) {
    return json(res, 200, MANIFEST, { "cache-control": "public, max-age=300" });
  }
  if (req.method === "GET" && path === "/api/catalog.json") {
    return json(res, 200, CATALOG, { "cache-control": "public, max-age=300" });
  }
  if (req.method === "GET" && path === "/") {
    return json(res, 200, {
      service: "misty-valley-supply MCP",
      post_to: "/mcp",
      see: ["/health", "/.well-known/offer-manifest.json", "/api/catalog.json"],
    });
  }

  if (path !== "/mcp") return json(res, 404, { error: "not_found", path });

  // MCP endpoint -----------------------------------------------------------
  if (TOKEN) {
    const auth = req.headers.authorization || "";
    const given = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    // constant-ish comparison; tokens are short and this is not a timing-critical path
    if (given.length !== TOKEN.length || given !== TOKEN) {
      return rpcError(res, -32001, 401, "Unauthorized: send Authorization: Bearer <MCP_TOKEN>");
    }
  }

  if (req.method !== "POST") {
    return rpcError(res, -32000, 405, "Method not allowed. This endpoint is stateless; POST your JSON-RPC request.");
  }

  let body;
  try {
    body = await readBody(req);
  } catch (e) {
    return rpcError(res, -32700, 400, `Parse error: ${e.message}`);
  }

  // Stateless: a fresh server + transport per request, so any instance can
  // serve any request. No sticky sessions, no shared mutable state.
  const server = buildServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

  res.on("close", () => { transport.close?.(); server.close?.(); });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, body);
  } catch (e) {
    if (!res.headersSent) rpcError(res, -32603, 500, `Internal error: ${e.message}`);
    else res.end();
  }
};

const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  createServer(handler).listen(PORT, "0.0.0.0", () => {
    process.stderr.write(
      `misty-valley-supply MCP on :${PORT} — auth ${TOKEN ? "bearer" : "OFF (set MCP_TOKEN)"} — ` +
      `${CATALOG.products.length} lines\n`
    );
  });
}
