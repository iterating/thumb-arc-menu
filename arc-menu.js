// ArcMenu class to handle the thumb arc interaction
export class ArcMenu {
    constructor(actionBar, config = {}) {
        // Store references to DOM elements
        this.actionBar = actionBar;
        
        // Configuration with defaults
        this.config = {
            debug: false,
            hideActionBar: true,  // New parameter
            holdDuration: 400,    // Hold duration in ms before menu activates
            ...config
        };

        // Debug mode
        this.debug = this.config.debug;
        
        // Add click handlers to action bar buttons - only trigger on quick taps
        const actionMessages = {
            '📱': 'Phone menu opened!',
            '📍': 'Location services activated!',
            '📷': 'Camera ready to snap!',
            '⚙️': 'Settings panel opened!',
            '➕': 'Ready to add new item!'
        };
        
        actionBar.querySelectorAll('.action-item').forEach(button => {
            button.addEventListener('click', (e) => {
                if (!this.isActive) { // Only show alert if menu isn't active
                    e.stopPropagation(); // Prevent event from bubbling
                    alert(actionMessages[button.textContent] || 'Button clicked!');
                }
            });
        });
        
        // Add click handlers to action bar buttons
        actionBar.querySelectorAll('.action-item').forEach(button => {
            button.addEventListener('touchstart', () => {
                pressTimer = setTimeout(() => {
                    pressTimer = null;
                }, this.config.holdDuration);
            });
            button.addEventListener('touchend', (e) => {
                // Only show alert if it was a quick tap (no hold timer)
                if (!pressTimer) {
                    alert(actionMessages[button.textContent] || 'Button clicked!');
                }
                e.preventDefault(); // Prevent any default button behavior
            });
        });

        this.arcMenu = document.getElementById('arc-menu');
        this.isActive = false;
        this.startX = 0;
        this.startY = 0;
        this.pathPoints = [];  // Raw user input points
        this.fittedPoints = []; // Points that lie on the circle
        this.debugPoints = [];  // Store debug elements
        this.buttons = [];
        this.lastFitTime = 0;  // Timestamp of last circle fit
        this.fitThrottleMs = 100; // Only fit every 100ms
        this.minPointsForFit = 5;     // Reduced from 10 to 5
        this.maxDeviation = 30;       // Increased from 20 to 30
        this.deviationThreshold = 0.5; // Increased from 0.3 to 0.5
        this.buttonSize = 50;         // Default button size
        this.minButtonSize = 30;      // Minimum button size when scaling down
        this.buttonPadding = 10;      // Minimum padding between buttons
        this.goodPointCount = 0;
        this.badPointCount = 0;
        this.circleState = {
            centerX: null,
            centerY: null,
            radius: null,
            startAngle: null,
            endAngle: null
        };
        this.lockedCircleState = null; // Store the locked circle parameters
        this.maxArcRadius = 400; // Maximum radius
        this.projectedCircle = null; // Store calculated circle parameters
        this.circleStartPoint = null;
        this.circleEndPoint = null;
        this.maxY = null;
        this.minY = null;
        this.maxDistance = null; // Maximum distance from start point
        this.arcDirection = null; // Arc direction (1 for right, -1 for left)
        this.currentAngle = null; // Current angle of movement
        this.startAngle = null; // Starting angle of movement
        this.minAngle = null; // Minimum allowed angle
        this.maxAngle = null; // Maximum allowed angle
        this.minPointsForDirection = 10;  // Wait for 10 points before deciding direction
        this.lastCheckedPointIndex = 0;  // Track which points we've already checked
        
        // Prevent text selection during arc drawing
        this.arcMenu.style.userSelect = 'none';
        this.actionBar.style.userSelect = 'none';
        
        // Get viewport dimensions
        this.updateViewportDimensions = () => {
            this.viewportWidth = window.innerWidth;
            this.viewportHeight = window.innerHeight;
        };
        this.updateViewportDimensions();
        window.addEventListener('resize', this.updateViewportDimensions);
        
        // Create debug indicator
        this.debugIndicator = document.createElement('div');
        this.debugIndicator.style.cssText = `
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
        this.debugIndicator.textContent = 'DEBUG MODE';
        document.body.appendChild(this.debugIndicator);
        
        // Create SVG element for the connecting line and debug arc
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9998;
        `;
        this.connectingPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this.connectingPath.style.cssText = `
            fill: none;
            stroke: rgba(255, 255, 255, 0.3);
            stroke-width: 2;
            filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.3));
            opacity: 0;
            transition: opacity 0.2s;
        `;
        
        // Add debug arc path
        this.debugArcPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this.debugArcPath.style.cssText = `
            fill: none;
            stroke: #FF6B00;
            stroke-width: 3;
            stroke-dasharray: 8,4;
            opacity: 0;
            filter: drop-shadow(0 0 3px rgba(255, 107, 0, 0.5));
        `;
        
        this.svg.appendChild(this.connectingPath);
        this.svg.appendChild(this.debugArcPath);
        document.body.appendChild(this.svg);
        
        // Sample menu items (can be customized)
        this.menuItems = [
            { icon: '🔍', label: 'Search', onClick: () => alert('Search clicked! Time to find something...') },
            { icon: '⭐', label: 'Favorite', onClick: () => alert('Added to favorites! Good choice!') },
            { icon: '✏️', label: 'Edit', onClick: () => alert('Edit mode activated! Make your changes...') },
            { icon: '🗑️', label: 'Delete', onClick: () => alert('Delete selected! Gone but not forgotten...') },
            { icon: '📤', label: 'Share', onClick: () => alert('Share menu opened! Spread the word!') }
        ];

        // Debug mode - toggle with 'D' key
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'd') {
                this.debug = !this.debug;
                this.debugIndicator.style.display = this.debug ? 'block' : 'none';
                console.log('Debug mode:', this.debug);
                // Clear any existing debug points
                this.clearDebugPoints();
            }
        });

        this.init();
    }

    init() {
        // Track mouse state and movement threshold
        let startX, startY;
        let isMouseDown = false;
        const DRAG_THRESHOLD = 10; // pixels to move before considering it a drag
        
        const resetState = () => {
            this.isActive = false;
            startX = null;
            startY = null;
            isMouseDown = false;
            // Ensure action bar is visible on reset
            if (this.config.hideActionBar) {
                this.actionBar.style.opacity = '1';
                this.actionBar.style.transition = 'opacity 0.2s';
            }
        };
        
        // Initialize touch event listeners with passive option
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            if (!this.isActive) {
                const dx = e.touches[0].clientX - startX;
                const dy = e.touches[0].clientY - startY;
                if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
                    this.isActive = true;
                    this.startX = startX;
                    this.startY = startY;
                    this.pathPoints = [];
                    this.fittedPoints = [];
                    this.arcDirection = null;
                    this.lockedCircleState = null;
                    
                    if (this.config.hideActionBar) {
                        this.actionBar.style.opacity = '0';
                        this.actionBar.style.transition = 'opacity 0.2s';
                    }
                    
                    this.buttons.forEach(button => button.remove());
                    this.buttons = [];
                    
                    if (this.debug) {
                        this.clearDebugPoints();
                        this.createDebugPoint(startX, startY, 'green');
                    }
                }
            }
            if (this.isActive) {
                this.handleTouchMove(e);
            }
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            this.handleTouchEnd();
            resetState();
        }, { passive: true });
        
        // Add mouse event listeners
        document.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            startX = e.clientX;
            startY = e.clientY;
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isMouseDown) return; // Only track movement if mouse is down
            
            if (!this.isActive) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
                    this.isActive = true;
                    this.startX = startX;
                    this.startY = startY;
                    this.pathPoints = [];
                    this.fittedPoints = [];
                    this.arcDirection = null;
                    this.lockedCircleState = null;
                    
                    if (this.config.hideActionBar) {
                        this.actionBar.style.opacity = '0';
                        this.actionBar.style.transition = 'opacity 0.2s';
                    }
                    
                    this.buttons.forEach(button => button.remove());
                    this.buttons = [];
                    
                    if (this.debug) {
                        this.clearDebugPoints();
                        this.createDebugPoint(startX, startY, 'green');
                    }
                }
            }
            if (this.isActive) {
                this.handleTouchMove({ touches: [{ clientX: e.clientX, clientY: e.clientY }] });
            }
        });
        
        document.addEventListener('mouseup', (e) => {
            console.log('Mouse up detected', e);
            this.handleTouchEnd();
            resetState();
        });
    }

    handleTouchStart(e) {
        // Don't activate arc menu if touching a button or interactive element
        const target = e.target || e.touches?.[0]?.target;
        if (target && (target.tagName === 'BUTTON' || target.closest('button') || target.closest('a'))) {
            return;
        }

        const touch = e.touches[0];
        if (!touch) return; // Exit if no touch data

        const startX = touch.clientX;
        const startY = touch.clientY;
        
        // Create hold timer
        this.holdTimer = setTimeout(() => {
            this.isActive = true;
            this.startX = startX;
            this.startY = startY;
            this.pathPoints = [];
            this.fittedPoints = [];
            this.arcDirection = null;  // Reset direction on new touch
            this.lockedCircleState = null; // Reset locked circle state
            
            // Hide the action bar during drag if configured
            if (this.config.hideActionBar) {
                this.actionBar.style.opacity = '0';
                this.actionBar.style.transition = 'opacity 0.2s';
            }
            
            // Clear any existing buttons
            this.buttons.forEach(button => button.remove());
            this.buttons = [];
            
            // Clear debug points
            if (this.debug) {
                this.clearDebugPoints();
                this.createDebugPoint(this.startX, this.startY, 'green');
            }
        }, this.config.holdDuration);

        // Add cancel handlers
        const cancelHold = () => {
            if (this.holdTimer) {
                clearTimeout(this.holdTimer);
                this.holdTimer = null;
            }
            document.removeEventListener('touchend', cancelHold);
            document.removeEventListener('touchmove', cancelHold);
        };
        document.addEventListener('touchend', cancelHold);
        document.addEventListener('touchmove', cancelHold);
    }

    handleTouchMove(e) {
        if (!this.isActive) return;

        // Throttle updates to every 16ms (roughly 60fps)
        const now = performance.now();
        if (now - this.lastUpdateTime < 16) return;
        this.lastUpdateTime = now;

        // Handle both mouse and touch events properly
        const currentX = e.clientX || (e.touches && e.touches[0].clientX);
        const currentY = e.clientY || (e.touches && e.touches[0].clientY);

        // Only clip raw input points, not calculated points
        const margin = 10;
        if (currentX < margin || currentX > this.viewportWidth - margin ||
            currentY < margin || currentY > this.viewportHeight - margin) {
            return;
        }

        // If we have a direction set, check if we've backtracked past origin
        if (this.arcDirection !== null) {
            // Check if we're below start Y or on wrong side of X
            if (currentY > this.startY || 
                (this.arcDirection > 0 && currentX < this.startX) || 
                (this.arcDirection < 0 && currentX > this.startX)) {
                if (this.debug) {
                    console.log('Backtracking detected:', {currentX, currentY, startX: this.startX, startY: this.startY});
                    this.createDebugPoint(currentX, currentY, '#ff0000', 'debug-point-backtrack');
                }
                return;
            }
        }

        // Only add points if we've moved enough
        if (this.pathPoints.length > 0) {
            const lastPoint = this.pathPoints[this.pathPoints.length - 1];
            const dx = currentX - lastPoint.x;
            const dy = currentY - lastPoint.y;
            // Skip if we haven't moved at least 5 pixels
            if (dx * dx + dy * dy < 25) return;
        }

        // Add point to path
        this.pathPoints.push({x: currentX, y: currentY});
        
        // Keep only last N points for performance
        if (this.pathPoints.length > 50) {
            this.pathPoints = this.pathPoints.slice(-50);
        }

        // Add debug point
        if (this.debug) {
            this.createDebugPoint(currentX, currentY);
        }

        // Detect arc direction if not set
        if (this.arcDirection === null && this.pathPoints.length > 5) {
            const dx = currentX - this.startX;
            this.arcDirection = Math.sign(dx);
        }

        // Update button positions with requestAnimationFrame
        if (!this.updateScheduled) {
            this.updateScheduled = true;
            requestAnimationFrame(() => {
                // Only update circle fit every 3 frames for performance
                if (this.frameCount % 3 === 0) {
                    this.updateCircleFit(currentX, currentY);
                }
                this.frameCount = (this.frameCount || 0) + 1;
                
                this.updateButtonPositions();
                this.updateScheduled = false;
            });
        }
    }

    updateButtonPositions() {
        // Cache frequently accessed properties
        const buttons = this.buttons;
        const buttonCount = buttons.length;
        if (buttonCount === 0) return;

        // Use fitted points if available, otherwise fall back to raw points
        const pointsToUse = (this.fittedPoints && this.fittedPoints.length >= 2) ? this.fittedPoints : this.pathPoints;
        if (pointsToUse.length < 2) return;

        // Pre-calculate segments for performance
        const segments = [];
        let totalLength = 0;
        
        // Use fewer points for length calculation
        const stride = Math.max(1, Math.floor(pointsToUse.length / 10));
        for (let i = stride; i < pointsToUse.length; i += stride) {
            const prev = pointsToUse[i - stride];
            const curr = pointsToUse[i];
            const segDx = curr.x - prev.x;
            const segDy = curr.y - prev.y;
            const length = Math.sqrt(segDx * segDx + segDy * segDy);
            totalLength += length;
            segments.push({ start: i - stride, end: i, length });
        }

        // Calculate button size once
        const buttonSize = Math.min(50, Math.max(35, totalLength / (buttonCount * 2)));
        const halfButtonSize = buttonSize / 2;
        const initialOffset = buttonSize;
        const remainingLength = totalLength - initialOffset;

        // Create a document fragment for batch updates
        const fragment = document.createDocumentFragment();
        
        // Update all buttons at once
        buttons.forEach((button, index) => {
            const targetDistance = initialOffset + (index / (buttonCount - 1)) * remainingLength;
            
            let currentDist = 0;
            let segmentIndex = 0;
            while (segmentIndex < segments.length && currentDist + segments[segmentIndex].length < targetDistance) {
                currentDist += segments[segmentIndex].length;
                segmentIndex++;
            }

            let x, y;
            if (segmentIndex >= segments.length) {
                const lastPoint = pointsToUse[pointsToUse.length - 1];
                x = lastPoint.x;
                y = lastPoint.y;
            } else {
                const segment = segments[segmentIndex];
                const segmentPos = (targetDistance - currentDist) / segment.length;
                const start = pointsToUse[segment.start];
                const end = pointsToUse[segment.end];
                x = start.x + (end.x - start.x) * segmentPos;
                y = start.y + (end.y - start.y) * segmentPos;
            }

            // Clip to viewport bounds
            const topMargin = buttonSize * 0.6;
            const bottomMargin = 80;
            const sideMargin = buttonSize * 0.6;
            
            const clippedX = Math.max(sideMargin, Math.min(this.viewportWidth - sideMargin, x));
            const clippedY = Math.max(topMargin, Math.min(this.viewportHeight - bottomMargin, y));

            // Batch style updates
            const style = button.style;
            style.cssText = `
                position: fixed;
                width: ${buttonSize}px;
                height: ${buttonSize}px;
                left: ${clippedX - halfButtonSize}px;
                top: ${clippedY - halfButtonSize}px;
                transform: scale(${Math.min(1, Math.max(0, (this.getDistance(x, y, this.startX, this.startY) - (index === 0 ? 5 : 15)) / 35))});
            `;

            fragment.appendChild(button);
        });

        // Single DOM update
        this.arcMenu.appendChild(fragment);
    }

    handleTouchEnd() {
        console.log('Touch/Mouse end handler called, isActive:', this.isActive);
        if (!this.isActive) return;
        
        this.isActive = false;  // Reset active state
        this.startX = null;  // Reset start position
        this.startY = null;

        // Show the action bar again if it was hidden
        if (this.config.hideActionBar) {
            this.actionBar.style.opacity = '1';
        }

        // Add final debug point in purple
        if (this.debug && this.pathPoints.length > 0) {
            const lastPoint = this.pathPoints[this.pathPoints.length - 1];
            this.createDebugPoint(lastPoint.x, lastPoint.y, '#800080', 'debug-point-end');
        }

        // Cleanup
        this.buttons.forEach(button => {
            button.style.transform = 'scale(0)';
            setTimeout(() => button.remove(), 200);
        });
        this.buttons = [];
        this.pathPoints = [];     // Clear path points
        this.fittedPoints = [];   // Clear fitted points
        this.lockedCircleState = null; // Reset locked circle state
        
        // Hide connecting line and debug arc
        this.connectingPath.style.opacity = '0';
        this.debugArcPath.style.opacity = '0';
        
        // Clear debug points immediately on release
        if (this.debug) {
            this.clearDebugPoints();
        }
    }

    createArcButtons() {
        // Clear existing buttons
        this.arcMenu.innerHTML = '';
        this.buttons = [];

        // Create new buttons, all starting at the same position
        this.menuItems.forEach((item, index) => {
            const button = document.createElement('button');
            button.className = 'arc-button';
            button.innerHTML = item.icon;
            button.setAttribute('aria-label', item.label);
            button.style.transform = 'scale(0)'; // Start invisible
            button.style.position = 'fixed';     // Ensure fixed positioning
            button.style.display = 'flex';       // Ensure flex display
            button.style.alignItems = 'center';  // Center content
            button.style.justifyContent = 'center'; // Center content
            button.style.zIndex = '10000';       // Ensure buttons are on top
            button.style.cursor = 'pointer';     // Show pointer cursor
            
            // Add both click and touchend handlers
            const handleInteraction = (e) => {
                console.log(`Button ${item.label} clicked/touched`);
                e.preventDefault();
                e.stopPropagation();
                this.isActive = false; // Deactivate menu
                this.handleTouchEnd(); // Clean up
                item.onClick?.();
            };
            
            button.addEventListener('click', handleInteraction);
            button.addEventListener('touchend', handleInteraction);
            
            this.arcMenu.appendChild(button);
            this.buttons.push(button);
            
            if (this.debug) {
                console.log(`Created button ${index}: ${item.icon} (${item.label})`);
            }
        });
    }

    clearDebugPoints() {
        this.debugPoints.forEach(point => {
            if (point && point.parentNode) {
                point.remove();
            }
        });
        this.debugPoints = [];
    }

    clearDebugPointsByClass(className) {
        this.debugPoints = this.debugPoints.filter(point => {
            if (point && point.className === className) {
                if (point.parentNode) {
                    point.remove();
                }
                return false;
            }
            return true;
        });
    }

    createDebugPoint(x, y, color = 'red', className = 'debug-point') {
        const point = document.createElement('div');
        point.className = className;
        point.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background-color: ${color};
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            left: ${x - 5}px;
            top: ${y - 5}px;
        `;
        document.body.appendChild(point);
        this.debugPoints.push(point);
        return point;
    }

    getDistance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    }

    updateCircleFit(currentX, currentY) {
        if (this.debug) {
            this.clearDebugPointsByClass('debug-point-fitted');
        }

        const points = this.pathPoints;
        if (points.length < 3) return;

        // If we already have a locked circle state, just update the end angle
        if (this.lockedCircleState) {
            const currentAngle = Math.atan2(currentY - this.lockedCircleState.centerY, 
                                          currentX - this.lockedCircleState.centerX);
            
            // Calculate the total angle swept from start
            const startAngle = this.lockedCircleState.startAngle;
            let angleDiff = currentAngle - startAngle;
            
            // Normalize the angle difference based on arc direction
            if (this.arcDirection > 0) {
                while (angleDiff < 0) angleDiff += 2 * Math.PI;
                while (angleDiff > 2 * Math.PI) angleDiff -= 2 * Math.PI;
            } else {
                while (angleDiff > 0) angleDiff -= 2 * Math.PI;
                while (angleDiff < -2 * Math.PI) angleDiff += 2 * Math.PI;
            }
            
            // Update circle state with normalized angles
            this.circleState = {
                ...this.lockedCircleState,
                startAngle: startAngle,
                endAngle: startAngle + angleDiff
            };
            
            this.updateFittedPoints();
            return;
        }

        // Take a subset of points for initial fitting - more at start, fewer later
        const stride = Math.max(1, Math.floor(points.length / 20)); // Use 5% of points
        const sampledPoints = points.filter((_, i) => 
            i === 0 || // Always include start point
            i === points.length - 1 || // Always include end point
            i % stride === 0 // Sample points in between
        );

        // Do initial fit with sampled points
        this.fitCircleToPoints(sampledPoints);
        if (!this.circleState.radius) return;

        // Quick check of last few points against current fit
        const lastFewPoints = points.slice(-5);
        let needsRefit = false;
        
        for (const point of lastFewPoints) {
            const dx = point.x - this.circleState.centerX;
            const dy = point.y - this.circleState.centerY;
            const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
            const deviation = Math.abs(distanceFromCenter - this.circleState.radius);
            
            if (deviation > this.maxDeviation) {
                needsRefit = true;
                break;
            }
        }

        // Only do a full refit if recent points don't match well
        if (needsRefit) {
            this.fitCircleToPoints(points);
            if (!this.circleState.radius) return;
        }

        // If we've drawn enough points and have a good circle fit, lock it
        if (this.pathPoints.length > 10 && this.circleState && !this.lockedCircleState) {
            this.lockedCircleState = { ...this.circleState };
            if (this.debug) {
                console.log('Circle parameters locked:', this.lockedCircleState);
            }
            this.createArcButtons(); // Create buttons once we lock the circle
        }

        this.updateFittedPoints();
    }

    fitCircleToPoints(points, endPoint) {
        // Take three points: start, middle, and end
        const startPoint = points[0];
        const midPoint = points[Math.floor(points.length / 2)];
        const endPointForFit = endPoint || points[points.length - 1];
        
        // Calculate vectors from start to mid and mid to end
        const dx1 = midPoint.x - startPoint.x;
        const dy1 = midPoint.y - startPoint.y;
        const dx2 = endPointForFit.x - midPoint.x;
        const dy2 = endPointForFit.y - midPoint.y;
        
        // Avoid tiny movements
        if (Math.abs(dx1) < 0.01 && Math.abs(dy1) < 0.01) return;
        if (Math.abs(dx2) < 0.01 && Math.abs(dy2) < 0.01) return;
        
        // Find perpendicular vector to create center point
        const perpX = -dy2;  // Perpendicular to the curve direction
        const perpY = dx2;
        const perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
        
        // Calculate distance from midpoint to desired center
        // This should be large enough to place center off screen
        const desiredRadius = this.arcDirection > 0 ? 
            this.viewportWidth + 100 - midPoint.x : 
            midPoint.x + 100;
            
        // Calculate center point
        const centerX = midPoint.x + (perpX / perpLength) * desiredRadius * (this.arcDirection > 0 ? 1 : -1);
        const centerY = midPoint.y + (perpY / perpLength) * desiredRadius * (this.arcDirection > 0 ? 1 : -1);
        
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
        if (this.arcDirection > 0 && startAngle > endAngle) {
            adjustedEndAngle += 2 * Math.PI;
        } else if (this.arcDirection < 0 && endAngle > startAngle) {
            adjustedEndAngle -= 2 * Math.PI;
        }
        
        // Update circle state
        this.circleState = {
            centerX,
            centerY,
            radius,
            startAngle,
            endAngle: adjustedEndAngle
        };

        if (this.debug) {
            console.log(`Best circle: center(${centerX.toFixed(0)}, ${centerY.toFixed(0)}) radius(${radius.toFixed(0)}), ${this.arcDirection > 0 ? 'right' : 'left'} hand`);
        }

        this.updateFittedPoints();
    }

    updateFittedPoints() {
        // Generate fitted points
        this.fittedPoints = [];
        const numPoints = 20; // Increased number of points for smoother arc
        
        // Use angles directly from circle state
        const startAngle = this.circleState.startAngle;
        const endAngle = this.circleState.endAngle;
        const angleRange = endAngle - startAngle;
        
        for (let i = 0; i < numPoints; i++) {
            const t = i / (numPoints - 1);
            const angle = startAngle + (angleRange * t);
            const x = this.circleState.centerX + this.circleState.radius * Math.cos(angle);
            const y = this.circleState.centerY + this.circleState.radius * Math.sin(angle);
            this.fittedPoints.push({x, y});
            
            if (this.debug) {
                this.createDebugPoint(x, y, '#00ff00', 'debug-point-fitted');
            }
        }
        
        if (this.debug) {
            this.createDebugPoint(this.circleState.centerX, this.circleState.centerY, 'blue', 'debug-point-center');
        }
    }
}

// Initialize the arc menu when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ArcMenu(document.querySelector('.action-bar'));
});
