import React, { useState, useEffect } from 'react';

const ProgressBar = ({ 
    value = 0,
    height = '4px',
    width = '100%'
}) => {
    // Ensure value is between 0 and 100
    const [normalizedValue, setNormalizedValue] = useState(Math.min(100, Math.max(0, value)));

    useEffect(() => {
        setNormalizedValue(Math.min(100, Math.max(0, value)));
    }, [value]);

    const containerStyle = {
        width,
        height,
        backgroundColor: '#e0e0e0',
        borderRadius: '2px',
        overflow: 'hidden'
    };

    const progressStyle = {
        width: `${normalizedValue}%`,
        height: '100%',
        backgroundColor: '#666',
        transition: 'width 0.3s ease'
    };

    return (
        <div style={containerStyle}>
            <div style={progressStyle} />
        </div>
    );
};

export default ProgressBar;
