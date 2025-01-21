import React, { useState } from 'react';
import KanbanBoard from '../components/KanbanBoard';
import KanbanTabs from '../components/KanbanTabs';
import PageHeader from '../components/PageHeader';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-react-navigations/styles/material.css';
import '@syncfusion/ej2-react-kanban/styles/material.css';
import './DreamBuilder.css';

function DreamBuilder() {
  const [boards] = useState([
    { id: 'personal', name: 'Personal' },
    { id: 'work', name: 'Work' }
  ]);
  const [activeBoard, setActiveBoard] = useState('personal');

  return (
    <div className="dream-builder">
      <PageHeader>
        <KanbanTabs
          boards={boards}
          activeBoard={activeBoard}
          onBoardChange={setActiveBoard}
        />
      </PageHeader>
      <div className="kanban-container">
        <KanbanBoard key={activeBoard} boardId={activeBoard} />
      </div>
    </div>
  );
}

export default DreamBuilder;
