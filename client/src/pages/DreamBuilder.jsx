import React, { useState } from 'react';
import { KanbanBoard, KanbanTabs } from '../components/kanban';
import PageHeader from '../components/PageHeader';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-react-navigations/styles/material.css';
import '@syncfusion/ej2-react-kanban/styles/material.css';
import './DreamBuilder.css';

function DreamBuilder() {
  const [activeTab, setActiveTab] = useState('personal');

  return (
    <div className="dream-builder">
      <PageHeader>
        <KanbanTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </PageHeader>
      <div className="kanban-container">
        <KanbanBoard key={activeTab} boardId={activeTab} />
      </div>
    </div>
  );
}

export default DreamBuilder;
