import { WorkflowExecution } from '@/types/workflow.types';

/**
 * Format execution duration in a human-readable format
 */
export function formatExecutionDuration(execution: WorkflowExecution): string {
  if (!execution.startedAt || !execution.completedAt) {
    return 'N/A';
  }
  
  const start = new Date(execution.startedAt).getTime();
  const end = new Date(execution.completedAt).getTime();
  const durationMs = end - start;
  
  if (durationMs < 1000) {
    return `${durationMs}ms`;
  } else if (durationMs < 60000) {
    return `${Math.round(durationMs / 1000)}s`;
  } else if (durationMs < 3600000) {
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.round((durationMs % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  } else {
    const hours = Math.floor(durationMs / 3600000);
    const minutes = Math.floor((durationMs % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  }
}

/**
 * Get execution progress percentage
 */
export function getExecutionProgress(execution: WorkflowExecution, totalNodes: number): number {
  if (execution.status === 'completed') {
    return 100;
  }
  
  if (execution.status === 'pending' || !execution.results) {
    return 0;
  }
  
  // Count nodes with results
  const nodesWithResults = Object.keys(execution.results).length;
  return Math.round((nodesWithResults / totalNodes) * 100);
}
