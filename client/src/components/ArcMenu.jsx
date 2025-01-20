import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import './ArcMenu.css';

const ArcMenu = () => {
  // Potentially unused imports/hooks
  const location = useLocation();

  // Core state we definitely need
  const [isActive, setIsActive] = useState(false);
  const [pathPoints, setPathPoints] = useState([]);
  const [pointCount, setPointCount] = useState(0);
  const [circleState, setCircleState] = useState({
    centerX: null,
    centerY: null,
    radius: null,
    startAngle: null,
    endAngle: null
  });

  // Potentially unused state
  const [lockedCircleState, setLockedCircleState] = useState(null);

  // Closing animation state
  const [isClosing, setIsClosing] = useState(false);

  // Core constants we definitely need
  const BUTTON_SIZE = 50;
  const SAMPLE_DISTANCE = 5;
  const DEBUG_PATH = false;  // Toggle gray connecting path only
  const DEBUG_ARC = true;  // Toggle orange arc path
  const MAX_POINTS = 100;  // Maximum number of points to store
  const MIN_MENU_ANGLE = Math.PI / 6;  // Minimum angle (in radians) to keep menu open (30 degrees)
  const CLOSE_ANIMATION_MS = 1000;  // Closing animation duration in milliseconds

  // Potentially unused constants
  const MIN_BUTTON_SIZE = 30;
  const BUTTON_PADDING = 10;

  // Core refs we definitely need
  const touchStartRef = useRef({ x: 0, y: 0 });
  const isMouseDownRef = useRef(false);
  const lastPointRef = useRef(null);
  const debugArcPathRef = useRef(null);
  const connectingPathRef = useRef(null);
  const svgRef = useRef(null);

  // Menu items
  const menuItems = [
    { icon: '🔍', label: 'Search', onClick: () => alert('Search clicked! Time to find something...') },
    { icon: '⭐', label: 'Favorite', onClick: () => alert('Added to favorites! Good choice!') },
    { icon: '✏️', label: 'Edit', onClick: () => alert('Edit mode activated! Make your changes...') },
    { icon: '🗑️', label: 'Delete', onClick: () => alert('Delete selected! Gone but not forgotten...') },
    { icon: '📤', label: 'Share', onClick: () => alert('Share menu opened! Spread the word!') }
  ];

  // Potentially unused helper functions
  const getDistance = useCallback((x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }, []);

  // Helper function to describe SVG arc path
  const describeArc = useCallback((x, y, radius, startAngle, endAngle) => {
    const angleDiff = Math.abs(endAngle - startAngle);
    const largeArcFlag = angleDiff > Math.PI ? 1 : 0;
    
    let sweepFlag = 1;
    if (endAngle < startAngle) sweepFlag = 0;

    const x1 = x + radius * Math.cos(startAngle);
    const y1 = y + radius * Math.sin(startAngle);
    const x2 = x + radius * Math.cos(endAngle);
    const y2 = y + radius * Math.sin(endAngle);

    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${x2} ${y2}`;
  }, []);

  // Core circle calculation
  const fitCircleToPoints = useCallback((startPoint, currentPoint) => {
    if (!startPoint || !currentPoint) return null;

    const dx = currentPoint.x - startPoint.x;
    const arcDirection = dx >= 0 ? 1 : -1;
    
    // Fixed circle center based on direction
    const centerX = arcDirection > 0 ? window.innerWidth + 300 : -300;
    const centerY = window.innerHeight + 300;

    // Calculate radius using start point (remains constant)
    const radius = Math.sqrt(
      Math.pow(centerX - startPoint.x, 2) + 
      Math.pow(centerY - startPoint.y, 2)
    );

    // Calculate angles
    const startAngle = Math.atan2(startPoint.y - centerY, startPoint.x - centerX);
    const endAngle = Math.atan2(currentPoint.y - centerY, currentPoint.x - centerX);

    return {
      centerX,
      centerY,
      radius,
      startAngle,
      endAngle
    };
  }, []);

  const handleMove = useCallback((e) => {
    if (!isActive) return;

    const currentX = e.clientX ?? e.touches?.[0]?.clientX;
    const rawY = e.clientY ?? e.touches?.[0]?.clientY;

    if (typeof currentX !== 'number' || typeof rawY !== 'number') return;

    // Calculate the minimum Y (highest point) for the current X position
    const dx = currentX - touchStartRef.current.x;
    const arcDirection = dx >= 0 ? 1 : -1;
    
    // Use the same circle center calculation as fitCircleToPoints
    const centerX = arcDirection > 0 ? window.innerWidth + 300 : -300;
    const centerY = window.innerHeight + 300;

    // Use the radius from circleState since it's fixed for this drag
    const { radius } = circleState;

    // Calculate the Y coordinate for this X position on the circle
    const dx2 = currentX - centerX;
    const r2 = radius * radius;
    const minY = centerY - Math.sqrt(r2 - dx2 * dx2);
    
    // Use the higher of minY or rawY to stay on or below the arc
    // AND never go below the start point
    const currentY = Math.min(
      touchStartRef.current.y,  // Never go below start point
      Math.max(minY, rawY)      // Never go above the arc
    );

    if (currentX < 0 || currentX > window.innerWidth || 
        currentY < 0 || currentY > window.innerHeight) {
      return;
    }

    const currentPoint = { x: currentX, y: currentY };
    const lastPoint = lastPointRef.current || touchStartRef.current;
    const distance = getDistance(currentX, currentY, lastPoint.x, lastPoint.y);
    
    if (distance >= SAMPLE_DISTANCE) {
      lastPointRef.current = currentPoint;
      
      // Only update circle state, skip path points for performance
      const circle = fitCircleToPoints(touchStartRef.current, currentPoint);
      if (circle) {
        setCircleState(circle);
      }
    }
  }, [isActive, getDistance, circleState]);

  // Core event handlers
  useEffect(() => {
    const handleTouchMove = (e) => {
      if (!isActive) return;
      e.preventDefault();
      handleMove(e.touches[0]);
    };

    const handleMouseMove = (e) => {
      if (!isActive || !isMouseDownRef.current) return;
      e.preventDefault();
      handleMove(e);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isActive, handleMove]);

  useEffect(() => {
    const handleTouchEnd = () => {
      console.log('Document touch end');
      isMouseDownRef.current = false;
      
      if (isActive) {
        const dragAngle = Math.abs(circleState?.endAngle - circleState?.startAngle) || 0;
        if (dragAngle >= MIN_MENU_ANGLE) {
          setLockedCircleState(circleState);
        } else {
          cleanup();
        }
      }
    };

    const handleMouseUp = () => {
      console.log('Document mouse up');
      isMouseDownRef.current = false;
      
      if (isActive) {
        const dragAngle = Math.abs(circleState?.endAngle - circleState?.startAngle) || 0;
        if (dragAngle >= MIN_MENU_ANGLE) {
          setLockedCircleState(circleState);
        } else {
          cleanup();
        }
      }
    };

    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isActive, circleState]);

  // Helper function to clean SVG paths
  const cleanSvgPaths = useCallback(() => {
    if (connectingPathRef.current) {
      connectingPathRef.current.setAttribute('d', '');
    }
    if (debugArcPathRef.current) {
      debugArcPathRef.current.setAttribute('d', '');
    }
  }, []);

  // Helper function to start cleanup animation
  const cleanup = useCallback(() => {
    cleanSvgPaths();
    setIsClosing(true);
    setIsActive(false);
  }, [cleanSvgPaths]);

  // Cleanup SVG on unmount
  useEffect(() => {
    return () => {
      cleanSvgPaths();
    };
  }, [cleanSvgPaths]);

  // Handle the closing animation completion
  useEffect(() => {
    if (isClosing) {
      const timer = setTimeout(() => {
        // Reset all state after animation
        setIsClosing(false);
        setLockedCircleState(null);
        setPathPoints([]);
        setPointCount(0);
        setCircleState({});
      }, CLOSE_ANIMATION_MS);
      return () => clearTimeout(timer);
    }
  }, [isClosing]);

  // Update button positions based on either active drag or locked state
  useEffect(() => {
    if (!isActive && !lockedCircleState && !isClosing) return;

    const currentState = isClosing ? circleState : (isActive ? circleState : lockedCircleState);
    
    // Safety check - if no valid state during animation, force cleanup
    if (!currentState?.endAngle || !currentState?.startAngle) {
      cleanup();
      return;
    }

    const { centerX, centerY, radius: radiusMult, startAngle, endAngle } = currentState;
    const angleDelta = (endAngle - startAngle) / (menuItems.length - 1);
    
    // Cache ALL trig calculations up front
    const angles = new Array(menuItems.length);
    angles[0] = startAngle;
    for (let i = 1; i < menuItems.length; i++) {
      angles[i] = angles[i-1] + angleDelta;
    }
    
    // Pre-calculate all cos/sin values
    const cosValues = angles.map(Math.cos);
    const sinValues = angles.map(Math.sin);

    const positions = menuItems.map((_, index) => {
      const x = centerX + radiusMult * cosValues[index];
      const y = centerY + radiusMult * sinValues[index];
      
      return {
        x: x,
        y: y,
        scale: isClosing ? 0 : 1  // Scale to 0 during closing
      };
    });

    const buttons = document.querySelectorAll('.arc-menu-button');
    
    buttons.forEach((button, index) => {
      const pos = positions[index];
      if (!pos) return;

      button.style.cssText = `
        position: fixed;
        width: ${BUTTON_SIZE}px;
        height: ${BUTTON_SIZE}px;
        left: ${isClosing ? touchStartRef.current.x : pos.x}px;
        top: ${isClosing ? touchStartRef.current.y : pos.y}px;
        transform: scale(${pos.scale});
        transition: ${isClosing ? `all ${CLOSE_ANIMATION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)` : 'none'};
        pointer-events: ${isClosing ? 'none' : 'auto'};
        background: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        cursor: pointer;
        font-size: 24px;
        z-index: 9999;
        opacity: ${isClosing ? 0 : 1};
      `;
    });
  }, [isActive, pathPoints, circleState, lockedCircleState, isClosing]);

  // Update SVG path
  useLayoutEffect(() => {
    if (!isActive || !circleState.centerX) {
      cleanSvgPaths();
      return;
    }

    const path = connectingPathRef.current;
    const arcPath = debugArcPathRef.current;
    if (!path || !arcPath) return;

    // Only draw paths if we're active and have points
    if (pathPoints.length > 0) {
      const pathD = pathPoints
        .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
        .join(' ');
      path.setAttribute('d', pathD);

      if (DEBUG_ARC && circleState.centerX) {
        const { centerX, centerY, radius, startAngle, endAngle } = circleState;
        const arcD = describeArc(centerX, centerY, radius, startAngle, endAngle);
        arcPath.setAttribute('d', arcD);
      }
    } else {
      cleanSvgPaths();
    }
  }, [isActive, pathPoints, circleState, cleanSvgPaths]);

  return (
    <>
      <div 
        className="action-bar"
        style={{ 
          opacity: isActive ? 0 : 1,
          pointerEvents: isActive ? 'none' : 'auto',
          transition: 'opacity 0.2s'
        }}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          if (!touch) return;

          touchStartRef.current = { x: touch.clientX, y: touch.clientY };
          setIsActive(true);
          setPathPoints([touchStartRef.current]);

          const startPoint = touchStartRef.current;
          const centerX = window.innerWidth + 300;
          const centerY = window.innerHeight + 300;
          
          // Calculate radius once at the start
          const radius = Math.sqrt(
            Math.pow(centerX - startPoint.x, 2) + 
            Math.pow(centerY - startPoint.y, 2)
          );
          const startAngle = Math.atan2(startPoint.y - centerY, startPoint.x - centerX);
          
          setCircleState({
            centerX,
            centerY,
            radius,  // Store radius in state
            startAngle,
            endAngle: startAngle
          });
        }}
        onMouseDown={(e) => {
          console.log('Action bar mouse down');
          isMouseDownRef.current = true;
          touchStartRef.current = { x: e.clientX, y: e.clientY };
          setIsActive(true);  
          setPathPoints([touchStartRef.current]);  

          const startPoint = touchStartRef.current;
          const centerX = window.innerWidth + 300;  
          const centerY = window.innerHeight + 300;
          const radius = Math.sqrt(
            Math.pow(centerX - startPoint.x, 2) + 
            Math.pow(centerY - startPoint.y, 2)
          );
          const startAngle = Math.atan2(startPoint.y - centerY, startPoint.x - centerX);
          
          setCircleState({
            centerX,
            centerY,
            radius,
            startAngle,
            endAngle: startAngle  
          });
        }}
      >
        <button className="action-item">📱</button>
        <button className="action-item">📍</button>
        <button className="action-item">📷</button>
        <button className="action-item">⚙️</button>
        <button className="action-item">➕</button>
      </div>

      {/* Show buttons during active drag, when locked open, or during closing animation */}
      {(isActive || lockedCircleState || isClosing) && menuItems.map((button, index) => (
        <button
          key={index}
          className="arc-menu-button"
          onClick={(e) => {
            cleanup();
            button.onClick(e);
          }}
        >
          {button.icon}
        </button>
      ))}

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
      />

      <svg
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
            opacity: DEBUG_PATH ? (isActive ? 1 : 0) : 0,
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
            opacity: DEBUG_ARC ? (isActive ? 1 : 0) : 0,
            filter: 'drop-shadow(0 0 3px rgba(255, 107, 0, 0.5))'
          }}
        />
      </svg>
    </>
  );
};

export default ArcMenu;
