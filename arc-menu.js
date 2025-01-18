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
        
        // Create SVG element for the connecting line
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
        this.svg.appendChild(this.connectingPath);
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

            // Calculate best-fit circle after we have enough points
            if (this.pathPoints.length >= 5) {
                this.projectedCircle = this.calculateBestFitCircle();
                if (this.projectedCircle && this.debug) {
                    // Show circle center in orange
                    this.createDebugPoint(
                        this.projectedCircle.center.x, 
                        this.projectedCircle.center.y, 
                        '#FF6B00'  // Bright orange
                    );
                }
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
        
        // Hide connecting line
        this.connectingPath.style.opacity = '0';
        
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
        point.style.cssText = `
            position: fixed;
            width: 6px;
            height: 6px;
            background: ${color};
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            left: ${x - 3}px;
            top: ${y - 3}px;
        `;
        document.body.appendChild(point);
        this.debugPoints.push(point);
        return point;
    }

    // Calculate best-fit circle from points
    calculateBestFitCircle() {
        if (this.pathPoints.length < 3) return null;

        // Step 1: Calculate centroid of points
        let sumX = 0, sumY = 0;
        this.pathPoints.forEach(p => {
            sumX += p.x;
            sumY += p.y;
        });
        const meanX = sumX / this.pathPoints.length;
        const meanY = sumY / this.pathPoints.length;

        // Step 2: Shift coordinates to mean
        const shiftedPoints = this.pathPoints.map(p => ({
            x: p.x - meanX,
            y: p.y - meanY
        }));

        // Step 3: Calculate the matrices for least squares fit
        let suu = 0, suv = 0, svv = 0, suuu = 0, suvv = 0, svuu = 0, svvv = 0;
        shiftedPoints.forEach(p => {
            const u = p.x;
            const v = p.y;
            const uu = u * u;
            const vv = v * v;
            suu += uu;
            suv += u * v;
            svv += vv;
            suuu += u * uu;
            suvv += u * vv;
            svuu += v * uu;
            svvv += v * vv;
        });

        // Step 4: Solve the system of equations
        const A = [[suu, suv], [suv, svv]];
        const B = [-(suuu + suvv) / 2, -(svuu + svvv) / 2];

        // Calculate determinant
        const det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
        if (Math.abs(det) < 1e-10) return null;

        // Solve for center
        const centerX = (A[1][1] * B[0] - A[0][1] * B[1]) / det;
        const centerY = (A[0][0] * B[1] - A[1][0] * B[0]) / det;

        // Step 5: Calculate radius
        let radius = 0;
        shiftedPoints.forEach(p => {
            const dx = p.x - centerX;
            const dy = p.y - centerY;
            radius += Math.sqrt(dx * dx + dy * dy);
        });
        radius /= this.pathPoints.length;

        // Transform center back to original coordinates
        return {
            center: {
                x: centerX + meanX,
                y: centerY + meanY
            },
            radius: radius
        };
    }
}

// Initialize the arc menu when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ArcMenu();
});
