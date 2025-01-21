import React from 'react';
import { KanbanComponent, ColumnsDirective, ColumnDirective } from '@syncfusion/ej2-react-kanban';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-react-kanban/styles/material.css';

// Add custom styles for the Kanban dialog
const dialogStyles = `
  .e-dialog .e-footer-content {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 1rem;
  }

  .e-dialog .e-footer-content button {
    width: auto;
    min-width: 80px;
    margin: 0;
  }

  .e-dialog .e-dlg-content {
    padding: 1rem;
  }
`;

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

  const cardSettings = {
    contentField: "Summary",
    headerField: "Title"
  };

  const dialogSettings = {
    fields: [
      { text: 'ID', key: 'Id', type: 'TextBox', validationRules: { required: true, number: true } },
      { text: 'Status', key: 'Status', type: 'DropDown' },
      { text: 'Title', key: 'Title', type: 'TextBox', validationRules: { required: true } },
      { text: 'Summary', key: 'Summary', type: 'TextArea' }
    ]
  };

  React.useEffect(() => {
    // Add the custom styles to the document
    const styleSheet = document.createElement('style');
    styleSheet.textContent = dialogStyles;
    document.head.appendChild(styleSheet);

    return () => {
      // Clean up the styles when component unmounts
      document.head.removeChild(styleSheet);
    };
  }, []);

  return (
    <div className="page">
      <h1>Dream Builder</h1>
      <div className="kanban-container">
        <KanbanComponent
          id="kanban"
          dataSource={data}
          keyField="Status"
          cardSettings={cardSettings}
          dialogSettings={dialogSettings}
          enablePersistence={true}
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
