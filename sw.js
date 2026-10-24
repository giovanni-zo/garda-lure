/* Garda Lure Simulator - PWA service worker
   Aggiornamenti facili: il file HTML usa network-first, quindi quando carichi una nuova versione su GitHub Pages l'app prova sempre a prendere la versione online piu' recente. */
const CACHE_NAME = "garda-lure-pwa-v9.2-combination-types";
const APP_SHELL = [
  "./", "./index.html", "./manifest.webmanifest",
  "./assets/garda-3d.css", "./assets/lure-selector.js?v=5.1",
  "./assets/recommendation-engine.js?v=9.2", "./assets/lure-selector.css?v=4.2",
  "./assets/lure-types.js?v=9.1.1", "./assets/simple-fishing.js?v=9.2", "./assets/simple-fishing.css?v=6.4",
  "./assets/liquid-glass.css?v=7.2", "./assets/lure-colors.js?v=9.1.1", "./assets/fishing-weather.js?v=7.2", "./assets/fishing-techniques.js?v=9.2", "./assets/presentations.css?v=9.1",
  "./assets/garda-lake-data.js?v=6.3", "./assets/garda-map.js?v=6.6",
  "./assets/lake-garda-v6.glb?v=6.1", "./vendor/model-viewer.min.js",
  "./assets/illustrations/spybait-low-poly-v9.png?v=9.1", "./icon-192.png", "./icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith("garda-lure-pwa-") && key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Pagine HTML: network-first. Cosi' gli update pubblicati online arrivano subito.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put("./index.html", copy));
          return response;
        })
        .catch(() => caches.match(request).then(cached => cached || caches.match("./index.html")))
    );
    return;
  }

  // File locali: cache-first con aggiornamento in background.
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(request).then(cached => {
        const update = fetch(request).then(async response => {
          const copy = response.clone();
          if (response.ok) await caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        }).catch(() => cached);
        event.waitUntil(update.then(() => undefined));
        return cached || update;
      })
    );
  }
});
