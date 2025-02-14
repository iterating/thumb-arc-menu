import React, { createContext, useContext, useCallback, useMemo } from 'react';

const MenuContext = createContext();

export function MenuProvider({ children }) {
  // Define menu configurations for each page
  const menuConfigs = useMemo(() => ({
    home: [
      { id: 'add', icon: 'add', color: '#FF0000', action: () => console.log('add') },
      { id: 'edit', icon: 'edit', color: '#FF7F00', action: () => console.log('edit') },
      { id: 'delete', icon: 'delete', color: '#FFFF00', action: () => console.log('delete') },
      { id: 'share', icon: 'share', color: '#00FF00', action: () => console.log('share') },
      { id: 'favorite', icon: 'favorite', color: '#0000FF', action: () => console.log('favorite') },
      { id: 'settings', icon: 'settings', color: '#4B0082', action: () => console.log('settings') },
      { id: 'help', icon: 'help', color: '#9400D3', action: () => console.log('help') },
    ],
    mindset: [
      { id: 'psychology', icon: 'psychology', color: '#FF0000', action: () => console.log('psychology') },
      { id: 'self_improvement', icon: 'self_improvement', color: '#FF7F00', action: () => console.log('improve') },
      { id: 'lightbulb', icon: 'lightbulb', color: '#FFFF00', action: () => console.log('idea') },
      { id: 'emoji_objects', icon: 'emoji_objects', color: '#00FF00', action: () => console.log('insight') },
      { id: 'track_changes', icon: 'track_changes', color: '#0000FF', action: () => console.log('progress') },
    ],
    today: [
      { id: 'add_task', icon: 'add_task', color: '#FF0000', action: () => console.log('add task') },
      { id: 'event', icon: 'event', color: '#FF7F00', action: () => console.log('event') },
      { id: 'schedule', icon: 'schedule', color: '#FFFF00', action: () => console.log('schedule') },
      { id: 'notifications', icon: 'notifications', color: '#00FF00', action: () => console.log('notify') },
      { id: 'check_circle', icon: 'check_circle', color: '#0000FF', action: () => console.log('complete') },
    ],
    dreambuilder: [
      { id: 'cloud_queue', icon: 'cloud_queue', color: '#FF0000', action: () => console.log('new dream') },
      { id: 'edit_note', icon: 'edit_note', color: '#FF7F00', action: () => console.log('edit dream') },
      { id: 'visibility', icon: 'visibility', color: '#FFFF00', action: () => console.log('view') },
      { id: 'timeline', icon: 'timeline', color: '#00FF00', action: () => console.log('progress') },
      { id: 'stars', icon: 'stars', color: '#0000FF', action: () => console.log('achieve') },
    ],
    community: [
      { id: 'group_add', icon: 'group_add', color: '#FF0000', action: () => console.log('add member') },
      { id: 'forum', icon: 'forum', color: '#FF7F00', action: () => console.log('discuss') },
      { id: 'share', icon: 'share', color: '#FFFF00', action: () => console.log('share') },
      { id: 'message', icon: 'message', color: '#00FF00', action: () => console.log('message') },
      { id: 'diversity_3', icon: 'diversity_3', color: '#0000FF', action: () => console.log('connect') },
    ],
  }), []);

  const value = useMemo(() => ({
    menuConfigs,
  }), [menuConfigs]);

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
}
