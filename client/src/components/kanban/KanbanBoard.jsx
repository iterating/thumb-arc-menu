import React, { useState } from 'react';
import { KanbanComponent, ColumnsDirective, ColumnDirective } from '@syncfusion/ej2-react-kanban';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-react-kanban/styles/material.css';
import { boardTemplates } from './constants';
import { formatDateTime } from '../../utils/dateTime';
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

  const formattedDateTime = formatDateTime(props.dueDate, props.dueTime);

  return (
    <div className={`card-template ${!props.uiState?.isExpanded ? 'compact' : ''}`} 
         style={cardStyle}
         onClick={handleClick}>
      <div className="e-card-content">
        {/* Header - Always visible */}
        <div className="card-header">
          <div className="header-main">
            <h3>{props.Title || 'Untitled'}</h3>
            {formattedDateTime && (
              <span className="due-date">{formattedDateTime}</span>
            )}
          </div>
          {props.Priority && (
            <span className={`priority-tag ${props.Priority.toLowerCase()}`}>
              {props.Priority}
            </span>
          )}
        </div>

        {/* Body - Toggleable */}
        {props.uiState?.isExpanded !== false && (
          <div className="card-body">
            {props.Summary && <div className="card-summary">{props.Summary}</div>}
            {props.steps && props.steps.length > 0 && (
              <div className="card-steps">
                {props.steps.map((step, index) => (
                  <div key={index} className="step-item">
                    <input 
                      type="checkbox" 
                      checked={step.isComplete} 
                      readOnly 
                    />
                    <span className="step-name">{step.name}</span>
                    {formatDateTime(step.dueDate, step.dueTime) && (
                      <span className="step-due">
                        {formatDateTime(step.dueDate, step.dueTime)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer - Always visible */}
        <div className="card-footer">
          {props.Status && <span>Status: {props.Status}</span>}
        </div>
      </div>
    </div>
  );
};

function KanbanBoard({ boardId }) {
  const template = boardTemplates[boardId];

  // Prevent accidental double-clicks
  const handleCardDoubleClick = (e) => {
    e.cancel = true;
  };

  return (
    <KanbanComponent
      dataSource={template.data}
      keyField="Status"
      cardSettings={{ 
        template: cardTemplate,
        headerField: "Title"
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
