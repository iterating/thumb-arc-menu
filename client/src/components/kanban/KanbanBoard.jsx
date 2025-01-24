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

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);

  // Initialize empty task if none exist
  useEffect(() => {
    if (!formData.tasks || formData.tasks.length === 0) {
      setFormData(prev => ({
        ...prev,
        tasks: [{
          id: Date.now().toString(),
          name: '',
          completed: false,
          dueDate: null
        }]
      }));
    }
  }, []);

  // Handle task-related actions
  const handleTaskComplete = (taskId) => {
    const newTasks = formData.tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setFormData(prev => ({ ...prev, tasks: newTasks }));
  };

  const handleTaskDateChange = (taskId, date) => {
    const newTasks = formData.tasks.map(task =>
      task.id === taskId ? { ...task, dueDate: date } : task
    );
    setFormData(prev => ({ ...prev, tasks: newTasks }));
  };

  const handleDragStart = (e, index) => {
    setDraggedTask(formData.tasks[index]);
    e.dataTransfer.effectAllowed = 'move';
    e.target.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
    setDraggedTask(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (!draggedTask) return;

    const tasks = [...formData.tasks];
    const oldIndex = tasks.findIndex(t => t.id === draggedTask.id);
    tasks.splice(oldIndex, 1);
    tasks.splice(index, 0, draggedTask);
    setFormData(prev => ({ ...prev, tasks }));

    setDraggedTask(null);
    setDragOverIndex(null);
  };

  // When the dialog is about to close with save
  const handleSave = () => {
    // Update the card in Kanban's dataSource directly
    if (props.kanbanRef?.current) {
      props.kanbanRef.current.dataSource = props.kanbanRef.current.dataSource.map(item =>
        item.Id === props.Id ? { ...item, ...formData } : item
      );
      props.kanbanRef.current.refresh();
    }
  };

  // Add save handler to dialog buttons
  useEffect(() => {
    const saveButton = document.querySelector('.e-primary.e-flat');
    if (saveButton) {
      saveButton.addEventListener('click', handleSave);
      return () => saveButton.removeEventListener('click', handleSave);
    }
  }, [formData]);

  return (
    <div>
      <table>
        <tbody>
          <tr>
            <td className="e-label">Title</td>
            <td>
              <div className="e-float-input e-control-wrapper">
                <input
                  type="text"
                  name="Title"
                  className="e-field"
                  value={formData.Title || ''}
                  onChange={e => setFormData(prev => ({ ...prev, Title: e.target.value }))}
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
                  onChange={e => setFormData(prev => ({ ...prev, Summary: e.target.value }))}
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
          <tr>
            <td className="e-label">Tasks</td>
            <td>
              <div className="tasks-container">
                {(formData.tasks || []).map((task, index) => (
                  <div key={task.id} className="task-wrapper">
                    <input
                      type="text"
                      className="e-field"
                      value={task.name}
                      onChange={e => {
                        const newTasks = [...formData.tasks];
                        newTasks[index].name = e.target.value;
                        setFormData(prev => ({ ...prev, tasks: newTasks }));
                      }}
                    />
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleTaskComplete(task.id)}
                    />
                    <InlineDateTimePicker
                      value={task.dueDate}
                      onChange={date => handleTaskDateChange(task.id, date)}
                      mode="compact"
                    />
                  </div>
                ))}
              </div>
            </td>
          </tr>
          {showAdvanced && (
            <>
              <tr>
                <td className="e-label">Background</td>
                <td>
                  <div className="e-float-input e-control-wrapper">
                    <input
                      type="color"
                      className="e-field"
                      value={formData.uiState.backgroundColor}
                      onChange={e => setFormData(prev => ({
                        ...prev,
                        uiState: { ...prev.uiState, backgroundColor: e.target.value }
                      }))}
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <td className="e-label">Text Color</td>
                <td>
                  <div className="e-float-input e-control-wrapper">
                    <input
                      type="color"
                      className="e-field"
                      value={formData.uiState.textColor}
                      onChange={e => setFormData(prev => ({
                        ...prev,
                        uiState: { ...prev.uiState, textColor: e.target.value }
                      }))}
                    />
                  </div>
                </td>
              </tr>
            </>
          )}
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
  
  // Check for persisted data first
  const persistedData = localStorage.getItem(`kanban_${boardId}`);
  // Initialize data with persisted data or template
  const initialData = persistedData ? 
    JSON.parse(persistedData) : 
    extend([], template.data, null, true);

  const [data, setData] = useState(initialData);

  // Add kanbanRef to each card's props
  const dataWithRef = data.map(card => ({
    ...card,
    kanbanRef
  }));

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
      dataSource={dataWithRef}
      keyField="Status"
      cardSettings={{ 
        template: cardTemplate,
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
      cardClick={handleCardClick}
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
