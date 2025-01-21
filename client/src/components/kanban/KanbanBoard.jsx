import React, { useState } from 'react';
import { KanbanComponent, ColumnsDirective, ColumnDirective } from '@syncfusion/ej2-react-kanban';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-react-kanban/styles/material.css';
import { boardTemplates } from './constants';
import './KanbanBoard.css';

// Custom template for Kanban cards
const cardTemplate = (props) => {
  const [, forceUpdate] = useState();
  
  if (!props) return null;

  const handleClick = (e) => {
    e.stopPropagation();
    if (!props.uiState) props.uiState = {};
    props.uiState.isExpanded = !props.uiState.isExpanded;
    forceUpdate({});
  };
  
  const cardStyle = {
    backgroundColor: '#ffffff',
    cursor: 'pointer'
  };

  return (
    <div className={`card-template ${!props.uiState?.isExpanded ? 'compact' : ''}`} 
         style={cardStyle}
         onClick={handleClick}>
      <div className="e-card-content">
        <div className="card-header">
          <h3>{props.Title || 'Untitled'}</h3>
          {props.Priority && (
            <span className={`priority-tag ${props.Priority.toLowerCase()}`}>
              {props.Priority}
            </span>
          )}
        </div>
        {props.uiState?.isExpanded !== false && props.Summary && (
          <div className="card-body">
            {props.Summary}
          </div>
        )}
      </div>
    </div>
  );
};

function KanbanBoard({ boardId }) {
  const template = boardTemplates[boardId];

  // Prevent accidental double-clicks
  const handleCardDoubleClick = (e) => {
    e.cancel = true; // Cancel default double-click behavior
  };

  return (
    <KanbanComponent
      dataSource={template.data}
      keyField="Status"
      cardSettings={{ 
        template: cardTemplate,
        headerField: "Title"
      }}
      dialogSettings={{
        showHeader: false,
        enableResize: false,
        width: '300px',
        height: '300px'
      }}
      cardDoubleClick={handleCardDoubleClick}
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
