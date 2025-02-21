// ArcMenu class to handle the thumb arc interaction
 class ArcMenu {
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
            { icon: '🔍', label: 'Search', onClick: () => alert('Search! Time to find something...') },
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
        // Add your init code here
    }
}
