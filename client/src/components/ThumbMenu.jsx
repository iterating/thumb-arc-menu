import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useMenu } from '../contexts/MenuContext';
import './ThumbMenu.css';

function ThumbMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const location = useLocation();
  const { menuConfigs } = useMenu();

  // Get current page from path
  const currentPage = useMemo(() => {
    const path = location.pathname.slice(1) || 'home';
    return path;
  }, [location]);

  // Get menu items for current page
  const menuItems = useMemo(() => {
    return menuConfigs[currentPage] || [];
  }, [menuConfigs, currentPage]);

  // Calculate positions for menu items
  const getItemStyle = useCallback((index, total) => {
    if (!isOpen) return { transform: 'scale(0)' };
    
    const angle = (index * (360 / total)) - 90; // Start from top
    const radius = 100; // Distance from center
    const radian = (angle * Math.PI) / 180;
    const x = Math.cos(radian) * radius;
    const y = Math.sin(radian) * radius;

    return {
      transform: `translate(${x}px, ${y}px) scale(1)`,
      backgroundColor: menuItems[index].color,
      transitionDelay: `${index * 50}ms`
    };
  }, [isOpen, menuItems]);

  // Handle click outside to close menu
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (!e.target.closest('.thumb-menu')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  // Handle menu item selection
  const handleItemClick = useCallback((item) => {
    setSelectedItem(item);
    item.action();
    setIsOpen(false);
  }, []);

  return (
    <div className="thumb-menu">
      <button 
        className={`menu-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="material-icons">
          {isOpen ? 'close' : 'menu'}
        </span>
      </button>

      <div className="menu-items">
        {menuItems.map((item, index) => (
          <button
            key={item.id}
            className="menu-item"
            style={getItemStyle(index, menuItems.length)}
            onClick={() => handleItemClick(item)}
          >
            <span className="material-icons">{item.icon}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ThumbMenu;
