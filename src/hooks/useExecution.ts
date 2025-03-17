// src/hooks/useExecution.ts
import { useState, useCallback } from 'react';
import { WorkflowExecution, ExecutionStatus } from '../types/execution.types';
import api from '@/lib/api';

interface UseExecutionReturn {
  executions: WorkflowExecution[];
  currentExecution: WorkflowExecution | null;
  loading: boolean;
  error: string | null;
  fetchExecutions: (workflowId: string) => Promise<WorkflowExecution[]>;
  startExecution: (workflowId: string, initialData?: any) => Promise<WorkflowExecution | null>;
  cancelExecution: (executionId: string) => Promise<boolean>;
  resumeExecution: (executionId: string) => Promise<WorkflowExecution | null>;
  submitHumanTask: (executionId: string, nodeId: string, data: any) => Promise<boolean>;
}

export const useExecution = (): UseExecutionReturn => {
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [currentExecution, setCurrentExecution] = useState<WorkflowExecution | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all executions for a workflow
  const fetchExecutions = useCallback(async (workflowId: string): Promise<WorkflowExecution[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/workflows/${workflowId}/executions`);
      const fetchedExecutions = response.data;
      setExecutions(fetchedExecutions);
      return fetchedExecutions;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || `Failed to fetch executions for workflow ${workflowId}`;
      setError(errorMessage);
      console.error(errorMessage, err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Start a new execution
  const startExecution = useCallback(async (workflowId: string, initialData?: any): Promise<WorkflowExecution | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post(`/workflows/${workflowId}/executions`, { initialData });
      const newExecution = response.data;
      setCurrentExecution(newExecution);
      return newExecution;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || `Failed to start execution for workflow ${workflowId}`;
      setError(errorMessage);
      console.error(errorMessage, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cancel an execution
  const cancelExecution = useCallback(async (executionId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await api.post(`/executions/${executionId}/cancel`);
      
      // Update current execution if it's the one being cancelled
      if (currentExecution?.id === executionId) {
        setCurrentExecution(prev => prev ? { ...prev, status: ExecutionStatus.CANCELLED } : null);
      }
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || `Failed to cancel execution ${executionId}`;
      setError(errorMessage);
      console.error(errorMessage, err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentExecution]);

  // Resume a paused execution
  const resumeExecution = useCallback(async (executionId: string): Promise<WorkflowExecution | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post(`/executions/${executionId}/resume`);
      const resumedExecution = response.data;
      
      // Update current execution if it's the one being resumed
      if (currentExecution?.id === executionId) {
        setCurrentExecution(resumedExecution);
      }
      
      return resumedExecution;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || `Failed to resume execution ${executionId}`;
      setError(errorMessage);
      console.error(errorMessage, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentExecution]);

  // Submit data for a human task
  const submitHumanTask = useCallback(async (executionId: string, nodeId: string, data: any): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await api.post(`/executions/${executionId}/nodes/${nodeId}/submit`, { data });
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || `Failed to submit human task for node ${nodeId}`;
      setError(errorMessage);
      console.error(errorMessage, err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    executions,
    currentExecution,
    loading,
    error,
    fetchExecutions,
    startExecution,
    cancelExecution,
    resumeExecution,
    submitHumanTask
  };
};

export default useExecution;
