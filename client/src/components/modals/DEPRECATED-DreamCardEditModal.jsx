import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiPlus, FiChevronDown, FiChevronRight, FiMenu, FiTrash2 } from 'react-icons/fi';
import InlineDateTimePicker from '../Shared/InlineDateTimePicker';
import './DreamCardEditModal.css';

const CARD_TYPES = ['dream', 'goal', 'plan', 'achieve'];

const validateCard = (formData) => {
  // TODO: Add validation rules
  return true;
};

const DreamCardEditModal = ({ card, onClose, onSave }) => {
  console.log('DreamCardEditModal - Initial card prop:', card);
  console.log('DreamCardEditModal - card.tasks:', card.tasks);

  const [formData, setFormData] = useState(() => {
    const initialData = {
      Id: card?.Id || Date.now(),
      Title: card?.Title || '',
      Status: card?.Status || 'Dreams',
      Summary: card?.Summary || '',
      dueDate: card?.dueDate ? new Date(card?.dueDate) : null,
      dueTime: card?.dueTime || null,
      progress: card?.progress || 0,
      uiState: card?.uiState || {
        backgroundColor: '#ffffff',
        textColor: '#333333',
        isExpanded: false,
        isHighlighted: false,
        customStyles: {}
      },
      tasks: (card?.tasks || []).map(task => ({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : null
      }))
    };
    console.log('DreamCardEditModal - Initial formData:', initialData);
    return initialData;
  });

  useEffect(() => {
    // If no tasks exist, initialize with an empty task
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

  const [editMode, setEditMode] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);

  const handleInputChange = useCallback((field, value) => {
    console.log('DreamCardEditModal - handleInputChange:', field, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleTaskComplete = useCallback((taskId) => {
    const newTasks = formData.tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setFormData(prev => ({
      ...prev,
      tasks: newTasks
    }));
  }, [formData.tasks]);

  const handleTaskDateChange = useCallback((taskId, date) => {
    const newTasks = formData.tasks.map(task =>
      task.id === taskId ? { ...task, dueDate: date } : task
    );
    setFormData(prev => ({
      ...prev,
      tasks: newTasks
    }));
  }, [formData.tasks]);

  const handleAddTask = useCallback(() => {
    console.log('DreamCardEditModal - handleAddTask:', newTaskName);
    if (!newTaskName.trim()) return;

    setFormData(prev => ({
      ...prev,
      tasks: [...prev.tasks, {
        id: Date.now().toString(),
        name: newTaskName,
        completed: false,
        dueDate: null
      }]
    }));
    setNewTaskName('');
  }, [newTaskName]);

  const handleDragStart = useCallback((e, index) => {
    console.log('DreamCardEditModal - handleDragStart:', index);
    setDraggedTask(formData.tasks[index]);
    e.dataTransfer.effectAllowed = 'move';
    e.target.classList.add('dragging');
  }, [formData.tasks]);

  const handleDragEnd = useCallback((e) => {
    console.log('DreamCardEditModal - handleDragEnd:');
    e.target.classList.remove('dragging');
    setDraggedTask(null);
    setDragOverIndex(null);
  }, []);

  const handleDragOver = useCallback((e, index) => {
    console.log('DreamCardEditModal - handleDragOver:', index);
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  }, []);

  const handleDrop = useCallback((e, index) => {
    console.log('DreamCardEditModal - handleDrop:', index);
    e.preventDefault();
    if (!draggedTask) return;

    setFormData(prev => {
      const tasks = [...prev.tasks];
      const oldIndex = tasks.findIndex(t => t.id === draggedTask.id);
      tasks.splice(oldIndex, 1);
      tasks.splice(index, 0, draggedTask);
      return { ...prev, tasks };
    });

    setDraggedTask(null);
    setDragOverIndex(null);
  }, [draggedTask]);

  const handleSave = useCallback(() => {
    console.log('DreamCardEditModal - handleSave:');
    if (validateCard(formData)) {
      // Convert dates to ISO strings before saving
      const processedData = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        tasks: formData.tasks.map(task => ({
          ...task,
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null
        }))
      };
      console.log('DreamCardEditModal - Saving data:', processedData);
      onSave(processedData);
    }
  }, [formData, onSave]);

  const handleOverlayClick = useCallback((e) => {
    console.log('DreamCardEditModal - handleOverlayClick:');
    if (e.target.classList.contains('modal-overlay')) {
      onClose();
    }
  }, [onClose]);

  return createPortal(
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`card-edit-modal ${editMode ? 'edit-mode' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="card-edit-modal-header">
          <h2 className="card-edit-modal-title">{card?.Title || 'View Card'}</h2>
          <button 
            className="edit-toggle-button"
            onClick={() => setEditMode(!editMode)}
            title={editMode ? "Exit Edit Mode" : "Enter Edit Mode"}
          >
            <span className="material-icons">
              {editMode ? 'done' : 'edit'}
            </span>
          </button>
        </div>

        {/* Basic Info */}
        <div className="form-row">
          <label>Title:</label>
          <input
            type="text"
            value={formData.Title}
            onChange={e => handleInputChange('Title', e.target.value)}
          />
        </div>

        <div className="form-row">
          <label>Summary:</label>
          <textarea
            value={formData.Summary}
            onChange={e => handleInputChange('Summary', e.target.value)}
          />
        </div>

        <div className="form-row">
          <label>Deadline:</label>
          <InlineDateTimePicker
            value={formData.dueDate}
            onChange={date => handleInputChange('dueDate', date)}
          />
        </div>

        {/* Tasks */}
        <div className="tasks-section">
          <h3>Tasks</h3>
          <div className="tasks-container">
            {(formData.tasks || []).map((task, index) => (
              <div
                key={task.id}
                className="task-wrapper"
                draggable={editMode}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
              >
                <div className="task-drag-handle">
                  <FiMenu />
                </div>
                <div
                  className={`task-checkbox ${task.completed ? 'completed' : ''}`}
                  onClick={() => handleTaskComplete(task.id)}
                />
                <input
                  type="text"
                  value={task.name}
                  onChange={e => {
                    const newTasks = [...formData.tasks];
                    newTasks[index].name = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      tasks: newTasks
                    }));
                  }}
                  placeholder="Task name..."
                />
                <InlineDateTimePicker
                  value={task.dueDate}
                  onChange={date => handleTaskDateChange(task.id, date)}
                  mode="compact"
                  allowClear={true}
                />
                {editMode && (
                  <div className="task-actions">
                    <button className="task-button" onClick={() => {
                      const newTasks = [...formData.tasks];
                      newTasks.splice(index + 1, 0, {
                        id: Date.now().toString(),
                        name: '',
                        completed: false,
                        dueDate: null
                      });
                      setFormData(prev => ({
                        ...prev,
                        tasks: newTasks
                      }));
                    }}>
                      <FiPlus />
                    </button>
                    <button className="task-button" onClick={() => {
                      const newTasks = [...formData.tasks];
                      newTasks.splice(index, 1);
                      if (newTasks.length === 0) {
                        newTasks.push({
                          id: Date.now().toString(),
                          name: '',
                          completed: false,
                          dueDate: null
                        });
                      }
                      setFormData(prev => ({
                        ...prev,
                        tasks: newTasks
                      }));
                    }}>
                      <FiTrash2 />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Advanced Section */}
        <button
          className="advanced-toggle"
          onClick={() => setShowAdvanced(prev => !prev)}
        >
          {showAdvanced ? <FiChevronDown /> : <FiChevronRight />}
          Advanced Options
        </button>

        {showAdvanced && (
          <div className="advanced-section">
            <div className="color-picker">
              <label>Background:</label>
              <input
                type="color"
                value={formData.uiState.backgroundColor}
                onChange={e => handleInputChange('uiState.backgroundColor', e.target.value)}
              />
            </div>
            <div className="color-picker">
              <label>Text Color:</label>
              <input
                type="color"
                value={formData.uiState.textColor}
                onChange={e => handleInputChange('uiState.textColor', e.target.value)}
              />
            </div>
            <div className="form-row">
              <label>Notes:</label>
              <textarea
                value={formData.notes}
                onChange={e => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes..."
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          {editMode && (
            <button onClick={handleSave}>Save Changes</button>
          )}
        </div>
      </div>
    </div>,
    document.querySelector('.app-container') || document.body
  );
};

export default DreamCardEditModal;
