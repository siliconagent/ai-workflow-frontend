import { NodeType, Workflow, WorkflowStatus } from '@/types/workflow.types';
import { v4 as uuidv4 } from 'uuid';
import { 
  createStartNode, 
  createEndNode, 
  createHumanNode, 
  createSystemNode, 
  createDecisionNode, 
  createMailNode 
} from './nodeUtils';
import { createEmptyWorkflow } from './workflowUtils';

/**
 * Get a template workflow for specific use cases
 */
export function getWorkflowTemplate(templateType: string, createdBy: string): Workflow {
  switch (templateType) {
    case 'approval':
      return createApprovalWorkflow(createdBy);
    case 'onboarding':
      return createOnboardingWorkflow(createdBy);
    case 'data-processing':
      return createDataProcessingWorkflow(createdBy);
    case 'customer-support':
      return createCustomerSupportWorkflow(createdBy);
    default:
      return createEmptyWorkflow(createdBy);
  }
}

/**
 * Create approval workflow template
 */
export function createApprovalWorkflow(createdBy: string): Workflow {
  const startNodeId = `node-${uuidv4()}`;
  const requestNodeId = `node-${uuidv4()}`;
  const approvalNodeId = `node-${uuidv4()}`;
  const decisionNodeId = `node-${uuidv4()}`;
  const approvedNodeId = `node-${uuidv4()}`;
  const rejectedNodeId = `node-${uuidv4()}`;
  const notifyApprovedNodeId = `node-${uuidv4()}`;
  const notifyRejectedNodeId = `node-${uuidv4()}`;
  const endNodeId = `node-${uuidv4()}`;
  
  return {
    id: `workflow-${uuidv4()}`,
    name: 'Approval Workflow',
    description: 'A simple approval workflow template',
    status: 'draft' as WorkflowStatus,
    nodes: [
      {
        ...createStartNode(startNodeId),
        position: { x: 250, y: 50 }
      },
      {
        ...createHumanNode(requestNodeId),
        position: { x: 250, y: 150 },
        data: {
          label: 'Request Form',
          description: 'Submit request details',
          type: 'human' as NodeType,
          formFields: [
            {
              id: `field-${uuidv4()}`,
              label: 'Request Title',
              type: 'text',
              placeholder: 'Enter request title',
              required: true
            },
            {
              id: `field-${uuidv4()}`,
              label: 'Description',
              type: 'textarea',
              placeholder: 'Describe your request',
              required: true
            },
            {
              id: `field-${uuidv4()}`,
              label: 'Priority',
              type: 'select',
              required: true,
              options: [
                { label: 'Low', value: 'low' },
                { label: 'Medium', value: 'medium' },
                { label: 'High', value: 'high' }
              ]
            }
          ],
          config: {
            contentType: 'form'
          }
        }
      },
      {
        ...createHumanNode(approvalNodeId),
        position: { x: 250, y: 300 },
        data: {
          label: 'Manager Approval',
          description: 'Review and approve/reject request',
          type: 'human' as NodeType,
          formFields: [
            {
              id: `field-${uuidv4()}`,
              label: 'Decision',
              type: 'select',
              required: true,
              options: [
                { label: 'Approve', value: 'approved' },
                { label: 'Reject', value: 'rejected' }
              ]
            },
            {
              id: `field-${uuidv4()}`,
              label: 'Comments',
              type: 'textarea',
              placeholder: 'Provide comments for your decision',
              required: false
            }
          ],
          config: {
            contentType: 'form'
          }
        }
      },
      {
        ...createDecisionNode(decisionNodeId),
        position: { x: 250, y: 450 },
        data: {
          label: 'Check Decision',
          description: 'Branch based on approval decision',
          type: 'decision' as NodeType,
          config: {
            type: 'simple',
            field: 'data.Decision',
            operator: '==',
            value: 'approved',
            condition: "data.Decision == 'approved'"
          }
        }
      },
      {
        ...createSystemNode(approvedNodeId),
        position: { x: 100, y: 550 },
        data: {
          label: 'Process Approval',
          description: 'Handle approved request',
          type: 'system' as NodeType
        }
      },
      {
        ...createSystemNode(rejectedNodeId),
        position: { x: 400, y: 550 },
        data: {
          label: 'Process Rejection',
          description: 'Handle rejected request',
          type: 'system' as NodeType
        }
      },
      {
        ...createMailNode(notifyApprovedNodeId),
        position: { x: 100, y: 650 },
        data: {
          label: 'Send Approval Email',
          description: 'Notify requester of approval',
          type: 'mail' as NodeType,
          config: {
            to: '{{data.email}}',
            subject: 'Your request has been approved',
            template: 'approval-notification'
          }
        }
      },
      {
        ...createMailNode(notifyRejectedNodeId),
        position: { x: 400, y: 650 },
        data: {
          label: 'Send Rejection Email',
          description: 'Notify requester of rejection',
          type: 'mail' as NodeType,
          config: {
            to: '{{data.email}}',
            subject: 'Your request has been rejected',
            template: 'rejection-notification'
          }
        }
      },
      {
        ...createEndNode(endNodeId),
        position: { x: 250, y: 750 }
      }
    ],
    edges: [
      {
        id: `edge-${uuidv4()}`,
        source: startNodeId,
        target: requestNodeId
      },
      {
        id: `edge-${uuidv4()}`,
        source: requestNodeId,
        target: approvalNodeId
      },
      {
        id: `edge-${uuidv4()}`,
        source: approvalNodeId,
        target: decisionNodeId
      },
      {
        id: `edge-${uuidv4()}`,
        source: decisionNodeId,
        target: approvedNodeId,
        sourceHandle: 'true'
      },
      {
        id: `edge-${uuidv4()}`,
        source: decisionNodeId,
        target: rejectedNodeId,
        sourceHandle: 'false'
      },
      {
        id: `edge-${uuidv4()}`,
        source: approvedNodeId,
        target: notifyApprovedNodeId
      },
      {
        id: `edge-${uuidv4()}`,
        source: rejectedNodeId,
        target: notifyRejectedNodeId
      },
      {
        id: `edge-${uuidv4()}`,
        source: notifyApprovedNodeId,
        target: endNodeId
      },
      {
        id: `edge-${uuidv4()}`,
        source: notifyRejectedNodeId,
        target: endNodeId
      }
    ],
    tags: ['approval', 'template'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy,
    version: 1
  };
}

/**
 * Create onboarding workflow template
 */
export function createOnboardingWorkflow(createdBy: string): Workflow {
  // Simplified onboarding workflow - in a real implementation, this would be more detailed
  const startNodeId = `node-${uuidv4()}`;
  const endNodeId = `node-${uuidv4()}`;
  
  return {
    id: `workflow-${uuidv4()}`,
    name: 'Employee Onboarding',
    description: 'Employee onboarding process template',
    status: 'draft' as WorkflowStatus,
    nodes: [
      {
        ...createStartNode(startNodeId),
        position: { x: 250, y: 50 }
      },
      {
        ...createEndNode(endNodeId),
        position: { x: 250, y: 750 }
      }
      // Additional nodes would be added here in a complete implementation
    ],
    edges: [
      // Edges would be added here in a complete implementation
    ],
    tags: ['onboarding', 'hr', 'template'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy,
    version: 1
  };
}

/**
 * Create data processing workflow template
 */
export function createDataProcessingWorkflow(createdBy: string): Workflow {
  // Simplified data processing workflow - in a real implementation, this would be more detailed
  const startNodeId = `node-${uuidv4()}`;
  const endNodeId = `node-${uuidv4()}`;
  
  return {
    id: `workflow-${uuidv4()}`,
    name: 'Data Processing Pipeline',
    description: 'Data processing workflow template',
    status: 'draft' as WorkflowStatus,
    nodes: [
      {
        ...createStartNode(startNodeId),
        position: { x: 250, y: 50 }
      },
      {
        ...createEndNode(endNodeId),
        position: { x: 250, y: 750 }
      }
      // Additional nodes would be added here in a complete implementation
    ],
    edges: [
      // Edges would be added here in a complete implementation
    ],
    tags: ['data', 'processing', 'template'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy,
    version: 1
  };
}

/**
 * Create customer support workflow template
 */
export function createCustomerSupportWorkflow(createdBy: string): Workflow {
  // Simplified customer support workflow - in a real implementation, this would be more detailed
  const startNodeId = `node-${uuidv4()}`;
  const endNodeId = `node-${uuidv4()}`;
  
  return {
    id: `workflow-${uuidv4()}`,
    name: 'Customer Support Ticket',
    description: 'Customer support workflow template',
    status: 'draft' as WorkflowStatus,
    nodes: [
      {
        ...createStartNode(startNodeId),
        position: { x: 250, y: 50 }
      },
      {
        ...createEndNode(endNodeId),
        position: { x: 250, y: 750 }
      }
      // Additional nodes would be added here in a complete implementation
    ],
    edges: [
      // Edges would be added here in a complete implementation
    ],
    tags: ['support', 'customer', 'template'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy,
    version: 1
  };
}
