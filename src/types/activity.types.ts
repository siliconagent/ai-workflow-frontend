export enum ActivityType {
    CONDITION = 'condition',
    START = 'start',
    END = 'end',
    HUMAN = 'human',
    SYSTEM = 'system',
    AI = 'ai',
    DB = 'db',
    MAIL = 'mail',
    REST = 'rest',
  }
  
  export enum ActivityStatus {
    DRAFT = 'DRAFT',
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    DEPRECATED = 'DEPRECATED'
  }
  
  export interface ActivityConfig {
    [key: string]: any;
  }
  
  export interface HumanTaskConfig extends ActivityConfig {
    formSchema: any;
    assignmentType: 'USER' | 'ROLE' | 'GROUP';
    assignedTo?: string;
    timeoutMinutes?: number;
    escalationPath?: string;
  }
  
  export interface SystemTaskConfig extends ActivityConfig {
    serviceEndpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    requestTemplate?: string;
    responseMapping?: Record<string, string>;
    retryPolicy?: {
      maxRetries: number;
      backoffFactor: number;
      initialDelayMs: number;
    };
  }
  
  export interface AITaskConfig extends ActivityConfig {
    modelId: string;
    promptTemplate: string;
    outputMapping: Record<string, string>;
    temperature?: number;
    maxTokens?: number;
  }
  
  export interface AgentTaskConfig extends ActivityConfig {
    agentId: string;
    operation: string;
    inputMapping: Record<string, string>;
    outputMapping: Record<string, string>;
    timeout?: number;
  }
  
  export interface ConditionConfig extends ActivityConfig {
    expression: string;
    ruleId?: string;
  }
  
  export interface Activity {
    id: string;
    name: string;
    description: string;
    type: ActivityType;
    status: ActivityStatus;
    configuration: ActivityConfig;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    category?: string;
    version: number;
    tags?: string[];
    config: Record<string, any>;
    active: boolean;
  }
  
  export interface ActivityInput {
    name: string;
    description: string;
    type: ActivityType;
    configuration: ActivityConfig;
    category?: string;
    tags?: string[];
  }
  
  export interface ActivityFilterParams {
    type?: ActivityType;
    status?: ActivityStatus;
    category?: string;
    tags?: string[];
    search?: string;
  }
