import { Workflow, WorkflowNode, WorkflowEdge } from '@/types/workflow.types';

/**
 * Check if a workflow is valid
 */
export function validateWorkflow(workflow: Workflow): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check for start node
  const startNode = workflow.nodes.find((node: WorkflowNode) => node.type === 'start');
  if (!startNode) {
    errors.push('Workflow must have a start node');
  }
  
  // Check for end node
  const endNode = workflow.nodes.find((node: WorkflowNode) => node.type === 'end');
  if (!endNode) {
    errors.push('Workflow must have an end node');
  }
  
  // Check for isolated nodes (nodes with no connections)
  workflow.nodes.forEach((node: WorkflowNode) => {
    // Skip start and end nodes for this check
    if (node.type === 'start' || node.type === 'end') return;

    const hasIncomingEdge = workflow.edges.some((edge: WorkflowEdge) => edge.target === node.id);
    const hasOutgoingEdge = workflow.edges.some((edge: WorkflowEdge) => edge.source === node.id);

    if (!hasIncomingEdge && !hasOutgoingEdge) {
      errors.push(`Node "${node.data.label}" (${node.id}) is isolated with no connections`);
    }
  });
  
  // Check for path from start to end
  if (startNode && endNode) {
    const visited = new Set<string>();
    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      workflow.edges
        .filter((edge: WorkflowEdge) => edge.source === nodeId)
        .forEach((edge: WorkflowEdge) => visit(edge.target));
    };
    
    visit(startNode.id);
    
    if (!visited.has(endNode.id)) {
      errors.push('No valid path from start to end node');
    }
  }
  
  // Check for decision nodes without both true/false paths
  workflow.nodes
    .filter((node: WorkflowNode) => node.type === 'decision')
    .forEach((node: WorkflowNode) => {
      const trueEdge = workflow.edges.find(
        (edge: WorkflowEdge) => edge.source === node.id && edge.sourceHandle === 'true'
      );
      const falseEdge = workflow.edges.find(
        (edge: WorkflowEdge) => edge.source === node.id && edge.sourceHandle === 'false'
      );
      
      if (!trueEdge) {
        errors.push(`Decision node "${node.data.label}" (${node.id}) is missing a true path`);
      }
      if (!falseEdge) {
        errors.push(`Decision node "${node.data.label}" (${node.id}) is missing a false path`);
      }
    });
  
  return {
    valid: errors.length === 0,
    errors
  };
}
