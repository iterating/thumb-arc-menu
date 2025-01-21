import React from 'react';
import { DropDownButtonComponent } from '@syncfusion/ej2-react-splitbuttons';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-react-splitbuttons/styles/material.css';
import './KanbanTabs.css';

function KanbanTabs({ boards, activeBoard, onBoardChange }) {
  return (
    <div className="kanban-tabs">
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
    </div>
  );
}

export default KanbanTabs;
