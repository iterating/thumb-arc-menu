// Scheduler Monitor Worker - Watches for upcoming tasks
const CACHE_NAME = 'scheduler-v1';
let tasks = new Map();

// How often to check tasks (1 minute)
const CHECK_INTERVAL = 60 * 1000;

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Handle messages from the app
self.addEventListener('message', (event) => {
  const data = event.data;
  
  switch (data.type) {
    case 'SYNC_TASKS':
      // Receive tasks from SyncFusion scheduler
      syncTasks(data.tasks);
      break;
      
    case 'CLEAR_TASKS':
      tasks.clear();
      break;
  }
});

// Sync tasks from SyncFusion
function syncTasks(newTasks) {
  tasks.clear();
  newTasks.forEach(task => {
    tasks.set(task.Id, {
      id: task.Id,
      title: task.Subject,
      description: task.Description,
      startTime: new Date(task.StartTime),
      reminder: parseInt(task.Reminder || '15'), // Minutes before
      priority: task.Priority || 'normal'
    });
  });
}

// Start monitoring loop
setInterval(checkTasks, CHECK_INTERVAL);

// Check for tasks that need attention
function checkTasks() {
  const now = new Date();
  
  tasks.forEach((task, id) => {
    const reminderTime = new Date(task.startTime);
    reminderTime.setMinutes(reminderTime.getMinutes() - task.reminder);
    
    const timeDiff = reminderTime - now;
    
    // If it's time for the reminder (within the last minute)
    if (timeDiff <= 0 && timeDiff > -60000) {
      notifyTask(task);
    }
  });
}

// Send notification for a task
async function notifyTask(task) {
  const options = {
    title: task.title,
    body: task.description,
    icon: '/icon.png',
    badge: '/badge.png',
    tag: `task-${task.id}`,
    requireInteraction: task.priority === 'high',
    data: {
      taskId: task.id,
      startTime: task.startTime
    }
  };

  await self.registration.showNotification(options.title, options);
}
