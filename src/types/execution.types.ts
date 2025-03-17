import { NodeStatus, NodeType } from './workflow.types';

export enum ExecutionStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR'
}

export interface ExecutionLog {
  id: string;
  executionId: string;
  nodeId?: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  details?: any;
}

export interface NodeResult {
  nodeId: string;
  status: NodeStatus;
  startTime: string;
  endTime?: string;
  input?: any;
  output?: any;
  error?: {
    message: string;
    details?: any;
  };
  retries?: number;
  duration?: number;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowVersion: number;
  status: ExecutionStatus;
  startTime: string;
  endTime?: string;
  initiatedBy: string;
  currentNodeId?: string;
  progress: number;
  input?: any;
  output?: any;
  error?: {
    message: string;
    nodeId?: string;
    details?: any;
  };
  duration?: number;
  nodeResults: Record<string, NodeResult>;
}

export interface ExecutionInput {
  workflowId: string;
  input?: any;
}

export interface HumanTaskInput {
  executionId: string;
  nodeId: string;
  formData: any;
  action: 'COMPLETE' | 'REJECT' | 'ESCALATE' | 'COMMENT';
  comment?: string;
}

export interface ExecutionFilterParams {
  workflowId?: string;
  status?: ExecutionStatus;
  initiatedBy?: string;
  startTimeFrom?: string;
  startTimeTo?: string;
  search?: string;
}

export interface PaginatedExecutions {
  items: WorkflowExecution[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ExecutionMetrics {
  total: number;
  byStatus: Record<ExecutionStatus, number>;
  averageDuration: number;
  successRate: number;
  failureRate: number;
}

export interface NodeStepConfig {
  nodeId: string;
  type: NodeType;
  input?: any;
  expectedOutput?: any;
}

export interface AutoExecuteConfig {
  executionId: string;
  nodeId: string;
  input: any;
}
