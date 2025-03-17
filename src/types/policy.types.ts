export enum PolicyType {
    ACCESS_CONTROL = 'ACCESS_CONTROL',
    GOVERNANCE = 'GOVERNANCE',
    COMPLIANCE = 'COMPLIANCE',
    VALIDATION = 'VALIDATION',
    DATA_PROTECTION = 'DATA_PROTECTION',
    AUTHORIZATION = 'AUTHORIZATION',
    CUSTOM = 'CUSTOM'
  }
  
  export enum PolicyStatus {
    DRAFT = 'DRAFT',
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    DEPRECATED = 'DEPRECATED'
  }
  
  export enum Effect {
    ALLOW = 'ALLOW',
    DENY = 'DENY'
  }
  
  // Adding PolicyEffect enum to maintain compatibility with existing components
  export enum PolicyEffect {
    ALLOW = 'ALLOW',
    DENY = 'DENY'
  }
  
  export enum ResourceType {
    WORKFLOW = 'WORKFLOW',
    ACTIVITY = 'ACTIVITY',
    AGENT = 'AGENT',
    RULE = 'RULE',
    POLICY = 'POLICY',
    USER = 'USER',
    ROLE = 'ROLE',
    EXECUTION = 'EXECUTION'
  }
  
  export type ActionType = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'EXECUTE' | 'DEACTIVATE';
  
  export interface PolicyCondition {
    [key: string]: any;
  }
  
  export interface PolicyStatement {
    id: string;
    effect: Effect;
    actions: ActionType[];
    resources: string[];
    resourceType: ResourceType;
    conditions?: PolicyCondition;
  }
  export interface DataClassification {
    level: 'public' | 'internal' | 'confidential' | 'restricted';
    pii: boolean;
    phi: boolean;
    pci: boolean;
    retention?: number;
  }
  
  export interface Policy {
    id: string;
    name: string;
    description: string;
    type: PolicyType;
    status: PolicyStatus;
    statements: PolicyStatement[];
    priority: number;
    effectiveFrom?: string;
    effectiveTo?: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    version: number;
    tags?: string[];
    // Adding properties to maintain compatibility with existing components
    resource?: string;
    action?: string;
    effect?: PolicyEffect;
    conditions?: Record<string, any>;
    active?: boolean;
    policyType: PolicyType;
    roles?: string[];
    dataClassification?: DataClassification;
  }
  
  export interface PolicyInput {
    name: string;
    description: string;
    type: PolicyType;
    statements: PolicyStatement[];
    priority: number;
    effectiveFrom?: string;
    effectiveTo?: string;
    tags?: string[];
  }
  
  export interface PolicyFilterParams {
    type?: PolicyType;
    status?: PolicyStatus;
    search?: string;
    tags?: string[];
  }
  
  export interface AuthorizationRequest {
    userId: string;
    action: ActionType;
    resourceType: ResourceType;
    resourceId: string;
    context?: Record<string, any>;
  }
  
  export interface AuthorizationResponse {
    authorized: boolean;
    reason?: string;
    evaluatedPolicies?: {
      policyId: string;
      policyName: string;
      result: boolean;
      statements: {
        statementId: string;
        effect: Effect;
        result: boolean;
      }[];
    }[];
  }
