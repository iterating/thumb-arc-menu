/**
 * Local Storage Implementation
 * Generic storage provider that uses browser's localStorage
 */
export class LocalStorageProvider {
  constructor(prefix = '') {
    this.prefix = prefix;
  }

  async setItem(key, value) {
    const storageKey = `${this.prefix}${key}`;
    localStorage.setItem(storageKey, JSON.stringify(value));
    return value;
  }

  async getItem(key) {
    const storageKey = `${this.prefix}${key}`;
    const data = localStorage.getItem(storageKey);
    return data ? JSON.parse(data) : null;
  }

  async removeItem(key) {
    const storageKey = `${this.prefix}${key}`;
    localStorage.removeItem(storageKey);
  }

  async clear() {
    // Only clear items with our prefix
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .forEach(key => localStorage.removeItem(key));
  }
}
