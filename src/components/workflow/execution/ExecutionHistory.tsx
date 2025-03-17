import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useExecution } from '../../../hooks/useExecution';
import { WorkflowExecution, ExecutionStatus } from '../../../types/execution.types';
import { formatUtils } from '../../../utils/formatUtils';

interface ExecutionHistoryProps {
  workflowId: string;
  onSelectExecution?: (execution: WorkflowExecution) => void;
  limit?: number;
}

const ExecutionHistory: React.FC<ExecutionHistoryProps> = ({
  workflowId,
  onSelectExecution,
  limit
}) => {
  const { executions, loading, error, fetchExecutions } = useExecution();
  const [statusFilter, setStatusFilter] = useState<ExecutionStatus | 'all'>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  useEffect(() => {
    fetchExecutions(workflowId);
  }, [fetchExecutions, workflowId]);
  
  const filteredExecutions = executions
    .filter(execution => {
      // Filter by status
      const matchesStatus = statusFilter === 'all' || execution.status === statusFilter;
      
      // Filter by date range
      let matchesDateRange = true;
      if (dateRange.start) {
        matchesDateRange = matchesDateRange && new Date(execution.startTime) >= new Date(dateRange.start);
      }
      if (dateRange.end) {
        matchesDateRange = matchesDateRange && new Date(execution.startTime) <= new Date(dateRange.end);
      }
      
      return matchesStatus && matchesDateRange;
    })
    // Sort by start date (newest first)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  
  // Apply limit if specified
  const displayedExecutions = limit ? filteredExecutions.slice(0, limit) : filteredExecutions;
  
  const getStatusBadgeClass = (status: ExecutionStatus) => {
    switch (status) {
      case ExecutionStatus.RUNNING:
        return 'bg-blue-100 text-blue-800';
      case ExecutionStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case ExecutionStatus.FAILED:
        return 'bg-red-100 text-red-800';
      case ExecutionStatus.CANCELLED:
        return 'bg-yellow-100 text-yellow-800';
      case ExecutionStatus.PAUSED:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (loading && executions.length === 0) {
    return <div className="text-center p-6">Loading execution history...</div>;
  }
  
  if (error) {
    return <div className="text-center p-6 text-red-600">Error loading execution history: {error}</div>;
  }
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Execution History</h2>
      </div>
      
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ExecutionStatus | 'all')}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">All Statuses</option>
              <option value={ExecutionStatus.RUNNING}>Running</option>
              <option value={ExecutionStatus.COMPLETED}>Completed</option>
              <option value={ExecutionStatus.FAILED}>Failed</option>
              <option value={ExecutionStatus.CANCELLED}>Cancelled</option>
              <option value={ExecutionStatus.PAUSED}>Paused</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            />
          </div>
        </div>
      </div>
      
      {displayedExecutions.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          No execution history found matching your criteria.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Started</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayedExecutions.map((execution) => (
                <tr 
                  key={execution.id} 
                  className={onSelectExecution ? 'cursor-pointer hover:bg-gray-50' : ''}
                  onClick={() => onSelectExecution && onSelectExecution(execution)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {execution.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(execution.status)}`}>
                      {execution.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatUtils.formatDateTime(execution.startTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {execution.endTime 
                      ? formatUtils.formatDateTime(execution.endTime)
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {execution.endTime 
                      ? formatUtils.formatDuration(new Date(execution.startTime), new Date(execution.endTime))
                      : formatUtils.formatDuration(new Date(execution.startTime), new Date())}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/workflows/${workflowId}/executions/${execution.id}`}
                      className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-2 py-1 rounded"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {limit && filteredExecutions.length > limit && (
        <div className="p-4 border-t border-gray-200 text-center">
          <Link
            to={`/workflows/${workflowId}/executions`}
            className="text-indigo-600 hover:text-indigo-900"
          >
            View All Executions
          </Link>
        </div>
      )}
    </div>
  );
};

export default ExecutionHistory;
