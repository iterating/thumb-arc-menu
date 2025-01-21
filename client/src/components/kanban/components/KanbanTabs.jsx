import React from 'react';
import { DropDownButtonComponent } from '@syncfusion/ej2-react-splitbuttons';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-react-splitbuttons/styles/material.css';
import '../styles/KanbanTabs.css';

function KanbanTabs({ 
  // Support both old and new prop patterns
  activeTab, setActiveTab,  // Old props
  boards = [               // New prop with default
    { id: 'personal', name: 'Personal' },
    { id: 'work', name: 'Work' }
  ],
  activeBoard = activeTab, // Use activeTab if provided
  onBoardChange = setActiveTab // Use setActiveTab if provided
}) {
  return (
    <div className="kanban-tabs">
      <div className="tab-container">
        <div className="tab-list">
          {boards.map(board => (
            <div 
              key={board.id}
              className={`tab-item ${board.id === activeBoard ? 'active' : ''}`}
              onClick={() => onBoardChange(board.id)}
            >
              <span className="tab-text">{board.name}</span>
              <DropDownButtonComponent
                items={[
                  { text: 'Add Card', id: 'add' },
                  { text: 'Edit Board', id: 'edit' },
                  { text: 'Delete Board', id: 'delete' }
                ]}
                cssClass="e-small"
                iconCss="e-icons e-down"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent tab selection when clicking dropdown
                }}
              />
            </div>
          ))}
        </div>
        <div className="tab-actions">
          <DropDownButtonComponent
            items={[
              { text: 'New Board', id: 'new-board' },
              { text: 'Import Board', id: 'import' },
              { separator: true },
              { text: 'Board Settings', id: 'settings' },
              { text: 'View Options', id: 'view' },
              { separator: true },
              { text: 'Export All Boards', id: 'export' }
            ]}
            cssClass="main-menu-btn"
            iconCss="e-icons e-menu"
            content="Menu"
          />
        </div>
      </div>
    </div>
  );
}

export default KanbanTabs;
