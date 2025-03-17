import {
    WorkflowNode,
    NodePolicy,
    NodeRule,
    NodeValidation,
    FormField,
    NodeType
  } from '@/types/workflow.types';
  import { v4 as uuidv4 } from 'uuid';
  
  /**
   * Get icon name for node type
   */
  export function getNodeIconName(nodeType: string): string {
    switch (nodeType) {
      case 'start':
        return 'play-circle';
      case 'end':
        return 'stop-circle';
      case 'human':
        return 'user';
      case 'system':
        return 'cog';
      case 'db':
        return 'database';
      case 'decision':
        return 'git-branch';
      case 'ai':
        return 'cpu';
      case 'mail':
        return 'mail';
      case 'flutter':
        return 'smartphone';
      default:
        return 'activity';
    }
  }
  
  /**
   * Get node display color based on type
   */
  export function getNodeColor(nodeType: string): string {
    switch (nodeType) {
      case 'start':
        return '#3b82f6'; // blue-500
      case 'end':
        return '#ef4444'; // red-500
      case 'human':
        return '#8b5cf6'; // violet-500
      case 'system':
        return '#10b981'; // emerald-500
      case 'db':
        return '#f59e0b'; // amber-500
      case 'decision':
        return '#ec4899'; // pink-500
      case 'ai':
        return '#6366f1'; // indigo-500
      case 'mail':
        return '#14b8a6'; // teal-500
      case 'flutter':
        return '#0ea5e9'; // sky-500
      default:
        return '#94a3b8'; // slate-400
    }
  }
  
  /**
   * Create form field
   */
  export function createFormField(type: string = 'text'): FormField {
    return {
      id: `field-${uuidv4()}`,
      label: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      type: type as any,
      placeholder: `Enter ${type}`,
      required: false
    };
  }
  
  /**
   * Create node validation
   */
  export function createNodeValidation(): NodeValidation {
    return {
      id: `validation-${uuidv4()}`,
      field: '',
      type: 'required',
      message: 'This field is required'
    };
  }
  
  /**
   * Create node rule
   */
  export function createNodeRule(): NodeRule {
    return {
      id: `rule-${uuidv4()}`,
      condition: '',
      action: 'setValue',
      target: ''
    };
  }
  
  /**
   * Create node policy
   */
  export function createNodePolicy(): NodePolicy {
    return {
      id: `policy-${uuidv4()}`,
      policyType: 'access',
      condition: 'true',
      effect: 'allow'
    };
  }
  
  /**
   * Create a start node
   */
  export function createStartNode(id?: string): WorkflowNode {
    return {
      id: id || `node-${uuidv4()}`,
      type: 'start' as NodeType,
      position: { x: 100, y: 100 },
      data: {
        label: 'Start',
        description: 'Workflow start point',
        type: 'start' as NodeType
      }
    };
  }
  
  /**
   * Create an end node
   */
  export function createEndNode(id?: string): WorkflowNode {
    return {
      id: id || `node-${uuidv4()}`,
      type: 'end' as NodeType,
      position: { x: 500, y: 100 },
      data: {
        label: 'End',
        description: 'Workflow end point',
        type: 'end' as NodeType
      }
    };
  }
  
  /**
   * Create a human task node
   */
  export function createHumanNode(id?: string): WorkflowNode {
    return {
      id: id || `node-${uuidv4()}`,
      type: 'human' as NodeType,
      position: { x: 300, y: 100 },
      data: {
        label: 'Human Task',
        description: 'Requires human interaction',
        type: 'human' as NodeType,
        formFields: [
          {
            id: `field-${uuidv4()}`,
            label: 'Name',
            type: 'text',
            placeholder: 'Enter your name',
            required: true
          },
          {
            id: `field-${uuidv4()}`,
            label: 'Email',
            type: 'text',
            placeholder: 'Enter your email',
            required: true,
            validation: {
              pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
              message: 'Please enter a valid email address'
            }
          }
        ],
        config: {
          contentType: 'form',
          layoutSettings: {
            columns: 1,
            showLabels: true,
            labelPosition: 'top'
          }
        }
      }
    };
  }
  
  /**
   * Create a system node
   */
  export function createSystemNode(id?: string): WorkflowNode {
    return {
      id: id || `node-${uuidv4()}`,
      type: 'system' as NodeType,
      position: { x: 300, y: 100 },
      data: {
        label: 'System Task',
        description: 'Automated system operation',
        type: 'system' as NodeType,
        code: `// Write your code here\nfunction process(data, context) {\n  // Process data and return result\n  return {\n    ...data,\n    processed: true,\n    timestamp: new Date().toISOString()\n  };\n}\n\nreturn process(data, context);`
      }
    };
  }
  
  /**
   * Create a database node
   */
  export function createDBNode(id?: string): WorkflowNode {
    return {
      id: id || `node-${uuidv4()}`,
      type: 'db' as NodeType,
      position: { x: 300, y: 100 },
      data: {
        label: 'Database Operation',
        description: 'Interact with database',
        type: 'db' as NodeType,
        config: {
          operation: 'find',
          collection: 'users',
          query: { active: true },
          projection: { password: 0 }
        }
      }
    };
  }
  
  /**
   * Create a decision node
   */
  export function createDecisionNode(id?: string): WorkflowNode {
    return {
      id: id || `node-${uuidv4()}`,
      type: 'decision' as NodeType,
      position: { x: 300, y: 100 },
      data: {
        label: 'Decision',
        description: 'Conditional branching',
        type: 'decision' as NodeType,
        config: {
          type: 'simple',
          field: 'data.amount',
          operator: '>',
          value: 1000,
          condition: 'data.amount > 1000'
        }
      }
    };
  }
  
  /**
   * Create an AI node
   */
  export function createAINode(id?: string): WorkflowNode {
    return {
      id: id || `node-${uuidv4()}`,
      type: 'ai' as NodeType,
      position: { x: 300, y: 100 },
      data: {
        label: 'AI Task',
        description: 'Process with AI model',
        type: 'ai' as NodeType,
        aiPrompt: 'Analyze the following data and provide insights:\n{{data}}',
        config: {
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 500,
          provider: 'openai'
        }
      }
    };
  }
  
  /**
   * Create a mail node
   */
  export function createMailNode(id?: string): WorkflowNode {
    return {
      id: id || `node-${uuidv4()}`,
      type: 'mail' as NodeType,
      position: { x: 300, y: 100 },
      data: {
        label: 'Send Email',
        description: 'Send email notification',
        type: 'mail' as NodeType,
        config: {
          to: '{{data.email}}',
          subject: 'Workflow Notification',
          template: 'notification',
          priority: 'normal'
        }
      }
    };
  }
  
  /**
   * Create a node based on type
   */
  export function createNodeByType(type: string, id?: string): WorkflowNode {
    switch (type) {
      case 'start':
        return createStartNode(id);
      case 'end':
        return createEndNode(id);
      case 'human':
        return createHumanNode(id);
      case 'system':
        return createSystemNode(id);
      case 'db':
        return createDBNode(id);
      case 'decision':
        return createDecisionNode(id);
      case 'ai':
        return createAINode(id);
      case 'mail':
        return createMailNode(id);
      default:
        throw new Error(`Unsupported node type: ${type}`);
    }
  }
