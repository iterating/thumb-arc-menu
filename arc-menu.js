// ArcMenu class to handle the thumb arc interaction
class ArcMenu {
    constructor() {
        this.actionBar = document.querySelector('.action-bar');
        this.arcMenu = document.getElementById('arc-menu');
        this.isActive = false;
        this.startX = 0;
        this.startY = 0;
        this.pathPoints = [];  // Store movement points
        this.buttons = [];
        
        // Sample menu items (can be customized)
        this.menuItems = [
            { icon: '🔍', label: 'Search' },
            { icon: '⭐', label: 'Favorite' },
            { icon: '✏️', label: 'Edit' },
            { icon: '🗑️', label: 'Delete' },
            { icon: '📤', label: 'Share' }
        ];

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
        console.log('Start:', { x: this.startX, y: this.startY });
        
        // Create arc buttons
        this.createArcButtons();
    }

    handleTouchMove(e) {
        if (!this.isActive) return;

        const touch = e.touches[0];
        const currentX = touch.clientX;
        const currentY = touch.clientY;

        // Add point to path if it's far enough from last point
        const lastPoint = this.pathPoints[this.pathPoints.length - 1];
        const dx = currentX - lastPoint.x;
        const dy = currentY - lastPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 10) { // Sample every 10px of movement
            this.pathPoints.push({x: currentX, y: currentY});
            console.log('New point:', {x: currentX, y: currentY, points: this.pathPoints.length});
        }

        this.positionButtons(currentX, currentY);
    }

    handleTouchEnd() {
        console.log('Touch/Mouse end handler called, isActive:', this.isActive);
        if (!this.isActive) return;
        this.isActive = false;

        // Cleanup
        this.buttons.forEach(button => {
            button.style.transform = 'scale(0)';
            setTimeout(() => button.remove(), 200);
        });
        this.buttons = [];
        console.log('Menu cleaned up');
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

    // Calculate control point for quadratic bezier curve
    calculateControlPoint() {
        if (this.pathPoints.length < 3) return null;

        // Use first, middle and last points to determine curve
        const start = this.pathPoints[0];
        const end = this.pathPoints[this.pathPoints.length - 1];
        const mid = this.pathPoints[Math.floor(this.pathPoints.length / 2)];

        // Find control point using perpendicular bisector method
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        
        // Calculate perpendicular vector
        const perpX = -dy;
        const perpY = dx;
        
        // Distance from mid point to actual middle point determines curve intensity
        const intensity = Math.sqrt(
            Math.pow(mid.x - midX, 2) + 
            Math.pow(mid.y - midY, 2)
        ) * 2;
        
        // Normalize perpendicular vector and scale by intensity
        const len = Math.sqrt(perpX * perpX + perpY * perpY);
        const controlX = midX + (perpX / len) * intensity;
        const controlY = midY + (perpY / len) * intensity;
        
        return {x: controlX, y: controlY};
    }

    // Get point on quadratic bezier curve at t (0-1)
    getPointOnCurve(t, start, control, end) {
        const t1 = 1 - t;
        return {
            x: t1 * t1 * start.x + 2 * t1 * t * control.x + t * t * end.x,
            y: t1 * t1 * start.y + 2 * t1 * t * control.y + t * t * end.y
        };
    }

    positionButtons(currentX, currentY) {
        if (!this.isActive || this.pathPoints.length < 3) return;

        const control = this.calculateControlPoint();
        if (!control) return;

        const start = this.pathPoints[0];
        const end = this.pathPoints[this.pathPoints.length - 1];
        
        // Position buttons along the curve
        this.buttons.forEach((button, index) => {
            // Calculate position along curve (0 to 1)
            const t = index / (this.buttons.length - 1);
            const pos = this.getPointOnCurve(t, start, control, end);
            
            // Scale based on distance from start
            const dx = pos.x - start.x;
            const dy = pos.y - start.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const scale = Math.min(1, Math.max(0, (distance - 20) / 50));

            button.style.left = `${pos.x - 25}px`;
            button.style.top = `${pos.y - 25}px`;
            button.style.transform = `scale(${scale})`;
        });
    }
}

// Initialize the arc menu when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ArcMenu();
});
