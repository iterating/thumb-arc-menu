// This code is from Syncfusion directtly in reply to an email I sent to support:
//
// The registration code and bugfix was added by Cascade 3.5 Sonnet.

import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { extend } from '@syncfusion/ej2-base';
import {
  KanbanComponent,
  ColumnsDirective,
  ColumnDirective,
} from '@syncfusion/ej2-react-kanban';

//============================================
// ADDED by Cascade 3.5 Sonnet:
// Register Syncfusion license
import { registerLicense } from '@syncfusion/ej2-base';
registerLicense('Ngo9BigBOggjHTQxAR8/V1NMaF5cXmBCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdmWX5feHVQR2JdWUVzXEo=');
//============================================

import * as dataSource from './datasource.json';

/**
 * Kanban Default sample
 */
const Default = () => {
  let kanbanRef = useRef(null);
  // Sample Data
  const initialData = [
    {
      Id: 1,
      Status: 'To Do',
      Title: 'Task 1',
      Summary: 'Summary of Task 1',
      isExpanded: false,
    },
    {
      Id: 2,
      Status: 'In Progress',
      Title: 'Task 2',
      Summary: 'Summary of Task 2',
      isExpanded: false,
    },
    {
      Id: 3,
      Status: 'Done',
      Title: 'Task 3',
      Summary: 'Summary of Task 3',
      isExpanded: false,
    },
  ];

  // Custom Card Template
  const cardTemplate = (props) => {
    if (!props) return null;
    debugger;
    const isExpanded = props.isExpanded !== false;
    return (
      <div>
        <div>
          <strong>{props.Title}</strong>
        </div>
        {props.isExpanded && (
          <div>
            <p>{props.Summary}</p>
          </div>
        )}
      </div>
    );
  };

  //   const KanbanBoard = () => {

  //   };
  const data = extend([], initialData, null, true);
  // This line oof code was fixed by Cascade 3.5 Sonnet:
  //   const [boardData, setBoardData] = useState([data]);  // wrong
  const [boardData, setBoardData] = useState(data);       // correct/

  // Initialize Data
  useEffect(() => {
    //setBoardData(data);
  }, []);

  // Handle Card Click
  const handleCardClick = (args) => {
    if (!args.data) return;
    const updatedCard = {
      ...args.data,
      isExpanded: !args.data.isExpanded,
    };

    // Update Kanban's data source directly
    if (kanbanRef.current) {
      kanbanRef.current.dataSource = kanbanRef.current.dataSource.map((card) =>
        card.Id === updatedCard.Id ? updatedCard : card
      );
      var temp = kanbanRef.current.dataSource;
      console.log(temp);
      debugger;
    }
  };

  return (
    <div className="kanban-control-section">
      <div className="col-lg-12 control-section">
        <div className="control-wrapper">
          <KanbanComponent
            ref={kanbanRef}
            id="kanban_board"
            dataSource={boardData}
            keyField="Status"
            cardSettings={{ template: cardTemplate, headerField: 'Title' }}
            cardClick={handleCardClick}
            enablePersistence={true}
            persistencekey="kanban_board"
          >
            <ColumnsDirective>
              <ColumnDirective
                headerText="To Do"
                keyField="To Do"
                allowToggle={true}
              />
              <ColumnDirective
                headerText="In Progress"
                keyField="In Progress"
                allowToggle={true}
              />
              <ColumnDirective
                headerText="Done"
                keyField="Done"
                allowToggle={true}
              />
            </ColumnsDirective>
          </KanbanComponent>
        </div>
      </div>
    </div>
  );
};
export default Default;

const root = createRoot(document.getElementById('sample'));
root.render(<Default />);
