import React, { useReducer, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import './ArcMenu.css';

const ARC_MENU_CONFIG = {
  BUTTON_SIZE: 50,
  SAMPLE_DISTANCE: 5,
  DEBUG_PATH: false,
  DEBUG_ARC: true,
  MAX_POINTS: 100,
  MIN_MENU_ANGLE: Math.PI / 12,
  EDGE_THRESHOLD: 150,
  CLOSE_ANIMATION_MS: 1000,
  DRAG_DELAY_MS: 150,
  MIN_DRAG_DISTANCE: 10,
  BUTTON_PADDING: 5
};

const initialState = {
  isActive: false,
  isClosing: false,
  pathPoints: [],
  pointCount: 0,
  circleState: {
    centerX: null,
    centerY: null,
    radius: null,
    startAngle: null,
    endAngle: null
  },
  lockedCircleState: null
};

function menuReducer(state, action) {
  switch (action.type) {
    case 'START_DRAG':
      return {
        ...state,
        isActive: true,
        pathPoints: [action.payload.startPoint]
      };
    case 'UPDATE_CIRCLE':
      return {
        ...state,
        circleState: action.payload.circle
      };
    case 'LOCK_CIRCLE':
      return {
        ...state,
        lockedCircleState: state.circleState
      };
    case 'CLEANUP':
      return {
        ...initialState,
        isClosing: true
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const ArcMenu = () => {
  const [state, dispatch] = useReducer(menuReducer, initialState);
  const { isActive, isClosing, circleState, lockedCircleState } = state;

  const touchStartRef = useRef({ x: 0, y: 0, time: 0, target: null });
  const isMouseDownRef = useRef(false);
  const lastPointRef = useRef(null);
  const debugArcPathRef = useRef(null);
  const connectingPathRef = useRef(null);
  const svgRef = useRef(null);

  const menuItems = [
    { icon: '🔍', label: 'Search', onClick: () => alert('Search clicked! Time to find something...') },
    { icon: '⭐', label: 'Favorite', onClick: () => alert('Added to favorites! Good choice!') },
    { icon: '✏️', label: 'Edit', onClick: () => alert('Edit mode activated! Make your changes...') },
    { icon: '🗑️', label: 'Delete', onClick: () => alert('Delete selected! Gone but not forgotten...') },
    { icon: '📤', label: 'Share', onClick: () => alert('Share menu opened! Spread the word!') }
  ];

  const getDistance = useCallback((x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }, []);

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

  const fitCircleToPoints = useCallback((startPoint, currentPoint) => {
    if (!startPoint || !currentPoint) return null;

    const dx = currentPoint.x - startPoint.x;
    const arcDirection = dx >= 0 ? 1 : -1;
    
    // Fixed center points
    const centerX = arcDirection > 0 ? window.innerWidth + 300 : -300;
    const centerY = window.innerHeight + 300;

    // Use exact radius from start point
    const radius = Math.sqrt(
      Math.pow(startPoint.x - centerX, 2) + 
      Math.pow(startPoint.y - centerY, 2)
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

  const cleanSvgPaths = useCallback(() => {
    if (connectingPathRef.current) {
      connectingPathRef.current.setAttribute('d', '');
    }
    if (debugArcPathRef.current) {
      debugArcPathRef.current.setAttribute('d', '');
    }
  }, []);

  const handleRotationMove = useCallback((e) => {
    if (!isMouseDownRef.current || !isActive) return;

    const currentX = e.clientX ?? e.touches?.[0]?.clientX;
    const currentY = e.clientY ?? e.touches?.[0]?.clientY;

    if (typeof currentX !== 'number' || typeof currentY !== 'number') return;

    const currentPoint = { x: currentX, y: currentY };
    const lastPoint = lastPointRef.current || touchStartRef.current;
    const distance = Math.sqrt(
      Math.pow(currentX - lastPoint.x, 2) +
      Math.pow(currentY - lastPoint.y, 2)
    );

    if (distance >= ARC_MENU_CONFIG.SAMPLE_DISTANCE) {
      lastPointRef.current = currentPoint;
      const circle = fitCircleToPoints(touchStartRef.current, currentPoint);
      if (circle) {
        dispatch({ type: 'UPDATE_CIRCLE', payload: { circle } });
      }
    }
  }, [isActive]);

  const handleInteractionStart = useCallback((e) => {
    const point = e.touches?.[0] || e;
    if (!point) return;

    touchStartRef.current = { 
      x: point.clientX, 
      y: point.clientY,
      time: Date.now(),
      target: e.target
    };
    isMouseDownRef.current = true;

    // Debounced interaction start
    const timer = setTimeout(() => {
      if (!isMouseDownRef.current) return;

      const currentPoint = e.touches?.[0] || e;
      const distance = Math.sqrt(
        Math.pow(currentPoint.clientX - touchStartRef.current.x, 2) +
        Math.pow(currentPoint.clientY - touchStartRef.current.y, 2)
      );

      if (distance >= ARC_MENU_CONFIG.MIN_DRAG_DISTANCE || Date.now() - touchStartRef.current.time >= ARC_MENU_CONFIG.DRAG_DELAY_MS) {
        dispatch({ type: 'START_DRAG', payload: { startPoint: touchStartRef.current } });

        const startPoint = touchStartRef.current;
        const centerX = startPoint.x + 300;
        const centerY = window.innerHeight + 300;
        const radius = Math.sqrt(
          Math.pow(startPoint.x - centerX, 2) + 
          Math.pow(startPoint.y - centerY, 2)
        );
        const startAngle = Math.atan2(startPoint.y - centerY, startPoint.x - centerX);
        
        dispatch({ type: 'UPDATE_CIRCLE', payload: { circle: {
          centerX,
          centerY,
          radius,
          startAngle,
          endAngle: startAngle
        } } });
      }
    }, ARC_MENU_CONFIG.DRAG_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleTouchMove = (e) => {
      if (!isActive) return;
      e.preventDefault();
      handleRotationMove(e.touches[0]);
    };

    const handleMouseMove = (e) => {
      if (!isActive || !isMouseDownRef.current) return;
      e.preventDefault();
      handleRotationMove(e);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isActive, handleRotationMove]);

  useEffect(() => {
    const handleTouchEnd = () => {
      // Log touch end event
      // console.log('Document touch end');
      isMouseDownRef.current = false;
      
      if (isActive) {
        const dragAngle = Math.abs(circleState?.endAngle - circleState?.startAngle) || 0;
        const currentPoint = lastPointRef.current;
        
        if (currentPoint) {
          // Check if we dragged far enough angle-wise
          const hasMinAngle = dragAngle >= ARC_MENU_CONFIG.MIN_MENU_ANGLE;
          
          // Check if we released near the appropriate edge based on drag direction
          const dx = currentPoint.x - touchStartRef.current.x;
          const isRightDrag = dx >= 0;
          const isNearEdge = isRightDrag ? 
            (currentPoint.x >= window.innerWidth - ARC_MENU_CONFIG.EDGE_THRESHOLD) : 
            (currentPoint.x <= ARC_MENU_CONFIG.EDGE_THRESHOLD);

          if (hasMinAngle || isNearEdge) {
            dispatch({ type: 'LOCK_CIRCLE' });
          } else {
            dispatch({ type: 'CLEANUP' });
          }
        } else {
          dispatch({ type: 'CLEANUP' });
        }
      }
    };

    const handleMouseUp = () => {
      // Log mouse up event
      // console.log('Document mouse up');
      isMouseDownRef.current = false;
      
      if (isActive) {
        const dragAngle = Math.abs(circleState?.endAngle - circleState?.startAngle) || 0;
        const currentPoint = lastPointRef.current;
        
        if (currentPoint) {
          // Check if we dragged far enough angle-wise
          const hasMinAngle = dragAngle >= ARC_MENU_CONFIG.MIN_MENU_ANGLE;
          
          // Check if we released near the appropriate edge based on drag direction
          const dx = currentPoint.x - touchStartRef.current.x;
          const isRightDrag = dx >= 0;
          const isNearEdge = isRightDrag ? 
            (currentPoint.x >= window.innerWidth - ARC_MENU_CONFIG.EDGE_THRESHOLD) : 
            (currentPoint.x <= ARC_MENU_CONFIG.EDGE_THRESHOLD);

          if (hasMinAngle || isNearEdge) {
            dispatch({ type: 'LOCK_CIRCLE' });
          } else {
            dispatch({ type: 'CLEANUP' });
          }
        } else {
          dispatch({ type: 'CLEANUP' });
        }
      }
    };

    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isActive, circleState, lockedCircleState]);

  useEffect(() => {
    const handleMouseDownOutside = (e) => {
      // Log mousedown event details
      // console.log('Mousedown detected:', {
      //   lockedCircleState: !!lockedCircleState,
      //   isActive,
      //   isClosing,
      //   clickX: e.clientX,
      //   clickY: e.clientY
      // });

      // Only handle when menu is locked open and not animating
      if (!lockedCircleState || isClosing) {
        // Log why mousedown was ignored
        // console.log('Mousedown ignored: menu not in stable open state');
        return;
      }
      
      // Get click coordinates
      const clickX = e.clientX;
      const clickY = e.clientY;
      
      // Calculate distance from center to click
      const distanceFromCenter = Math.sqrt(
        Math.pow(clickX - lockedCircleState.centerX, 2) + 
        Math.pow(clickY - lockedCircleState.centerY, 2)
      );

      // Log distance calculations for debugging
      // console.log('Distance check:', {
      //   distanceFromCenter,
      //   radius: lockedCircleState.radius,
      //   diff: Math.abs(distanceFromCenter - lockedCircleState.radius),
      //   threshold: ARC_MENU_CONFIG.BUTTON_SIZE
      // });
      
      // If click is outside the arc's radius, close the menu
      if (Math.abs(distanceFromCenter - lockedCircleState.radius) > ARC_MENU_CONFIG.BUTTON_SIZE) {
        // Log menu closure due to outside click
        // console.log('Closing menu due to outside mousedown');
        dispatch({ type: 'CLEANUP' });
      }
    };

    document.addEventListener('mousedown', handleMouseDownOutside);
    return () => document.removeEventListener('mousedown', handleMouseDownOutside);
  }, [lockedCircleState, isClosing]);

  useEffect(() => {
    if (isClosing) {
      const timer = setTimeout(() => {
        // Reset all state after animation
        dispatch({ type: 'RESET' });
      }, ARC_MENU_CONFIG.CLOSE_ANIMATION_MS);
      return () => clearTimeout(timer);
    }
  }, [isClosing]);

  useEffect(() => {
    if (!isActive && !lockedCircleState && !isClosing) return;

    const currentState = isClosing ? circleState : (isActive ? circleState : lockedCircleState);
    
    // Safety check - if no valid state during animation, force cleanup
    if (!currentState?.endAngle || !currentState?.startAngle) {
      dispatch({ type: 'CLEANUP' });
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
        width: ${ARC_MENU_CONFIG.BUTTON_SIZE}px;
        height: ${ARC_MENU_CONFIG.BUTTON_SIZE}px;
        left: ${isClosing ? touchStartRef.current.x : pos.x}px;
        top: ${isClosing ? touchStartRef.current.y : pos.y}px;
        transform: scale(${pos.scale});
        transition: ${isClosing ? `all ${ARC_MENU_CONFIG.CLOSE_ANIMATION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)` : 'none'};
        pointer-events: ${isClosing ? 'none' : 'auto'};
        background: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        cursor: pointer;
        font-size: 24px;
        z-index: 999;
        opacity: ${isClosing ? 0 : 1};
      `;
    });
  }, [isActive, lockedCircleState, isClosing]);

  useEffect(() => {
    if (!isActive || !circleState.centerX) {
      cleanSvgPaths();
      return;
    }

    const path = connectingPathRef.current;
    const arcPath = debugArcPathRef.current;
    if (!path || !arcPath) return;

    // Only draw paths if we're active and have points
    if (state.pathPoints.length > 0) {
      const pathD = state.pathPoints
        .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
        .join(' ');
      path.setAttribute('d', pathD);

      if (ARC_MENU_CONFIG.DEBUG_ARC && circleState.centerX) {
        const { centerX, centerY, radius, startAngle, endAngle } = circleState;
        const arcD = describeArc(centerX, centerY, radius, startAngle, endAngle);
        arcPath.setAttribute('d', arcD);
      }
    } else {
      cleanSvgPaths();
    }
  }, [isActive, state.pathPoints, circleState, cleanSvgPaths]);

  return (
    <>
      <div 
        className="action-bar"
        style={{ 
          opacity: isActive ? 0 : 1,
          pointerEvents: isActive ? 'none' : 'auto',
          transition: 'opacity 0.2s'
        }}
        onTouchStart={handleInteractionStart}
        onMouseDown={handleInteractionStart}
      >
        <button 
          className="action-item"
          onClick={(e) => {
            // Only trigger click if it was a quick tap/click without much movement
            if (touchStartRef.current && touchStartRef.current.target === e.target) {
              const timeDiff = Date.now() - touchStartRef.current.time;
              const distance = Math.sqrt(
                Math.pow(e.clientX - touchStartRef.current.x, 2) +
                Math.pow(e.clientY - touchStartRef.current.y, 2)
              );
              
              // If it was a quick tap without much movement, handle the click
              if (timeDiff < ARC_MENU_CONFIG.DRAG_DELAY_MS && distance < ARC_MENU_CONFIG.MIN_DRAG_DISTANCE) {
                // Handle button click
                // console.log('Button clicked!');
              }
            }
          }}
        >
          📱
        </button>
        <button 
          className="action-item"
          onClick={(e) => {
            // Only trigger click if it was a quick tap/click without much movement
            if (touchStartRef.current && touchStartRef.current.target === e.target) {
              const timeDiff = Date.now() - touchStartRef.current.time;
              const distance = Math.sqrt(
                Math.pow(e.clientX - touchStartRef.current.x, 2) +
                Math.pow(e.clientY - touchStartRef.current.y, 2)
              );
              
              // If it was a quick tap without much movement, handle the click
              if (timeDiff < ARC_MENU_CONFIG.DRAG_DELAY_MS && distance < ARC_MENU_CONFIG.MIN_DRAG_DISTANCE) {
                // Handle button click
                // console.log('Button clicked!');
              }
            }
          }}
        >
          📍
        </button>
        <button 
          className="action-item"
          onClick={(e) => {
            // Only trigger click if it was a quick tap/click without much movement
            if (touchStartRef.current && touchStartRef.current.target === e.target) {
              const timeDiff = Date.now() - touchStartRef.current.time;
              const distance = Math.sqrt(
                Math.pow(e.clientX - touchStartRef.current.x, 2) +
                Math.pow(e.clientY - touchStartRef.current.y, 2)
              );
              
              // If it was a quick tap without much movement, handle the click
              if (timeDiff < ARC_MENU_CONFIG.DRAG_DELAY_MS && distance < ARC_MENU_CONFIG.MIN_DRAG_DISTANCE) {
                // Handle button click
                // console.log('Button clicked!');
              }
            }
          }}
        >
          📷
        </button>
        <button 
          className="action-item"
          onClick={(e) => {
            // Only trigger click if it was a quick tap/click without much movement
            if (touchStartRef.current && touchStartRef.current.target === e.target) {
              const timeDiff = Date.now() - touchStartRef.current.time;
              const distance = Math.sqrt(
                Math.pow(e.clientX - touchStartRef.current.x, 2) +
                Math.pow(e.clientY - touchStartRef.current.y, 2)
              );
              
              // If it was a quick tap without much movement, handle the click
              if (timeDiff < ARC_MENU_CONFIG.DRAG_DELAY_MS && distance < ARC_MENU_CONFIG.MIN_DRAG_DISTANCE) {
                // Handle button click
                // console.log('Button clicked!');
              }
            }
          }}
        >
          ✏️
        </button>
        <button 
          className="action-item"
          onClick={(e) => {
            // Only trigger click if it was a quick tap/click without much movement
            if (touchStartRef.current && touchStartRef.current.target === e.target) {
              const timeDiff = Date.now() - touchStartRef.current.time;
              const distance = Math.sqrt(
                Math.pow(e.clientX - touchStartRef.current.x, 2) +
                Math.pow(e.clientY - touchStartRef.current.y, 2)
              );
              
              // If it was a quick tap without much movement, handle the click
              if (timeDiff < ARC_MENU_CONFIG.DRAG_DELAY_MS && distance < ARC_MENU_CONFIG.MIN_DRAG_DISTANCE) {
                // Handle button click
                // console.log('Button clicked!');
              }
            }
          }}
        >
          🗑️
        </button>
        <button 
          className="action-item"
          onClick={(e) => {
            // Only trigger click if it was a quick tap/click without much movement
            if (touchStartRef.current && touchStartRef.current.target === e.target) {
              const timeDiff = Date.now() - touchStartRef.current.time;
              const distance = Math.sqrt(
                Math.pow(e.clientX - touchStartRef.current.x, 2) +
                Math.pow(e.clientY - touchStartRef.current.y, 2)
              );
              
              // If it was a quick tap without much movement, handle the click
              if (timeDiff < ARC_MENU_CONFIG.DRAG_DELAY_MS && distance < ARC_MENU_CONFIG.MIN_DRAG_DISTANCE) {
                // Handle button click
                // console.log('Button clicked!');
              }
            }
          }}
        >
          📤
        </button>
        <button 
          className="action-item"
          onClick={(e) => {
            // Only trigger click if it was a quick tap/click without much movement
            if (touchStartRef.current && touchStartRef.current.target === e.target) {
              const timeDiff = Date.now() - touchStartRef.current.time;
              const distance = Math.sqrt(
                Math.pow(e.clientX - touchStartRef.current.x, 2) +
                Math.pow(e.clientY - touchStartRef.current.y, 2)
              );
              
              // If it was a quick tap without much movement, handle the click
              if (timeDiff < ARC_MENU_CONFIG.DRAG_DELAY_MS && distance < ARC_MENU_CONFIG.MIN_DRAG_DISTANCE) {
                // Handle button click
                // console.log('Button clicked!');
              }
            }
          }}
        >
          ➕
        </button>
      </div>

      {/* Show buttons during active drag, when locked open, or during closing animation */}
      {(isActive || lockedCircleState || isClosing) && menuItems.map((button, index) => (
        <button
          key={index}
          className="arc-menu-button"
          onClick={(e) => {
            dispatch({ type: 'CLEANUP' });
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
          zIndex: 997,
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
          zIndex: 998
        }}
      >
        <path
          ref={connectingPathRef}
          style={{
            fill: 'none',
            stroke: 'rgba(255, 255, 255, 0.3)',
            strokeWidth: 2,
            filter: 'drop-shadow(0 0 2px rgba(0, 0, 0, 0.3))',
            opacity: ARC_MENU_CONFIG.DEBUG_PATH ? (isActive ? 1 : 0) : 0,
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
            opacity: ARC_MENU_CONFIG.DEBUG_ARC ? (isActive ? 1 : 0) : 0,
            filter: 'drop-shadow(0 0 3px rgba(255, 107, 0, 0.5))'
          }}
        />
      </svg>
    </>
  );
};

export default ArcMenu;
