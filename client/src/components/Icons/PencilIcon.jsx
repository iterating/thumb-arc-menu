import React from 'react';

const PencilIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"  // Tighter viewBox
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 1L15 4L5 14H2V11L12 1Z" />
  </svg>
);

export default PencilIcon;
