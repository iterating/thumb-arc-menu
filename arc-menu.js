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

        const lastPoint = this.pathPoints[this.pathPoints.length - 1];
        const dx = currentX - lastPoint.x;
        const dy = currentY - lastPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 10) {
            this.pathPoints.push({x: currentX, y: currentY});
            
            // Add debug point
            if (this.debug) {
                this.createDebugPoint(currentX, currentY);
            }
        }

        this.positionButtons(currentX, currentY);
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

    positionButtons(currentX, currentY) {
        if (!this.isActive || this.pathPoints.length < 3) return;

        // Get the total path length
        let totalLength = 0;
        const segments = [];
        for (let i = 1; i < this.pathPoints.length; i++) {
            const dx = this.pathPoints[i].x - this.pathPoints[i-1].x;
            const dy = this.pathPoints[i].y - this.pathPoints[i-1].y;
            const length = Math.sqrt(dx * dx + dy * dy);
            totalLength += length;
            segments.push({ start: i-1, end: i, length });
        }

        // Position buttons along the actual path
        this.buttons.forEach((button, index) => {
            // Calculate desired distance along path for this button
            const targetDistance = (index / (this.buttons.length - 1)) * totalLength;
            
            // Find the segment containing this position
            let currentDist = 0;
            let segmentIndex = 0;
            while (segmentIndex < segments.length && currentDist + segments[segmentIndex].length < targetDistance) {
                currentDist += segments[segmentIndex].length;
                segmentIndex++;
            }

            // If we're at the end, use the last point
            if (segmentIndex >= segments.length) {
                const lastPoint = this.pathPoints[this.pathPoints.length - 1];
                button.style.left = `${lastPoint.x - 25}px`;
                button.style.top = `${lastPoint.y - 25}px`;
                return;
            }

            // Calculate position within the segment
            const segment = segments[segmentIndex];
            const segmentPos = (targetDistance - currentDist) / segment.length;
            const start = this.pathPoints[segment.start];
            const end = this.pathPoints[segment.end];

            // Interpolate position
            const x = start.x + (end.x - start.x) * segmentPos;
            const y = start.y + (end.y - start.y) * segmentPos;

            // Scale based on distance from start
            const dx = x - this.pathPoints[0].x;
            const dy = y - this.pathPoints[0].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const scale = Math.min(1, Math.max(0, (distance - 20) / 50));

            button.style.left = `${x - 25}px`;
            button.style.top = `${y - 25}px`;
            button.style.transform = `scale(${scale})`;
        });
    }
}

// Initialize the arc menu when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ArcMenu();
});
