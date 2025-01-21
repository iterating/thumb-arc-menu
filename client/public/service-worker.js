// Service Worker: runs in background, even when app is closed
const CACHE_NAME = 'thumb-arc-menu-v1';

// Listen for installation
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing');
  // Skip waiting for old service worker to finish
  self.skipWaiting();
});

// Listen for activation
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating');
  // Claim control immediately
  event.waitUntil(clients.claim());
});

// Listen for push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/icon.png',
    badge: '/badge.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/images/checkmark.png'
      },
      {
        action: 'close',
        title: 'Dismiss',
        icon: '/images/xmark.png'
      },
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Thumb Arc Menu', options)
  );
});

// Listen for notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    // Open the app and navigate to specific page
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        if (clientList.length > 0) {
          clientList[0].focus();
          clientList[0].navigate('/');
        } else {
          clients.openWindow('/');
        }
      })
    );
  }
});
