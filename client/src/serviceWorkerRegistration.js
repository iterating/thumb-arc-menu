// This file registers our service worker

export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then(registration => {
          console.log('ServiceWorker registration successful');
          
          // Request notification permission while registering SW
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              console.log('Notification permission granted');
            }
          });
        })
        .catch(error => {
          console.error('ServiceWorker registration failed:', error);
        });
    });
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
      })
      .catch(error => {
        console.error(error.message);
      });
  }
}
