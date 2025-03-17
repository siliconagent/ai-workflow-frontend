import React, { useState } from 'react';
import { useExecution } from '../../../hooks/useExecution';
import { ExecutionStatus } from '../../../types/execution.types';

interface ExecutionControlsProps {
  workflowId: string;
  executionId?: string;
  status?: ExecutionStatus;
  onStatusChange?: (status: ExecutionStatus) => void;
}

const ExecutionControls: React.FC<ExecutionControlsProps> = ({
  workflowId,
  executionId,
  status,
  onStatusChange
}) => {
  const { startExecution, cancelExecution, resumeExecution } = useExecution();
  const [inputData, setInputData] = useState('{}');
  const [showInputModal, setShowInputModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleStartExecution = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let parsedInput = {};
      
      // Try to parse the input data if it's not empty
      if (inputData.trim() !== '{}' && inputData.trim() !== '') {
        try {
          parsedInput = JSON.parse(inputData);
        } catch (e) {
          throw new Error('Invalid JSON input data');
        }
      }
      
      await startExecution(workflowId, parsedInput);
      setShowInputModal(false);
      if (onStatusChange) {
        onStatusChange(ExecutionStatus.RUNNING);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to start execution');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelExecution = async () => {
    if (!executionId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await cancelExecution(executionId);
      if (onStatusChange) {
        onStatusChange(ExecutionStatus.CANCELLED);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to cancel execution');
    } finally {
      setLoading(false);
    }
  };
  
  const handleResumeExecution = async () => {
    if (!executionId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await resumeExecution(executionId);
      if (onStatusChange) {
        onStatusChange(ExecutionStatus.RUNNING);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to resume execution');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Execution Controls</h2>
      </div>
      
      <div className="p-4">
        <div className="space-y-4">
          {status && (
            <div className="flex items-center">
              <span className="font-medium mr-2">Status:</span>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                status === ExecutionStatus.RUNNING ? 'bg-blue-100 text-blue-800' :
                status === ExecutionStatus.COMPLETED ? 'bg-green-100 text-green-800' :
                status === ExecutionStatus.FAILED ? 'bg-red-100 text-red-800' :
                status === ExecutionStatus.CANCELLED ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {status}
              </span>
            </div>
          )}
          
          <div className="flex space-x-3">
            {(!executionId || status === ExecutionStatus.COMPLETED || 
              status === ExecutionStatus.FAILED || status === ExecutionStatus.CANCELLED) && (
              <button
                type="button"
                onClick={() => setShowInputModal(true)}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Start Execution
              </button>
            )}
            
            {status === ExecutionStatus.RUNNING && (
              <button
                type="button"
                onClick={handleCancelExecution}
                disabled={loading || !executionId}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel Execution
              </button>
            )}
            
            {status === ExecutionStatus.PAUSED && (
              <button
                type="button"
                onClick={handleResumeExecution}
                disabled={loading || !executionId}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Resume Execution
              </button>
            )}
          </div>
          
          {error && (
            <div className="p-2 bg-red-100 text-red-800 rounded">
              {error}
            </div>
          )}
        </div>
      </div>
      
      {showInputModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Execution Input Data</h3>
            </div>
            
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                Provide initial data for workflow execution in JSON format.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Input Data (JSON)</label>
                <textarea
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                  placeholder="{}"
                />
              </div>
              
              {error && (
                <div className="p-2 bg-red-100 text-red-800 rounded mb-4">
                  {error}
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowInputModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStartExecution}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Starting...' : 'Start Execution'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecutionControls;
