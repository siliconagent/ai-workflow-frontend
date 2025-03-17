import { useState, useEffect, useCallback } from 'react';
import { useAIStore } from '../store/aiStore';
import { 
  ChatMessage, 
  MessageRole, 
  WorkflowSuggestion, 
  AIModelInfo, 
  AISettings 
} from '../types/ai.types';

export const useAI = (sessionId?: string) => {
  const {
    session,
    messages,
    suggestions,
    isLoading,
    error,
    models,
    settings,
    sendMessage,
    getOrCreateSession,
    fetchMessages,
    getWorkflowSuggestions,
    applySuggestion,
    generateWorkflow,
    fetchModels,
    fetchSettings,
    updateSettings,
    analyzeWorkflow,
    generateDocumentation,
    clearMessages,
    clearSuggestions,
    clearError
  } = useAIStore();

  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize session on load
  useEffect(() => {
    getOrCreateSession(sessionId);
  }, [sessionId, getOrCreateSession]);

    // Generate suggestions for a workflow
    const generateSuggestions = useCallback(async (workflowId: string) => {
        setIsGenerating(true);
        try {
          await getWorkflowSuggestions(workflowId);
        } catch (error) {
          console.error('Error generating workflow suggestions:', error);
          throw error;
        } finally {
          setIsGenerating(false);
        }
      }, [getWorkflowSuggestions]);

  // Send a message to the AI assistant
  const sendUserMessage = useCallback(async (content: string, context?: Record<string, any>) => {
    setIsSending(true);
    try {
      await sendMessage(content, context);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    } finally {
      setIsSending(false);
    }
  }, [sendMessage]);

  // Get suggestions for a workflow
  const getSuggestionsForWorkflow = useCallback(async (workflowId: string) => {
    try {
      await getWorkflowSuggestions(workflowId);
    } catch (error) {
      console.error('Error getting workflow suggestions:', error);
      throw error;
    }
  }, [getWorkflowSuggestions]);

  // Apply a suggestion to a workflow
  const applySuggestionToWorkflow = useCallback(async (workflowId: string, suggestionId: string) => {
    try {
      return await applySuggestion(workflowId, suggestionId);
    } catch (error) {
      console.error('Error applying suggestion:', error);
      throw error;
    }
  }, [applySuggestion]);

  // Generate a new workflow based on description
  const generateNewWorkflow = useCallback(async (description: string, requirements?: string[], constraints?: string[]) => {
    try {
      return await generateWorkflow(description, requirements, constraints);
    } catch (error) {
      console.error('Error generating workflow:', error);
      throw error;
    }
  }, [generateWorkflow]);

  // Analyze a workflow
  const analyzeWorkflowWithAI = useCallback(async (workflowId: string) => {
    try {
      return await analyzeWorkflow(workflowId);
    } catch (error) {
      console.error('Error analyzing workflow:', error);
      throw error;
    }
  }, [analyzeWorkflow]);

  // Generate documentation for a workflow
  const generateWorkflowDocumentation = useCallback(async (workflowId: string) => {
    try {
      return await generateDocumentation(workflowId);
    } catch (error) {
      console.error('Error generating documentation:', error);
      throw error;
    }
  }, [generateDocumentation]);

  // Load AI models
  const loadModels = useCallback(async () => {
    try {
      await fetchModels();
    } catch (error) {
      console.error('Error loading AI models:', error);
      throw error;
    }
  }, [fetchModels]);

  // Load user AI settings
  const loadSettings = useCallback(async () => {
    try {
      await fetchSettings();
    } catch (error) {
      console.error('Error loading AI settings:', error);
      throw error;
    }
  }, [fetchSettings]);

  // Update user AI settings
  const updateUserSettings = useCallback(async (newSettings: Partial<AISettings>) => {
    try {
      await updateSettings(newSettings);
    } catch (error) {
      console.error('Error updating AI settings:', error);
      throw error;
    }
  }, [updateSettings]);

  // Clear conversation history
  const clearConversation = useCallback(() => {
    clearMessages();
  }, [clearMessages]);

  // Get last message in the conversation
  const getLastMessage = useCallback((): ChatMessage | undefined => {
    if (!messages || messages.length === 0) return undefined;
    return messages[messages.length - 1];
  }, [messages]);

  // Get last user message in the conversation
  const getLastUserMessage = useCallback((): ChatMessage | undefined => {
    if (!messages || messages.length === 0) return undefined;
    
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === MessageRole.USER) {
        return messages[i];
      }
    }
    
    return undefined;
  }, [messages]);

  // Get last assistant message in the conversation
  const getLastAssistantMessage = useCallback((): ChatMessage | undefined => {
    if (!messages || messages.length === 0) return undefined;
    
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === MessageRole.ASSISTANT) {
        return messages[i];
      }
    }
    
    return undefined;
  }, [messages]);

  return {
    session,
    messages,
    suggestions,
    isLoading,
    isSending,
    isGenerating,
    error,
    models,
    settings,
    sendMessage: sendUserMessage,
    getSuggestionsForWorkflow,
    applySuggestionToWorkflow,
    generateNewWorkflow,
    getWorkflowSuggestions,
    analyzeWorkflowWithAI,
    generateWorkflowDocumentation,
    loadModels,
    loadSettings,
    updateUserSettings,
    clearConversation,
    clearSuggestions,
    clearError,
    getLastMessage,
    getLastUserMessage,
    getLastAssistantMessage
  };
};
