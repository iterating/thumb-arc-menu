import { extend } from '@syncfusion/ej2-base';
import { ScheduleComponent, Day, Week, Month, Agenda } from '@syncfusion/ej2-react-schedule';

// Wrapper to combine SyncFusion scheduling with notifications
class SchedulerService {
  static scheduleObj = null;

  static initialize(scheduleRef) {
    this.scheduleObj = scheduleRef;
    
    // Add reminder handling
    if (this.scheduleObj) {
      this.scheduleObj.eventSettings.fields = {
        ...this.scheduleObj.eventSettings.fields,
        reminder: { name: 'Reminder', default: '15' } // 15 minutes default
      };
    }
  }

  // Add a task with notification
  static async addTask(task) {
    if (!this.scheduleObj) return;

    const scheduleData = {
      Id: task.id,
      Subject: task.title,
      Description: task.description,
      StartTime: new Date(task.scheduledTime),
      EndTime: new Date(task.scheduledTime), // For point-in-time tasks
      IsAllDay: false,
      Priority: task.priority,
      Reminder: task.reminder || '15', // Minutes before
      RecurrenceRule: task.recurring ? 'FREQ=DAILY' : null // Can be DAILY, WEEKLY, etc.
    };

    // Add to SyncFusion scheduler
    this.scheduleObj.addEvent([scheduleData]);

    // Request notification permission if needed
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Schedule notification
        const notifyTime = new Date(task.scheduledTime);
        notifyTime.setMinutes(notifyTime.getMinutes() - (task.reminder || 15));
        
        const timeDiff = notifyTime.getTime() - new Date().getTime();
        if (timeDiff > 0) {
          setTimeout(() => {
            new Notification(task.title, {
              body: task.description,
              requireInteraction: task.priority === 'high'
            });
          }, timeDiff);
        }
      }
    }
  }

  // Get upcoming tasks
  static getUpcomingTasks() {
    if (!this.scheduleObj) return [];
    
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59);

    return this.scheduleObj.getEvents(now, endOfDay);
  }

  // Cancel a task
  static cancelTask(taskId) {
    if (!this.scheduleObj) return;
    
    const events = this.scheduleObj.getEventById(taskId);
    if (events.length > 0) {
      this.scheduleObj.deleteEvent(events[0]);
    }
  }
}

export default SchedulerService;
