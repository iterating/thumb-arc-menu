import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useMenu } from '../contexts/MenuContext';
import './ThumbMenu.css';

function ThumbMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startAngle, setStartAngle] = useState(0);
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
    
    const angle = (index * (360 / total)) + rotation - 90; // Include rotation offset
    const radius = 100; // Distance from center
    const radian = (angle * Math.PI) / 180;
    const x = Math.cos(radian) * radius;
    const y = Math.sin(radian) * radius;

    return {
      transform: `translate(${x}px, ${y}px) scale(1)`,
      backgroundColor: menuItems[index].color,
      transitionDelay: `${index * 50}ms`,
      transition: isDragging ? 'none' : 'transform 0.3s ease'
    };
  }, [isOpen, menuItems, rotation, isDragging]);

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

  // Handle rotation
  const handleMouseDown = useCallback((e) => {
    if (!isOpen) return;
    
    const menuRect = e.currentTarget.getBoundingClientRect();
    const centerX = menuRect.left + menuRect.width / 2;
    const centerY = menuRect.top + menuRect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;
    
    setIsDragging(true);
    setStartAngle(angle - rotation);
  }, [isOpen, rotation]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    const menuRect = e.currentTarget.getBoundingClientRect();
    const centerX = menuRect.left + menuRect.width / 2;
    const centerY = menuRect.top + menuRect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;
    
    setRotation(angle - startAngle);
  }, [isDragging, startAngle]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add and remove event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mouseleave', handleMouseUp);
    } else {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [isDragging, handleMouseUp]);

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

      <div 
        className="menu-items"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
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
