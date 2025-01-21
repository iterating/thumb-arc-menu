import React from 'react';
import { KanbanComponent, ColumnsDirective, ColumnDirective } from '@syncfusion/ej2-react-kanban';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-react-kanban/styles/material.css';
import { boardTemplates } from './constants';
import './KanbanBoard.css';

// Custom template for Kanban cards
const cardTemplate = (props) => {
  console.log('Card Template Props:', props);
  if (!props) {
    console.log('No props');
    return null;
  }
  
  return (
    <div className="card-template">
      <div className="e-card-content">
        <div className="card-header">
          <h3>{props.Title || 'Untitled'}</h3>
          {props.Priority && (
            <span className={`priority-tag ${props.Priority.toLowerCase()}`}>
              {props.Priority}
            </span>
          )}
        </div>
        <div className="card-body">
          {props.Summary}
        </div>
        {props.DueDate && (
          <div className="card-footer">
            Due: {props.DueDate}
          </div>
        )}
      </div>
    </div>
  );
};

function KanbanBoard({ boardId }) {
  // Get the template for the current board
  const template = boardTemplates[boardId];
  console.log('Template Data:', template?.data);

  return (
    <KanbanComponent
      dataSource={template.data}
      keyField="Status"
      cardSettings={{ 
        template: cardTemplate,
        headerField: "Title"
      }}
    >
      <ColumnsDirective>
        {template.columns.map(column => (
          <ColumnDirective
            key={column.keyField}
            headerText={column.headerText}
            keyField={column.keyField}
            allowToggle={true}
          />
        ))}
      </ColumnsDirective>
    </KanbanComponent>
  );
}

export default KanbanBoard;
