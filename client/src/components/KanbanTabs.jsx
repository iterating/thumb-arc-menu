import React from 'react';
import { TabComponent } from '@syncfusion/ej2-react-navigations';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-react-navigations/styles/material.css';
import './KanbanTabs.css';

function KanbanTabs({ boards, activeBoard, onBoardChange }) {
  const handleSelecting = (e) => {
    if (e.selectingIndex !== undefined) {
      const selectedBoard = boards[e.selectingIndex];
      if (selectedBoard) {
        onBoardChange(selectedBoard.id);
      }
    }
  };

  return (
    <div className="kanban-tabs">
      <TabComponent
        heightAdjustMode="Auto"
        overflowMode="Scrollable"
        selectedItem={boards.findIndex(b => b.id === activeBoard)}
        selecting={handleSelecting}
        items={boards.map(board => ({
          header: { text: board.name }
        }))}
      />
    </div>
  );
}

export default KanbanTabs;
