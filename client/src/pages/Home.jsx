import TestKanban from '../SyncFusionSampleCode/ChatGPt40/ChatGpt40miniExample';
import React from 'react';

// Import required styles
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-react-kanban/styles/material.css';
import '@syncfusion/ej2-inputs/styles/material.css';
import '@syncfusion/ej2-buttons/styles/material.css';
import '@syncfusion/ej2-popups/styles/material.css';

function Home() {
  return (
    <div className="page">
      <h1>Test Kanban Board</h1>
      <div style={{ padding: '20px', minHeight: '500px' }}>
        <TestKanban />
      </div>
    </div>
  );
}

export default Home;
