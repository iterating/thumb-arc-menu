import { createRoot } from 'react-dom/client';
import * as React from 'react';
import { registerLicense } from '@syncfusion/ej2-base';
import TestKanban from './ChatGpt40miniExample';

// Register Syncfusion license
registerLicense('Ngo9BigBOggjHTQxAR8/V1NMaF5cXmBCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdmWX5feHVQR2JdWUVzXEo=');

// Import required styles
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-react-kanban/styles/material.css';
import '@syncfusion/ej2-inputs/styles/material.css';
import '@syncfusion/ej2-buttons/styles/material.css';
import '@syncfusion/ej2-popups/styles/material.css';

const root = createRoot(document.getElementById('sample'));
root.render(<TestKanban />);
