/**
 * Creates a storage interface with a specific prefix
 * @param {string} prefix - Prefix for all storage keys
 */
export const createStorage = (prefix = '') => ({
  /**
   * Get an item from storage
   * @param {string} key - Storage key
   * @returns {Promise<any>} - Parsed data or null
   */
  getItem: async (key) => {
    const fullKey = `${prefix}${key}`;
    const data = localStorage.getItem(fullKey);
    console.log('🔍 [genericStorage] Getting item:', { key: fullKey, value: data ? JSON.parse(data) : null });
    return data ? JSON.parse(data) : null;
  },

  /**
   * Set an item in storage
   * @param {string} key - Storage key
   * @param {any} value - Value to store (will be JSON stringified)
   * @returns {Promise<void>}
   */
  setItem: async (key, value) => {
    const fullKey = `${prefix}${key}`;
    console.log('💾 [genericStorage] Setting item:', { key: fullKey, value });
    localStorage.setItem(fullKey, JSON.stringify(value));
  },

  /**
   * Remove an item from storage
   * @param {string} key - Storage key
   * @returns {Promise<void>}
   */
  removeItem: async (key) => {
    const fullKey = `${prefix}${key}`;
    console.log('❌ [genericStorage] Removing item:', { key: fullKey });
    localStorage.removeItem(fullKey);
  },

  /**
   * Clear all items with this prefix
   * @returns {Promise<void>}
   */
  clear: async () => {
    console.log('🧹 [genericStorage] Clearing storage');
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    });
  }
});

// Create storage instances for different data types
export const kanbanStorage = createStorage('kanban_');
export const dreamStorage = createStorage('');  
export const userStorage = createStorage('user_');
