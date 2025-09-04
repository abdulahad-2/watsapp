import axios from '../axiosConfig';

class AIService {
  async chatWithAI(message, conversationHistory = []) {
    try {
      const response = await axios.post('/ai/chat', {
        message,
        conversationHistory
      });
      return response.data;
    } catch (error) {
      console.error('AI Service Error:', error);
      throw error;
    }
  }

  async getAIStatus() {
    try {
      const response = await axios.get('/ai/status');
      return response.data;
    } catch (error) {
      console.error('AI Status Error:', error);
      throw error;
    }
  }
}

export default new AIService();
