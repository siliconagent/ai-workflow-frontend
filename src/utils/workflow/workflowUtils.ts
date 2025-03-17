import { Workflow, WorkflowNode, WorkflowEdge, WorkflowStatus } from '@/types/workflow.types';
import { v4 as uuidv4 } from 'uuid';
import { createStartNode, createEndNode } from './nodeUtils';

/**
 * Create a new empty workflow
 */
export function createEmptyWorkflow(createdBy: string): Workflow {
  const startNodeId = `node-${uuidv4()}`;
  const endNodeId = `node-${uuidv4()}`;
  
  return {
    id: `workflow-${uuidv4()}`,
    name: 'New Workflow',
    description: '',
    status: 'draft' as WorkflowStatus,
    nodes: [
      createStartNode(startNodeId),
      createEndNode(endNodeId)
    ],
    edges: [
      {
        id: `edge-${uuidv4()}`,
        source: startNodeId,
        target: endNodeId
      }
    ],
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy,
    version: 1
  };
}

/**
 * Clone a workflow
 */
export function cloneWorkflow(workflow: Workflow, createdBy: string): Workflow {
  const nodeIdMap: Record<string, string> = {};
  
  // Generate new IDs for nodes
  const newNodes = workflow.nodes.map((node: WorkflowNode) => {
    const newId = `node-${uuidv4()}`;
    nodeIdMap[node.id] = newId;
    
    return {
      ...node,
      id: newId
    };
  });
  
  // Update edges with new node IDs
  const newEdges = workflow.edges.map((edge: WorkflowEdge) => ({
    ...edge,
    id: `edge-${uuidv4()}`,
    source: nodeIdMap[edge.source],
    target: nodeIdMap[edge.target]
  }));
  
  return {
    ...workflow,
    id: `workflow-${uuidv4()}`,
    name: `${workflow.name} (Clone)`,
    nodes: newNodes,
    edges: newEdges,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy,
    version: 1
  };
}
