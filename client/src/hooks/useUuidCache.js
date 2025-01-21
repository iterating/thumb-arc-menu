import { useState, useCallback, useRef } from 'react';

/**
 * Hook for caching and persisting UUID-based objects
 * @param {string} storageKey - Key to use in storage
 * @param {Object} storage - Storage provider object with getItem/setItem methods
 */
export const useUuidCache = (storageKey, storage) => {
  // Global cache shared between all instances
  const globalCache = useRef(window._uuidCache = window._uuidCache || new Map());
  const [, forceUpdate] = useState({});

  // Get an entity by UUID
  const get = useCallback(async (uuid) => {
    // Check global cache first
    if (globalCache.current.has(uuid)) {
      console.log('[useUuidCache] Cache hit:', { key: storageKey, uuid });
      return globalCache.current.get(uuid);
    }

    console.log('[useUuidCache] Cache miss:', { key: storageKey, uuid });
    
    try {
      // Try loading individual item first
      const key = `${storageKey}_${uuid}`;
      console.log('[useUuidCache] Loading from storage:', { key });
      const entity = await storage.getItem(key);
      console.log('[useUuidCache] Individual load result:', { key, uuid, entity });
      
      if (entity) {
        console.log('[useUuidCache] Setting cache from individual:', { key, uuid, entity });
        globalCache.current.set(uuid, entity);
        forceUpdate({});
        return entity;
      }
      
      // Fall back to collection
      console.log('[useUuidCache] Loading collection:', { key: storageKey });
      const data = await storage.getItem(storageKey) || {};
      console.log('[useUuidCache] Collection load result:', { key: storageKey, data });
      const collectionEntity = data[uuid];
      
      if (collectionEntity) {
        console.log('[useUuidCache] Setting cache from collection:', { key: storageKey, uuid, entity: collectionEntity });
        globalCache.current.set(uuid, collectionEntity);
        forceUpdate({});
        return collectionEntity;
      }
      
      console.log('[useUuidCache] Entity not found:', { key: storageKey, uuid });
      return null;
    } catch (error) {
      console.error('[useUuidCache] Load error:', { key: storageKey, uuid, error });
      return null;
    }
  }, [storage, storageKey]);

  // Save an entity
  const save = useCallback(async (entity) => {
    if (!entity.uuid) {
      console.error('[useUuidCache] Missing UUID:', { key: storageKey, entity });
      throw new Error('Entity must have a UUID');
    }

    console.log('[useUuidCache] Saving entity:', { key: storageKey, uuid: entity.uuid, entity });
    
    try {
      // Save to individual storage
      const key = `${storageKey}_${entity.uuid}`;
      console.log('[useUuidCache] Saving to storage:', { key, entity });
      await storage.setItem(key, entity);
      
      // Update cache
      console.log('[useUuidCache] Updating cache:', { key: storageKey, uuid: entity.uuid, entity });
      globalCache.current.set(entity.uuid, entity);
      forceUpdate({});
      
      return entity;
    } catch (error) {
      console.error('[useUuidCache] Save error:', { key: storageKey, uuid: entity.uuid, error });
      throw error;
    }
  }, [storage, storageKey]);

  // Delete an entity
  const remove = useCallback(async (uuid) => {
    const data = await storage.getItem(storageKey) || {};
    delete data[uuid];
    
    // Update global cache
    globalCache.current.delete(uuid);
    forceUpdate({});
    
    await storage.setItem(storageKey, data);
    console.log('[useUuidCache] Removed from storage:', { key: storageKey, uuid });
  }, [storage, storageKey]);

  // Get all entities
  const getAll = useCallback(async () => {
    const data = await storage.getItem(storageKey) || {};
    console.log('[useUuidCache] Getting all entities:', { key: storageKey, count: Object.keys(data).length });
    
    // Update global cache
    Object.entries(data).forEach(([uuid, entity]) => {
      globalCache.current.set(uuid, entity);
    });
    forceUpdate({});
    
    return Object.values(data);
  }, [storage, storageKey]);

  // Clear the cache
  const clearCache = useCallback(() => {
    globalCache.current.clear();
    forceUpdate({});
  }, []);

  return {
    get,
    save,
    remove,
    getAll,
    clearCache,
    cache: globalCache.current // Expose the global cache
  };
};
