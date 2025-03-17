import api from '../lib/api';
import { 
  ExecutionFilterParams, 
  ExecutionInput, 
  HumanTaskInput, 
  PaginatedExecutions, 
  WorkflowExecution, 
  AutoExecuteConfig
} from '../types/execution.types';

export const executionService = {
  /**
   * Execute a workflow
   */
  async executeWorkflow(workflowId: string, input?: any): Promise<WorkflowExecution> {
    const response = await api.post(`/api/workflows/${workflowId}/execute`, { input });
    return response.data;
  },

  /**
   * Get workflow executions with pagination and filtering
   */
  async getWorkflowExecutions(
    workflowId: string, 
    params?: ExecutionFilterParams & { page?: number; pageSize?: number }
  ): Promise<PaginatedExecutions> {
    const response = await api.get(`/api/workflows/${workflowId}/executions`, { params });
    return response.data;
  },

  /**
   * Get execution status by ID
   */
  async getExecutionStatus(executionId: string): Promise<WorkflowExecution> {
    const response = await api.get(`/api/workflows/executions/${executionId}`);
    return response.data;
  },

  /**
   * Cancel a workflow execution
   */
  async cancelExecution(executionId: string): Promise<WorkflowExecution> {
    const response = await api.post(`/api/workflows/executions/${executionId}/cancel`);
    return response.data;
  },

  /**
   * Resume a paused workflow execution
   */
  async resumeExecution(executionId: string): Promise<WorkflowExecution> {
    const response = await api.post(`/api/workflows/executions/${executionId}/resume`);
    return response.data;
  },

  /**
   * Complete a human task in a workflow
   */
  async completeHumanTask(input: HumanTaskInput): Promise<WorkflowExecution> {
    const { executionId, nodeId, formData, action, comment } = input;
    
    const response = await api.post(`/api/workflows/executions/${executionId}/nodes/${nodeId}/complete`, {
      formData,
      action,
      comment
    });
    
    return response.data;
  },

  /**
   * Auto-execute a human step (for testing purposes)
   */
  async autoExecuteHumanStep(config: AutoExecuteConfig): Promise<WorkflowExecution> {
    const { executionId } = config;
    const response = await api.post(`/api/workflows/executions/${executionId}/auto-execute-human-step`, config);
    return response.data;
  },

  /**
   * Poll for execution updates
   * This is an alternative to WebSockets for real-time updates
   */
  async pollExecutionUpdates(executionId: string, intervalMs = 2000): Promise<() => void> {
    let timeoutId: number;
    
    const poll = async (callback: (execution: WorkflowExecution) => void) => {
      try {
        const execution = await this.getExecutionStatus(executionId);
        callback(execution);
        
        // Continue polling if execution is still running or paused
        if (['RUNNING', 'PAUSED', 'PENDING'].includes(execution.status)) {
          timeoutId = window.setTimeout(() => poll(callback), intervalMs);
        }
      } catch (error) {
        console.error('Error polling execution updates:', error);
        timeoutId = window.setTimeout(() => poll(callback), intervalMs * 2); // Backoff on error
      }
    };
    
    // Return a function to cancel the polling
    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }
};
