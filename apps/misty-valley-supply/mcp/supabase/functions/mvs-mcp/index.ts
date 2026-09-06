/**
 * Misty Valley Supply — MCP over HTTP, as a Supabase Edge Function.
 *
 * Port of src/http.js from node:http to the Deno fetch-handler style.
 * Stateless streamable-HTTP transport: a fresh McpServer and transport per
 * request, so any instance can serve any request — no sticky sessions.
 *
 * Routes (relative to the function base, https://<ref>.supabase.co/functions/v1/mvs-mcp):
 *   POST /mcp   (and POST /)              the MCP endpoint (optional bearer auth)
 *   GET  /health                          liveness
 *   GET  /.well-known/offer-manifest.json who we are, machine-readable
 *   GET  /api/catalog.json                the whole catalog
 *
 * Env:
 *   MCP_TOKEN   if set (via Supabase function secrets), POST /mcp requires
 *               `Authorization: Bearer <token>`. Unset = public.
 */

import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { toFetchResponse, toReqRes } from "fetch-to-node";
import { buildServer, CATALOG } from "./server.js";

const TOKEN = Deno.env.get("MCP_TOKEN") || "";
const STARTED = Date.now();
const BASE = "/functions/v1/mvs-mcp";

const MANIFEST = {
  name: "misty-valley-supply",
  version: "0.4.0",
  seller: CATALOG.seller,
  catalog_lines: CATALOG.products.length,
  categories: CATALOG.categories.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })),
  fulfilment: ["dropship", "fabricate"],
  ships: "US, Canada, Mexico — quote for rest of world",
  standards_indexed: [
    "ANSI/ISEA Z87.1", "ANSI/ISEA Z89.1", "ANSI/ISEA 105",
    "ANSI/ISEA 107", "ANSI/ASSP Z359", "OSHA 29 CFR 1926 subpart M",
  ],
  endpoints: {
    mcp: `${BASE}/mcp`,
    catalog: `${BASE}/api/catalog.json`,
    health: `${BASE}/health`,
  },
  transport: "streamable-http",
  auth: TOKEN ? "bearer" : "none",
  ordering: { requires_human_po: true, auto_execute: false },
  differentiator:
    "Every line carries the consensus standard and the OSHA citation as structured data. Call check_compliance.",
};

const CORS = { "access-control-allow-origin": "*" };

const json = (code: number, body: unknown, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body, null, 2), {
    status: code,
    headers: { "content-type": "application/json", ...CORS, ...extra },
  });

const rpcError = (code: number, httpCode: number, message: string) =>
  json(httpCode, { jsonrpc: "2.0", error: { code, message }, id: null });

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  // Strip the function base however the platform presents it, then normalize.
  let path = url.pathname
    .replace(/^\/functions\/v1/, "")
    .replace(/^\/mvs-mcp/, "")
    .replace(/\/+$/, "") || "/";

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        ...CORS,
        "access-control-allow-methods": "GET, POST, OPTIONS",
        "access-control-allow-headers":
          "content-type, authorization, mcp-session-id, mcp-protocol-version",
      },
    });
  }

  if (req.method === "GET" && path === "/health") {
    return json(200, {
      ok: true,
      lines: CATALOG.products.length,
      uptime_s: Math.round((Date.now() - STARTED) / 1000),
    });
  }
  if (req.method === "GET" && (path === "/.well-known/offer-manifest.json" || path === "/manifest")) {
    return json(200, MANIFEST, { "cache-control": "public, max-age=300" });
  }
  if (req.method === "GET" && path === "/api/catalog.json") {
    return json(200, CATALOG, { "cache-control": "public, max-age=300" });
  }
  if (req.method === "GET" && path === "/") {
    return json(200, {
      service: "misty-valley-supply MCP",
      post_to: `${BASE}/mcp`,
      see: [`${BASE}/health`, `${BASE}/.well-known/offer-manifest.json`, `${BASE}/api/catalog.json`],
    });
  }

  // POST to the function root is treated as the MCP endpoint too, so the bare
  // function URL works directly as an MCP server URL in clients.
  if (path !== "/mcp" && !(req.method === "POST" && path === "/")) {
    return json(404, { error: "not_found", path });
  }

  // MCP endpoint -----------------------------------------------------------
  if (TOKEN) {
    const auth = req.headers.get("authorization") || "";
    const given = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (given.length !== TOKEN.length || given !== TOKEN) {
      return rpcError(-32001, 401, "Unauthorized: send Authorization: Bearer <MCP_TOKEN>");
    }
  }

  if (req.method !== "POST") {
    return rpcError(-32000, 405, "Method not allowed. This endpoint is stateless; POST your JSON-RPC request.");
  }

  let body: unknown;
  try {
    const raw = await req.text();
    if (raw.length > 1_000_000) return rpcError(-32700, 400, "Parse error: payload too large");
    body = raw ? JSON.parse(raw) : undefined;
  } catch (e) {
    return rpcError(-32700, 400, `Parse error: ${(e as Error).message}`);
  }

  // Stateless: a fresh server + transport per request, so any instance can
  // serve any request. No sticky sessions, no shared mutable state.
  const { req: nodeReq, res: nodeRes } = toReqRes(req);
  const server = buildServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

  nodeRes.on("close", () => {
    transport.close?.();
    server.close?.();
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(nodeReq, nodeRes, body);
    return await toFetchResponse(nodeRes);
  } catch (e) {
    return rpcError(-32603, 500, `Internal error: ${(e as Error).message}`);
  }
});
