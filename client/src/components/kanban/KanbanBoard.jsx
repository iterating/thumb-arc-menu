import React, { useState } from 'react';
import { KanbanComponent, ColumnsDirective, ColumnDirective } from '@syncfusion/ej2-react-kanban';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-react-kanban/styles/material.css';
import { boardTemplates } from './constants';
import './KanbanBoard.css';

// Custom template for Kanban cards
const cardTemplate = (props) => {
  if (!props) {
    return null;
  }

  const handleClick = (e) => {
    // Stop event from bubbling to Kanban's click handler
    e.stopPropagation();
    if (props.onToggleExpand) {
      props.onToggleExpand(props.Id);
    }
  };
  
  const cardStyle = {
    backgroundColor: '#ffffff',
    cursor: 'pointer'
  };

  return (
    <div className={`card-template ${!props.isExpanded ? 'compact' : ''}`} 
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
        {props.isExpanded && props.Summary && (
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
  const [expandedCards, setExpandedCards] = useState(new Set());

  const toggleCardExpand = (cardId) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const cardTemplateWithExpand = (props) => {
    return cardTemplate({
      ...props,
      isExpanded: expandedCards.has(props.Id),
      onToggleExpand: toggleCardExpand
    });
  };

  return (
    <KanbanComponent
      dataSource={template.data}
      keyField="Status"
      cardSettings={{ 
        template: cardTemplateWithExpand,
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
