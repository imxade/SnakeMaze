if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/static/service-worker.js')
    .then(function(registration) {
      console.log('Service Worker registered with scope:', registration.scope);

      // Trigger the installation prompt from your application code
      registration.active.postMessage({ action: 'installApp' });
    })
    .catch(function(error) {
      console.error('Service Worker registration failed:', error);
    });
}
