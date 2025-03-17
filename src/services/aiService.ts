import api from '../lib/api';
import { 
  ChatMessage, 
  ChatSession, 
  MessageRequest, 
  MessageResponse, 
  GenerateWorkflowRequest, 
  WorkflowSuggestion, 
  AIModelInfo, 
  AISettings 
} from '../types/ai.types';

export const aiService = {
  /**
   * Send a message to the AI assistant
   */
  async sendMessage(request: MessageRequest): Promise<MessageResponse> {
    const response = await api.post('/api/ai/chat', request);
    return response.data;
  },

  /**
   * Get or create a chat session
   */
  async getOrCreateSession(sessionId?: string): Promise<ChatSession> {
    if (sessionId) {
      const response = await api.get(`/api/ai/sessions/${sessionId}`);
      return response.data;
    } else {
      const response = await api.post('/api/ai/sessions');
      return response.data;
    }
  },

  /**
   * Get chat session history
   */
  async getSessionHistory(sessionId: string): Promise<ChatMessage[]> {
    const response = await api.get(`/api/ai/sessions/${sessionId}/messages`);
    return response.data;
  },

  /**
   * Generate a new workflow based on description
   */
  async generateWorkflow(request: GenerateWorkflowRequest): Promise<any> {
    const response = await api.post('/api/ai/generate-workflow', request);
    return response.data;
  },

  /**
   * Get suggestions for improving the current workflow
   */
  async getWorkflowSuggestions(workflowId: string): Promise<WorkflowSuggestion[]> {
    const response = await api.get(`/api/ai/workflows/${workflowId}/suggestions`);
    return response.data;
  },

  /**
   * Apply a workflow suggestion
   */
  async applySuggestion(workflowId: string, suggestionId: string): Promise<any> {
    const response = await api.post(`/api/ai/workflows/${workflowId}/suggestions/${suggestionId}/apply`);
    return response.data;
  },

  /**
   * Get AI model information
   */
  async getAvailableModels(): Promise<AIModelInfo[]> {
    const response = await api.get('/api/ai/models');
    return response.data;
  },

  /**
   * Get user AI settings
   */
  async getUserAISettings(): Promise<AISettings> {
    const response = await api.get('/api/ai/settings');
    return response.data;
  },

  /**
   * Update user AI settings
   */
  async updateUserAISettings(settings: Partial<AISettings>): Promise<AISettings> {
    const response = await api.put('/api/ai/settings', settings);
    return response.data;
  },

  /**
   * Analyze workflow for potential issues
   */
  async analyzeWorkflow(workflowId: string): Promise<any> {
    const response = await api.post(`/api/ai/workflows/${workflowId}/analyze`);
    return response.data;
  },

  /**
   * Generate documentation for a workflow
   */
  async generateDocumentation(workflowId: string): Promise<string> {
    const response = await api.post(`/api/ai/workflows/${workflowId}/documentation`);
    return response.data.documentation;
  }
};
