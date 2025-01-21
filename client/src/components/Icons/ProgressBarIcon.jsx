import React from 'react';

const ProgressBarIcon = ({ progress = 0, width = 32, height = 6 }) => {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(100, Math.max(0, progress));
  
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
    >
      {/* Background bar */}
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        rx={height / 2}
        fill="var(--text-secondary, rgba(0,0,0,0.2))"
        opacity="0.3"
      />
      {/* Progress fill */}
      <rect
        x="0"
        y="0"
        width={(width * normalizedProgress) / 100}
        height={height}
        rx={height / 2}
        fill="var(--primary-color, #007bff)"
      />
    </svg>
  );
};

export default ProgressBarIcon;
