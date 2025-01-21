// Orchestrates the voice command processing flow
class VoiceCommandProcessor {
  constructor(kanbanService) {
    this.goalService = new GoalService(kanbanService);
  }

  async processCommand(voiceText) {
    try {
      // 1. Format prompt for AI
      const prompt = `
        Parse this voice command into a structured goal:
        "${voiceText}"
        Return JSON with: action, type, name, dueDate, details, priority
      `;

      // 2. Get AI response
      const aiResponse = await AIService.generateText(prompt);

      // 3. Interpret the raw response
      const command = CommandInterpreter.interpret(aiResponse);
      if (!command) {
        throw new Error('Could not interpret AI response');
      }

      // 4. Format and verify the command
      const formatted = ResponseFormatter.format(command);
      
      // 5. Verify AI did what we asked
      const verification = ResponseFormatter.verifyAIResponse(voiceText, formatted);
      if (!verification.verified) {
        throw new Error(`AI verification failed: ${verification.errors.join(', ')}`);
      }

      // 6. Execute the command via appropriate service
      let result;
      if (formatted.target === 'goal') {
        switch (formatted.action) {
          case 'add':
            result = await this.goalService.addGoal(formatted.params);
            break;
          case 'edit':
            result = await this.goalService.editGoal(formatted.params.id, formatted.params);
            break;
          case 'delete':
            result = await this.goalService.deleteGoal(formatted.params.id);
            break;
          default:
            throw new Error(`Unknown action: ${formatted.action}`);
        }
      }

      return {
        success: true,
        result,
        command: formatted
      };

    } catch (error) {
      console.error('Command processing failed:', error);
      return {
        success: false,
        error: error.message,
        command: null
      };
    }
  }
}

export default VoiceCommandProcessor;
