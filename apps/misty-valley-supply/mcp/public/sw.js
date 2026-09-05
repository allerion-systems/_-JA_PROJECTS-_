/* Misty Valley Supply — offline shell.
   A cache-first shell for the app, network-first for everything else, so a
   phone on a roof with one bar still opens the app instead of a dinosaur. */
const V = "mvs-v1";
const SHELL = ["/", "/index.html", "/manifest.webmanifest", "/icon-192.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // never cache map tiles or Stripe

  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).catch(() => caches.match("/index.html").then(r => r || Response.error()))
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone();
      if (res.ok) caches.open(V).then(c => c.put(req, copy));
      return res;
    }).catch(() => caches.match("/index.html")))
  );
});
