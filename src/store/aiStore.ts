import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  ChatMessage, 
  ChatSession, 
  MessageRequest, 
  AIModelInfo, 
  AISettings, 
  WorkflowSuggestion
} from '../types/ai.types';
import { aiService } from '../services/aiService';

interface AIState {
  session: ChatSession | null;
  messages: ChatMessage[];
  suggestions: WorkflowSuggestion[];
  isLoading: boolean;
  error: string | null;
  models: AIModelInfo[];
  settings: AISettings | null;

  // Actions
  sendMessage: (content: string, context?: Record<string, any>) => Promise<void>;
  getOrCreateSession: (sessionId?: string) => Promise<void>;
  fetchMessages: (sessionId: string) => Promise<void>;
  getWorkflowSuggestions: (workflowId: string) => Promise<void>;
  applySuggestion: (workflowId: string, suggestionId: string) => Promise<any>;
  generateWorkflow: (description: string, requirements?: string[], constraints?: string[]) => Promise<any>;
  fetchModels: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<AISettings>) => Promise<void>;
  analyzeWorkflow: (workflowId: string) => Promise<any>;
  generateDocumentation: (workflowId: string) => Promise<string>;
  clearMessages: () => void;
  clearSuggestions: () => void;
  clearError: () => void;
}

export const useAIStore = create<AIState>()(
  devtools(
    (set, get) => ({
      session: null,
      messages: [],
      suggestions: [],
      isLoading: false,
      error: null,
      models: [],
      settings: null,

      sendMessage: async (content, context) => {
        set({ isLoading: true, error: null });
        try {
          const sessionId = get().session?.id;
          if (!sessionId) {
            await get().getOrCreateSession();
          }
          
          const request: MessageRequest = {
            content,
            sessionId: get().session?.id,
            context
          };
          
          const response = await aiService.sendMessage(request);
          
          set((state) => ({ 
            messages: [...state.messages, response.message],
            suggestions: response.suggestions || state.suggestions,
            isLoading: false 
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to send message', 
            isLoading: false 
          });
        }
      },

      getOrCreateSession: async (sessionId) => {
        set({ isLoading: true, error: null });
        try {
          const session = await aiService.getOrCreateSession(sessionId);
          set({ session, isLoading: false });
          
          // If session has messages, load them
          if (session.messages && session.messages.length > 0) {
            set({ messages: session.messages });
          } else {
            await get().fetchMessages(session.id);
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create session', 
            isLoading: false 
          });
        }
      },

      fetchMessages: async (sessionId) => {
        set({ isLoading: true, error: null });
        try {
          const messages = await aiService.getSessionHistory(sessionId);
          set({ messages, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch messages', 
            isLoading: false 
          });
        }
      },

      getWorkflowSuggestions: async (workflowId) => {
        set({ isLoading: true, error: null });
        try {
          const suggestions = await aiService.getWorkflowSuggestions(workflowId);
          set({ suggestions, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to get workflow suggestions', 
            isLoading: false 
          });
        }
      },

      applySuggestion: async (workflowId, suggestionId) => {
        set({ isLoading: true, error: null });
        try {
          const result = await aiService.applySuggestion(workflowId, suggestionId);
          set((state) => ({ 
            suggestions: state.suggestions.filter(s => s.id !== suggestionId),
            isLoading: false 
          }));
          return result;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to apply suggestion', 
            isLoading: false 
          });
          throw error;
        }
      },

      generateWorkflow: async (description, requirements, constraints) => {
        set({ isLoading: true, error: null });
        try {
          const result = await aiService.generateWorkflow({
            description,
            requirements,
            constraints
          });
          set({ isLoading: false });
          return result;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to generate workflow', 
            isLoading: false 
          });
          throw error;
        }
      },

      fetchModels: async () => {
        set({ isLoading: true, error: null });
        try {
          const models = await aiService.getAvailableModels();
          set({ models, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch AI models', 
            isLoading: false 
          });
        }
      },

      fetchSettings: async () => {
        set({ isLoading: true, error: null });
        try {
          const settings = await aiService.getUserAISettings();
          set({ settings, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch AI settings', 
            isLoading: false 
          });
        }
      },

      updateSettings: async (settings) => {
        set({ isLoading: true, error: null });
        try {
          const updatedSettings = await aiService.updateUserAISettings(settings);
          set({ settings: updatedSettings, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update AI settings', 
            isLoading: false 
          });
        }
      },

      analyzeWorkflow: async (workflowId) => {
        set({ isLoading: true, error: null });
        try {
          const result = await aiService.analyzeWorkflow(workflowId);
          set({ isLoading: false });
          return result;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to analyze workflow', 
            isLoading: false 
          });
          throw error;
        }
      },

      generateDocumentation: async (workflowId) => {
        set({ isLoading: true, error: null });
        try {
          const documentation = await aiService.generateDocumentation(workflowId);
          set({ isLoading: false });
          return documentation;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to generate documentation', 
            isLoading: false 
          });
          throw error;
        }
      },

      clearMessages: () => {
        set({ messages: [] });
      },

      clearSuggestions: () => {
        set({ suggestions: [] });
      },

      clearError: () => {
        set({ error: null });
      }
    }),
    { name: 'ai-store' }
  )
);
