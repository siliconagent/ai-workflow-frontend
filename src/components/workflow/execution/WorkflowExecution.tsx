import React, { useState, useEffect } from 'react';
import { Workflow, WorkflowExecution as WorkflowExecutionType, NodeStatus } from '@/types/workflow.types';
import useWorkflowStore from '@/store/workflowStore';
import { FaPlay, FaCheck, FaExclamationTriangle, FaClock, FaSpinner } from 'react-icons/fa';
import HumanTaskForm from './HumanTaskForm';

interface WorkflowExecutionProps {
  workflow: Workflow;
  executionId?: string;
  onExecutionComplete?: (execution: WorkflowExecutionType) => void;
}

const WorkflowExecution: React.FC<WorkflowExecutionProps> = ({
  workflow,
  executionId,
  onExecutionComplete
}) => {
  const {
    currentExecution,
    executionStatus,
    nodeStatuses,
    fetchExecution,
    executeWorkflow,
    submitHumanTask,
    loading,
    workflowError: error
  } = useWorkflowStore();
  
  const [activeHumanNode, setActiveHumanNode] = useState<any>(null);
  const [initialData, setInitialData] = useState<Record<string, any>>({});
  
  useEffect(() => {
    // If an executionId is provided, fetch that execution
    if (executionId) {
      fetchExecution(executionId);
    }
  }, [executionId, fetchExecution]);
  
  useEffect(() => {
    // Check if there's a waiting human task
    if (currentExecution?.status === 'running') {
      const waitingNodes = workflow.nodes.filter(node => 
        nodeStatuses[node.id] === 'waiting' && node.data.type === 'human'
      );
      
      if (waitingNodes.length > 0) {
        setActiveHumanNode(waitingNodes[0]);
      } else {
        setActiveHumanNode(null);
      }
    } else {
      setActiveHumanNode(null);
    }
  }, [currentExecution, nodeStatuses, workflow.nodes]);
  
  useEffect(() => {
    // Call the completion callback if execution is done
    if (
      currentExecution?.status === 'completed' || 
      currentExecution?.status === 'failed'
    ) {
      onExecutionComplete?.(currentExecution);
    }
  }, [currentExecution, onExecutionComplete]);
  
  const handleStartExecution = async () => {
    await executeWorkflow(initialData);
  };
  
  const handleHumanTaskSubmit = async (data: any) => {
    if (!currentExecution || !activeHumanNode) return;
    
    await submitHumanTask(currentExecution.id, activeHumanNode.id, data);
    setActiveHumanNode(null);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInitialData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Workflow Execution</h2>
        {currentExecution ? (
          <div className="flex items-center space-x-2">
            <ExecutionStatusBadge status={currentExecution.status} />
            <span className="text-sm">
              Started: {new Date(currentExecution.startedAt).toLocaleString()}
            </span>
            {currentExecution.completedAt && (
              <span className="text-sm">
                Completed: {new Date(currentExecution.completedAt).toLocaleString()}
              </span>
            )}
          </div>
        ) : (
          <div className="bg-secondary/20 p-4 rounded-md">
            <h3 className="font-medium mb-2">Execution Parameters</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Initial Data (JSON)</label>
                <textarea
                  name="jsonData"
                  value={initialData.jsonData || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-border rounded-md h-24 font-mono text-sm"
                  placeholder='{"key": "value"}'
                />
              </div>
              <button
                onClick={handleStartExecution}
                disabled={loading}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md flex items-center"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Starting...
                  </>
                ) : (
                  <>
                    <FaPlay className="mr-2" />
                    Start Execution
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          <FaExclamationTriangle className="inline-block mr-2" />
          {error}
        </div>
      )}
      
      {currentExecution && (
        <div className="mb-4">
          <h3 className="font-medium mb-2">Execution Progress</h3>
          <div className="border border-border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="py-2 px-4 text-left">Node</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-left">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {workflow.nodes.map(node => (
                  <tr key={node.id}>
                    <td className="py-2 px-4">{node.data.label || node.id}</td>
                    <td className="py-2 px-4">
                      <NodeStatusBadge status={nodeStatuses[node.id] || 'idle'} />
                    </td>
                    <td className="py-2 px-4 font-mono text-xs">
                      {currentExecution?.results?.[node.id] 
                        ? JSON.stringify(currentExecution.results[node.id]).substring(0, 50) + 
                          (JSON.stringify(currentExecution.results[node.id]).length > 50 ? '...' : '')
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {activeHumanNode && (
        <div className="mb-4">
          <h3 className="font-medium mb-2">Human Task: {activeHumanNode.data.label}</h3>
          <div className="bg-primary/10 p-4 rounded-md">
            <HumanTaskForm
              formFields={activeHumanNode.data.formFields || []}
              node={activeHumanNode}
              onSubmit={handleHumanTaskSubmit}
              loading={loading}
            />
          </div>
        </div>
      )}
      
      {currentExecution?.logs && currentExecution.logs.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">Execution Logs</h3>
          <div className="border border-border rounded-md h-40 overflow-y-auto p-2 bg-secondary/20">
            {currentExecution.logs.map((log, index) => (
              <div 
                key={index} 
                className={`text-xs py-1 px-2 rounded mb-1 ${
                  log.status === 'error' 
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                    : 'bg-secondary/40'
                }`}
              >
                <span className="font-mono">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                <span className="font-medium">{log.nodeName}:</span>{' '}
                <span>{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface ExecutionStatusBadgeProps {
  status: string;
}

const ExecutionStatusBadge: React.FC<ExecutionStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'running':
      return (
        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 flex items-center">
          <FaPlay className="mr-1" size={12} /> Running
        </span>
      );
    case 'completed':
      return (
        <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 flex items-center">
          <FaCheck className="mr-1" size={12} /> Completed
        </span>
      );
    case 'failed':
      return (
        <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 flex items-center">
          <FaExclamationTriangle className="mr-1" size={12} /> Failed
        </span>
      );
    default:
      return (
        <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 flex items-center">
          <FaClock className="mr-1" size={12} /> {status}
        </span>
      );
  }
};

interface NodeStatusBadgeProps {
  status: string;
}

const NodeStatusBadge: React.FC<NodeStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'running':
      return (
        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">
          Running
        </span>
      );
    case 'completed':
      return (
        <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
          Completed
        </span>
      );
    case 'error':
      return (
        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs">
          Error
        </span>
      );
    case 'waiting':
      return (
        <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs">
          Waiting
        </span>
      );
    default:
      return (
        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 text-xs">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
  }
};

export default WorkflowExecution;
