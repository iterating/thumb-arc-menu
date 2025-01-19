# Thumb Arc Menu Specification

This document details the exact implementation of the Thumb Arc Menu component, serving as the canonical reference for any reimplementation.

## Core Concepts

The Thumb Arc Menu is a touch/mouse-based menu system that:
- Activates on hold and drag
- Creates an arc-shaped menu following thumb movement
- Dynamically positions buttons along the arc path
- Adapts to both left and right-handed use
- Provides smooth, performant animations

## Key Components

### 1. State Management

```javascript
class ArcMenu {
    // Core state
    isActive = false;
    pathPoints = [];     // Raw input points
    fittedPoints = [];   // Points on calculated circle
    arcDirection = null; // Left (-1) or right (1)
    
    // Circle parameters
    circleState = {
        centerX: null,
        centerY: null,
        radius: null,
        startAngle: null,
        endAngle: null
    };
    lockedCircleState = null; // Final stable circle parameters
}
```

### 2. Visual Elements

- **SVG Overlay**
  - Full viewport coverage
  - Contains path and debug visualizations
  - Z-index: 9998
  - Pointer events: none

- **Buttons**
  - Dynamic sizing (30-50px)
  - Flex layout for centering
  - Scale animations on appear/disappear
  - Z-index: 10000

- **Action Bar**
  - Fades out during menu use
  - Smooth opacity transitions
  - Configurable visibility

### 3. Configuration Constants

```javascript
const CONSTANTS = {
    HOLD_DURATION: 400,        // ms before activation
    MIN_POINTS_FOR_FIT: 5,     // points needed for circle
    MAX_DEVIATION: 30,         // max pixel deviation
    DEVIATION_THRESHOLD: 0.5,  // acceptable deviation ratio
    BUTTON_SIZE: 50,          // max button size
    MIN_BUTTON_SIZE: 30,      // min button size
    BUTTON_PADDING: 10,       // min padding between buttons
    MIN_POINTS_FOR_DIRECTION: 10 // points before locking direction
};
```

## Critical Algorithms

### 1. Circle Fitting Algorithm

```javascript
fitCircleToPoints(points) {
    if (points.length < MIN_POINTS_FOR_FIT) return null;

    // Take three key points
    const startPoint = points[0];
    const midPoint = points[Math.floor(points.length / 2)];
    const endPoint = points[points.length - 1];
    
    // Calculate vectors
    const dx1 = midPoint.x - startPoint.x;
    const dy1 = midPoint.y - startPoint.y;
    const dx2 = endPoint.x - midPoint.x;
    const dy2 = endPoint.y - midPoint.y;
    
    // Find perpendicular vector
    const perpX = dy2;
    const perpY = -dx2;
    const perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
    
    // Detect arc direction
    const dx = endPoint.x - startPoint.x;
    const arcDirection = Math.sign(dx);
    
    // Calculate radius to ensure center is off screen
    const desiredRadius = arcDirection > 0 ? 
        window.innerWidth + 100 - midPoint.x : 
        midPoint.x + 100;
        
    // Calculate center point
    const centerX = midPoint.x + (perpX / perpLength) * desiredRadius * (arcDirection > 0 ? -1 : 1);
    const centerY = midPoint.y + (perpY / perpLength) * desiredRadius * (arcDirection > 0 ? -1 : 1);
    
    return { centerX, centerY, radius: desiredRadius };
}
```

### 2. Button Positioning Algorithm

Key aspects:
1. Calculate total path length using stride sampling
2. Divide path into segments for efficient updates
3. Position buttons evenly along path length
4. Scale buttons based on distance from start
5. Clip positions to viewport bounds
6. Batch DOM updates using DocumentFragment

## Event Flow

### 1. Activation
1. User holds for HOLD_DURATION
2. Menu becomes active
3. Action bar fades out
4. Initial point recorded
5. Debug mode initialized if enabled

### 2. Movement
1. Points collected and filtered (16ms throttle)
2. Direction detected after MIN_POINTS_FOR_DIRECTION
3. Circle fitted every 3 animation frames
4. Buttons positioned every frame
5. Invalid movements prevented:
   - Backtracking past origin
   - Moving outside viewport margins
   - Changing direction after lock

### 3. Deactivation
1. Touch/mouse released
2. Buttons animate out with scale transform
3. Action bar fades in
4. State reset
5. Debug points cleared

## Performance Optimizations

1. **Update Throttling**
   - Movement updates: 16ms (≈60fps)
   - Circle fitting: Every 3 frames
   - Point sampling: Stride-based reduction

2. **DOM Performance**
   - Batch updates using DocumentFragment
   - Transform-based animations
   - Efficient style updates
   - Minimal DOM queries

3. **Memory Management**
   - Limited point history (50 points max)
   - Cleanup on deactivation
   - Event listener management

## Critical Implementation Notes

1. Circle fitting must create a large circle extending off-screen
2. Button positioning must remain smooth and evenly distributed
3. Direction locking must be strictly enforced
4. Performance optimizations are essential for smooth operation
5. Debug mode must provide comprehensive visualization

## Common Implementation Pitfalls

1. Incorrect circle fitting leading to visible circle centers
2. Uneven button distribution along the arc
3. Poor performance due to missing optimizations
4. Incorrect handling of direction changes
5. Missing viewport boundary checks

This specification serves as the definitive reference for implementing the Thumb Arc Menu. Any deviation from these specifications may result in degraded user experience or incorrect functionality.
