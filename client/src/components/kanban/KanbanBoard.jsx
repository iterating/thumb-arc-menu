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
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const cardStyle = {
    backgroundColor: '#ffffff',
    cursor: 'pointer'
  };

  const formattedDateTime = formatDateTime(props.dueDate, props.dueTime);
  const isExpanded = props.uiState?.isExpanded !== false;  // Default to expanded if undefined

  const handleSave = (updatedCard) => {
    setEditModalOpen(false);
    if (props.kanbanRef?.current) {
      props.kanbanRef.current.updateCard(updatedCard);
    }
  };

  return (
    <>
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
                    console.log('Opening modal for card:', props);
                    setEditModalOpen(true);
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

      {editModalOpen && (
        <DreamCardEditModal 
          card={props}
          onClose={() => setEditModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
};

const KanbanBoard = ({ boardId }) => {
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
    
    // Update both React and SF state
    setBoardData(prev => prev.map(item => 
      item.Id === updatedCard.Id ? updatedCard : item
    ));
    
    if (kanbanRef.current) {
      kanbanRef.current.updateCard(updatedCard);
    }
  };

  const handleCardDoubleClick = (e) => {
    if (e) {
      e.cancel = true;
      e.preventDefaults?.();
      e.stopPropagation?.();
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Add kanbanRef to each card's props
  const dataWithRef = boardData.map(card => ({
    ...card,
    kanbanRef
  }));

  return (
    <KanbanComponent
      ref={kanbanRef}
      id={`board_${boardId}`}
      dataSource={dataWithRef}
      keyField="Status"
      cardSettings={{ 
        template: cardTemplate,
        headerField: "Title"
      }}
      cardClick={handleCardClick}
      cardDoubleClick={handleCardDoubleClick}
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
  );
};

export default KanbanBoard;
