import React, { useState, useEffect } from 'react';
import { Workflow } from '@/types/workflow.types';
import WorkflowExecution from '../execution/WorkflowExecution';
import { FaPlay, FaSpinner, FaRedo, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import useWorkflowStore from '@/store/workflowStore';

interface PreviewTabProps {
  workflow: Workflow;
}

const PreviewTab: React.FC<PreviewTabProps> = ({ workflow }) => {
  const [status, setStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
  const [testMode, setTestMode] = useState<'manual' | 'auto'>('manual');
  const [testData, setTestData] = useState<string>('{}');
  const [isValidJson, setIsValidJson] = useState(true);
  
  // Access workflow execution functionality from store
  const { 
    executeWorkflow, 
    currentExecution, 
    executionStatus
  } = useWorkflowStore();
  
  // Update local status when execution status changes
  useEffect(() => {
    if (executionStatus) {
      setStatus(executionStatus as 'idle' | 'running' | 'completed' | 'error');
    }
  }, [executionStatus]);
  
  // Validate JSON when test data changes
  useEffect(() => {
    try {
      if (testData.trim()) {
        JSON.parse(testData);
        setIsValidJson(true);
      } else {
        setIsValidJson(true); // Empty is valid (will be treated as {})
      }
    } catch (e) {
      setIsValidJson(false);
    }
  }, [testData]);
  
  const handleExecute = async () => {
    if (!isValidJson) return;
    
    let parsedData = {};
    try {
      if (testData.trim()) {
        parsedData = JSON.parse(testData);
      }
      
      // Execute the workflow with the test data
      await executeWorkflow({ workflow, data: parsedData });
    } catch (error) {
      console.error('Error executing workflow:', error);
    }
  };
  
const handleExecutionComplete = (execution: { id: string; startedAt: string; completedAt?: string }) => {
    console.log('Execution completed:', execution);
};
  
  return (
    <div className="flex flex-col h-full">
      <div className="bg-card p-4 border-b border-border">
        <h2 className="text-lg font-bold mb-4">Workflow Preview & Testing</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Test Mode</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="testMode"
                    checked={testMode === 'manual'}
                    onChange={() => setTestMode('manual')}
                    className="mr-2"
                  />
                  <span>Manual Input</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="testMode"
                    checked={testMode === 'auto'}
                    onChange={() => setTestMode('auto')}
                    className="mr-2"
                  />
                  <span>Auto Generate</span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Test Data (JSON)</label>
              <textarea
                value={testData}
                onChange={(e) => setTestData(e.target.value)}
                className={`w-full h-32 px-3 py-2 font-mono text-sm border rounded-md ${
                  !isValidJson ? 'border-red-500' : 'border-border'
                }`}
                placeholder='{"key": "value"}'
                disabled={testMode === 'auto' || status === 'running'}
              />
              {!isValidJson && (
                <p className="mt-1 text-xs text-red-500">Invalid JSON format</p>
              )}
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleExecute}
                disabled={!isValidJson || status === 'running'}
                className={`px-4 py-2 rounded-md flex items-center ${
                  !isValidJson || status === 'running'
                    ? 'bg-secondary text-secondary-foreground cursor-not-allowed'
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                {status === 'running'? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Running...
                  </>
                ) : (
                  <>
                    <FaPlay className="mr-2" />
                    Execute Workflow
                  </>
                )}
              </button>
              
              {status !== 'idle' && (
                <button
                  onClick={() => setStatus('idle')}
                  disabled={status === 'running'}
                  className={`px-4 py-2 rounded-md flex items-center ${
                    status === 'running'
                      ? 'bg-secondary text-secondary-foreground cursor-not-allowed'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  <FaRedo className="mr-2" />
                  Reset
                </button>
              )}
            </div>
          </div>
          
          <div className="bg-secondary/20 p-4 rounded-md">
            <h3 className="font-medium mb-2">Execution Status</h3>
            <div className="flex items-center mb-4">
              <StatusIndicator status={status} />
              <span className="ml-2">
                {status === 'idle' && 'Ready to execute'}
                {status === 'running' && 'Workflow is running...'}
                {status === 'completed' && 'Workflow completed successfully'}
                {status === 'error' && 'Workflow failed with errors'}
              </span>
            </div>
            
            {currentExecution && (
              <div className="text-sm">
                <div className="mb-2">
                  <span className="font-medium">ID:</span> {currentExecution.id}
                </div>
                <div className="mb-2">
                  <span className="font-medium">Started:</span>{' '}
                  {new Date(currentExecution.startedAt).toLocaleString()}
                </div>
                {currentExecution.completedAt && (
                  <div className="mb-2">
                    <span className="font-medium">Completed:</span>{' '}
                    {new Date(currentExecution.completedAt).toLocaleString()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        {workflow && (
          <WorkflowExecution
            workflow={workflow}
            executionId={currentExecution?.id}
            onExecutionComplete={handleExecutionComplete}
          />
        )}
      </div>
    </div>
  );
};

interface StatusIndicatorProps {
  status: 'idle' | 'running' | 'completed' | 'error';
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  switch (status) {
    case 'idle':
      return <div className="w-3 h-3 rounded-full bg-gray-400"></div>;
    case 'running':
      return <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>;
    case 'completed':
      return <FaCheck className="text-green-500" />;
    case 'error':
      return <FaExclamationTriangle className="text-red-500" />;
    default:
      return null;
  }
};

export default PreviewTab;
