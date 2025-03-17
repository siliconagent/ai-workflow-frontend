export enum MessageRole {
    USER = 'USER',
    ASSISTANT = 'ASSISTANT',
    SYSTEM = 'SYSTEM'
  }
  
  export interface ChatMessage {
    id: string;
    role: MessageRole;
    content: string;
    timestamp: string;
    metadata?: Record<string, any>;
  }
  
  export interface ChatSession {
    id: string;
    messages: ChatMessage[];
    title?: string;
    createdAt: string;
    updatedAt: string;
    context?: Record<string, any>;
  }
  
  export enum WorkflowSuggestionType {
    NEW_WORKFLOW = 'NEW_WORKFLOW',
    ADD_NODE = 'ADD_NODE',
    MODIFY_NODE = 'MODIFY_NODE',
    DELETE_NODE = 'DELETE_NODE',
    ADD_CONNECTION = 'ADD_CONNECTION',
    MODIFY_CONNECTION = 'MODIFY_CONNECTION',
    DELETE_CONNECTION = 'DELETE_CONNECTION',
    OPTIMIZE = 'OPTIMIZE',
    FIX_ERROR = 'FIX_ERROR'
  }
  
  export interface WorkflowSuggestion {
    id: string;
    type: WorkflowSuggestionType;
    workflowId: string;
    description: string;
    changes: {
      before?: any;
      after: any;
    };
    confidence: number;
    reasoning: string;
    createdAt: string;
  }
  
  export interface MessageRequest {
    content: string;
    sessionId?: string;
    context?: Record<string, any>;
  }
  
  export interface MessageResponse {
    message: ChatMessage;
    suggestions?: WorkflowSuggestion[];
  }
  
  export interface GenerateWorkflowRequest {
    description: string;
    requirements?: string[];
    constraints?: string[];
    complexity?: 'SIMPLE' | 'MEDIUM' | 'COMPLEX';
    similarTo?: string;
  }
  
  export interface AIModelInfo {
    id: string;
    name: string;
    provider: string;
    capabilities: string[];
    description: string;
  }
  
  export interface AISettings {
    defaultModel: string;
    temperature: number;
    maxTokens: number;
    suggestionsEnabled: boolean;
    autoCompleteEnabled: boolean;
  }
