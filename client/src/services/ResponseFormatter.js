// Validates and formats commands before they reach services
class ResponseFormatter {
  // Command schemas for validation
  static schemas = {
    goal: {
      required: ['name', 'dueDate'],
      optional: ['details', 'priority'],
      actions: ['add', 'edit', 'delete']
    },
    task: {
      required: ['name'],
      optional: ['dueDate', 'details', 'priority'],
      actions: ['add', 'edit', 'delete', 'complete']
    }
  };

  // Validate and format a command
  static format(command) {
    // Verify we have a valid command
    if (!command || !command.action || !command.target) {
      throw new Error('Invalid command structure');
    }

    // Get schema for this type
    const schema = this.schemas[command.target];
    if (!schema) {
      throw new Error(`Unknown command target: ${command.target}`);
    }

    // Verify action is valid
    if (!schema.actions.includes(command.action)) {
      throw new Error(`Invalid action '${command.action}' for ${command.target}`);
    }

    // Check required fields
    const missingFields = schema.required.filter(
      field => !command.params[field]
    );
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Format dates
    if (command.params.dueDate) {
      command.params.dueDate = new Date(command.params.dueDate);
      if (isNaN(command.params.dueDate)) {
        throw new Error('Invalid date format');
      }
    }

    // Format priority
    if (command.params.priority) {
      command.params.priority = command.params.priority.toLowerCase();
      if (!['low', 'medium', 'high'].includes(command.params.priority)) {
        command.params.priority = 'medium';
      }
    }

    return {
      ...command,
      verified: true,
      timestamp: new Date()
    };
  }

  // Verify the AI did what we asked
  static verifyAIResponse(originalPrompt, command) {
    // Basic verification checks
    const checks = [
      // Check if action matches intent in prompt
      {
        test: () => {
          const addKeywords = ['add', 'create', 'new'];
          const editKeywords = ['edit', 'update', 'modify'];
          const deleteKeywords = ['delete', 'remove'];

          const promptLower = originalPrompt.toLowerCase();
          const hasAddIntent = addKeywords.some(k => promptLower.includes(k));
          const hasEditIntent = editKeywords.some(k => promptLower.includes(k));
          const hasDeleteIntent = deleteKeywords.some(k => promptLower.includes(k));

          return (
            (hasAddIntent && command.action === 'add') ||
            (hasEditIntent && command.action === 'edit') ||
            (hasDeleteIntent && command.action === 'delete')
          );
        },
        error: 'AI action does not match user intent'
      },
      
      // Check if dates mentioned in prompt match command
      {
        test: () => {
          if (!command.params.dueDate) return true;
          const yearMatch = originalPrompt.match(/\b20\d{2}\b/);
          if (yearMatch) {
            return command.params.dueDate.getFullYear().toString() === yearMatch[0];
          }
          return true;
        },
        error: 'AI date does not match specified year'
      }
    ];

    // Run all checks
    const failures = checks
      .filter(check => !check.test())
      .map(check => check.error);

    return {
      verified: failures.length === 0,
      errors: failures,
      command: command
    };
  }
}

export default ResponseFormatter;
