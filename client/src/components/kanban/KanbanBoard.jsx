import React, { useState, useRef } from 'react';
import { KanbanComponent, ColumnsDirective, ColumnDirective } from '@syncfusion/ej2-react-kanban';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-react-kanban/styles/material.css';
import { boardTemplates } from './constants';
import { formatDateTime } from '../../utils/dateTime';
import ProgressBar from '../common/ProgressBar';
import DreamCardEditModal from '../modals/DreamCardEditModal';
import './KanbanBoard.css';

// Custom template for Kanban cards
const cardTemplate = (props) => {
  if (!props) return null;

  const handleClick = (e) => {
    e.stopPropagation();
    if (!props.uiState) props.uiState = {};
    props.uiState.isExpanded = !props.uiState.isExpanded;
    props.onUpdate?.(props);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    props.onOpenModal?.(props);
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
          {/* First row */}
          <div className="header-row">
            <div className="header-date">
              {formattedDateTime}
            </div>
            <div className="header-progress">
              <ProgressBar 
                value={props.progress || 0} 
                height="4px" 
                width="60px"
                showValue={false}
              />
            </div>
          </div>
          {/* Second row */}
          <div className="header-row">
            <h3 className="card-title">{props.Title || 'Untitled'}</h3>
            {props.uiState?.isExpanded !== false && (
              <button 
                className="edit-button" 
                onClick={handleEdit}
                title="Edit card"
              >
                ✎
              </button>
            )}
          </div>
        </div>

        {/* Body - Toggleable */}
        {props.uiState?.isExpanded !== false && (
          <div className="card-body">
            {props.Summary && <div className="card-summary">{props.Summary}</div>}
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

const KanbanBoard = ({ boardId }) => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const kanbanRef = useRef(null);
  const template = boardTemplates[boardId];

  // Prevent accidental double-clicks
  const handleCardDoubleClick = (e) => {
    e.cancel = true;
  };

  const handleOpenModal = (card) => {
    setSelectedCard(card);
    setEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedCard(null);
    setEditModalOpen(false);
  };

  const handleCardUpdate = (updatedCard) => {
    if (kanbanRef.current) {
      kanbanRef.current.updateCard(updatedCard);
    }
  };

  return (
    <>
      <KanbanComponent
        ref={kanbanRef}
        dataSource={template.data.map(item => ({
          ...item,
          onOpenModal: handleOpenModal,
          onUpdate: handleCardUpdate
        }))}
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

      {editModalOpen && selectedCard && (
        <DreamCardEditModal 
          card={selectedCard} 
          onClose={handleCloseModal}
          onSave={(updatedCard) => {
            console.log('Updated card:', updatedCard);
            handleCloseModal();
          }}
        />
      )}
    </>
  );
};

export default KanbanBoard;
