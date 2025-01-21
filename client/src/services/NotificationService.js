// NotificationService.js - Platform agnostic notification service
class NotificationService {
  static async requestPermission() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return true;
  }

  static async notify(title, options = {}) {
    // Default options that work well in browsers
    const defaultOptions = {
      body: options.body || '',
      icon: options.icon || '/icon.png', // Your app icon
      requireInteraction: options.requireInteraction || false,
      silent: options.silent || false,
      tag: options.tag, // For grouping notifications
    };

    try {
      // Check permission
      const hasPermission = await this.requestPermission();
      if (!hasPermission) return false;

      // Show notification
      const notification = new Notification(title, defaultOptions);

      // Handle click
      notification.onclick = () => {
        window.focus();
        notification.close();
        if (options.onClick) options.onClick();
      };

      return true;
    } catch (error) {
      console.error('Notification error:', error);
      return false;
    }
  }

  // Example usage methods
  static async notifyNewCard(cardTitle) {
    return this.notify('New Card Added', {
      body: `"${cardTitle}" was added to your board`,
      requireInteraction: false,
      tag: 'new-card'
    });
  }

  static async notifyTaskComplete(taskName) {
    return this.notify('Task Complete', {
      body: `"${taskName}" was marked as complete`,
      requireInteraction: false,
      tag: 'task-complete'
    });
  }

  static async notifyReminder(reminderText) {
    return this.notify('Reminder', {
      body: reminderText,
      requireInteraction: true, // This one stays until user interacts
      tag: 'reminder'
    });
  }
}

export default NotificationService;
