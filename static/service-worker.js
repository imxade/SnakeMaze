self.addEventListener('install', function(event) {
  self.skipWaiting(); // Skip waiting and activate immediately
  event.waitUntil(
    caches.open('Cache').then(function(cache) {
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

self.addEventListener('activate', function(event) {
  self.clients.claim(); // Take control of pages immediately
});

self.addEventListener('fetch', function(event) {
  self.clients.claim(); // Take control of pages immediately
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});

let deferredInstallPrompt = null;

self.addEventListener('beforeinstallprompt', (event) => {
  // Prevent the default prompt
  event.preventDefault();

  // Stash the event so it can be triggered later
  deferredInstallPrompt = event;

  // Optionally, you can customize the UI or behavior here
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'installApp' && deferredInstallPrompt) {
    // Show the installation prompt
    deferredInstallPrompt.prompt();

    // Wait for the user to respond to the prompt
    deferredInstallPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }

      // Reset deferredInstallPrompt for the next prompt
      deferredInstallPrompt = null;
    });
  }
});
