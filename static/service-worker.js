self.addEventListener('install', function(event) {
  self.skipWaiting(); // Skip waiting and activate immediately
  event.waitUntil(
    caches.open('snake-maze').then(function(cache) {
      return cache.addAll([
        '/',
        '/index.html',  
        '/script.js',
        '/style.css',
        '/static/manifest.json',
        '/static/service-worker.js',
      ]);
    })
  );
});

self.addEventListener('fetch', function(event) {
  self.clients.claim(); // Take control of pages immediately
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});

