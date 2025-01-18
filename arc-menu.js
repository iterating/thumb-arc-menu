// ArcMenu class to handle the thumb arc interaction
class ArcMenu {
    constructor() {
        this.actionBar = document.querySelector('.action-bar');
        this.arcMenu = document.getElementById('arc-menu');
        this.isActive = false;
        this.startX = 0;
        this.startY = 0;
        this.pathPoints = [];  // Store movement points
        this.debugPoints = [];  // Store debug elements
        this.buttons = [];
        this.arcDirection = 1; // Default arc direction
        this.maxArcRadius = 400; // Increased from 200 to allow wider arcs
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
        const touch = e.touches[0];
        this.startX = touch.clientX;
        this.startY = touch.clientY;
        this.pathPoints = [{x: this.startX, y: this.startY}];
        this.isActive = true;
        
        // Clear any existing debug points
        if (this.debug) {
            this.clearDebugPoints();
            this.createDebugPoint(this.startX, this.startY, 'green');  // Start point in green
        }
        
        // Create arc buttons
        this.createArcButtons();
    }

    handleTouchMove(e) {
        if (!this.isActive) return;

        const touch = e.touches[0];
        const currentX = touch.clientX;
        const currentY = touch.clientY;

        // Ignore points outside viewport (with small margin)
        const margin = 10;
        if (currentX < margin || currentX > this.viewportWidth - margin ||
            currentY < margin || currentY > this.viewportHeight - margin) {
            return;
        }

        // Always add the point if we're in debug mode and moving
        if (this.debug) {
            const lastPoint = this.pathPoints[this.pathPoints.length - 1];
            const dx = currentX - lastPoint.x;
            const dy = currentY - lastPoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 5) {  // Only add if moved more than 5 pixels
                this.pathPoints.push({x: currentX, y: currentY});
                this.createDebugPoint(currentX, currentY, 'red');
                
                // If we have enough points, calculate the best fit circle
                if (this.pathPoints.length >= 3) {
                    const points = this.pathPoints;
                    let sumX = 0, sumY = 0;
                    
                    // Calculate center as average of points
                    points.forEach(point => {
                        sumX += point.x;
                        sumY += point.y;
                    });
                    
                    const n = points.length;
                    const centerX = sumX / n;
                    const centerY = sumY / n;
                    
                    // Calculate average radius
                    let radius = 0;
                    points.forEach(point => {
                        const dx = point.x - centerX;
                        const dy = point.y - centerY;
                        radius += Math.sqrt(dx * dx + dy * dy);
                    });
                    radius /= n;
                    
                    console.log(`%cBest circle: center(${centerX.toFixed(0)}, ${centerY.toFixed(0)}) radius(${radius.toFixed(0)}), ${this.arcDirection > 0 ? 'right' : 'left'} hand`, 'color: #00ff00; font-weight: bold');
                    
                    // Create a debug point for the center
                    this.createDebugPoint(centerX, centerY, 'blue');
                }
            }
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

        // On first substantial movement, determine the arc direction
        if (this.pathPoints.length === 1 && distance > 10) {
            const directionX = currentX - this.startX;
            this.arcDirection = Math.sign(directionX) || 1;
            
            // Initialize the sector angle range based on initial direction
            this.currentAngle = Math.atan2(dy, dx);
            this.startAngle = this.currentAngle;
            
            // Set allowed angle range (120 degrees total)
            this.minAngle = this.startAngle - Math.PI / 3;
            this.maxAngle = this.startAngle + Math.PI / 3;
        }

        // Enforce arc constraints
        if (this.arcDirection && distance > 5) {
            const proposedAngle = Math.atan2(dy, dx);
            
            // Normalize angles to handle the -PI to PI transition
            let normalizedProposed = proposedAngle;
            let normalizedMin = this.minAngle;
            let normalizedMax = this.maxAngle;
            
            if (this.arcDirection > 0) {
                // For rightward movement, angle should increase
                if (proposedAngle < this.currentAngle - Math.PI) {
                    normalizedProposed += 2 * Math.PI;
                }
                if (normalizedProposed < normalizedMin || normalizedProposed > normalizedMax) {
                    return;
                }
            } else {
                // For leftward movement, angle should decrease
                if (proposedAngle > this.currentAngle + Math.PI) {
                    normalizedProposed -= 2 * Math.PI;
                }
                if (normalizedProposed > normalizedMax || normalizedProposed < normalizedMin) {
                    return;
                }
            }
            
            // Update current angle if valid
            this.currentAngle = proposedAngle;
            
            // Add the point since it's valid
            this.pathPoints.push({x: currentX, y: currentY});
            if (this.debug) {
                this.createDebugPoint(currentX, currentY);
            }
        }

        // Get the total path length for button positioning
        let totalLength = 0;
        const segments = [];
        for (let i = 1; i < this.pathPoints.length; i++) {
            const segDx = this.pathPoints[i].x - this.pathPoints[i-1].x;
            const segDy = this.pathPoints[i].y - this.pathPoints[i-1].y;
            const length = Math.sqrt(segDx * segDx + segDy * segDy);
            totalLength += length;
            segments.push({ start: i-1, end: i, length });
        }

        // Position buttons along the path
        let buttonPositions = [];
        this.buttons.forEach((button, index) => {
            const targetDistance = (index / (this.buttons.length - 1)) * totalLength;
            
            // Find segment containing this position
            let currentDist = 0;
            let segmentIndex = 0;
            while (segmentIndex < segments.length && currentDist + segments[segmentIndex].length < targetDistance) {
                currentDist += segments[segmentIndex].length;
                segmentIndex++;
            }

            let x, y;
            if (segmentIndex >= segments.length) {
                const lastPoint = this.pathPoints[this.pathPoints.length - 1];
                x = lastPoint.x;
                y = lastPoint.y;
            } else {
                const segment = segments[segmentIndex];
                const segmentPos = (targetDistance - currentDist) / segment.length;
                const start = this.pathPoints[segment.start];
                const end = this.pathPoints[segment.end];
                x = start.x + (end.x - start.x) * segmentPos;
                y = start.y + (end.y - start.y) * segmentPos;
            }

            // Keep buttons within viewport bounds (with 50px margin)
            const margin = 50;
            x = Math.max(margin, Math.min(this.viewportWidth - margin, x));
            y = Math.max(margin, Math.min(this.viewportHeight - margin, y));

            buttonPositions.push({x, y});

            const buttonDx = x - this.startX;
            const buttonDy = y - this.startY;
            const buttonDistance = Math.sqrt(buttonDx * buttonDx + buttonDy * buttonDy);
            const scale = Math.min(1, Math.max(0, (buttonDistance - 20) / 50));

            button.style.left = `${x - 25}px`;
            button.style.top = `${y - 25}px`;
            button.style.transform = `scale(${scale})`;
        });

        // Update connecting line
        if (buttonPositions.length >= 2) {
            // Start the path at the first point
            let pathD = `M ${buttonPositions[0].x} ${buttonPositions[0].y}`;
            
            // For each segment, calculate a smooth curve
            for (let i = 1; i < buttonPositions.length; i++) {
                const current = buttonPositions[i];
                const prev = buttonPositions[i - 1];
                
                if (i < buttonPositions.length - 1) {
                    // Calculate control point as midpoint between prev and next
                    const next = buttonPositions[i + 1];
                    const controlX = current.x;
                    const controlY = current.y;
                    
                    // Use quadratic Bézier curve (Q) for smoother transition
                    pathD += ` Q ${controlX} ${controlY}, ${(current.x + next.x) / 2} ${(current.y + next.y) / 2}`;
                } else {
                    // For the last segment, just curve to the final point
                    pathD += ` Q ${current.x} ${current.y}, ${current.x} ${current.y}`;
                }
            }
            
            this.connectingPath.setAttribute('d', pathD);
            this.connectingPath.style.opacity = '1';
        }
    }

    handleTouchEnd() {
        console.log('Touch/Mouse end handler called, isActive:', this.isActive);
        if (!this.isActive) return;
        this.isActive = false;

        // Add final debug point in blue
        if (this.debug && this.pathPoints.length > 0) {
            const lastPoint = this.pathPoints[this.pathPoints.length - 1];
            this.createDebugPoint(lastPoint.x, lastPoint.y, 'blue');
        }

        // Cleanup
        this.buttons.forEach(button => {
            button.style.transform = 'scale(0)';
            setTimeout(() => button.remove(), 200);
        });
        this.buttons = [];
        
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
        this.debugPoints.forEach(point => point.remove());
        this.debugPoints = [];
    }

    createDebugPoint(x, y, color = 'red') {
        const point = document.createElement('div');
        point.className = 'debug-point';
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

    // Removed calculateBestFitCircle and updateDebugArc methods
}

// Initialize the arc menu when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ArcMenu();
});
