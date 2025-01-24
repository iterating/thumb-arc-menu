import React, { useState, useEffect } from 'react';
import {
  KanbanComponent,
  ColumnsDirective,
  ColumnDirective,
} from '@syncfusion/ej2-react-kanban';

const PERSISTENCE_KEY = 'kanbanData';

const TestKanban = () => {
  const [data, setData] = useState([
      {
        Id: 1,
        Title: 'Write a Book',
        Status: 'Dreams',
        DueDate: '2025-02-01',
        Description: 'Finish the first draft.',
        Tasks: [
          { taskName: 'Outline chapters', dueDate: '2025-01-25', completed: false },
          { taskName: 'Write introduction', dueDate: '2025-01-27', completed: true },
        ],
      },
      {
        Id: 2,
        Title: 'Launch a Startup',
        Status: 'Goals',
        DueDate: '2025-03-01',
        Description: 'Prepare pitch deck.',
        Tasks: [],
      },
  ]);

  const [modalData, setModalData] = useState({
    Id: '',
    Title: '',
    Status: '',
    DueDate: '',
    Description: '',
    Tasks: [],
  });

  // Add a new task
  const handleAddTask = () => {
    setModalData((prev) => ({
      ...prev,
      Tasks: [...prev.Tasks, { taskName: '', dueDate: '', completed: false }],
    }));
  };

  // Remove a task
  const handleRemoveTask = (index) => {
    setModalData((prev) => ({
      ...prev,
      Tasks: prev.Tasks.filter((_, i) => i !== index),
    }));
  };

  // Handle changes to a task
  const handleTaskChange = (index, key, value) => {
    setModalData((prev) => ({
      ...prev,
      Tasks: prev.Tasks.map((task, i) =>
        i === index ? { ...task, [key]: value } : task
      ),
    }));
  };

  // Save the card changes
  const handleSave = () => {
    setData((prev) =>
      prev.map((item) => (item.Id === modalData.Id ? modalData : item))
    );
    setModalData(null);
  };

  // Cancel editing the card
  const handleCancel = () => setModalData(null);

  // Card template
  const cardTemplate = (props) => {
    return (
      <div style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
        <h4 style={{ margin: '0', color: '#007acc' }}>{props.Title}</h4>
        <p style={{ margin: '4px 0' }}>
          <strong>Description: </strong> {props.Description || 'No description provided.'}
        </p>
        <p style={{ margin: '4px 0' }}>
          <strong>Due Date: </strong> {props.DueDate || 'Not set'}
        </p>
        {props.Tasks && props.Tasks.length > 0 && (
          <ul style={{ padding: '0', listStyle: 'none', margin: '4px 0' }}>
            <strong>Tasks:</strong>
            {props.Tasks.map((task, index) => (
              <li
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>{task.taskName || 'Unnamed Task'}</span>
                <span style={{ color: task.completed ? 'green' : 'red' }}>
                  {task.completed ? '✔️' : '❌'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  // Edit modal template
  const dialogTemplate = (props) => {
    console.log('Dialog Template Props:', props);
    console.log('Props.Title is ', props.Title);
    return (
      <div style={{ padding: '16px' }}>
        <h3>Edit Card</h3>
        <label>Card Name</label>
        <input
          type="text"
          value={props.Title || ''}
          onChange={(e) => setModalData((prev) => ({ ...prev, Title: e.target.value }))}
          style={{ width: '100%', marginBottom: '8px' }}
        />
        <label>Due Date</label>
        <input
          type="date"
          value={props.DueDate || ''}
          onChange={(e) => setModalData((prev) => ({ ...prev, DueDate: e.target.value }))}
          style={{ width: '100%', marginBottom: '8px' }}
        />
        <label>Description</label>
        <textarea
          value={props.Description || ''}
          onChange={(e) => setModalData((prev) => ({ ...prev, Description: e.target.value }))}
          style={{ width: '100%', marginBottom: '16px' }}
        ></textarea>

        <label>Tasks</label>
        {props.Tasks?.map((task, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <input
              type="text"
              placeholder="Task Name"
              value={task.taskName || ''}
              onChange={(e) => handleTaskChange(index, 'taskName', e.target.value)}
              style={{ flex: 2, marginRight: '8px' }}
            />
            <input
              type="date"
              value={task.dueDate || ''}
              onChange={(e) => handleTaskChange(index, 'dueDate', e.target.value)}
              style={{ flex: 1, marginRight: '8px' }}
            />
            <input
              type="checkbox"
              checked={task.completed || false}
              onChange={(e) => handleTaskChange(index, 'completed', e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            <button onClick={() => handleRemoveTask(index)} style={{ flexShrink: 0 }}>-</button>
          </div>
        ))}
        <button onClick={handleAddTask} style={{ marginTop: '8px' }}>+ Add Task</button>

        <div style={{ marginTop: '16px', textAlign: 'right' }}>
          <button onClick={handleCancel} style={{ marginRight: '8px' }}>Cancel</button>
          <button onClick={handleSave}>Save</button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h2>DreamBuilder Kanban Board</h2>
      <KanbanComponent
        dataSource={data}
        keyField="Status"
        cardSettings={{
          headerField: 'Title',
          contentField: 'Description',
          template: cardTemplate,
        }}
        dialogSettings={{
          template: dialogTemplate,
        }}
        cardDoubleClick={(e) => {
          console.log('Card Double Click Event:', e);
          if (e.data) {
            setModalData(e.data);
          }
        }}
        enablePersistence={true}
        persistencekey="kanban_test"
      >
        <ColumnsDirective>
          <ColumnDirective headerText="Dreams" keyField="Dreams" />
          <ColumnDirective headerText="Goals" keyField="Goals" />
          <ColumnDirective headerText="Plans" keyField="Plans" />
          <ColumnDirective headerText="Achievements" keyField="Achievements" />
        </ColumnsDirective>
      </KanbanComponent>
    </div>
  );
};

export default TestKanban;
