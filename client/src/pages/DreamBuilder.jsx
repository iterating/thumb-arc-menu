import React from 'react';
import { KanbanComponent, ColumnsDirective, ColumnDirective } from '@syncfusion/ej2-react-kanban';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-react-kanban/styles/material.css';

function DreamBuilder() {
  const data = [
    {
      Id: 1,
      Title: 'Create my first dream',
      Status: 'To Do',
      Summary: 'Start planning my dream project'
    },
    {
      Id: 2,
      Title: 'Research resources',
      Status: 'In Progress',
      Summary: 'Find materials and tools needed'
    },
    {
      Id: 3,
      Title: 'Set milestones',
      Status: 'Done',
      Summary: 'Define key achievements'
    }
  ];

  return (
    <div className="page">
      <h1>Dream Builder</h1>
      <div className="kanban-container">
        <KanbanComponent
          id="kanban"
          dataSource={data}
          keyField="Status"
          cardSettings={{
            contentField: "Summary",
            headerField: "Title"
          }}
        >
          <ColumnsDirective>
            <ColumnDirective headerText="To Do" keyField="To Do" />
            <ColumnDirective headerText="In Progress" keyField="In Progress" />
            <ColumnDirective headerText="Done" keyField="Done" />
          </ColumnsDirective>
        </KanbanComponent>
      </div>
    </div>
  );
}

export default DreamBuilder;
