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
  const [lockedCircleState, setLockedCircleState] = useState(null);
  const [goodPointCount, setGoodPointCount] = useState(0);
  const [badPointCount, setBadPointCount] = useState(0);

  // Refs
  const actionBarRef = useRef(null);
  const svgRef = useRef(null);
  const connectingPathRef = useRef(null);
  const debugArcPathRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const isMouseDownRef = useRef(false);
  const holdTimerRef = useRef(null);
  const arcDirectionRef = useRef(null);

  // Constants
  const DRAG_THRESHOLD = 10;
  const BUTTON_SIZE = 50;
  const MIN_BUTTON_SIZE = 30;
  const BUTTON_PADDING = 10;
  const HOLD_DURATION = 400;
  const MIN_POINT_DISTANCE = 5; // Minimum distance between points in pixels
  const USE_SMART_PRUNING = true; // Easy toggle for pruning strategy
  const MIN_POINTS_FOR_LOCK = 10;
  const GOOD_POINT_THRESHOLD = 0.8; // 80% of points need to be good

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
    const perpX = dy2;  // Perpendicular to the curve direction (flipped sign)
    const perpY = -dx2;
    const perpLength = Math.sqrt(perpX * perpX + perpY * perpY);

    // Detect arc direction if not set
    const dx = endPointForFit.x - startPoint.x;
    const arcDirection = Math.sign(dx);
    
    // Calculate distance from midpoint to desired center
    // This should be large enough to place center off screen
    const desiredRadius = arcDirection > 0 ? 
        window.innerWidth + 100 - midPoint.x : 
        midPoint.x + 100;
        
    // Calculate center point with corrected direction
    const centerX = midPoint.x + (perpX / perpLength) * desiredRadius * (arcDirection > 0 ? -1 : 1);
    const centerY = midPoint.y + (perpY / perpLength) * desiredRadius * (arcDirection > 0 ? -1 : 1);
    
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
    setLockedCircleState(null);
    setGoodPointCount(0);
    setBadPointCount(0);
  }, []);

  // Utility function to get distance between points
  const getDistance = (p1, p2) => {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Smart point pruning - only add points that are far enough from the last one
  const prunePoints = useCallback((newPoint, existingPoints) => {
    if (!USE_SMART_PRUNING) {
      // Original simple pruning logic
      const points = [...existingPoints, newPoint];
      if (points.length > 300) {
        const firstPoint = points[0];
        const lastPoints = points.slice(-299);
        return [firstPoint, ...lastPoints];
      }
      return points;
    }

    // Always keep the first point
    if (existingPoints.length === 0) {
      return [newPoint];
    }

    // Check distance from last point
    const lastPoint = existingPoints[existingPoints.length - 1];
    if (getDistance(newPoint, lastPoint) < MIN_POINT_DISTANCE) {
      return existingPoints;
    }

    // Add the new point since it's far enough
    return [...existingPoints, newPoint];
  }, []);

  // Handle move events
  const handleMove = useCallback((e) => {
    if (!isActive) return;

    // Get coordinates and ensure they exist
    const currentX = e.clientX ?? e.touches?.[0]?.clientX;
    const currentY = e.clientY ?? e.touches?.[0]?.clientY;

    // Return early if coordinates are invalid
    if (typeof currentX !== 'number' || typeof currentY !== 'number') {
      return;
    }

    // Strict viewport bounds checking - reject any points outside
    const margin = 10;
    if (currentX < margin || currentX > window.innerWidth - margin || 
        currentY < margin || currentY > window.innerHeight - margin) {
      return;
    }

    // Detect arc direction if not set
    if (arcDirectionRef.current === null && pathPoints.length > 5) {
      const dx = currentX - touchStartRef.current.x;
      arcDirectionRef.current = Math.sign(dx);
      console.log('Arc direction set to:', arcDirectionRef.current);
    }

    // If we have a direction set, check if we've backtracked past origin
    if (arcDirectionRef.current !== null) {
      // Check if we're below start Y or on wrong side of X
      if (currentY > touchStartRef.current.y || 
          (arcDirectionRef.current > 0 && currentX < touchStartRef.current.x) || 
          (arcDirectionRef.current < 0 && currentX > touchStartRef.current.x)) {
        console.log('Rejected: Backtracking detected');
        return;
      }
    }

    // Only add points if we've moved enough (minimum 5 pixels)
    if (pathPoints.length > 0) {
      const lastPoint = pathPoints[pathPoints.length - 1];
      const dx = currentX - lastPoint.x;
      const dy = currentY - lastPoint.y;
      if (dx * dx + dy * dy < 25) return;
    }

    // Add point using smart pruning
    const newPoints = prunePoints({ x: currentX, y: currentY }, pathPoints);
    setPathPoints(newPoints);

    // Calculate circle fit if we have enough points
    if (newPoints.length >= 5) {
      const circle = fitCircleToPoints(newPoints);
      if (circle) {
        // If we have a locked circle state, use its center and radius but calculate new angles
        if (lockedCircleState) {
          const currentAngle = Math.atan2(currentY - lockedCircleState.centerY, 
                                        currentX - lockedCircleState.centerX);
          setCircleState({
            ...lockedCircleState,
            startAngle: Math.atan2(touchStartRef.current.y - lockedCircleState.centerY,
                                 touchStartRef.current.x - lockedCircleState.centerX),
            endAngle: currentAngle
          });
        } else {
          setCircleState(circle);

          // Check if this point is "good" - close to the fitted circle
          const distanceToCircle = Math.abs(
            Math.sqrt(
              Math.pow(currentX - circle.centerX, 2) + 
              Math.pow(currentY - circle.centerY, 2)
            ) - circle.radius
          );

          const isGoodPoint = distanceToCircle < 10; // Within 10 pixels of the circle
          if (isGoodPoint) {
            setGoodPointCount(prev => prev + 1);
          } else {
            setBadPointCount(prev => prev + 1);
          }

          // Check if we should lock the circle
          const totalPoints = goodPointCount + badPointCount;
          if (totalPoints > MIN_POINTS_FOR_LOCK) {
            const goodPointRatio = goodPointCount / totalPoints;
            if (goodPointRatio > GOOD_POINT_THRESHOLD) {
              console.log('🔒 Locking circle center and radius!', {
                center: { x: circle.centerX, y: circle.centerY },
                radius: circle.radius,
                goodPoints: goodPointCount,
                badPoints: badPointCount,
                ratio: goodPointRatio
              });
              // Only lock the center and radius
              setLockedCircleState({
                centerX: circle.centerX,
                centerY: circle.centerY,
                radius: circle.radius
              });
            }
          }
        }
      }
    }
  }, [isActive, pathPoints, fitCircleToPoints, prunePoints, lockedCircleState, goodPointCount, badPointCount]);

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
    if (pathPoints.length > MIN_POINTS_FOR_LOCK) {
      const totalPoints = goodPointCount + badPointCount;
      const goodPointRatio = goodPointCount / totalPoints;
      console.log('Curve stats:', {
        goodPoints: goodPointCount,
        badPoints: badPointCount,
        ratio: goodPointRatio,
        locked: !!lockedCircleState
      });
    }
  }, [isActive, lockedCircleState, pathPoints.length, goodPointCount, badPointCount]);

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
