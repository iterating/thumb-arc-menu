// Interprets raw AI responses into structured commands
class CommandInterpreter {
  // Takes raw AI response and converts to standard command format
  static interpret(aiResponse) {
    try {
      // First try to parse the JSON
      const parsed = typeof aiResponse === 'string' 
        ? JSON.parse(aiResponse)
        : aiResponse;

      // Convert to our internal command format
      return {
        action: parsed.action?.toLowerCase() || '',
        target: parsed.type?.toLowerCase() || '',
        params: {
          name: parsed.name || '',
          dueDate: parsed.dueDate || null,
          details: parsed.details || '',
          priority: parsed.priority?.toLowerCase() || 'medium'
        },
        raw: aiResponse // Keep original for debugging
      };
    } catch (error) {
      console.error('Failed to interpret AI response:', error);
      return null;
    }
  }
}

export default CommandInterpreter;
