// Service to handle AI text generation
class AIService {
  static async generateText(prompt) {
    try {
      // Try Free GPT API first
      const response = await fetch(
        `https://free-unoficial-gpt4o-mini-api-g70n.onrender.com/chat/?query=${encodeURIComponent(prompt)}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Free GPT API failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('AI generation error:', error);
      return null;
    }
  }

  // Example usage:
  static async generateTaskSummary(task) {
    const prompt = `Summarize this task in a clear, concise way: ${task}`;
    const result = await this.generateText(prompt);
    return result;
  }

  static async generateReminder(task, timeLeft) {
    const prompt = `Create a friendly reminder that this task: "${task}" needs attention in ${timeLeft} minutes`;
    const result = await this.generateText(prompt);
    return result;
  }
}

export default AIService;
