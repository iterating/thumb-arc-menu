// Notification Service Worker - Handles all types of notifications
const CACHE_NAME = 'notifications-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Handle incoming push notifications
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: data.icon || '/icon.png',
    badge: data.badge || '/badge.png',
    vibrate: data.vibrate || [200, 100, 200],
    tag: data.tag || 'default', // For grouping similar notifications
    data: {
      timestamp: Date.now(),
      type: data.type || 'general',
      url: data.url || '/'
    },
    actions: data.actions || [
      {
        action: 'view',
        title: 'View Now'
      },
      {
        action: 'dismiss',
        title: 'Later'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;
  const data = notification.data;

  notification.close();

  if (action === 'view') {
    // Open the specific URL if provided
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        if (clientList.length > 0) {
          clientList[0].focus();
          clientList[0].navigate(data.url);
        } else {
          clients.openWindow(data.url);
        }
      })
    );
  }
});
