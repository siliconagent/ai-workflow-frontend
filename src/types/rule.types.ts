export enum RuleType {
    CONDITION = 'CONDITION',
    VALIDATION = 'VALIDATION',
    CALCULATION = 'CALCULATION',
    TRANSFORMATION = 'TRANSFORMATION',
    DECISION = 'DECISION',
    BUSINESS = 'BUSINESS',
    DATA = 'DATA',
    SECURITY = 'SECURITY'
  }
  
  export enum RuleStatus {
    DRAFT = 'DRAFT',
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    DEPRECATED = 'DEPRECATED'
  }
  
  export enum OperatorType {
    EQUALS = 'EQUALS',
    NOT_EQUALS = 'NOT_EQUALS',
    GREATER_THAN = 'GREATER_THAN',
    LESS_THAN = 'LESS_THAN',
    GREATER_THAN_OR_EQUALS = 'GREATER_THAN_OR_EQUALS',
    LESS_THAN_OR_EQUALS = 'LESS_THAN_OR_EQUALS',
    CONTAINS = 'CONTAINS',
    NOT_CONTAINS = 'NOT_CONTAINS',
    STARTS_WITH = 'STARTS_WITH',
    ENDS_WITH = 'ENDS_WITH',
    IN = 'IN',
    NOT_IN = 'NOT_IN',
    BETWEEN = 'BETWEEN',
    NOT_BETWEEN = 'NOT_BETWEEN',
    IS_NULL = 'IS_NULL',
    IS_NOT_NULL = 'IS_NOT_NULL',
    MATCHES_REGEX = 'MATCHES_REGEX',
    AND = 'AND',
    OR = 'OR',
    NOT = 'NOT'
  }
  
  export type ConditionValue = string | number | boolean | null | Array<string | number | boolean>;
  
  export interface Condition {
    id: string;
    type: 'SIMPLE' | 'GROUP';
    operator?: OperatorType;
    field?: string;
    value?: ConditionValue;
    children?: Condition[];
  }
  
  export interface RuleAction {
    id: string;
    type: 'SET_VALUE' | 'EXECUTE_WORKFLOW' | 'CALL_SERVICE' | 'NOTIFY' | 'CUSTOM';
    configuration: {
      [key: string]: any;
    };
    target?: string;
    value?: any;
    // configuration?: Record<string, unknown>;
  }
  
  export interface Rule {
    id: string;
    name: string;
    description: string;
    type: RuleType;
    status: RuleStatus;
    condition: Condition;
    conditions?: Condition[];
    actions?: RuleAction[];
    priority: number;
    effectiveFrom?: string;
    effectiveTo?: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    category?: string;
    version: number;
    tags?: string[];
    active: boolean;
  }
  
  export interface RuleInput {
    name: string;
    description: string;
    type: RuleType;
    condition: Condition;
    conditions?: Condition[];
    actions?: RuleAction[];
    priority: number;
    effectiveFrom?: string;
    effectiveTo?: string;
    category?: string;
    tags?: string[];
    active: boolean; 
  }
  
  export interface RuleFilterParams {
    type?: RuleType;
    status?: RuleStatus;
    category?: string;
    search?: string;
    tags?: string[];
  }
  
  export interface ConditionEvaluationRequest {
    condition: Condition;
    contextData: Record<string, any>;
  }
  
  export interface ConditionEvaluationResult {
    result: boolean;
    executionDetails?: {
      evaluatedNodes: {
        conditionId: string;
        result: boolean;
        reason?: string;
      }[];
    };
  }
  
  export interface RuleEvaluationRequest {
    ruleId: string;
    contextData: Record<string, any>;
  }
  
  export interface RuleEvaluationResult {
    result: boolean;
    executedActions?: {
      actionId: string;
      success: boolean;
      result?: any;
      error?: string;
    }[];
    conditionEvaluation: ConditionEvaluationResult;
  }
