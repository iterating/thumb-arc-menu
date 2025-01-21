// Service to handle notifications across different platforms
class NotificationService {
  static async requestPermission() {
    // Check if the browser supports notifications
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    // Request permission if not already granted
    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return true;
  }

  static async showNotification(title, options = {}) {
    // Default options
    const defaultOptions = {
      body: '',
      icon: '/path/to/icon.png', // Add your icon path
      badge: '/path/to/badge.png', // Add your badge path
      vibrate: [200, 100, 200], // Vibration pattern for mobile
      tag: 'default', // Group similar notifications
      renotify: false, // Should new notifications replace old ones with the same tag
      requireInteraction: false, // Should notification remain until user interacts
      silent: false, // Should notification make a sound
      ...options
    };

    try {
      // Check/request permission
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        console.log('Notification permission denied');
        return false;
      }

      // Show notification
      const notification = new Notification(title, defaultOptions);

      // Handle notification clicks
      notification.onclick = function(event) {
        event.preventDefault();
        window.focus();
        notification.close();
      };

      return true;
    } catch (error) {
      console.error('Error showing notification:', error);
      return false;
    }
  }

  // Helper method for mobile devices using service workers
  static async showServiceWorkerNotification(title, options = {}) {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, options);
        return true;
      } catch (error) {
        console.error('Error showing service worker notification:', error);
        return false;
      }
    }
    return false;
  }

  // Show notification using the best available method
  static async notify(title, options = {}) {
    // Try service worker first (better for mobile)
    const swResult = await this.showServiceWorkerNotification(title, options);
    if (swResult) return true;

    // Fallback to regular notification
    return await this.showNotification(title, options);
  }
}

export default NotificationService;
