import React from 'react';

const KanbanCard = (props) => {
  const { data } = props;

  return (
    <div className="kanban-card">
      <div className="card-header">
        <h4>{data.Title}</h4>
        {data.priority && (
          <span className={`priority-badge ${data.priority}`}>
            {data.priority}
          </span>
        )}
      </div>
      <div className="card-content">
        <p>{data.Summary}</p>
      </div>
    </div>
  );
};

export default KanbanCard;
