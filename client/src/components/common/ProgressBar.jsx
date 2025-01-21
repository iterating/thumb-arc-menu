import React, { useState, useEffect } from 'react';
import { LinearGaugeComponent } from '@syncfusion/ej2-react-lineargauge';

const ProgressBar = ({ 
    value = 0,
    height = '4px',
    width = '100%',
    showValue = false,
    cornerRadius = 'Round'
}) => {
    // Ensure value is between 0 and 100
    const [normalizedValue, setNormalizedValue] = useState(Math.min(100, Math.max(0, value)));

    useEffect(() => {
        setNormalizedValue(Math.min(100, Math.max(0, value)));
    }, [value]);

    return (
        <LinearGaugeComponent
            width={width}
            height={height}
            orientation='Horizontal'
            theme='Material'
            container={{
                width: 0,
                height: 0,
                type: 'RoundedRectangle'
            }}
            axes={[{
                minimum: 0,
                maximum: 100,
                line: { width: 0 },
                majorTicks: { height: 0 },
                minorTicks: { height: 0 },
                labelStyle: { font: { size: '0px' }},
                pointers: [{
                    value: normalizedValue,
                    height: 4,
                    width: 4,
                    type: 'Bar',
                    roundedCornerRadius: 2,
                    color: '#666'
                }]
            }]}
        />
    );
};

export default ProgressBar;
