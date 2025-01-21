import React, { useRef, useState } from 'react';
import { KanbanComponent, ColumnsDirective, ColumnDirective } from '@syncfusion/ej2-react-kanban';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-react-kanban/styles/material.css';
import { BOARD_TEMPLATES, SWIMLANES } from './constants';

function KanbanBoard({ boardId }) {
  const [showSwimlanes, setShowSwimlanes] = useState(false);
  const kanbanRef = useRef();
  const template = BOARD_TEMPLATES[boardId];

  // Sample data - will be moved to data management
  const data = [
    {
      Id: 1,
      Title: 'Task 1',
      colStatus: 'col1',
      priority: SWIMLANES.HIGH,
      Summary: 'Sample task'
    }
  ];

  return (
    <div className="kanban-container">
      <div className="kanban-header">
        <button onClick={() => setShowSwimlanes(!showSwimlanes)}>
          {showSwimlanes ? 'Hide Swimlanes' : 'Show Swimlanes'}
        </button>
      </div>

      <KanbanComponent
        ref={kanbanRef}
        dataSource={data}
        keyField="colStatus"
        swimlaneSettings={showSwimlanes ? {
          keyField: 'priority',
          allowDragAndDrop: true,
          showEmptyRow: true
        } : null}
        cardSettings={{ contentField: "Summary", headerField: "Title" }}
      >
        <ColumnsDirective>
          {template.columns.map(column => (
            <ColumnDirective
              key={column.keyField}
              headerText={column.headerText}
              keyField={column.keyField}
            />
          ))}
        </ColumnsDirective>
      </KanbanComponent>
    </div>
  );
}

export default KanbanBoard;
