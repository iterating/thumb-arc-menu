import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import './ArcMenu.css';

const ArcMenu = () => {
  const location = useLocation();
  
  // State
  const [isActive, setIsActive] = useState(false);
  const [pathPoints, setPathPoints] = useState([]);
  const [menuButtons, setMenuButtons] = useState([]);
  const [circleState, setCircleState] = useState({
    centerX: null,
    centerY: null,
    radius: null,
    startAngle: null,
    endAngle: null
  });

  // Refs
  const actionBarRef = useRef(null);
  const svgRef = useRef(null);
  const connectingPathRef = useRef(null);
  const debugArcPathRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const isMouseDownRef = useRef(false);
  const holdTimerRef = useRef(null);

  // Constants
  const DRAG_THRESHOLD = 10;
  const BUTTON_SIZE = 50;
  const MIN_BUTTON_SIZE = 30;
  const BUTTON_PADDING = 10;
  const HOLD_DURATION = 400;

  // Menu items configuration
  const menuItems = {
    home: [
      { icon: '🔍', label: 'Search', onClick: () => alert('Search clicked!') },
      { icon: '⭐', label: 'Favorite', onClick: () => alert('Favorited!') },
      { icon: '✏️', label: 'Edit', onClick: () => alert('Edit mode!') },
      { icon: '🗑️', label: 'Delete', onClick: () => alert('Deleted!') },
      { icon: '📤', label: 'Share', onClick: () => alert('Shared!') }
    ],
    mindset: [
      { icon: '🧠', label: 'Think', onClick: () => alert('Thinking...') },
      { icon: '📝', label: 'Note', onClick: () => alert('Taking notes...') },
      { icon: '🎯', label: 'Focus', onClick: () => alert('Focusing...') },
      { icon: '💡', label: 'Idea', onClick: () => alert('New idea!') },
      { icon: '🌟', label: 'Inspire', onClick: () => alert('Inspired!') }
    ],
    today: [
      { icon: '📅', label: 'Schedule', onClick: () => alert('Checking schedule...') },
      { icon: '✅', label: 'Complete', onClick: () => alert('Task completed!') },
      { icon: '⏰', label: 'Reminder', onClick: () => alert('Setting reminder...') },
      { icon: '📊', label: 'Progress', onClick: () => alert('Viewing progress...') },
      { icon: '🎉', label: 'Celebrate', onClick: () => alert('Great job!') }
    ],
    dreambuilder: [
      { icon: '🌈', label: 'Dream', onClick: () => alert('Dreaming big!') },
      { icon: '🎨', label: 'Create', onClick: () => alert('Creating...') },
      { icon: '🚀', label: 'Launch', onClick: () => alert('Launching...') },
      { icon: '🎯', label: 'Target', onClick: () => alert('Setting goals...') },
      { icon: '💫', label: 'Achieve', onClick: () => alert('Achievement unlocked!') }
    ],
    community: [
      { icon: '👥', label: 'Connect', onClick: () => alert('Connecting...') },
      { icon: '💬', label: 'Chat', onClick: () => alert('Opening chat...') },
      { icon: '🤝', label: 'Share', onClick: () => alert('Sharing...') },
      { icon: '📢', label: 'Announce', onClick: () => alert('Announcing...') },
      { icon: '❤️', label: 'Support', onClick: () => alert('Supporting...') }
    ]
  };

  // Get current route's menu items
  const getCurrentMenuItems = useCallback(() => {
    const path = location.pathname.slice(1) || 'home';
    return menuItems[path] || menuItems.home;
  }, [location]);

  // Circle fitting math
  const fitCircleToPoints = useCallback((points) => {
    if (!points || points.length < 5) return null;

    // Take three points: start, middle, and end
    const startPoint = points[0];
    const midPoint = points[Math.floor(points.length / 2)];
    const endPointForFit = points[points.length - 1];
    
    // Calculate vectors from start to mid and mid to end
    const dx1 = midPoint.x - startPoint.x;
    const dy1 = midPoint.y - startPoint.y;
    const dx2 = endPointForFit.x - midPoint.x;
    const dy2 = endPointForFit.y - midPoint.y;
    
    // Avoid tiny movements
    if (Math.abs(dx1) < 0.01 && Math.abs(dy1) < 0.01) return null;
    if (Math.abs(dx2) < 0.01 && Math.abs(dy2) < 0.01) return null;
    
    // Find perpendicular vector to create center point
    const perpX = -dy2;  // Perpendicular to the curve direction
    const perpY = dx2;
    const perpLength = Math.sqrt(perpX * perpX + perpY * perpY);

    // Detect arc direction if not set
    const dx = endPointForFit.x - startPoint.x;
    const arcDirection = Math.sign(dx);
    
    // Calculate distance from midpoint to desired center
    // This should be large enough to place center off screen
    const desiredRadius = arcDirection > 0 ? 
        window.innerWidth + 100 - midPoint.x : 
        midPoint.x + 100;
        
    // Calculate center point
    const centerX = midPoint.x + (perpX / perpLength) * desiredRadius * (arcDirection > 0 ? 1 : -1);
    const centerY = midPoint.y + (perpY / perpLength) * desiredRadius * (arcDirection > 0 ? 1 : -1);
    
    // Calculate radius based on distance to points
    const radius = Math.sqrt(
        (centerX - midPoint.x) * (centerX - midPoint.x) +
        (centerY - midPoint.y) * (centerY - midPoint.y)
    );
    
    // Calculate angles
    const startAngle = Math.atan2(startPoint.y - centerY, startPoint.x - centerX);
    const endAngle = Math.atan2(endPointForFit.y - centerY, endPointForFit.x - centerX);
    
    // Adjust end angle based on direction to ensure proper arc
    let adjustedEndAngle = endAngle;
    if (arcDirection > 0 && startAngle > endAngle) {
        adjustedEndAngle += 2 * Math.PI;
    } else if (arcDirection < 0 && endAngle > startAngle) {
        adjustedEndAngle -= 2 * Math.PI;
    }

    return {
        centerX,
        centerY,
        radius,
        startAngle,
        endAngle: adjustedEndAngle
    };
  }, []);

  // Reset all state
  const resetState = useCallback(() => {
    setIsActive(false);
    setPathPoints([]);
    setMenuButtons([]);
    setCircleState({
      centerX: null,
      centerY: null,
      radius: null,
      startAngle: null,
      endAngle: null
    });
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    isMouseDownRef.current = false;
  }, []);

  // Document-level event handlers
  useEffect(() => {
    const handleTouchMove = (e) => {
      const touch = e.touches[0];
      if (!touch) return;

      if (!isActive) {
        const dx = touch.clientX - touchStartRef.current.x;
        const dy = touch.clientY - touchStartRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        console.log('Distance:', distance, 'Threshold:', DRAG_THRESHOLD);

        if (distance > DRAG_THRESHOLD) {
          console.log('🌈 Activating menu from drag');
          setIsActive(true);
          setPathPoints([{ x: touchStartRef.current.x, y: touchStartRef.current.y }]);
          if (holdTimerRef.current) {
            clearTimeout(holdTimerRef.current);
            holdTimerRef.current = null;
          }
        }
      }

      if (isActive) {
        setPathPoints(prev => [...prev, { x: touch.clientX, y: touch.clientY }]);
        const circle = fitCircleToPoints([...pathPoints, { x: touch.clientX, y: touch.clientY }]);
        if (circle) {
          setCircleState(circle);
        }
      }
    };

    const handleTouchEnd = () => {
      console.log('Document touch end');
      resetState();
    };

    const handleMouseMove = (e) => {
      if (!isMouseDownRef.current) return;

      if (!isActive) {
        const dx = e.clientX - touchStartRef.current.x;
        const dy = e.clientY - touchStartRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > DRAG_THRESHOLD) {
          setIsActive(true);
          setPathPoints([{ x: touchStartRef.current.x, y: touchStartRef.current.y }]);
          if (holdTimerRef.current) {
            clearTimeout(holdTimerRef.current);
            holdTimerRef.current = null;
          }
        }
      }

      if (isActive) {
        setPathPoints(prev => [...prev, { x: e.clientX, y: e.clientY }]);
        const circle = fitCircleToPoints([...pathPoints, { x: e.clientX, y: e.clientY }]);
        if (circle) {
          setCircleState(circle);
        }
      }
    };

    const handleMouseUp = () => {
      console.log('Document mouse up');
      isMouseDownRef.current = false;
      resetState();
    };

    // Add document-level event listeners
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isActive, pathPoints, resetState, fitCircleToPoints]);

  // Action bar event handlers
  const handleTouchStart = useCallback((e) => {
    console.log('Action bar touch start');
    const touch = e.touches[0];
    if (!touch) return;

    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    
    // Create hold timer
    holdTimerRef.current = setTimeout(() => {
      console.log('Hold timer activated');
      setIsActive(true);
      setPathPoints([{ x: touch.clientX, y: touch.clientY }]);
    }, HOLD_DURATION);
  }, []);

  const handleMouseDown = useCallback((e) => {
    console.log('Action bar mouse down');
    isMouseDownRef.current = true;
    touchStartRef.current = { x: e.clientX, y: e.clientY };
    
    holdTimerRef.current = setTimeout(() => {
      console.log('Hold timer activated');
      setIsActive(true);
      setPathPoints([{ x: e.clientX, y: e.clientY }]);
    }, HOLD_DURATION);
  }, []);

  // Handle touch/mouse move
  const handleMove = useCallback((e) => {
    if (!isActive) return;

    const currentX = e.clientX || (e.touches && e.touches[0].clientX);
    const currentY = e.clientY || (e.touches && e.touches[0].clientY);

    // Only add points if we've moved enough
    if (pathPoints.length > 0) {
      const lastPoint = pathPoints[pathPoints.length - 1];
      const dx = currentX - lastPoint.x;
      const dy = currentY - lastPoint.y;
      if (dx * dx + dy * dy < 25) return;
    }

    // Add point to path
    const newPoints = [...pathPoints, { x: currentX, y: currentY }];
    setPathPoints(newPoints);

    // Calculate circle fit if we have enough points
    if (newPoints.length >= 5) {
      const circle = fitCircleToPoints(newPoints);
      if (circle) {
        setCircleState(circle);
      }
    }
  }, [isActive, pathPoints, fitCircleToPoints]);

  // Update buttons when circle state changes
  useEffect(() => {
    if (!isActive || !circleState.radius) {
      setMenuButtons([]);
      return;
    }

    const buttons = getCurrentMenuItems().map((item, index) => {
      const angle = circleState.startAngle + (index / (getCurrentMenuItems().length - 1)) * (circleState.endAngle - circleState.startAngle);
      return {
        ...item,
        x: circleState.centerX + circleState.radius * Math.cos(angle),
        y: circleState.centerY + circleState.radius * Math.sin(angle)
      };
    });
    setMenuButtons(buttons);
  }, [circleState, isActive, getCurrentMenuItems]);

  // Update SVG path
  useEffect(() => {
    if (!connectingPathRef.current) return;

    if (pathPoints.length > 1) {
      const pathD = pathPoints
        .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
        .join(' ');
      connectingPathRef.current.setAttribute('d', pathD);
      connectingPathRef.current.style.opacity = '1';
    } else {
      connectingPathRef.current.style.opacity = '0';
    }
  }, [pathPoints]);

  // Debug arc path
  useEffect(() => {
    if (!debugArcPathRef.current || !circleState.centerX) return;

    const { centerX, centerY, radius, startAngle, endAngle } = circleState;
    let sweepFlag = 1;
    if (endAngle < startAngle) sweepFlag = 0;

    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    const arcPath = `M ${x1} ${y1} A ${radius} ${radius} 0 0 ${sweepFlag} ${x2} ${y2}`;
    debugArcPathRef.current.setAttribute('d', arcPath);
  }, [circleState]);

  return (
    <>
      <div 
        ref={actionBarRef} 
        className="action-bar"
        style={{ 
          opacity: isActive ? 0 : 1,
          pointerEvents: isActive ? 'none' : 'auto',
          transition: 'opacity 0.2s'
        }}
        onTouchStart={handleTouchStart}
        onMouseDown={handleMouseDown}
      >
        <button className="action-item">📱</button>
        <button className="action-item">📍</button>
        <button className="action-item">📷</button>
        <button className="action-item">⚙️</button>
        <button className="action-item">➕</button>
      </div>

      {/* Only show menu buttons when active */}
      {isActive && menuButtons.map((button, index) => (
        <button
          key={index}
          className="arc-menu-button"
          style={{
            transform: `translate(${button.x}px, ${button.y}px)`,
            opacity: isActive ? 1 : 0,
            transition: 'transform 0.3s, opacity 0.2s'
          }}
          onClick={button.onClick}
        >
          {button.icon}
        </button>
      ))}

      {/* Touch area - only active when menu is active */}
      <div
        className="arc-menu-touch-area"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 9997,
          pointerEvents: isActive ? 'auto' : 'none'
        }}
        onTouchMove={handleMove}
        onMouseMove={handleMove}
      />

      {/* SVG for visualization */}
      <svg
        ref={svgRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 9998
        }}
      >
        <path
          ref={connectingPathRef}
          style={{
            fill: 'none',
            stroke: 'rgba(255, 255, 255, 0.3)',
            strokeWidth: 2,
            filter: 'drop-shadow(0 0 2px rgba(0, 0, 0, 0.3))',
            opacity: isActive ? 1 : 0,
            transition: 'opacity 0.2s'
          }}
        />
        <path
          ref={debugArcPathRef}
          style={{
            fill: 'none',
            stroke: '#FF6B00',
            strokeWidth: 3,
            strokeDasharray: '8,4',
            opacity: isActive ? 1 : 0,
            filter: 'drop-shadow(0 0 3px rgba(255, 107, 0, 0.5))'
          }}
        />
      </svg>
    </>
  );
};

export default ArcMenu;
