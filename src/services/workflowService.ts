import apiService from '../lib/api';
import { Workflow, WorkflowExecution } from '../types/workflow.types';

class WorkflowService {
  /**
   * Get all workflows
   */
  public async getWorkflows(): Promise<Workflow[]> {
    try {
      const response = await apiService.get<Workflow[]>('/workflows');
      return response.data;
    } catch (error) {
      console.error('Error fetching workflows:', error);
      throw error;
    }
  }

  /**
   * Get workflow by ID
   */
  public async getWorkflow(id: string): Promise<Workflow> {
    try {
      const response = await apiService.get<Workflow>(`/workflows/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching workflow ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new workflow
   */
  public async createWorkflow(workflow: Partial<Workflow>): Promise<Workflow> {
    try {
      const response = await apiService.post<Workflow>('/workflows', workflow);
      return response.data;
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw error;
    }
  }

  /**
   * Update an existing workflow
   */
  public async updateWorkflow(id: string, workflow: Partial<Workflow>): Promise<Workflow> {
    try {
      const response = await apiService.put<Workflow>(`/workflows/${id}`, workflow);
      return response.data;
    } catch (error) {
      console.error(`Error updating workflow ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a workflow
   */
  public async deleteWorkflow(id: string): Promise<void> {
    try {
      await apiService.delete(`/workflows/${id}`);
    } catch (error) {
      console.error(`Error deleting workflow ${id}:`, error);
      throw error;
    }
  }

  /**
   * Deactivate a workflow
   */
  public async deactivateWorkflow(id: string): Promise<Workflow> {
    try {
      const response = await apiService.patch<Workflow>(`/workflows/${id}/deactivate`);
      return response.data;
    } catch (error) {
      console.error(`Error deactivating workflow ${id}:`, error);
      throw error;
    }
  }

  /**
   * Execute a workflow
   */
  public async executeWorkflow(id: string, initialData?: any): Promise<WorkflowExecution> {
    try {
      const response = await apiService.post<WorkflowExecution>(`/workflows/${id}/execute`, { initialData });
      return response.data;
    } catch (error) {
      console.error(`Error executing workflow ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get workflow executions
   */
  public async getWorkflowExecutions(workflowId: string): Promise<WorkflowExecution[]> {
    try {
      const response = await apiService.get<WorkflowExecution[]>(`/workflows/${workflowId}/executions`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching executions for workflow ${workflowId}:`, error);
      throw error;
    }
  }

  /**
   * Get execution status
   */
  public async getExecutionStatus(executionId: string): Promise<WorkflowExecution> {
    try {
      const response = await apiService.get<WorkflowExecution>(`/workflows/executions/${executionId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching execution status ${executionId}:`, error);
      throw error;
    }
  }

  /**
   * Cancel workflow execution
   */
  public async cancelExecution(executionId: string): Promise<WorkflowExecution> {
    try {
      const response = await apiService.post<WorkflowExecution>(`/workflows/executions/${executionId}/cancel`);
      return response.data;
    } catch (error) {
      console.error(`Error canceling execution ${executionId}:`, error);
      throw error;
    }
  }

  /**
   * Resume workflow execution
   */
  public async resumeExecution(executionId: string): Promise<WorkflowExecution> {
    try {
      const response = await apiService.post<WorkflowExecution>(`/workflows/executions/${executionId}/resume`);
      return response.data;
    } catch (error) {
      console.error(`Error resuming execution ${executionId}:`, error);
      throw error;
    }
  }

  /**
   * Auto-execute human step
   */
  public async autoExecuteHumanStep(executionId: string): Promise<WorkflowExecution> {
    try {
      const response = await apiService.post<WorkflowExecution>(
        `/workflows/executions/${executionId}/auto-execute-human-step`
      );
      return response.data;
    } catch (error) {
      console.error(`Error auto-executing human step for execution ${executionId}:`, error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const workflowService = new WorkflowService();
export default workflowService;
