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

// Board templates
export const boardTemplates = {
  personal: {
    columns: [
      { headerText: 'Dreams', keyField: 'Dreams' },
      { headerText: 'Goals', keyField: 'Goals' },
      { headerText: 'Plans', keyField: 'Plans' },
      { headerText: 'Achievements', keyField: 'Achievements' }
    ],
    data: [
      {
        Id: 1,
        Title: 'Travel the world',
        Status: 'Dreams',
        Summary: 'Visit at least 10 countries in 5 years',
        uiState: {
          backgroundColor: '#ffffff',
          textColor: '#333333',
          isExpanded: true,
          isHighlighted: false,
          customStyles: {}
        }
      },
      {
        Id: 2,
        Title: 'Learn piano',
        Status: 'Goals',
        Summary: 'Take piano lessons and practice regularly',
        uiState: {
          backgroundColor: '#f8f9fa',
          textColor: '#333333',
          isExpanded: true,
          isHighlighted: false,
          customStyles: {}
        }
      },
      {
        Id: 3,
        Title: 'Weekly practice schedule',
        Status: 'Plans',
        Summary: 'Create a weekly schedule for piano practice',
        uiState: {
          backgroundColor: '#ffffff',
          textColor: '#333333',
          isExpanded: true,
          isHighlighted: false,
          customStyles: {}
        }
      },
      {
        Id: 4,
        Title: 'First recital',
        Status: 'Achievements',
        Summary: 'Performed at first piano recital',
        uiState: {
          backgroundColor: '#ffffff',
          textColor: '#333333',
          isExpanded: true,
          isHighlighted: false,
          customStyles: {}
        }
      }
    ]
  },
  work: {
    columns: [
      { headerText: 'To Do', keyField: 'To Do' },
      { headerText: 'In Progress', keyField: 'In Progress' },
      { headerText: 'Done', keyField: 'Done' }
    ],
    data: [
      {
        Id: 1,
        Title: 'Project proposal',
        Status: 'To Do',
        Summary: 'Write project proposal for new client',
        uiState: {
          backgroundColor: '#ffffff',
          textColor: '#333333',
          isExpanded: true,
          isHighlighted: false,
          customStyles: {}
        }
      },
      {
        Id: 2,
        Title: 'Client meeting',
        Status: 'In Progress',
        Summary: 'Prepare presentation for client meeting',
        uiState: {
          backgroundColor: '#f8f9fa',
          textColor: '#333333',
          isExpanded: true,
          isHighlighted: false,
          customStyles: {}
        }
      },
      {
        Id: 3,
        Title: 'Documentation',
        Status: 'Done',
        Summary: 'Complete project documentation',
        uiState: {
          backgroundColor: '#ffffff',
          textColor: '#333333',
          isExpanded: true,
          isHighlighted: false,
          customStyles: {}
        }
      }
    ]
  }
};
