export enum AgentType {
    HTTP = 'HTTP',
    DATABASE = 'DATABASE',
    MESSAGE_QUEUE = 'MESSAGE_QUEUE',
    FILE_SYSTEM = 'FILE_SYSTEM',
    EMAIL = 'EMAIL',
    REST = 'REST',
    SOAP = 'SOAP',
    MESSAGING = 'MESSAGING',
    CUSTOM = 'CUSTOM'
  }
  
  export enum AgentStatus {
    DRAFT = 'DRAFT',
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    ERROR = 'ERROR'
  }
  
  export interface AgentConfig {
    [key: string]: any;
  }
  
  export interface HttpAgentConfig extends AgentConfig {
    baseUrl: string;
    defaultHeaders?: Record<string, string>;
    authType?: 'NONE' | 'BASIC' | 'BEARER' | 'API_KEY' | 'OAUTH2';
    username?: string;
    password?: string;
    apiKey?: string;
    apiKeyHeader?: string;
    accessToken?: string;
    oauth2Config?: {
      tokenUrl: string;
      clientId: string;
      clientSecret: string;
      scope?: string;
    };
    timeout?: number;
  }
  
  export interface DatabaseAgentConfig extends AgentConfig {
    type: 'MYSQL' | 'POSTGRES' | 'MONGODB' | 'ORACLE' | 'MSSQL';
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    connectionString?: string;
    ssl?: boolean;
    poolSize?: number;
  }
  
  export interface MessageQueueAgentConfig extends AgentConfig {
    type: 'KAFKA' | 'RABBITMQ' | 'SQS' | 'AZURE_SB';
    connectionString: string;
    queueName?: string;
    exchangeName?: string;
    routingKey?: string;
    credentials?: {
      username?: string;
      password?: string;
      accessKey?: string;
      secretKey?: string;
    };
  }
  
  export interface FileSystemAgentConfig extends AgentConfig {
    type: 'LOCAL' | 'S3' | 'AZURE_BLOB' | 'GCS';
    basePath?: string;
    credentials?: {
      accessKey?: string;
      secretKey?: string;
      connectionString?: string;
    };
    bucketName?: string;
    containerName?: string;
  }
  
  export interface EmailAgentConfig extends AgentConfig {
    smtpServer: string;
    port: number;
    username: string;
    password: string;
    useSsl: boolean;
    defaultSender?: string;
  }
  
  export interface Agent {
    id: string;
    name: string;
    description: string;
    type: AgentType;
    status: AgentStatus;
    configuration: AgentConfig;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    lastConnectedAt?: string;
    lastConnectionStatus?: 'SUCCESS' | 'FAILURE';
    lastErrorMessage?: string;
    tags?: string[];
    active: boolean; 
  }
  
  export interface AgentInput {
    name: string;
    description: string;
    type: AgentType;
    configuration: AgentConfig;
    tags?: string[];
    active: boolean;
  }
  
  export interface AgentFilterParams {
    type?: AgentType;
    status?: AgentStatus;
    search?: string;
    tags?: string[];
  }
  
  export interface ConnectionTestResult {
    success: boolean;
    message: string;
    timestamp: string;
    details?: any;
  }
