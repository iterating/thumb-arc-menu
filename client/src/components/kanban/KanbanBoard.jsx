import React, { useState, useRef, useEffect } from 'react';
import { KanbanComponent, ColumnsDirective, ColumnDirective } from '@syncfusion/ej2-react-kanban';
import { extend } from '@syncfusion/ej2-base';
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
    const updatedCard = {
      ...props,
      uiState: {
        ...props.uiState,
        isExpanded: !props.uiState?.isExpanded
      }
    };
    props.onUpdate?.(updatedCard);
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
  const isExpanded = props.uiState?.isExpanded !== false;  // Default to expanded if undefined

  return (
    <div className={`card-template ${!isExpanded ? 'compact' : ''}`} 
         style={cardStyle}
         onClick={handleClick}>
      <div className="e-card-content">
        {/* Header - Always visible */}
        <div className="card-header">
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
          <div className="header-row">
            <h3 className="card-title">{props.Title || 'Untitled'}</h3>
            {isExpanded && (
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
        {isExpanded && (
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
  const [isLoading, setIsLoading] = useState(true);
  const [boardData, setBoardData] = useState([]);
  const kanbanRef = useRef(null);
  const template = boardTemplates[boardId];

  // Initialize data
  useEffect(() => {
    setIsLoading(true);
    try {
      // Use extend to create a deep copy of the template data
      const data = extend([], boardTemplates[boardId].data, null, true);
      setBoardData(data);
    } catch (error) {
      console.error('Error initializing board data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [boardId]);

  const handleCardUpdate = (updatedCard) => {
    if (kanbanRef.current && !isLoading) {
      console.log('Updating card:', updatedCard);
      const newData = boardData.map(item => 
        item.Id === updatedCard.Id ? updatedCard : item
      );
      setBoardData(newData);
    }
  };

  const handleDragStop = (args) => {
    if (args.data && args.data[0] && !isLoading) {
      const card = args.data[0];
      console.log('Card dragged:', card);
      const newData = boardData.map(item => 
        item.Id === card.Id ? card : item
      );
      setBoardData(newData);
    }
  };

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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Add handlers to each card in the data
  const dataWithHandlers = boardData.map(card => ({
    ...card,
    onUpdate: handleCardUpdate,
    onOpenModal: handleOpenModal
  }));

  return (
    <>
      <KanbanComponent
        ref={kanbanRef}
        id={`board_${boardId}`}
        dataSource={dataWithHandlers}
        keyField="Status"
        cardSettings={{ 
          template: cardTemplate,
          headerField: "Title"
        }}
        cardDoubleClick={handleCardDoubleClick}
        dragStop={handleDragStop}
        allowDragAndDrop={true}
        enablePersistence={true}
        persistenceSettings={{
          saveUrl: '/save',
          loadUrl: '/load'
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

      {editModalOpen && selectedCard && (
        <DreamCardEditModal 
          card={selectedCard} 
          onClose={handleCloseModal}
          onSave={(updatedCard) => {
            handleCardUpdate(updatedCard);
            handleCloseModal();
          }}
        />
      )}
    </>
  );
};

export default KanbanBoard;
