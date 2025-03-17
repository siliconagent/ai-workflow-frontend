import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  ExecutionFilterParams, 
  HumanTaskInput, 
  PaginatedExecutions, 
  WorkflowExecution,
  AutoExecuteConfig
} from '../types/execution.types';
import { executionService } from '../services/executionService';

interface ExecutionState {
  executions: WorkflowExecution[];
  currentExecution: WorkflowExecution | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    pageSize: number;
  };

  // Actions
  executeWorkflow: (workflowId: string, input?: any) => Promise<WorkflowExecution>;
  fetchExecutions: (workflowId: string, params?: ExecutionFilterParams & { page?: number; pageSize?: number }) => Promise<void>;
  fetchExecution: (executionId: string) => Promise<void>;
  cancelExecution: (executionId: string) => Promise<void>;
  resumeExecution: (executionId: string) => Promise<void>;
  completeHumanTask: (input: HumanTaskInput) => Promise<void>;
  autoExecuteHumanStep: (config: AutoExecuteConfig) => Promise<void>;
  setCurrentExecution: (execution: WorkflowExecution | null) => void;
  clearError: () => void;
  startPolling: (executionId: string) => void;
  stopPolling: () => void;
}

export const useExecutionStore = create<ExecutionState>()(
  devtools(
    (set, get) => {
      let pollingCancel: (() => void) | null = null;

      return {
        executions: [],
        currentExecution: null,
        isLoading: false,
        error: null,
        pagination: {
          total: 0,
          page: 1,
          pageSize: 10
        },

        executeWorkflow: async (workflowId, input) => {
          set({ isLoading: true, error: null });
          try {
            const execution = await executionService.executeWorkflow(workflowId, input);
            set({ 
              currentExecution: execution, 
              isLoading: false,
              // Add to executions list if not present
              executions: [execution, ...get().executions.filter(e => e.id !== execution.id)]
            });
            return execution;
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to execute workflow', 
              isLoading: false 
            });
            throw error;
          }
        },

        fetchExecutions: async (workflowId, params) => {
          set({ isLoading: true, error: null });
          try {
            const result = await executionService.getWorkflowExecutions(workflowId, params);
            set({ 
              executions: result.items, 
              pagination: {
                total: result.total,
                page: result.page,
                pageSize: result.pageSize
              },
              isLoading: false 
            });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to fetch executions', 
              isLoading: false 
            });
          }
        },

        fetchExecution: async (executionId) => {
          set({ isLoading: true, error: null });
          try {
            const execution = await executionService.getExecutionStatus(executionId);
            set({ currentExecution: execution, isLoading: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to fetch execution', 
              isLoading: false 
            });
          }
        },

        cancelExecution: async (executionId) => {
          set({ isLoading: true, error: null });
          try {
            const updatedExecution = await executionService.cancelExecution(executionId);
            set((state) => ({ 
              executions: state.executions.map(e => e.id === executionId ? updatedExecution : e),
              currentExecution: state.currentExecution?.id === executionId ? updatedExecution : state.currentExecution,
              isLoading: false 
            }));
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to cancel execution', 
              isLoading: false 
            });
          }
        },

        resumeExecution: async (executionId) => {
          set({ isLoading: true, error: null });
          try {
            const updatedExecution = await executionService.resumeExecution(executionId);
            set((state) => ({ 
              executions: state.executions.map(e => e.id === executionId ? updatedExecution : e),
              currentExecution: state.currentExecution?.id === executionId ? updatedExecution : state.currentExecution,
              isLoading: false 
            }));
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to resume execution', 
              isLoading: false 
            });
          }
        },

        completeHumanTask: async (input) => {
          set({ isLoading: true, error: null });
          try {
            const updatedExecution = await executionService.completeHumanTask(input);
            set((state) => ({ 
              executions: state.executions.map(e => e.id === input.executionId ? updatedExecution : e),
              currentExecution: state.currentExecution?.id === input.executionId ? updatedExecution : state.currentExecution,
              isLoading: false 
            }));
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to complete human task', 
              isLoading: false 
            });
          }
        },

        autoExecuteHumanStep: async (config) => {
          set({ isLoading: true, error: null });
          try {
            const updatedExecution = await executionService.autoExecuteHumanStep(config);
            set((state) => ({ 
              executions: state.executions.map(e => e.id === config.executionId ? updatedExecution : e),
              currentExecution: state.currentExecution?.id === config.executionId ? updatedExecution : state.currentExecution,
              isLoading: false 
            }));
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to auto-execute human step', 
              isLoading: false 
            });
          }
        },

        setCurrentExecution: (execution) => {
          set({ currentExecution: execution });
        },

        clearError: () => {
          set({ error: null });
        },

        startPolling: (executionId) => {
          // Stop any existing polling
          if (pollingCancel) {
            pollingCancel();
          }

          // Helper function to handle execution updates
          const handleExecutionUpdate = (execution: WorkflowExecution) => {
            set((state) => ({ 
              executions: state.executions.map(e => e.id === executionId ? execution : e),
              currentExecution: state.currentExecution?.id === executionId ? execution : state.currentExecution,
            }));
          };

          // Start polling
          executionService.pollExecutionUpdates(executionId, 2000)
            .then(cancelFn => {
              pollingCancel = cancelFn;
              
              // Initial fetch to get current state
              executionService.getExecutionStatus(executionId)
                .then(handleExecutionUpdate)
                .catch(error => console.error('Error fetching execution status:', error));
            })
            .catch(error => console.error('Error setting up polling:', error));
        },

        stopPolling: () => {
          if (pollingCancel) {
            pollingCancel();
            pollingCancel = null;
          }
        }
      };
    },
    { name: 'execution-store' }
  )
);
