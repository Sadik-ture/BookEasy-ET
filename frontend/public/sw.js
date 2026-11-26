const CACHE = "bookeasy-shell-v1";
const SHELL = ["/", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;
  // Never cache private API data, uploads, or dashboard navigations as confirmed content.
  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/uploads")) return;
  if (url.pathname.startsWith("/workspace") || url.pathname.startsWith("/platform") || url.pathname.startsWith("/my-")) return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok && (url.pathname === "/" || url.pathname.endsWith(".svg") || url.pathname.endsWith(".css") || url.pathname.endsWith(".js"))) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match("/")))
  );
});
