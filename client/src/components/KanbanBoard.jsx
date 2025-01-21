import React from 'react';
import { KanbanComponent, ColumnsDirective, ColumnDirective } from '@syncfusion/ej2-react-kanban';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-react-kanban/styles/material.css';

// Template configurations for different board types
const boardTemplates = {
  personal: {
    columns: [
      { headerText: 'Dreams', keyField: 'Dreams' },
      { headerText: 'Goals', keyField: 'Goals' },
      { headerText: 'Plans', keyField: 'Plans' },
      { headerText: 'Achievements', keyField: 'Achievements' }
    ],
    data: [
      {
        Id: 1,
        Title: 'Travel the world',
        Status: 'Dreams',
        Summary: 'Visit at least 10 countries in 5 years'
      },
      {
        Id: 2,
        Title: 'Learn piano',
        Status: 'Goals',
        Summary: 'Take piano lessons and practice regularly'
      },
      {
        Id: 3,
        Title: 'Weekly practice schedule',
        Status: 'Plans',
        Summary: 'Create a weekly schedule for piano practice'
      },
      {
        Id: 4,
        Title: 'First recital',
        Status: 'Achievements',
        Summary: 'Performed at first piano recital'
      }
    ]
  },
  work: {
    columns: [
      { headerText: 'To Do', keyField: 'To Do' },
      { headerText: 'In Progress', keyField: 'In Progress' },
      { headerText: 'Done', keyField: 'Done' }
    ],
    data: [
      {
        Id: 1,
        Title: 'Project proposal',
        Status: 'To Do',
        Summary: 'Write project proposal for new client'
      },
      {
        Id: 2,
        Title: 'Client meeting',
        Status: 'In Progress',
        Summary: 'Prepare presentation for client meeting'
      },
      {
        Id: 3,
        Title: 'Documentation',
        Status: 'Done',
        Summary: 'Complete project documentation'
      }
    ]
  }
};

function KanbanBoard({ boardId }) {
  // Get the template for the current board
  const template = boardTemplates[boardId];

  return (
    <KanbanComponent
      dataSource={template.data}
      keyField="Status"
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
  );
}

export default KanbanBoard;
