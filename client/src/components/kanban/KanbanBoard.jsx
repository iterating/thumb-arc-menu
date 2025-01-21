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
  
  const uiState = props.uiState || {
    backgroundColor: '#ffffff',
    textColor: '#333333',
    isExpanded: true,
    isHighlighted: false,
    customStyles: {}
  };

  const cardStyle = {
    backgroundColor: uiState.backgroundColor,
    color: uiState.textColor,
    ...(uiState.isHighlighted && { border: '2px solid #1976d2' }),
    ...uiState.customStyles
  };

  return (
    <div className={`card-template ${!uiState.isExpanded ? 'compact' : ''}`} style={cardStyle}>
      <div className="e-card-content">
        <div className="card-header">
          <h3>{props.Title || 'Untitled'}</h3>
          {props.Priority && (
            <span className={`priority-tag ${props.Priority.toLowerCase()}`}>
              {props.Priority}
            </span>
          )}
        </div>
        {uiState.isExpanded && (
          <div className="card-body">
            {props.Summary}
          </div>
        )}
        {props.DueDate && uiState.isExpanded && (
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
