// src/types/workflow.types.ts

import { Rule, Condition as RuleCondition, RuleAction, RuleStatus } from './rule.types';

export interface WorkflowRule {
    id: string;
    name: string;
    description?: string;
    ruleType: string;
    priority: number;
    active: boolean;
    conditions: { field: string; operator: string; value: any; }[];
    actions: { type: string; target: string; value: any; }[];
    appliesTo?: 'all' | string[];
  }

export enum NodeType {
    SERVICE = 'service',
    FORK = 'fork',
    CONDITION = 'condition',
    JOIN = 'join',
    START = 'start',
    END = 'end',
    HUMAN = 'human',
    SYSTEM = 'system',
    AI = 'ai',
    DECISION = 'decision',
    DB = 'db',
    MAIL = 'mail',
    REST = 'rest',
    AGENT = 'agent',
    CUSTOM = 'custom'
}
  
export enum NodeStatus {
    IDLE = 'idle',
    RUNNING = 'running',
    COMPLETED = 'completed',
    ERROR = 'error',
    WAITING = 'waiting',
    SKIPPED = 'skipped'
}
  
export interface Position {
    x: number;
    y: number;
}
  
export interface WorkflowNodeData {
    label: string;
    description?: string;
    type: NodeType;
    status?: NodeStatus;
    config?: Record<string, any>;
    formFields?: FormField[];
    inputSchema?: Record<string, any>;
    outputSchema?: Record<string, any>;
    code?: string;
    aiPrompt?: string;
    validations?: NodeValidation[];
    rules?: NodeRule[];
    policies?: NodePolicy[];
    dataClassification?: any;
}
  
export interface WorkflowNode {
    id: string;
    type: NodeType;
    position: Position;
    data: WorkflowNodeData;
}
  
export interface WorkflowEdgeData {
    label?: string;
    condition?: string;
}
  
export interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
    data?: WorkflowEdgeData;
}
  
export interface FormField {
    id: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'checkbox' | 'date' | 'file' | 'textarea';
    description?: string;
    placeholder?: string;
    defaultValue?: any;
    required?: boolean;
    options?: { label: string; value: any }[];
    validation?: Record<string, any>;
}
  
export interface Workflow {
    id: string;
    name: string;
    description?: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    tags?: string[];
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    isPublic?: boolean;
    version: number;
    application?: string;
    status: WorkflowStatus;
    rules?: WorkflowRule[];
    policies?: WorkflowPolicy[];
    validations?: WorkflowValidation[];
    securityPolicies?: any[];
}
  
export interface WorkflowExecution {
    id: string;
    workflowId: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    startedAt: string;
    completedAt?: string;
    currentNodeId?: string;
    results?: Record<string, any>;
    logs?: WorkflowExecutionLog[];
}
  
export interface WorkflowExecutionLog {
    timestamp: string;
    nodeId: string;
    nodeName: string;
    status: NodeStatus;
    message: string;
    data?: Record<string, any>;
    securityEvents?: SecurityEvent[];
}

export interface SecurityEvent {
    type: 'access' | 'data' | 'encryption' | 'compliance' | 'validation' | 'action';
    timestamp: string;
    policyId?: string;
    result: 'allow' | 'deny' | 'warning' | 'log';
    message: string;
    details?: Record<string, any>;
}
  
export interface WorkflowTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    tags: string[];
    thumbnail?: string;
}

export enum WorkflowStatus {
    DRAFT = 'DRAFT',
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    DEPRECATED = 'DEPRECATED'
}

// Add missing interfaces used in components
export interface NodeValidation {
    id: string;
    field: string;
    type: 'required' | 'regex' | 'min' | 'max' | 'email' | 'url' | 'custom';
    value?: any;
    message?: string;
    customValidator?: string;
}

export interface NodeRule {
    id: string;
    condition: string;
    action: 'setValue' | 'setVisibility' | 'triggerEvent' | 'custom';
    target?: string;
    value?: any;
    customAction?: string;
}

export interface NodePolicy {
    id: string;
    policyType: 'access' | 'data' | 'action';
    condition: string;
    effect: 'allow' | 'deny';
}

// export interface WorkflowRule {
//     id: string;
//     name: string;
//     description?: string;
//     ruleType: 'business' | 'data' | 'security' | 'custom';
//     priority: number;
//     active: boolean;
//     conditions: {
//         field: string;
//         operator: string;
//         value: any;
//     }[];
//     actions: {
//         type: string;
//         target: string;
//         value?: any;
//     }[];
//     appliesTo?: 'all' | string[];
// }

export interface WorkflowPolicy {
    id: string;
    name: string;
    description?: string;
    policyType: 'access' | 'data' | 'time' | 'rate' | 'custom';
    resource: string;
    action: string;
    effect: 'allow' | 'deny';
    conditions?: Record<string, any>;
    appliesTo?: 'all' | string[];
    roles?: string[];
    priority: number;
}

export interface WorkflowValidation {
    id: string;
    name: string;
    description?: string;
    nodeId?: string;
    targetFields: string[];
    validationType: 'data' | 'state' | 'transition' | 'custom';
    condition: string;
    errorMessage: string;
    errorLevel: 'warning' | 'error';
    errorAction?: 'block' | 'log' | 'notify';
}

// Add a conversion function to convert WorkflowRule to Rule for RuleEditor
export const convertToRule = (workflowRule: WorkflowRule): Rule => {
  // Create a simple condition from the first condition in the array
  const mainCondition: RuleCondition = {
    id: `condition-${Date.now()}`,
    type: 'SIMPLE',
    field: workflowRule.conditions[0]?.field || '',
    operator: workflowRule.conditions[0]?.operator as any || 'EQUALS',
    value: workflowRule.conditions[0]?.value
    };
  
  // Convert actions format
  const ruleActions: RuleAction[] = workflowRule.actions.map(action => ({
    id: `action-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    type: action.type.toUpperCase() as any,
    configuration: { target: action.target },
    target: action.target,
    value: action.value
  }));
    return {
    id: workflowRule.id,
    name: workflowRule.name,
    description: workflowRule.description || '',
    type: workflowRule.ruleType.toUpperCase() as any,
    status: workflowRule.active ? RuleStatus.ACTIVE : RuleStatus.INACTIVE,
    condition: mainCondition,
    conditions: workflowRule.conditions.map(c => ({
      id: `condition-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type: 'SIMPLE',
      field: c.field,
      operator: c.operator as any,
      value: c.value
    })),
    actions: ruleActions,
    priority: workflowRule.priority,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system',
    version: 1,
    active: workflowRule.active
  };
};
