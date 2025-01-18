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
        
        // Determine arc direction on first move
        if (this.pathPoints.length === 1) {
            this.arcDirection = Math.sign(currentX - this.startX) || 1;
        }

        // Only add points if moving enough distance
        if (distance > 10) {
            this.pathPoints.push({x: currentX, y: currentY});
            if (this.debug) {
                this.createDebugPoint(currentX, currentY);
            }

            // Calculate path length from start
            let pathLength = 0;
            for (let i = 1; i < this.pathPoints.length; i++) {
                const p1 = this.pathPoints[i - 1];
                const p2 = this.pathPoints[i];
                pathLength += Math.sqrt(
                    Math.pow(p2.x - p1.x, 2) + 
                    Math.pow(p2.y - p1.y, 2)
                );
            }

            // Try to project the arc VERY early - after just 5% movement and 3 points
            const minPathLength = this.maxArcRadius * 0.05; // Just 20 pixels of movement
            
            if (!this.projectedCircle && pathLength > minPathLength && this.pathPoints.length >= 3) {
                this.projectedCircle = this.calculateBestFitCircle();
                if (this.projectedCircle && this.debug) {
                    console.log('Projected circle calculated:', {
                        pathLength,
                        numPoints: this.pathPoints.length,
                        circle: this.projectedCircle
                    });
                    // Show the middle point we used in purple
                    const middleIndex = Math.floor(this.pathPoints.length / 2);
                    const middlePoint = this.pathPoints[middleIndex];
                    this.createDebugPoint(
                        middlePoint.x,
                        middlePoint.y,
                        '#800080'  // Purple
                    );
                }
            }
            
            // Always update the debug arc if we have a projection
            if (this.projectedCircle && this.debug) {
                this.updateDebugArc();
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
            let pathD = `M ${buttonPositions[0].x} ${buttonPositions[0].y}`;
            for (let i = 1; i < buttonPositions.length; i++) {
                pathD += ` L ${buttonPositions[i].x} ${buttonPositions[i].y}`;
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
        
        // Clear debug points after a delay
        if (this.debug) {
            setTimeout(() => this.clearDebugPoints(), 1000);
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

    // Calculate circle using three points method
    calculateBestFitCircle() {
        if (this.pathPoints.length < 3) {
            console.log('Not enough points:', this.pathPoints.length);
            return null;
        }

        // Only use first 30% of points for circle calculation
        const numPointsToUse = Math.max(3, Math.floor(this.pathPoints.length * 0.3));
        const earlyPoints = this.pathPoints.slice(0, numPointsToUse);
        
        console.log('Using early points:', {
            total: this.pathPoints.length,
            using: numPointsToUse,
            points: earlyPoints
        });

        // Get three key points: start, middle, end (of early points)
        const startPoint = earlyPoints[0];
        const endPoint = this.pathPoints[this.pathPoints.length - 1];
        
        // Find point with maximum perpendicular distance from start-end line
        const dx = endPoint.x - startPoint.x;
        const dy = endPoint.y - startPoint.y;
        const lineLength = Math.sqrt(dx * dx + dy * dy);
        if (lineLength < 1) {
            console.log('Line too short');
            return null;
        }
        
        // Normalize direction vector
        const dirX = dx / lineLength;
        const dirY = dy / lineLength;
        
        // Perpendicular direction (rotated 90 degrees)
        const perpX = -dirY;
        const perpY = dirX;
        
        // Find middle point with max distance from line
        let maxDist = 0;
        let middlePoint = null;
        
        // Only look at early points for finding middle point
        for (let i = 1; i < earlyPoints.length - 1; i++) {
            const point = earlyPoints[i];
            // Vector from start to point
            const vpx = point.x - startPoint.x;
            const vpy = point.y - startPoint.y;
            // Perpendicular distance = dot product with perpendicular vector
            const dist = Math.abs(vpx * perpX + vpy * perpY);
            if (dist > maxDist) {
                maxDist = dist;
                middlePoint = point;
            }
        }
        
        // Lower threshold to 1 pixel
        if (!middlePoint || maxDist < 1) {
            console.log('No good middle point found:', { maxDist });
            return null;
        }

        console.log('Found curve:', { 
            maxDist: maxDist,
            middle: middlePoint
        });

        // Calculate circle using three points method
        // First, find perpendicular bisectors of two chords
        
        // Midpoint of first chord (start to middle)
        const mid1X = (startPoint.x + middlePoint.x) / 2;
        const mid1Y = (startPoint.y + middlePoint.y) / 2;
        
        // Midpoint of second chord (middle to end)
        const mid2X = (middlePoint.x + endPoint.x) / 2;
        const mid2Y = (middlePoint.y + endPoint.y) / 2;
        
        // Perpendicular direction of first chord
        const chord1Dx = middlePoint.x - startPoint.x;
        const chord1Dy = middlePoint.y - startPoint.y;
        const perp1X = -chord1Dy;
        const perp1Y = chord1Dx;
        
        // Perpendicular direction of second chord
        const chord2Dx = endPoint.x - middlePoint.x;
        const chord2Dy = endPoint.y - middlePoint.y;
        const perp2X = -chord2Dy;
        const perp2Y = chord2Dx;
        
        // Find intersection of perpendicular bisectors
        const denominator = perp1X * perp2Y - perp1Y * perp2X;
        if (Math.abs(denominator) < 1e-10) {
            console.log('Parallel lines - no intersection');
            return null;
        }
        
        const t = ((mid2X - mid1X) * perp2Y - (mid2Y - mid1Y) * perp2X) / denominator;
        
        // Center is the intersection point
        const centerX = mid1X + t * perp1X;
        const centerY = mid1Y + t * perp1Y;
        
        // Calculate radius as distance to any point
        const radius = Math.sqrt(
            Math.pow(centerX - startPoint.x, 2) + 
            Math.pow(centerY - startPoint.y, 2)
        );

        const result = {
            center: {x: centerX, y: centerY},
            radius: radius
        };

        console.log('Circle calculated:', {
            center: result.center,
            radius: result.radius,
            points: {
                start: startPoint,
                middle: middlePoint,
                end: endPoint
            }
        });

        return result;
    }

    // Calculate and draw the debug arc
    updateDebugArc() {
        if (!this.projectedCircle || !this.debug) {
            console.log('No projected circle or not in debug mode');
            this.debugArcPath.style.opacity = '0';
            return;
        }

        // Use full path points for start/end, but projected circle for the arc
        const startPoint = this.pathPoints[0];
        const endPoint = this.pathPoints[this.pathPoints.length - 1];
        const center = this.projectedCircle.center;
        const radius = this.projectedCircle.radius;

        console.log('Drawing debug arc:', {
            startPoint,
            endPoint,
            center,
            radius,
            arcDirection: this.arcDirection
        });

        // Calculate angles from center to start and end points
        const startAngle = Math.atan2(startPoint.y - center.y, startPoint.x - center.x);
        let endAngle = Math.atan2(endPoint.y - center.y, endPoint.x - center.x);

        // Ensure we draw in the correct direction
        if (this.arcDirection > 0) {
            while (endAngle <= startAngle) endAngle += 2 * Math.PI;
        } else {
            while (endAngle >= startAngle) endAngle -= 2 * Math.PI;
        }

        // Create SVG arc path
        const d = [
            `M ${startPoint.x} ${startPoint.y}`,
            `A ${radius} ${radius} 0 ${Math.abs(endAngle - startAngle) > Math.PI ? '1' : '0'} ${this.arcDirection > 0 ? '1' : '0'} ${endPoint.x} ${endPoint.y}`
        ].join(' ');

        console.log('SVG path:', d);

        this.debugArcPath.setAttribute('d', d);
        this.debugArcPath.style.opacity = '1';
    }
}

// Initialize the arc menu when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ArcMenu();
});
