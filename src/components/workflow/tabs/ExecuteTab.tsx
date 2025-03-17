import React, { useState, useEffect } from 'react';
import { FaPlay, FaStop, FaRedo, FaExclamationTriangle, FaCheck, FaSpinner, FaClock } from 'react-icons/fa';
import { Workflow, WorkflowExecution, NodeStatus } from '../../../types/workflow.types';
import useWorkflowStore from '../../../store/workflowStore';

interface ExecuteTabProps {
  workflow: Workflow;
}

const ExecuteTab: React.FC<ExecuteTabProps> = ({ workflow }) => {
  const { 
    executeWorkflow, 
    cancelExecution, 
    resumeExecution,
    fetchExecution,
    currentExecution, 
    executionStatus,
    nodeStatuses
  } = useWorkflowStore();
  
  const [initialDataJson, setInitialDataJson] = useState<string>('{\n  \n}');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [activeExecutionId, setActiveExecutionId] = useState<string | null>(null);
  const [executionHistory, setExecutionHistory] = useState<WorkflowExecution[]>([]);
  const [showInitialDataPanel, setShowInitialDataPanel] = useState<boolean>(true);
  
  // Fetch execution history when component mounts
  useEffect(() => {
    const fetchHistory = async () => {
      if (workflow) {
        const history = await useWorkflowStore.getState().fetchExecutions(workflow.id);
        setExecutionHistory(history);
      }
    };
    
    fetchHistory();
  }, [workflow]);
  
  // Poll for execution status updates when there's an active execution
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (activeExecutionId && (executionStatus === 'running' || executionStatus === 'loading')) {
      intervalId = setInterval(() => {
        fetchExecution(activeExecutionId);
      }, 2000); // Poll every 2 seconds
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [activeExecutionId, executionStatus, fetchExecution]);
  
  const handleExecute = async () => {
    try {
      // Parse initial data JSON
      let initialData = {};
      if (initialDataJson.trim()) {
        try {
          initialData = JSON.parse(initialDataJson);
          setJsonError(null);
        } catch (error) {
          setJsonError('Invalid JSON format');
          return;
        }
      }
      
      // Execute the workflow
      const execution = await executeWorkflow(initialData);
      
      if (execution) {
        setActiveExecutionId(execution.id);
        // Add to history
        setExecutionHistory(prev => [execution, ...prev]);
      }
    } catch (error) {
      console.error('Error executing workflow:', error);
    }
  };
  
  const handleCancel = async () => {
    if (activeExecutionId) {
      await cancelExecution(activeExecutionId);
    }
  };
  
  const handleResume = async () => {
    if (activeExecutionId) {
      await resumeExecution(activeExecutionId);
    }
  };
  
  const viewExecution = async (executionId: string) => {
    setActiveExecutionId(executionId);
    await fetchExecution(executionId);
  };
  
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };
  
  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime).getTime();
    const end = endTime ? new Date(endTime).getTime() : Date.now();
    const durationMs = end - start;
    
    // Format as mm:ss or hh:mm:ss
    const seconds = Math.floor((durationMs / 1000) % 60);
    const minutes = Math.floor((durationMs / (1000 * 60)) % 60);
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border flex justify-between">
        <h2 className="text-lg font-semibold flex items-center">
          <FaPlay className="mr-2 text-green-500" />
          Execute Workflow
        </h2>
        
        <div className="flex space-x-2">
          {(!activeExecutionId || executionStatus === 'completed' || executionStatus === 'error') && (
            <button
              onClick={handleExecute}
              className="px-3 py-1 bg-green-600 text-white rounded-md flex items-center"
              disabled={executionStatus === 'loading'}
            >
              {executionStatus === 'loading' ? (
                <>
                  <FaSpinner className="animate-spin mr-1" />
                  Starting...
                </>
              ) : (
                <>
                  <FaPlay className="mr-1" />
                  Execute
                </>
              )}
            </button>
          )}
          
          {activeExecutionId && executionStatus === 'running' && (
            <button
              onClick={handleCancel}
              className="px-3 py-1 bg-red-600 text-white rounded-md flex items-center"
            >
              <FaStop className="mr-1" />
              Cancel
            </button>
          )}
          
          {activeExecutionId && executionStatus === 'error' && (
            <button
              onClick={handleResume}
              className="px-3 py-1 bg-blue-600 text-white rounded-md flex items-center"
            >
              <FaRedo className="mr-1" />
              Resume
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-grow flex overflow-hidden">
        <div className="w-3/4 flex flex-col overflow-hidden">
          {/* Execution Visualization */}
          <div className="flex-grow overflow-auto p-4">
            {activeExecutionId && currentExecution ? (
              <div className="space-y-4">
                <div className="bg-card p-4 rounded-md border border-border">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h3 className="font-medium">Execution Status</h3>
                      <p className="text-sm text-muted-foreground">ID: {currentExecution.id}</p>
                    </div>
                    <div className="flex items-center">
                      <StatusBadge status={currentExecution.status} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Started:</span> {formatTimestamp(currentExecution.startedAt)}
                    </div>
                    {currentExecution.completedAt && (
                      <div>
                        <span className="text-muted-foreground">Completed:</span> {formatTimestamp(currentExecution.completedAt)}
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Duration:</span> {formatDuration(currentExecution.startedAt, currentExecution.completedAt)}
                    </div>
                  </div>
                </div>
                
                <div className="bg-card p-4 rounded-md border border-border">
                  <h3 className="font-medium mb-3">Execution Flow</h3>
                  <div className="space-y-3">
                    {workflow.nodes.map(node => (
                      <div 
                        key={node.id} 
                        className={`p-3 border rounded-md ${
                          nodeStatuses[node.id] === NodeStatus.ERROR 
                            ? 'border-red-300 bg-red-50 dark:bg-red-900/20' 
                            : nodeStatuses[node.id] === NodeStatus.COMPLETED 
                              ? 'border-green-300 bg-green-50 dark:bg-green-900/20' 
                              : nodeStatuses[node.id] === NodeStatus.RUNNING
                                ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20'
                                : nodeStatuses[node.id] === NodeStatus.WAITING
                                  ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20'
                                  : 'border-border'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <NodeStatusIcon status={nodeStatuses[node.id]} />
                            <span className="ml-2 font-medium">{node.data.label}</span>
                          </div>
                          <NodeStatusBadge status={nodeStatuses[node.id]} />
                        </div>
                        
                        {nodeStatuses[node.id] === NodeStatus.COMPLETED && currentExecution.results && currentExecution.results[node.id] && (
                          <div className="mt-2 text-xs">
                            <p className="text-muted-foreground">Result:</p>
                            <pre className="mt-1 p-2 bg-secondary/20 rounded overflow-x-auto max-h-32">
                              {JSON.stringify(currentExecution.results[node.id], null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Execution Logs */}
                <div className="bg-card p-4 rounded-md border border-border">
                  <h3 className="font-medium mb-3">Execution Logs</h3>
                  <div className="h-64 overflow-y-auto border border-border rounded-md">
                    {currentExecution.logs && currentExecution.logs.length > 0 ? (
                      <div className="space-y-1 p-2">
                        {currentExecution.logs.map((log, index) => (
                          <div 
                            key={index} 
                            className={`p-2 text-xs rounded ${
                              log.status === NodeStatus.ERROR 
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' 
                                : 'bg-secondary/30'
                            }`}
                          >
                            <span className="font-mono">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                            <span className="font-medium">{log.nodeName}:</span>{' '}
                            <span>{log.message}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">
                        No logs available for this execution
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-md">
                  <FaPlay className="mx-auto text-3xl text-muted-foreground opacity-30 mb-3" />
                  <h3 className="text-lg font-medium mb-2">Ready to Execute</h3>
                  <p className="text-muted-foreground">
                    Click the Execute button to run the workflow. You can configure input data in the panel on the right.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="w-1/4 border-l border-border flex flex-col overflow-hidden">
          {/* Right sidebar with execution history and initial data */}
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="font-medium">
              {showInitialDataPanel ? 'Initial Data' : 'Execution History'}
            </h3>
            <button
              onClick={() => setShowInitialDataPanel(!showInitialDataPanel)}
              className="text-xs text-primary hover:underline"
            >
              {showInitialDataPanel ? 'Show History' : 'Configure Input'}
            </button>
          </div>
          
          <div className="flex-grow overflow-auto">
            {showInitialDataPanel ? (
              <div className="p-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Enter initial data for this workflow execution in JSON format:
                </p>
                <div className="relative">
                  <textarea
                    value={initialDataJson}
                    onChange={(e) => {
                      setInitialDataJson(e.target.value);
                      setJsonError(null);
                    }}
                    className="w-full h-60 font-mono text-sm p-3 border border-border rounded-md"
                  />
                  {jsonError && (
                    <div className="mt-2 text-sm text-red-600">
                      <FaExclamationTriangle className="inline mr-1" />
                      {jsonError}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {executionHistory.length > 0 ? (
                  executionHistory.map((execution) => (
                    <div 
                      key={execution.id} 
                      className={`p-4 cursor-pointer hover:bg-secondary/10 ${
                        activeExecutionId === execution.id ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => viewExecution(execution.id)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <StatusBadge status={execution.status} size="sm" />
                        <span className="text-xs text-muted-foreground">
                          {formatDuration(execution.startedAt, execution.completedAt)}
                        </span>
                      </div>
                      <div className="text-xs truncate font-mono">{execution.id}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(execution.startedAt)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No execution history found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <FaSpinner className="animate-spin" />;
      case 'completed':
        return <FaCheck />;
      case 'failed':
        return <FaExclamationTriangle />;
      case 'pending':
        return <FaClock />;
      default:
        return null;
    }
  };
  
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  
  return (
    <div className={`${getStatusClasses(status)} ${sizeClasses} rounded-full flex items-center`}>
      <span className="mr-1">{getStatusIcon(status)}</span>
      <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
    </div>
  );
};

interface NodeStatusBadgeProps {
  status?: NodeStatus;
}

const NodeStatusBadge: React.FC<NodeStatusBadgeProps> = ({ status }) => {
  if (!status) return null;
  
  const getStatusClasses = (status: NodeStatus) => {
    switch (status) {
      case NodeStatus.RUNNING:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case NodeStatus.COMPLETED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case NodeStatus.ERROR:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case NodeStatus.WAITING:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };
  
  const getStatusText = (status: NodeStatus) => {
    switch (status) {
      case NodeStatus.RUNNING:
        return 'Running';
      case NodeStatus.COMPLETED:
        return 'Completed';
      case NodeStatus.ERROR:
        return 'Error';
      case NodeStatus.WAITING:
        return 'Waiting';
      case NodeStatus.IDLE:
        return 'Idle';
      default:
        return 'Unknown';
    }
  };
  
  return (
    <div className={`${getStatusClasses(status)} px-2 py-0.5 text-xs rounded-full`}>
      {getStatusText(status)}
    </div>
  );
};

interface NodeStatusIconProps {
  status?: NodeStatus;
}

const NodeStatusIcon: React.FC<NodeStatusIconProps> = ({ status }) => {
  if (!status) return null;
  
  const getIconAndClass = (status: NodeStatus) => {
    switch (status) {
      case NodeStatus.RUNNING:
        return { icon: <FaSpinner className="animate-spin" />, className: 'text-blue-500' };
      case NodeStatus.COMPLETED:
        return { icon: <FaCheck />, className: 'text-green-500' };
      case NodeStatus.ERROR:
        return { icon: <FaExclamationTriangle />, className: 'text-red-500' };
      case NodeStatus.WAITING:
        return { icon: <FaClock />, className: 'text-yellow-500' };
      default:
        return { icon: <div className="w-4 h-4 rounded-full bg-gray-300" />, className: '' };
    }
  };
  
  const { icon, className } = getIconAndClass(status);
  
  return (
    <div className={`${className} w-6 h-6 flex items-center justify-center`}>
      {icon}
    </div>
  );
};

export default ExecuteTab;
