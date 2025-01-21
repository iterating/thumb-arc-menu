/**
 * Local Storage Implementation
 * Example storage provider that uses browser's localStorage
 */
export class LocalStorageProvider {
  constructor(prefix = 'timeline_') {
    this.prefix = prefix;
  }

  async saveTimeline(timeline) {
    const key = `${this.prefix}${timeline.timelineUuid}`;
    localStorage.setItem(key, JSON.stringify(timeline));
    
    // Update timeline index
    const index = this.getTimelineIndex();
    if (!index.includes(timeline.timelineUuid)) {
      index.push(timeline.timelineUuid);
      this.saveTimelineIndex(index);
    }
    
    return timeline;
  }

  async getTimeline(timelineUuid) {
    const key = `${this.prefix}${timelineUuid}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  async getAllTimelines() {
    const index = this.getTimelineIndex();
    return Promise.all(index.map(uuid => this.getTimeline(uuid)));
  }

  async deleteTimeline(timelineUuid) {
    const key = `${this.prefix}${timelineUuid}`;
    localStorage.removeItem(key);
    
    // Update timeline index
    const index = this.getTimelineIndex();
    const newIndex = index.filter(uuid => uuid !== timelineUuid);
    this.saveTimelineIndex(newIndex);
  }

  // Private methods for index management
  getTimelineIndex() {
    const index = localStorage.getItem(`${this.prefix}index`);
    return index ? JSON.parse(index) : [];
  }

  saveTimelineIndex(index) {
    localStorage.setItem(`${this.prefix}index`, JSON.stringify(index));
  }
}
