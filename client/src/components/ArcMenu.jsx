import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import './ArcMenu.css';

function ArcMenu() {
  const location = useLocation();
  const actionBarRef = useRef(null);
  const svgRef = useRef(null);
  const connectingPathRef = useRef(null);
  const debugArcPathRef = useRef(null);
  const debugIndicatorRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0 });

  // State for menu behavior
  const [isActive, setIsActive] = useState(false);
  const [debug, setDebug] = useState(false);
  const [pathPoints, setPathPoints] = useState([]);
  const [fittedPoints, setFittedPoints] = useState([]);
  const [menuButtons, setMenuButtons] = useState([]);
  const [circleState, setCircleState] = useState({
    centerX: null,
    centerY: null,
    radius: null,
    startAngle: null,
    endAngle: null
  });

  // Constants
  const DRAG_THRESHOLD = 10;
  const BUTTON_SIZE = 50;
  const MIN_BUTTON_SIZE = 30;
  const BUTTON_PADDING = 10;
  const MAX_ARC_RADIUS = 400;
  const MIN_POINTS_FOR_FIT = 5;

  // Get current route's menu items
  const getCurrentMenuItems = useCallback(() => {
    const path = location.pathname.slice(1) || 'home';
    return menuItems[path] || menuItems.home;
  }, [location]);

  // Circle fitting math
  const fitCircleToPoints = useCallback((points) => {
    if (points.length < MIN_POINTS_FOR_FIT) return null;

    // Calculate center and radius using least squares method
    let sumX = 0, sumY = 0, sumXX = 0, sumYY = 0, sumXY = 0;
    points.forEach(point => {
      sumX += point.x;
      sumY += point.y;
      sumXX += point.x * point.x;
      sumYY += point.y * point.y;
      sumXY += point.x * point.y;
    });

    const n = points.length;
    const meanX = sumX / n;
    const meanY = sumY / n;

    // Calculate circle parameters
    const centerX = meanX;
    const centerY = meanY;
    
    // Calculate average radius
    let radius = 0;
    points.forEach(point => {
      const dx = point.x - centerX;
      const dy = point.y - centerY;
      radius += Math.sqrt(dx * dx + dy * dy);
    });
    radius /= n;

    // Calculate start and end angles
    const startAngle = Math.atan2(points[0].y - centerY, points[0].x - centerX);
    const endAngle = Math.atan2(
      points[points.length - 1].y - centerY,
      points[points.length - 1].x - centerX
    );

    return { centerX, centerY, radius, startAngle, endAngle };
  }, []);

  // Update button positions based on circle state
  const updateButtonPositions = useCallback(() => {
    if (!circleState.centerX) return;

    const currentItems = getCurrentMenuItems();
    const numButtons = currentItems.length;
    const { centerX, centerY, radius, startAngle, endAngle } = circleState;

    // Calculate angle between buttons
    let totalAngle = endAngle - startAngle;
    if (totalAngle < 0) totalAngle += 2 * Math.PI;
    const angleStep = totalAngle / (numButtons - 1);

    // Position buttons along the arc
    const newButtons = currentItems.map((item, index) => {
      const angle = startAngle + angleStep * index;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      return {
        ...item,
        x,
        y,
        style: {
          position: 'absolute',
          left: x - BUTTON_SIZE / 2,
          top: y - BUTTON_SIZE / 2,
          transform: 'scale(1)',
          opacity: 1,
          transition: 'transform 0.3s, opacity 0.3s'
        }
      };
    });

    setMenuButtons(newButtons);
  }, [circleState, getCurrentMenuItems]);

  // Touch handlers
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    if (!touch) return;

    console.log('Touch Start:', {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
      touchCount: e.touches.length
    });

    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    setPathPoints([{ x: touch.clientX, y: touch.clientY }]);
  }, []);

  const handleTouchMove = useCallback((e) => {
    const touch = e.touches[0];
    if (!touch) return;

    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (!isActive && distance > DRAG_THRESHOLD) {
      console.log('Drag Started:', {
        startX: touchStartRef.current.x,
        startY: touchStartRef.current.y,
        currentX: touch.clientX,
        currentY: touch.clientY,
        distance,
        threshold: DRAG_THRESHOLD
      });
      setIsActive(true);
    }

    if (isActive) {
      console.log('Dragging:', {
        x: touch.clientX,
        y: touch.clientY,
        pathLength: pathPoints.length + 1,
        distance
      });
      
      setPathPoints(prev => [...prev, { x: touch.clientX, y: touch.clientY }]);
      const circle = fitCircleToPoints([...pathPoints, { x: touch.clientX, y: touch.clientY }]);
      if (circle) {
        setCircleState(circle);
      }
    }
  }, [isActive, pathPoints, fitCircleToPoints]);

  const handleTouchEnd = useCallback(() => {
    console.log('Touch End:', {
      x: touchStartRef.current.x,
      y: touchStartRef.current.y,
      timestamp: Date.now(),
      touchCount: 0
    });
    setIsActive(false);
    setPathPoints([]);
    setCircleState({
      centerX: null,
      centerY: null,
      radius: null,
      startAngle: null,
      endAngle: null
    });
    setMenuButtons([]);
  }, []);

  // Update buttons when circle state changes
  useEffect(() => {
    if (isActive && circleState.centerX !== null) {
      updateButtonPositions();
    }
  }, [isActive, circleState, updateButtonPositions]);

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
        style={{ opacity: isActive ? 0 : 1 }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <button className="action-item">📱</button>
        <button className="action-item">📍</button>
        <button className="action-item">📷</button>
        <button className="action-item">⚙️</button>
        <button className="action-item">➕</button>
      </div>

      {menuButtons.map((button, index) => (
        <button
          key={index}
          className="arc-menu-button"
          style={button.style}
          onClick={button.onClick}
        >
          {button.icon}
        </button>
      ))}

      <svg
        ref={svgRef}
        className="arc-menu-svg"
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
          className="connecting-path"
          style={{
            fill: 'none',
            stroke: 'rgba(255, 255, 255, 0.3)',
            strokeWidth: 2,
            filter: 'drop-shadow(0 0 2px rgba(0, 0, 0, 0.3))',
            opacity: 0,
            transition: 'opacity 0.2s'
          }}
        />
        <path
          ref={debugArcPathRef}
          className="debug-arc-path"
          style={{
            fill: 'none',
            stroke: '#FF6B00',
            strokeWidth: 3,
            strokeDasharray: '8,4',
            opacity: debug ? 1 : 0,
            filter: 'drop-shadow(0 0 3px rgba(255, 107, 0, 0.5))'
          }}
        />
      </svg>

      {debug && (
        <div
          ref={debugIndicatorRef}
          className="debug-indicator"
          style={{
            position: 'fixed',
            top: 10,
            right: 10,
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: 4,
            fontFamily: 'monospace',
            zIndex: 10000
          }}
        >
          DEBUG MODE
        </div>
      )}

      <div
        className="arc-menu-touch-area"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 9997,
          pointerEvents: 'none'
        }}
      />
    </>
  );
}

// Menu items configuration
const menuItems = {
  home: [
    { icon: '🔍', label: 'Search', onClick: () => console.log('Search') },
    { icon: '⭐', label: 'Favorite', onClick: () => console.log('Favorite') },
    { icon: '✏️', label: 'Edit', onClick: () => console.log('Edit') },
    { icon: '🗑️', label: 'Delete', onClick: () => console.log('Delete') },
    { icon: '📤', label: 'Share', onClick: () => console.log('Share') }
  ],
  mindset: [
    { icon: '🧠', label: 'Think', onClick: () => console.log('Think') },
    { icon: '📝', label: 'Note', onClick: () => console.log('Note') },
    { icon: '💡', label: 'Idea', onClick: () => console.log('Idea') },
    { icon: '🎯', label: 'Goal', onClick: () => console.log('Goal') },
    { icon: '📊', label: 'Progress', onClick: () => console.log('Progress') }
  ],
  today: [
    { icon: '➕', label: 'Add', onClick: () => console.log('Add') },
    { icon: '📅', label: 'Schedule', onClick: () => console.log('Schedule') },
    { icon: '⏰', label: 'Remind', onClick: () => console.log('Remind') },
    { icon: '✅', label: 'Complete', onClick: () => console.log('Complete') },
    { icon: '📊', label: 'Stats', onClick: () => console.log('Stats') }
  ],
  dreambuilder: [
    { icon: '☁️', label: 'Dream', onClick: () => console.log('Dream') },
    { icon: '📝', label: 'Plan', onClick: () => console.log('Plan') },
    { icon: '🎯', label: 'Target', onClick: () => console.log('Target') },
    { icon: '📊', label: 'Track', onClick: () => console.log('Track') },
    { icon: '🌟', label: 'Achieve', onClick: () => console.log('Achieve') }
  ],
  community: [
    { icon: '👥', label: 'Connect', onClick: () => console.log('Connect') },
    { icon: '💬', label: 'Chat', onClick: () => console.log('Chat') },
    { icon: '🤝', label: 'Share', onClick: () => console.log('Share') },
    { icon: '📢', label: 'Announce', onClick: () => console.log('Announce') },
    { icon: '🌟', label: 'Highlight', onClick: () => console.log('Highlight') }
  ]
};

export default ArcMenu;
