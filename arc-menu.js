// ArcMenu class to handle the thumb arc interaction
class ArcMenu {
    constructor() {
        this.actionBar = document.querySelector('.action-bar');
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
            { icon: '🔍', label: 'Search' },
            { icon: '⭐', label: 'Favorite' },
            { icon: '✏️', label: 'Edit' },
            { icon: '🗑️', label: 'Delete' },
            { icon: '📤', label: 'Share' }
        ];

        // Debug mode - toggle with 'D' key
        this.debug = false;
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
        // Initialize touch event listeners with passive option
        this.actionBar.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
        
        // Add mouse event listeners
        this.actionBar.addEventListener('mousedown', (e) => {
            console.log('Mouse down detected', e);
            this.handleTouchStart({ touches: [e] });
        });
        document.addEventListener('mousemove', (e) => {
            if (this.isActive) {
                console.log('Mouse move detected', e);
                this.handleTouchMove({ touches: [e] });
            }
        });
        document.addEventListener('mouseup', (e) => {
            console.log('Mouse up detected', e);
            this.handleTouchEnd();
        });
    }

    handleTouchStart(e) {
        this.isActive = true;
        const touch = e.touches[0];
        this.startX = touch.clientX;
        this.startY = touch.clientY;
        this.pathPoints = [];
        this.fittedPoints = [];
        this.arcDirection = null;  // Reset direction on new touch
        this.lockedCircleState = null; // Reset locked circle state
        
        // Clear any existing buttons
        this.buttons.forEach(button => button.remove());
        this.buttons = [];
        
        // Clear debug points
        if (this.debug) {
            this.clearDebugPoints();
            this.createDebugPoint(this.startX, this.startY, 'green');
        }
    }

    handleTouchMove(e) {
        if (!this.isActive) return;

        const touch = e.touches[0];
        const currentX = touch.clientX;
        const currentY = touch.clientY;

        // Only clip raw input points, not calculated points
        const margin = 10;
        if (currentX < margin || currentX > this.viewportWidth - margin ||
            currentY < margin || currentY > this.viewportHeight - margin) {
            return;
        }

        // If we somehow lost our points, restore the start point
        if (this.pathPoints.length === 0) {
            this.pathPoints.push({x: this.startX, y: this.startY});
            if (this.debug) {
                this.createDebugPoint(this.startX, this.startY, 'green');
            }
        }

        const lastPoint = this.pathPoints[this.pathPoints.length - 1];
        const dx = currentX - lastPoint.x;
        const dy = currentY - lastPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Check if user is backtracking
        if (!this.lockedCircleState && this.arcDirection !== null && this.pathPoints.length > 5 && this.circleState.radius) {
            // Calculate current angle from circle center
            const currentAngle = Math.atan2(currentY - this.circleState.centerY, currentX - this.circleState.centerX);
            
            // Get previous point's angle
            const prevPoint = this.pathPoints[this.pathPoints.length - 1];
            const prevAngle = Math.atan2(prevPoint.y - this.circleState.centerY, prevPoint.x - this.circleState.centerX);
            
            // Calculate angle difference, considering the circle direction
            let angleDiff = currentAngle - prevAngle;
            // Normalize angle to [-π, π]
            if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
            
            // Check if movement direction matches arc direction
            const isBacktracking = (this.arcDirection > 0 && angleDiff < -0.1) || 
                                 (this.arcDirection < 0 && angleDiff > 0.1);
            
            if (isBacktracking) {
                if (this.debug) {
                    console.log('Backtracking detected - angleDiff:', angleDiff);
                }
                this.handleTouchEnd();
                return;
            }

            // Check for wild movements outside curve boundaries
            const dx = currentX - this.circleState.centerX;
            const dy = currentY - this.circleState.centerY;
            const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
            const deviation = Math.abs(distanceFromCenter - this.circleState.radius);
            
            // If deviation is more than 2x the maxDeviation, switch to action mode
            if (deviation > this.maxDeviation * 2) {
                if (this.debug) {
                    console.log('Wild movement detected - deviation:', deviation);
                }
                // For now, just close the menu. Later we can implement specific actions
                this.handleTouchEnd();
                return;
            }
        }

        // Only add points if significant movement
        if (distance > 5) {
            this.pathPoints.push({x: currentX, y: currentY});
            if (this.debug) {
                this.createDebugPoint(currentX, currentY, 'red', 'debug-point-raw');
            }

            // Wait for enough points before determining direction
            if (this.arcDirection === null && this.pathPoints.length >= this.minPointsForDirection) {
                // Count how many points move left vs right
                let leftCount = 0;
                let rightCount = 0;
                
                for (let i = 1; i < this.pathPoints.length; i++) {
                    const dx = this.pathPoints[i].x - this.pathPoints[i-1].x;
                    if (dx < 0) leftCount++;
                    if (dx > 0) rightCount++;
                }
                
                this.arcDirection = leftCount > rightCount ? -1 : 1;
                if (this.debug) {
                    console.log(`Direction set to: ${this.arcDirection > 0 ? 'RIGHT' : 'LEFT'} (${this.arcDirection})`);
                }
            }

            // Throttle circle fitting
            const now = Date.now();
            if (this.pathPoints.length >= 3 && now - this.lastFitTime >= this.fitThrottleMs) {
                this.lastFitTime = now;
                if (this.debug) {
                    console.log(`Current arcDirection before fitting: ${this.arcDirection}`);
                }
                this.updateCircleFit(currentX, currentY);
            }
        }

        // Always update button positions
        this.updateButtonPositions();
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
            this.circleState = {
                ...this.lockedCircleState,
                endAngle: currentAngle
            };
            
            // Adjust end angle based on direction to ensure proper arc
            if (this.arcDirection > 0 && this.circleState.startAngle > this.circleState.endAngle) {
                this.circleState.endAngle += 2 * Math.PI;
            } else if (this.arcDirection < 0 && this.circleState.endAngle > this.circleState.startAngle) {
                this.circleState.endAngle -= 2 * Math.PI;
            }
            
            this.updateFittedPoints();
            return;
        }

        // Try fitting with all points first
        this.fitCircleToPoints(points);
        if (!this.circleState.radius) return;

        // Now verify how many points actually fit this circle
        let goodPoints = [];
        let badPoints = [];
        
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            const dx = point.x - this.circleState.centerX;
            const dy = point.y - this.circleState.centerY;
            const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
            const deviation = Math.abs(distanceFromCenter - this.circleState.radius);
            
            if (deviation <= this.maxDeviation) {
                goodPoints.push(point);
            } else {
                badPoints.push(point);
            }
        }

        // If we have more bad points than good points, try fitting with just the good points
        if (badPoints.length > goodPoints.length && goodPoints.length >= 3) {
            if (this.debug) {
                console.log(`Found ${badPoints.length} bad points vs ${goodPoints.length} good points, refitting with good points only`);
            }
            this.fitCircleToPoints(goodPoints);
        }

        // Update fitted points for visualization
        this.updateFittedPoints();

        // If we've drawn enough points and have a good circle fit, lock it
        if (this.pathPoints.length > 10 && this.circleState && !this.lockedCircleState) {
            this.lockedCircleState = { ...this.circleState };
            if (this.debug) {
                console.log('Circle parameters locked:', this.lockedCircleState);
            }
            this.createArcButtons(); // Create buttons once we lock the circle
        }
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

    updateButtonPositions() {
        // Get the total path length for button positioning
        let totalLength = 0;
        const segments = [];
        
        // Use fitted points if available, otherwise fall back to raw points
        const pointsToUse = (this.fittedPoints && this.fittedPoints.length >= 2) ? this.fittedPoints : this.pathPoints;
        
        for (let i = 1; i < pointsToUse.length; i++) {
            const segDx = pointsToUse[i].x - pointsToUse[i-1].x;
            const segDy = pointsToUse[i].y - pointsToUse[i-1].y;
            const length = Math.sqrt(segDx * segDx + segDy * segDy);
            totalLength += length;
            segments.push({ start: i-1, end: i, length });
        }

        // Position buttons along the path
        this.buttons.forEach((button, index) => {
            const targetDistance = (index / (this.buttons.length - 1)) * totalLength;
            
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

            // Only clip the buttons to stay on screen, not the path points
            const margin = 50;
            const clippedX = Math.max(margin, Math.min(this.viewportWidth - margin, x));
            const clippedY = Math.max(margin, Math.min(this.viewportHeight - margin, y));

            button.style.left = `${clippedX - 25}px`;
            button.style.top = `${clippedY - 25}px`;
            const scale = Math.min(1, Math.max(0, (this.getDistance(x, y, this.startX, this.startY) - 20) / 50));
            button.style.transform = `scale(${scale})`;
        });
    }

    handleTouchEnd() {
        console.log('Touch/Mouse end handler called, isActive:', this.isActive);
        if (!this.isActive) return;
        this.isActive = false;

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
            this.arcMenu.appendChild(button);
            this.buttons.push(button);
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
}

// Initialize the arc menu when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ArcMenu();
});
