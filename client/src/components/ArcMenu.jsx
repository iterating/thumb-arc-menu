import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import './ArcMenu.css';

const ArcMenu = () => {
  const location = useLocation();
  
  // State variables matching original code
  const [isActive, setIsActive] = useState(false);
  const [pathPoints, setPathPoints] = useState([]);  // Raw user input points
  const [fittedPoints, setFittedPoints] = useState([]); // Points that lie on the circle
  const [debugPoints, setDebugPoints] = useState([]); // Debug visualization points
  const [buttons, setButtons] = useState([]);
  const [goodPointCount, setGoodPointCount] = useState(0);
  const [badPointCount, setBadPointCount] = useState(0);
  const [circleState, setCircleState] = useState({
    centerX: null,
    centerY: null,
    radius: null,
    startAngle: null,
    endAngle: null
  });
  const [lockedCircleState, setLockedCircleState] = useState(null);

  // Constants matching original code
  const BUTTON_SIZE = 50;
  const MIN_BUTTON_SIZE = 30;
  const BUTTON_PADDING = 10;
  const MIN_POINTS_FOR_FIT = 5;
  const MAX_DEVIATION = 30;
  const DEVIATION_THRESHOLD = 0.5;
  const MIN_POINTS_FOR_DIRECTION = 10;
  const HOLD_DURATION = 400;

  // Refs matching original code
  const touchStartRef = useRef({ x: 0, y: 0 });
  const isMouseDownRef = useRef(false);
  const arcDirectionRef = useRef(null);
  const lastFitTimeRef = useRef(0);
  const fitThrottleMs = useRef(100);
  const lastCheckedPointIndexRef = useRef(0);
  const debugIndicatorRef = useRef(null);
  const svgRef = useRef(null);
  const connectingPathRef = useRef(null);
  const debugArcPathRef = useRef(null);
  const actionBarRef = useRef(null);
  const holdTimerRef = useRef(null);

  // Menu items matching original code
  const menuItems = [
    { icon: '🔍', label: 'Search', onClick: () => alert('Search clicked! Time to find something...') },
    { icon: '⭐', label: 'Favorite', onClick: () => alert('Added to favorites! Good choice!') },
    { icon: '✏️', label: 'Edit', onClick: () => alert('Edit mode activated! Make your changes...') },
    { icon: '🗑️', label: 'Delete', onClick: () => alert('Delete selected! Gone but not forgotten...') },
    { icon: '📤', label: 'Share', onClick: () => alert('Share menu opened! Spread the word!') }
  ];

  // Helper functions matching original code
  const getDistance = useCallback((x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }, []);

  const fitCircleToPoints = useCallback((points) => {
    if (points.length < MIN_POINTS_FOR_FIT) return null;

    const startPoint = touchStartRef.current; // MUST go through this point
    const endPoint = points[points.length - 1];
    
    // Calculate direction and center offset
    const dx = endPoint.x - startPoint.x;
    const arcDirection = Math.sign(dx);
    
    // Calculate pivot point based on strict rules
    const OFFSCREEN_MARGIN = 100; // How far off screen the center should be
    const centerY = window.innerHeight + OFFSCREEN_MARGIN; // Always below screen
    
    const centerX = arcDirection > 0 ?
        window.innerWidth + OFFSCREEN_MARGIN : // Right pivot: beyond right edge
        -OFFSCREEN_MARGIN; // Left pivot: beyond left edge
    
    // Calculate radius based on distance from start to center
    const radius = Math.sqrt(
        Math.pow(centerX - startPoint.x, 2) + 
        Math.pow(centerY - startPoint.y, 2)
    );
    
    // Calculate angles
    const startAngle = Math.atan2(startPoint.y - centerY, startPoint.x - centerX);
    const endAngle = Math.atan2(endPoint.y - centerY, endPoint.x - centerX);
    
    // Adjust end angle based on direction
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

  const handleMove = useCallback((e) => {
    if (!isActive) return;

    const currentX = e.clientX ?? e.touches?.[0]?.clientX;
    const currentY = e.clientY ?? e.touches?.[0]?.clientY;

    if (typeof currentX !== 'number' || typeof currentY !== 'number') return;

    // Strict viewport bounds checking - ignore ANY point outside viewport
    if (currentX < 0 || currentX > window.innerWidth || 
        currentY < 0 || currentY > window.innerHeight) {
      return;
    }

    // BUTTON BOUNDARY CHECK 1: Reject if too close to left edge
    // Comment out this if-block to disable left boundary check
    if (currentX < (BUTTON_SIZE + BUTTON_PADDING)) {
      return;
    }

    // BUTTON BOUNDARY CHECK 2: Reject if too close to right edge
    // Comment out this if-block to disable right boundary check
    if (currentX > (window.innerWidth - (BUTTON_SIZE + BUTTON_PADDING))) {
      return;
    }

    // Direction detection (same as original)
    if (arcDirectionRef.current === null && pathPoints.length >= MIN_POINTS_FOR_DIRECTION) {
      const dx = currentX - touchStartRef.current.x;
      arcDirectionRef.current = Math.sign(dx);
      console.log('Arc direction:', arcDirectionRef.current > 0 ? 'right' : 'left');
    }

    // Backtracking prevention (same as original)
    if (arcDirectionRef.current !== null) {
      if (currentY > touchStartRef.current.y || 
          (arcDirectionRef.current > 0 && currentX < touchStartRef.current.x) || 
          (arcDirectionRef.current < 0 && currentX > touchStartRef.current.x)) {
        return;
      }
    }

    // Point pruning (same as original)
    if (pathPoints.length > 0) {
      const lastPoint = pathPoints[pathPoints.length - 1];
      if (getDistance(currentX, currentY, lastPoint.x, lastPoint.y) < 5) return;
    }

    setPathPoints(prev => [...prev, { x: currentX, y: currentY }]);

    // Circle fitting (same as original)
    const now = Date.now();
    if (now - lastFitTimeRef.current > fitThrottleMs.current && pathPoints.length >= MIN_POINTS_FOR_FIT) {
      const circle = fitCircleToPoints(pathPoints);
      if (circle) {
        if (lockedCircleState) {
          setCircleState({
            ...lockedCircleState,
            startAngle: Math.atan2(touchStartRef.current.y - lockedCircleState.centerY,
                               touchStartRef.current.x - lockedCircleState.centerX),
            endAngle: Math.atan2(currentY - lockedCircleState.centerY,
                             currentX - lockedCircleState.centerX)
          });
        } else {
          setCircleState(circle);
          
          // Point quality check (same as original)
          const distToCircle = Math.abs(getDistance(currentX, currentY, circle.centerX, circle.centerY) - circle.radius);
          if (distToCircle < MAX_DEVIATION) {
            setGoodPointCount(prev => prev + 1);
          } else {
            setBadPointCount(prev => prev + 1);
          }
        }
      }
      lastFitTimeRef.current = now;
    }
  }, [isActive, pathPoints, fitCircleToPoints, getDistance, lockedCircleState]);

  // Document-level event handlers
  useEffect(() => {
    const handleTouchMove = (e) => {
      if (!isActive) return;
      e.preventDefault(); // Prevent scrolling
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

  // Handle end events
  useEffect(() => {
    const handleTouchEnd = () => {
      console.log('Document touch end');
      isMouseDownRef.current = false;
      setIsActive(false);
      setPathPoints([]);
      setCircleState({});
      setLockedCircleState(null);
      setGoodPointCount(0);
      setBadPointCount(0);
      arcDirectionRef.current = null;
      
      // Clear SVG paths
      if (connectingPathRef.current) {
        connectingPathRef.current.setAttribute('d', '');
      }
      if (debugArcPathRef.current) {
        debugArcPathRef.current.setAttribute('d', '');
      }
    };

    const handleMouseUp = () => {
      console.log('Document mouse up');
      isMouseDownRef.current = false;
      setIsActive(false);
      setPathPoints([]);
      setCircleState({});
      setLockedCircleState(null);
      setGoodPointCount(0);
      setBadPointCount(0);
      arcDirectionRef.current = null;
      
      // Clear SVG paths
      if (connectingPathRef.current) {
        connectingPathRef.current.setAttribute('d', '');
      }
      if (debugArcPathRef.current) {
        debugArcPathRef.current.setAttribute('d', '');
      }
    };

    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Debug visualization for curve locking
  useEffect(() => {
    if (!isActive) return;

    // Update debug arc color based on lock state
    if (debugArcPathRef.current) {
      debugArcPathRef.current.style.stroke = lockedCircleState ? '#00FF00' : '#FF6B00';
      debugArcPathRef.current.style.strokeWidth = lockedCircleState ? '4' : '3';
    }

    // Log curve locking stats
    if (pathPoints.length > MIN_POINTS_FOR_FIT) {
      const totalPoints = goodPointCount + badPointCount;
      const goodPointRatio = goodPointCount / totalPoints;
      console.log('Curve stats:', {
        goodPoints: goodPointCount,
        badPoints: badPointCount,
        ratio: goodPointRatio,
        locked: !!lockedCircleState,
        startPoint: touchStartRef.current,
        firstPoint: pathPoints[0]
      });
    }
  }, [isActive, lockedCircleState, pathPoints.length, goodPointCount, badPointCount]);

  // Update button styles when positions change
  useEffect(() => {
    if (!isActive) return;

    const positions = menuItems.map((_, index) => {
      const angle = (index / (menuItems.length - 1)) * (circleState.endAngle - circleState.startAngle) + circleState.startAngle;
      const x = circleState.centerX + circleState.radius * Math.cos(angle);
      const y = circleState.centerY + circleState.radius * Math.sin(angle);

      return {
        x: x - BUTTON_SIZE / 2,
        y: y - BUTTON_SIZE / 2,
        scale: 1
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
        left: ${pos.x}px;
        top: ${pos.y}px;
        transform: scale(${pos.scale});
        transition: all 0.1s ease-out;
        pointer-events: auto;
        background: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        cursor: pointer;
        font-size: 24px;
        z-index: 9999;
      `;
    });
  }, [isActive, pathPoints, circleState]);

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
      setPathPoints([touchStartRef.current]); // Use original touch position
    }, HOLD_DURATION);
  }, []);

  const handleMouseDown = useCallback((e) => {
    console.log('Action bar mouse down');
    isMouseDownRef.current = true;
    touchStartRef.current = { x: e.clientX, y: e.clientY };
    
    holdTimerRef.current = setTimeout(() => {
      console.log('Hold timer activated');
      setIsActive(true);
      setPathPoints([touchStartRef.current]); // Use original mouse position
    }, HOLD_DURATION);
  }, []);

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
    
    // Determine if we need the large arc flag
    const angleDiff = Math.abs(endAngle - startAngle);
    const largeArcFlag = angleDiff > Math.PI ? 1 : 0;
    
    // Determine sweep direction
    let sweepFlag = 1;
    if (endAngle < startAngle) sweepFlag = 0;

    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    // A rx ry x-axis-rotation large-arc-flag sweep-flag x y
    const arcPath = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${x2} ${y2}`;
    debugArcPathRef.current.setAttribute('d', arcPath);
    
    console.log('Arc angles:', {
      startAngle: startAngle * 180 / Math.PI,
      endAngle: endAngle * 180 / Math.PI,
      diff: angleDiff * 180 / Math.PI,
      largeArc: largeArcFlag
    });
  }, [circleState]);

  // Create SVG elements on mount
  useEffect(() => {
    // Create SVG element
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9998;
    `;
    svgRef.current = svg;

    // Create connecting path
    const connectingPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    connectingPath.style.cssText = `
      fill: none;
      stroke: rgba(255, 255, 255, 0.3);
      stroke-width: 2;
      filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.3));
      opacity: 0;
      transition: opacity 0.2s;
    `;
    connectingPathRef.current = connectingPath;

    // Create debug arc path
    const debugArcPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    debugArcPath.style.cssText = `
      fill: none;
      stroke: #FF6B00;
      stroke-width: 3;
      stroke-dasharray: 8,4;
      opacity: 0;
      filter: drop-shadow(0 0 3px rgba(255, 107, 0, 0.5));
    `;
    debugArcPathRef.current = debugArcPath;

    // Add paths to SVG
    svg.appendChild(connectingPath);
    svg.appendChild(debugArcPath);
    document.body.appendChild(svg);

    // Create debug indicator
    const debugIndicator = document.createElement('div');
    debugIndicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 5px 10px;
      border-radius: 4px;
      font-family: monospace;
      z-index: 10000;
      display: none;
    `;
    debugIndicator.textContent = 'DEBUG MODE';
    debugIndicatorRef.current = debugIndicator;
    document.body.appendChild(debugIndicator);

    // Cleanup on unmount
    return () => {
      document.body.removeChild(svg);
      if (debugIndicator.parentNode) {
        document.body.removeChild(debugIndicator);
      }
    };
  }, []);

  return (
    <>
      <div 
        ref={touchStartRef} 
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
      {isActive && menuItems.map((button, index) => (
        <button
          key={index}
          className="arc-menu-button"
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
      />

      {/* SVG for visualization */}
      {svgRef.current && (
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
      )}
    </>
  );
};

export default ArcMenu;
