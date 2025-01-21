const { app, BrowserWindow, Notification, ipcMain } = require('electron');

// ... other Electron setup code ...

// Handle notification requests from renderer
ipcMain.on('show-notification', (event, notificationOptions) => {
  // Use native OS notifications through Electron
  const notification = new Notification({
    ...notificationOptions,
    // Add any default options here
    closeButtonText: 'Close',
    // On Windows, the app's icon will be used automatically
  });

  notification.show();

  // Handle notification click
  notification.on('click', () => {
    event.sender.send('notification-clicked');
  });
});

// ... rest of your Electron app code ...
