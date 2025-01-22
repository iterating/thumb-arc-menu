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
  
  const cardStyle = {
    backgroundColor: '#ffffff',
    cursor: 'pointer'
  };

  const formattedDateTime = formatDateTime(props.dueDate, props.dueTime);
  const isExpanded = props.uiState?.isExpanded !== false;  // Default to expanded if undefined

  return (
    <div className={`card-template ${!isExpanded ? 'compact' : ''}`} 
         style={cardStyle}>
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
              />
            </div>
          </div>
          <div className="header-row">
            <div className="header-title">{props.Title}</div>
            {isExpanded && (
              <button 
                className="edit-button" 
                onClick={(e) => {
                  e.stopPropagation();
                  if (props.data?.onOpenModal) {
                    props.data.onOpenModal(props);
                  }
                }}
                title="Edit card"
              >
                ✎
              </button>
            )}
          </div>
        </div>
        
        {/* Body - Only visible when expanded */}
        {isExpanded && (
          <div className="card-body">
            <div className="body-summary">{props.Summary}</div>
          </div>
        )}
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
      const dataWithHandlers = data.map(card => ({
        ...card,
        onOpenModal: handleOpenModal
      }));
      setBoardData(dataWithHandlers);
    } catch (error) {
      console.error('Error initializing board data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [boardId]);

  const handleCardClick = (args) => {
    const card = args.data;
    if (!card) return;

    // Toggle expanded state
    const updatedCard = {
      ...card,
      uiState: {
        ...card.uiState,
        isExpanded: !card.uiState?.isExpanded
      }
    };

    // Update the card in our data
    const newData = boardData.map(item => 
      item.Id === updatedCard.Id ? updatedCard : item
    );
    setBoardData(newData);

    // Update SF's data
    if (kanbanRef.current) {
      kanbanRef.current.dataSource = newData;
      kanbanRef.current.dataBind();
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
    if (e) {
      e.cancel = true;
      e.preventDefaults?.();
      e.stopPropagation?.();
    }
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

  return (
    <>
      <KanbanComponent
        ref={kanbanRef}
        id={`board_${boardId}`}
        dataSource={boardData}
        keyField="Status"
        cardSettings={{ 
          template: cardTemplate,
          headerField: "Title"
        }}
        cardClick={handleCardClick}
        cardDoubleClick={handleCardDoubleClick}
        dragStop={handleDragStop}
        allowDragAndDrop={true}
        enablePersistence={true}
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
            const newData = boardData.map(item => 
              item.Id === updatedCard.Id ? updatedCard : item
            );
            setBoardData(newData);
            handleCloseModal();
          }}
        />
      )}
    </>
  );
};

export default KanbanBoard;
