// ArcMenu class to handle the thumb arc interaction
class ArcMenu {
    constructor() {
        this.actionBar = document.querySelector('.action-bar');
        this.arcMenu = document.getElementById('arc-menu');
        this.isActive = false;
        this.startX = 0;
        this.startY = 0;
        this.lastX = 0;
        this.arcDirection = null;
        this.VERTICAL_THRESHOLD = 30;  // Increased to 30px for better sampling
        this.xPositions = [];  // Track X positions during vertical movement
        this.buttons = [];
        this.expectedRightward = null;
        
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
        
        // Get action bar position
        const actionBarRect = this.actionBar.getBoundingClientRect();
        const startFromLeft = this.startX < (actionBarRect.left + actionBarRect.width / 2);
        
        // If starting from left side, expect rightward movement (right-handed)
        // If starting from right side, expect leftward movement (left-handed)
        this.expectedRightward = startFromLeft;
        
        this.lastX = this.startX;
        this.arcDirection = null;
        this.xPositions = [this.startX];
        this.isActive = true;
        console.log('Start:', { 
            x: this.startX, 
            y: this.startY,
            startFromLeft,
            expectedMovement: this.expectedRightward ? 'rightward' : 'leftward'
        });
        
        // Create arc buttons
        this.createArcButtons();
    }

    handleTouchMove(e) {
        if (!this.isActive) return;

        const touch = e.touches[0];
        const currentX = touch.clientX;
        const currentY = touch.clientY;
        const verticalMove = this.startY - currentY;
        
        // Track X positions during vertical movement
        if (this.arcDirection === null) {
            this.xPositions.push(currentX);
            
            if (verticalMove > (this.VERTICAL_THRESHOLD * 0.5)) {
                console.log('Move:', {
                    verticalMove,
                    threshold: this.VERTICAL_THRESHOLD,
                    xChange: currentX - this.startX,
                    expectedMovement: this.expectedRightward ? 'rightward' : 'leftward'
                });
            }
        }

        // Determine arc direction after vertical threshold is met
        if (this.arcDirection === null && verticalMove >= this.VERTICAL_THRESHOLD) {
            const xStart = this.xPositions[0];
            const xEnd = this.xPositions[this.xPositions.length - 1];
            const movedRightward = xEnd - xStart > 0;
            
            // If movement matches expected direction, use that
            // Otherwise, fall back to the movement direction
            this.arcDirection = (Math.abs(xEnd - xStart) > 20) ? 
                movedRightward : // Strong horizontal movement, use that
                this.expectedRightward; // Weak movement, use expected direction
            
            console.log('Direction determined:', {
                direction: this.arcDirection ? 'RIGHT' : 'LEFT',
                startFromLeft: this.expectedRightward,
                totalXChange: xEnd - xStart,
                usedExpectedDirection: Math.abs(xEnd - xStart) <= 20
            });
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

        // Create new buttons
        this.menuItems.forEach((item, index) => {
            const button = document.createElement('button');
            button.className = 'arc-button';
            button.innerHTML = item.icon;
            button.setAttribute('aria-label', item.label);
            this.arcMenu.appendChild(button);
            this.buttons.push(button);
        });
    }

    positionButtons(currentX, currentY) {
        // If direction not yet determined, use a neutral position
        if (this.arcDirection === null) {
            return;
        }
        
        // Calculate the arc parameters
        const radius = 150; // Arc radius
        const totalAngle = 120; // Total angle of the arc in degrees
        const angleStep = totalAngle / (this.buttons.length - 1);
        // When moving right (this.arcDirection is true), arc should curve left (-120)
        // When moving left (this.arcDirection is false), arc should curve right (-60)
        const startAngle = this.arcDirection ? -120 : -60;

        // Position each button along the arc
        this.buttons.forEach((button, index) => {
            // When moving right, use negative index to curve left
            // When moving left, use positive index to curve right
            const angle = (startAngle + (this.arcDirection ? -index : index) * angleStep) * Math.PI / 180;
            const x = this.startX + radius * Math.cos(angle);
            const y = this.startY + radius * Math.sin(angle);

            // Apply position and show button
            button.style.left = `${x - 25}px`; // 25 is half the button width
            button.style.top = `${y - 25}px`;
            button.style.transform = 'scale(1)';
        });
    }
}

// Initialize the arc menu when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ArcMenu();
});
