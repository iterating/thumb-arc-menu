import React from 'react';

const KanbanSwimlane = (props) => {
  const { swimlane } = props;

  return (
    <div className="kanban-swimlane-header">
      <div className={`swimlane-badge ${swimlane.keyField}`}>
        {swimlane.headerText}
      </div>
    </div>
  );
};

export default KanbanSwimlane;
