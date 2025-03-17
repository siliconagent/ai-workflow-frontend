import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import workflowService from '../services/workflowService';
import { Workflow, WorkflowNode, WorkflowEdge, WorkflowExecution, NodeStatus } from '../types/workflow.types';

interface WorkflowState {
  // Workflow data
  workflows: Workflow[];
  currentWorkflow: Workflow | null;
  workflowStatus: 'idle' | 'loading' | 'error' | 'success';
  workflowError: string | null;
  
  // Execution data
  executions: WorkflowExecution[];
  currentExecution: WorkflowExecution | null;
  executionStatus: 'idle' | 'loading' | 'running' | 'completed' | 'error';
  executionError: string | null;
  nodeStatuses: Record<string, NodeStatus>;
  
  // Actions - Workflows
  fetchWorkflows: () => Promise<Workflow[]>;
  fetchWorkflow: (id: string) => Promise<Workflow | null>;
  createWorkflow: (workflow: Partial<Workflow>) => Promise<Workflow | null>;
  updateWorkflow: (id: string, workflow: Partial<Workflow>) => Promise<Workflow | null>;
  deleteWorkflow: (id: string) => Promise<boolean>;
  setCurrentWorkflow: (workflow: Workflow | null) => void;
  
  // Actions - Nodes & Edges
  addNode: (node: WorkflowNode) => void;
  updateNode: (id: string, data: Partial<WorkflowNode['data']>) => void;
  removeNode: (id: string) => void;
  addEdge: (edge: WorkflowEdge) => void;
  updateEdge: (id: string, data: Partial<WorkflowEdge['data']>) => void;
  removeEdge: (id: string) => void;
  
  // Actions - Executions
  executeWorkflow: (initialData?: any) => Promise<WorkflowExecution | null>;
  fetchExecutions: (workflowId: string) => Promise<WorkflowExecution[]>;
  fetchExecution: (executionId: string) => Promise<WorkflowExecution | null>;
  cancelExecution: (executionId: string) => Promise<boolean>;
  resumeExecution: (executionId: string) => Promise<boolean>;
  autoExecuteHumanStep: (executionId: string) => Promise<boolean>;
  submitHumanTask: (executionId: string, nodeId: string, data: any) => Promise<void>;
  loading: boolean;
}

const useWorkflowStore = create<WorkflowState>()(
  devtools((set, get) => ({
    // Initial state
    workflows: [],
    currentWorkflow: null,
    workflowStatus: 'idle',
    workflowError: null,
    
    executions: [],
    currentExecution: null,
    executionStatus: 'idle',
    executionError: null,
    nodeStatuses: {},
    
    // Actions - Workflows
    fetchWorkflows: async () => {
      set({ workflowStatus: 'loading' });
      try {
        const workflows = await workflowService.getWorkflows();
        set({ workflows, workflowStatus: 'success' });
        return workflows;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        set({ workflowStatus: 'error', workflowError: errorMessage });
        return [];
      }
    },
    
    fetchWorkflow: async (id: string) => {
      set({ workflowStatus: 'loading' });
      try {
        const workflow = await workflowService.getWorkflow(id);
        set({ currentWorkflow: workflow, workflowStatus: 'success' });
        return workflow;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        set({ workflowStatus: 'error', workflowError: errorMessage });
        return null;
      }
    },
    
    createWorkflow: async (workflow: Partial<Workflow>) => {
      set({ workflowStatus: 'loading' });
      try {
        const newWorkflow = await workflowService.createWorkflow(workflow);
        set(state => ({
          workflows: [...state.workflows, newWorkflow],
          currentWorkflow: newWorkflow,
          workflowStatus: 'success'
        }));
        return newWorkflow;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        set({ workflowStatus: 'error', workflowError: errorMessage });
        return null;
      }
    },
    
    updateWorkflow: async (id: string, workflow: Partial<Workflow>) => {
      set({ workflowStatus: 'loading' });
      try {
        const updatedWorkflow = await workflowService.updateWorkflow(id, workflow);
        set(state => ({
          workflows: state.workflows.map(w => w.id === id ? updatedWorkflow : w),
          currentWorkflow: state.currentWorkflow?.id === id ? updatedWorkflow : state.currentWorkflow,
          workflowStatus: 'success'
        }));
        return updatedWorkflow;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        set({ workflowStatus: 'error', workflowError: errorMessage });
        return null;
      }
    },
    
    deleteWorkflow: async (id: string) => {
      set({ workflowStatus: 'loading' });
      try {
        await workflowService.deleteWorkflow(id);
        set(state => ({
          workflows: state.workflows.filter(w => w.id !== id),
          currentWorkflow: state.currentWorkflow?.id === id ? null : state.currentWorkflow,
          workflowStatus: 'success'
        }));
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        set({ workflowStatus: 'error', workflowError: errorMessage });
        return false;
      }
    },
    
    setCurrentWorkflow: (workflow: Workflow | null) => {
      set({ currentWorkflow: workflow });
    },
    
    // Actions - Nodes & Edges
    addNode: (node: WorkflowNode) => {
      set(state => {
        if (!state.currentWorkflow) return state;
        
        const updatedWorkflow = {
          ...state.currentWorkflow,
          nodes: [...state.currentWorkflow.nodes, node]
        };
        
        return { currentWorkflow: updatedWorkflow };
      });
    },
    
    updateNode: (id: string, data: Partial<WorkflowNode['data']>) => {
      set(state => {
        if (!state.currentWorkflow) return state;
        
        const updatedNodes = state.currentWorkflow.nodes.map(node => 
          node.id === id 
            ? { ...node, data: { ...node.data, ...data } } 
            : node
        );
        
        const updatedWorkflow = {
          ...state.currentWorkflow,
          nodes: updatedNodes
        };
        
        return { currentWorkflow: updatedWorkflow };
      });
    },
    
    removeNode: (id: string) => {
      set(state => {
        if (!state.currentWorkflow) return state;
        
        // Remove the node
        const updatedNodes = state.currentWorkflow.nodes.filter(node => node.id !== id);
        
        // Also remove any connected edges
        const updatedEdges = state.currentWorkflow.edges.filter(edge => 
          edge.source !== id && edge.target !== id
        );
        
        const updatedWorkflow = {
          ...state.currentWorkflow,
          nodes: updatedNodes,
          edges: updatedEdges
        };
        
        return { currentWorkflow: updatedWorkflow };
      });
    },
    
    addEdge: (edge: WorkflowEdge) => {
      set(state => {
        if (!state.currentWorkflow) return state;
        
        const updatedWorkflow = {
          ...state.currentWorkflow,
          edges: [...state.currentWorkflow.edges, edge]
        };
        
        return { currentWorkflow: updatedWorkflow };
      });
    },
    
    updateEdge: (id: string, data: Partial<WorkflowEdge['data']>) => {
      set(state => {
        if (!state.currentWorkflow) return state;
        
        const updatedEdges = state.currentWorkflow.edges.map(edge => 
          edge.id === id 
            ? { ...edge, data: { ...edge.data, ...data } } 
            : edge
        );
        
        const updatedWorkflow = {
          ...state.currentWorkflow,
          edges: updatedEdges
        };
        
        return { currentWorkflow: updatedWorkflow };
      });
    },
    
    removeEdge: (id: string) => {
      set(state => {
        if (!state.currentWorkflow) return state;
        
        const updatedEdges = state.currentWorkflow.edges.filter(edge => edge.id !== id);
        
        const updatedWorkflow = {
          ...state.currentWorkflow,
          edges: updatedEdges
        };
        
        return { currentWorkflow: updatedWorkflow };
      });
    },
    
    // Actions - Executions
    executeWorkflow: async (initialData?: any) => {
      set({ executionStatus: 'loading' });
      try {
        const currentWorkflow = get().currentWorkflow;
        if (!currentWorkflow) {
          throw new Error('No workflow selected');
        }
        
        const execution = await workflowService.executeWorkflow(currentWorkflow.id, initialData);
        set({ 
          currentExecution: execution, 
          executionStatus: 'running',
          nodeStatuses: { 
            [execution.currentNodeId || '']: NodeStatus.RUNNING 
          }
        });
        return execution;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        set({ executionStatus: 'error', executionError: errorMessage });
        return null;
      }
    },
    
    fetchExecutions: async (workflowId: string) => {
      try {
        const executions = await workflowService.getWorkflowExecutions(workflowId);
        set({ executions });
        return executions;
      } catch (error) {
        console.error('Error fetching executions:', error);
        return [];
      }
    },
    
    fetchExecution: async (executionId: string) => {
      try {
        const execution = await workflowService.getExecutionStatus(executionId);
        set({ 
          currentExecution: execution,
          executionStatus: execution.status === 'running' ? 'running' : 
                           execution.status === 'completed' ? 'completed' : 
                           execution.status === 'failed' ? 'error' : 'idle'
        });
        
        // Update node statuses from execution logs
        if (execution.logs) {
          const nodeStatuses: Record<string, NodeStatus> = {};
          
          execution.logs.forEach(log => {
            nodeStatuses[log.nodeId] = log.status;
          });
          
          set({ nodeStatuses });
        }
        
        return execution;
      } catch (error) {
        console.error('Error fetching execution:', error);
        return null;
      }
    },
    
    cancelExecution: async (executionId: string) => {
      try {
        await workflowService.cancelExecution(executionId);
        set(state => ({
          currentExecution: state.currentExecution?.id === executionId 
            ? { ...state.currentExecution, status: 'failed' } 
            : state.currentExecution,
          executionStatus: 'idle'
        }));
        return true;
      } catch (error) {
        console.error('Error canceling execution:', error);
        return false;
      }
    },
    
    resumeExecution: async (executionId: string) => {
      try {
        const execution = await workflowService.resumeExecution(executionId);
        set({ 
          currentExecution: execution,
          executionStatus: 'running'
        });
        return true;
      } catch (error) {
        console.error('Error resuming execution:', error);
        return false;
      }
    },
    
    autoExecuteHumanStep: async (executionId: string) => {
      try {
        await workflowService.autoExecuteHumanStep(executionId);
        return true;
      } catch (error) {
        console.error('Error auto-executing human step:', error);
        return false;
      }
    }
  }))
);

export default useWorkflowStore;
