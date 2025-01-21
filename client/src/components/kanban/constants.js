// Column definitions
export const COLUMNS = {
  COL1: 'col1',
  COL2: 'col2',
  COL3: 'col3',
  COL4: 'col4'
};

// Swimlane definitions
export const SWIMLANES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Board types
export const BOARD_TYPES = {
  PERSONAL: 'personal',
  WORK: 'work'
};

// Board templates
export const BOARD_TEMPLATES = {
  [BOARD_TYPES.PERSONAL]: {
    columns: [
      { headerText: 'Dreams', keyField: COLUMNS.COL1 },
      { headerText: 'Goals', keyField: COLUMNS.COL2 },
      { headerText: 'Plans', keyField: COLUMNS.COL3 },
      { headerText: 'Achievements', keyField: COLUMNS.COL4 }
    ]
  },
  [BOARD_TYPES.WORK]: {
    columns: [
      { headerText: 'To Do', keyField: COLUMNS.COL1 },
      { headerText: 'In Progress', keyField: COLUMNS.COL2 },
      { headerText: 'Done', keyField: COLUMNS.COL3 }
    ]
  }
};
