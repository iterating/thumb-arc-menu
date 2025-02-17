import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  const menuRef = useRef(null);

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
  const getAngleFromEvent = useCallback((e, menuRect) => {
    const centerX = menuRect.left + menuRect.width / 2;
    const centerY = menuRect.top + menuRect.height / 2;
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    return Math.atan2(clientY - centerY, clientX - centerX) * 180 / Math.PI;
  }, []);

  const handleRotationStart = useCallback((e) => {
    if (!isOpen) return;

    // Prevent default for both touch and mouse events
    e.preventDefault();
    
    const menu = menuRef.current;
    if (!menu) return;

    const menuRect = menu.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    const angle = getAngleFromEvent({ clientX, clientY }, menuRect);
    
    setIsDragging(true);
    setStartAngle(angle - rotation);
  }, [isOpen, rotation]);

  const handleRotationMove = useCallback((e) => {
    if (!isDragging) return;

    // Prevent default for both touch and mouse events
    e.preventDefault();

    const menu = menuRef.current;
    if (!menu) return;

    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    const menuRect = menu.getBoundingClientRect();
    const angle = getAngleFromEvent({ clientX, clientY }, menuRect);
    
    let newRotation = angle - startAngle;
    newRotation = ((newRotation % 360) + 360) % 360;
    
    setRotation(newRotation);
  }, [isDragging, startAngle]);

  const handleRotationEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add and remove event listeners
  useEffect(() => {
    const handleMove = (e) => {
      e.preventDefault();
      handleRotationMove(e);
    };

    const menu = menuRef.current;
    if (!menu) return;

    menu.addEventListener('touchmove', handleMove, { passive: false });
    menu.addEventListener('mousemove', handleMove);

    return () => {
      menu.removeEventListener('touchmove', handleMove);
      menu.removeEventListener('mousemove', handleMove);
    };
  }, [handleRotationMove]);

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
        ref={menuRef}
        className="menu-items"
        onMouseDown={handleRotationStart}
        onTouchStart={handleRotationStart}
        style={{ touchAction: 'none' }} // Prevent touch scrolling
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
