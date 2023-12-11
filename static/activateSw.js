if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/static/service-worker.js')
    .then(function(registration) {
      console.log('Service Worker registered with scope:', registration.scope);

      // Wait for the service worker to be activated before triggering the prompt
      if (registration.active) {
        registration.active.postMessage({ action: 'installApp' });
      } else {
        console.error('Service Worker is not yet active.');
      }
    })
    .catch(function(error) {
      console.error('Service Worker registration failed:', error);
    });
}
