// Handles all goal-related operations
class GoalService {
  constructor(kanbanService) {
    this.kanbanService = kanbanService;
  }

  // Add a new goal
  async addGoal(params) {
    const goalData = {
      title: params.name,
      description: params.details || '',
      dueDate: params.dueDate,
      priority: params.priority || 'medium',
      status: 'active',
      type: 'goal',
      created: new Date()
    };

    return await this.kanbanService.addCard(goalData);
  }

  // Edit existing goal
  async editGoal(goalId, params) {
    const updates = {};
    if (params.name) updates.title = params.name;
    if (params.details) updates.description = params.details;
    if (params.dueDate) updates.dueDate = params.dueDate;
    if (params.priority) updates.priority = params.priority;

    return await this.kanbanService.updateCard(goalId, updates);
  }

  // Delete goal
  async deleteGoal(goalId) {
    return await this.kanbanService.deleteCard(goalId);
  }
}

export default GoalService;
