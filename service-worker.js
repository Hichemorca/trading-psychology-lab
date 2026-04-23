// service-worker.js - TradingPsych Lab PWA
const CACHE_NAME = 'tradingpsych-v1.1.0';
const ASSETS_TO_CACHE = [
  '/trading-psychology-lab/',
  '/trading-psychology-lab/index.html',
  '/trading-psychology-lab/style.css',
  '/trading-psychology-lab/script.js',
  '/trading-psychology-lab/orca-logo.png',
  '/trading-psychology-lab/orca-logo-192.png',
  '/trading-psychology-lab/orca-logo-512.png',
  '/trading-psychology-lab/about.html',
  '/trading-psychology-lab/contact.html',
  '/trading-psychology-lab/privacy.html',
  '/trading-psychology-lab/terms.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('chrome-extension') || 
      event.request.url.includes('api.telegram.org') ||
      event.request.url.includes('github.com')) {
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/trading-psychology-lab/');
          }
        });
      })
  );
});