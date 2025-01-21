/**
 * Template library for storing and managing template data
 * Templates are identified by specific UUIDs and provide instant data access
 */
import { generateUuid } from '../utils/uuidUtils';

// Known template UUIDs and their default data
const TEMPLATE_CARDS = {
  // Personal board templates
  "550e8400-e29b-41d4-a716-446655440000": {
    title: "Todo Item",
    description: "A basic todo item",
    comments: [],
    attachments: [],
    assigneeUuids: [],
    watcherUuids: [],
    tags: [],
    metrics: {
      views: 0,
      shares: 0,
      comments: 0
    }
  },
  "550e8400-e29b-41d4-a716-446655440001": {
    title: "In Progress",
    description: "Task currently being worked on",
    comments: [],
    attachments: [],
    assigneeUuids: [],
    watcherUuids: [],
    tags: ["in-progress"],
    metrics: {
      views: 0,
      shares: 0,
      comments: 0
    }
  },
  // Work board templates
  "550e8400-e29b-41d4-a716-446655440002": {
    title: "Work Task",
    description: "A work-related task",
    comments: [],
    attachments: [],
    assigneeUuids: [],
    watcherUuids: [],
    tags: ["work"],
    metrics: {
      views: 0,
      shares: 0,
      comments: 0
    }
  }
};

class TemplateLibrary {
  /**
   * Check if a UUID corresponds to a template
   * @param {string} uuid - UUID to check
   * @returns {boolean} True if template exists
   */
  static hasTemplate(uuid) {
    return uuid in TEMPLATE_CARDS;
  }

  /**
   * Get a new instance of a template
   * @param {string} uuid - Template UUID
   * @returns {Object|null} New template instance or null if not found
   */
  static getTemplate(uuid) {
    const template = TEMPLATE_CARDS[uuid];
    if (!template) return null;

    // Create new instance with new UUID
    return {
      ...template,
      uuid: generateUuid(), // Use our UUID generator
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDirty: true, // Mark as needing save
      isTemplate: true // Track template origin
    };
  }

  /**
   * Get template UUIDs for a specific board type
   * @param {string} boardType - Type of board (e.g., 'personal', 'work')
   * @returns {string[]} Array of template UUIDs
   */
  static getBoardTemplateUuids(boardType) {
    switch (boardType) {
      case 'personal':
        return [
          "550e8400-e29b-41d4-a716-446655440000", // Todo
          "550e8400-e29b-41d4-a716-446655440001"  // In Progress
        ];
      case 'work':
        return [
          "550e8400-e29b-41d4-a716-446655440002"  // Work Task
        ];
      default:
        return [];
    }
  }
}

export default TemplateLibrary;
