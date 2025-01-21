import React, { useState } from 'react';
import KanbanBoard from '../components/KanbanBoard';
import KanbanTabs from '../components/KanbanTabs';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-react-navigations/styles/material.css';
import '@syncfusion/ej2-react-kanban/styles/material.css';

function DreamBuilder() {
  const [boards] = useState([
    { id: 'personal', name: 'Personal' },
    { id: 'work', name: 'Work' }
  ]);
  const [activeBoard, setActiveBoard] = useState('personal');

  return (
    <div className="page" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <KanbanTabs
        boards={boards}
        activeBoard={activeBoard}
        onBoardChange={setActiveBoard}
      />
      <div style={{ flex: 1, padding: '16px', overflow: 'auto' }}>
        <KanbanBoard key={activeBoard} boardId={activeBoard} />
      </div>
    </div>
  );
}

export default DreamBuilder;
