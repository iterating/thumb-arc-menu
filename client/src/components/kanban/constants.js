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
        dueDate: '2025-12-31',
        dueTime: '1700',
        progress: 15,  // Just starting
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
        dueDate: '2024-06-30',
        dueTime: '2:30pm',
        progress: 45,  // Almost halfway
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
        dueDate: '2024-02-01',
        progress: 80,  // Almost done
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
        Summary: 'Successfully performed at first piano recital',
        dueDate: '2024-01-15',
        progress: 100,  // Completed
        uiState: {
          backgroundColor: '#ffffff',
          textColor: '#333333',
          isExpanded: false,
          isHighlighted: false,
          customStyles: {}
        }
      }
    ]
  },
  work: {
    columns: [
      { headerText: 'To Do', keyField: 'ToDo' },
      { headerText: 'In Progress', keyField: 'InProgress' },
      { headerText: 'Done', keyField: 'Done' }
    ],
    data: [
      {
        Id: 5,
        Title: 'Project proposal',
        Status: 'ToDo',
        Summary: 'Write project proposal for new client',
        dueDate: '2024-02-15',
        progress: 0,  // Not started
        uiState: {
          backgroundColor: '#ffffff',
          textColor: '#333333',
          isExpanded: true,
          isHighlighted: false,
          customStyles: {}
        }
      },
      {
        Id: 6,
        Title: 'Client meeting',
        Status: 'InProgress',
        Summary: 'Prepare presentation for client meeting',
        dueDate: '2024-02-01',
        progress: 60,  // More than halfway
        uiState: {
          backgroundColor: '#ffffff',
          textColor: '#333333',
          isExpanded: true,
          isHighlighted: false,
          customStyles: {}
        }
      },
      {
        Id: 7,
        Title: 'Bug fixes',
        Status: 'Done',
        Summary: 'Fix reported bugs in the application',
        dueDate: '2024-01-20',
        progress: 100,  // Completed
        uiState: {
          backgroundColor: '#ffffff',
          textColor: '#333333',
          isExpanded: false,
          isHighlighted: false,
          customStyles: {}
        }
      }
    ]
  }
};
