self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('snake-maze').then(function(cache) {
      return cache.addAll([
        '/',
        '/index.html',  
        '/script.js',
        '/style.css',
      ]);
    })
  );
});
