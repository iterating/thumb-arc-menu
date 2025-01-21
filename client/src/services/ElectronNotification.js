// ElectronNotification.js
const { ipcRenderer } = window.require('electron');

class ElectronNotification {
  static async showNotification(title, options = {}) {
    // Use Electron's native notification API
    const notification = {
      title,
      body: options.body || '',
      icon: options.icon, // Path to icon file
      silent: options.silent || false,
      timeoutType: options.requireInteraction ? 'never' : 'default',
      urgency: options.urgency || 'normal', // 'normal', 'critical', or 'low'
    };

    // Send to main process to show notification
    ipcRenderer.send('show-notification', notification);

    // Listen for notification click
    ipcRenderer.once('notification-clicked', () => {
      if (options.onClick) {
        options.onClick();
      }
    });

    return true;
  }

  // Check if we're running in Electron
  static isElectron() {
    return window?.electron !== undefined;
  }

  // Show notification using the best available method
  static async notify(title, options = {}) {
    if (this.isElectron()) {
      return this.showNotification(title, options);
    } else {
      // Fallback to web notifications if not in Electron
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification(title, options);
          return true;
        }
      }
      return false;
    }
  }
}

export default ElectronNotification;
