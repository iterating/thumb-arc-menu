// Service to manage our notification worker
class WorkerService {
  static async registerWorker() {
    if ('serviceWorker' in navigator) {
      try {
        // Register notification worker
        const registration = await navigator.serviceWorker.register(
          '/notification-worker.js',
          { scope: '/' }
        );
        console.log('Notification worker registered');
        return registration;
      } catch (error) {
        console.error('Worker registration failed:', error);
        return null;
      }
    }
  }

  // Send a notification
  static async notify(notification) {
    const registration = await navigator.serviceWorker.ready;
    registration.active.postMessage({
      type: 'SHOW_NOTIFICATION',
      notification: {
        title: notification.title,
        body: notification.body,
        icon: notification.icon,
        tag: notification.tag,
        requireInteraction: notification.requireInteraction
      }
    });
  }
}

export default WorkerService;
