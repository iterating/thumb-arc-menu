import React from 'react';

const KanbanHeader = (props) => {
  const { column } = props;

  return (
    <div className="kanban-column-header">
      <h3>{column.headerText}</h3>
      <div className="header-actions">
        {/* Add actions like add card, filter, etc */}
      </div>
    </div>
  );
};

export default KanbanHeader;
