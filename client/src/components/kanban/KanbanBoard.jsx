import React, { useState, useRef, useEffect, useCallback } from 'react';
import { KanbanComponent, ColumnsDirective, ColumnDirective } from '@syncfusion/ej2-react-kanban';
import { extend } from '@syncfusion/ej2-base';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-react-kanban/styles/material.css';
import { boardTemplates } from './constants';
import { formatDateTime } from '../../utils/dateTime';
import ProgressBar from '../common/ProgressBar';
import InlineDateTimePicker from '../Shared/InlineDateTimePicker';
import { FiPlus, FiChevronDown, FiChevronRight, FiMenu, FiTrash2, FiEdit2 } from 'react-icons/fi';
import './KanbanBoard.css';

// Custom dialog template for editing cards
const dialogTemplate = (props) => {
  const [formData, setFormData] = useState(() => ({
    Id: props?.Id || Date.now(),
    Title: props?.Title || '',
    Status: props?.Status || 'Dreams',
    Summary: props?.Summary || '',
    dueDate: props?.dueDate ? new Date(props?.dueDate) : null,
    dueTime: props?.dueTime || null,
    progress: props?.progress || 0,
    uiState: props?.uiState || {
      backgroundColor: '#ffffff',
      textColor: '#333333',
      isExpanded: false,
      isHighlighted: false,
      customStyles: {}
    },
    tasks: (props?.tasks || []).map(task => ({
      ...task,
      dueDate: task.dueDate ? new Date(task.dueDate) : null
    }))
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="e-kanban-dialog">
      <table>
        <tbody>
          <tr>
            <td className="e-label">Status</td>
            <td>
              <div className="e-float-input e-control-wrapper">
                <select 
                  name="Status" 
                  className="e-field" 
                  value={formData.Status}
                  onChange={handleChange}
                >
                  <option value="Dreams">Dreams</option>
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
            </td>
          </tr>
          <tr>
            <td className="e-label">Title</td>
            <td>
              <div className="e-float-input e-control-wrapper">
                <input
                  type="text"
                  name="Title"
                  className="e-field"
                  value={formData.Title || ''}
                  onChange={handleChange}
                />
              </div>
            </td>
          </tr>
          <tr>
            <td className="e-label">Summary</td>
            <td>
              <div className="e-float-input e-control-wrapper">
                <textarea
                  name="Summary"
                  className="e-field"
                  value={formData.Summary || ''}
                  onChange={handleChange}
                />
              </div>
            </td>
          </tr>
          <tr>
            <td className="e-label">Due Date</td>
            <td>
              <div className="e-float-input e-control-wrapper">
                <InlineDateTimePicker
                  value={formData.dueDate}
                  onChange={date => setFormData(prev => ({ ...prev, dueDate: date }))}
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// Custom template for Kanban cards
const cardTemplate = (props) => {
  if (!props) return null;
  
  const cardStyle = {
    backgroundColor: props.uiState?.backgroundColor || '#ffffff',
    color: props.uiState?.textColor || '#333333',
    cursor: 'pointer'
  };

  const formattedDateTime = formatDateTime(props.dueDate, props.dueTime);
  const isExpanded = props.uiState?.isExpanded !== false;  // Default to expanded if undefined

  const handleEditClick = (e) => {
    // e.stopPropagation();
    // if (props.kanbanRef?.current) {
    //   props.kanbanRef.current.openDialog('Edit', props);
    // }
  };

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
                onClick={handleEditClick}
                aria-label="Edit card"
              >
                <FiEdit2 size={16} />
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
  const kanbanRef = useRef(null);
  const template = boardTemplates[boardId];
  
  // Initialize with template data and let SyncFusion handle persistence
  const [data] = useState(() => extend([], template.data, null, true));

  const handleCardClick = (args) => {
    // Ignore double clicks - let SyncFusion handle those
    if (args.event && args.event.detail === 2) return;
    
    const card = args.data;
    if (!card) return;

    // Only handle card expansion on single click
    const updatedCard = {
      ...card,
      uiState: {
        ...card.uiState,
        isExpanded: !card.uiState?.isExpanded
      }
    };

    // Update Kanban's dataSource directly
    if (kanbanRef.current) {
      kanbanRef.current.dataSource = kanbanRef.current.dataSource.map(item =>
        item.Id === updatedCard.Id ? updatedCard : item
      );
    }
  };

  return (
    <KanbanComponent
      ref={kanbanRef}
      id={`board_${boardId}`}
      dataSource={data}
      keyField="Status"
      cardSettings={{ 
        template: cardTemplate.bind(this),
        headerField: "Title"
      }}
      dialogSettings={{
        template: dialogTemplate.bind(this)
      }}
      editsettings={{
        allowEditing: true,
        allowAdding: true,
        mode: "Dialog"
      }}
      cardClick={handleCardClick.bind(this)}
      allowDragAndDrop={true}
      enablePersistence={true}
      persistencekey={`kanban_${boardId}`}
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
