import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Agent, AgentType } from '../../../types/agent.types';
import { useAgents } from '../../../hooks/useAgents';

interface AgentListProps {
  onSelect?: (agent: Agent) => void;
  selectable?: boolean;
}

const AgentTypeLabels: Record<AgentType, string> = {
  [AgentType.REST]: 'REST API',
  [AgentType.SOAP]: 'SOAP API',
  [AgentType.DATABASE]: 'Database',
  [AgentType.MESSAGING]: 'Messaging',
  [AgentType.CUSTOM]: 'Custom',
  [AgentType.HTTP]: 'HTTP',
  [AgentType.MESSAGE_QUEUE]: 'Message Queue',
  [AgentType.FILE_SYSTEM]: 'File System',
  [AgentType.EMAIL]: 'Email'
};

const AgentList: React.FC<AgentListProps> = ({ onSelect, selectable = false }) => {
  const { agents, loading, error, fetchAgents, deleteAgent, toggleAgentStatus } = useAgents();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<AgentType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      try {
        await deleteAgent(id);
      } catch (error) {
        console.error('Failed to delete agent:', error);
      }
    }
  };
  
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await toggleAgentStatus(id);
    } catch (error) {
      console.error('Failed to toggle agent status:', error);
    }
  };
  
  const filteredAgents = agents.filter(agent => {
    // Filter by search term
    const matchesSearch = 
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (agent.description && agent.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by type
    const matchesType = typeFilter === 'all' || agent.type === typeFilter;
    
    // Filter by status
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && agent.active) ||
      (statusFilter === 'inactive' && !agent.active);
    
    return matchesSearch && matchesType && matchesStatus;
  });
  
  if (loading && agents.length === 0) {
    return <div className="text-center p-6">Loading agents...</div>;
  }
  
  if (error) {
    return <div className="text-center p-6 text-red-600">Error loading agents: {error}</div>;
  }
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="relative">
            <input
              type="text"
              placeholder="Search agents..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <select
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as AgentType | 'all')}
            >
              <option value="all">All Types</option>
              {Object.entries(AgentTypeLabels).map(([type, label]) => (
                <option key={type} value={type}>{label}</option>
              ))}
            </select>
            
            <select
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            
            {!selectable && (
              <Link
                to="/agents/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Agent
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {filteredAgents.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          No agents found matching your criteria.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAgents.map(agent => (
                <tr key={agent.id} className={selectable ? 'cursor-pointer hover:bg-gray-50' : ''} onClick={selectable ? () => onSelect?.(agent) : undefined}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                    {agent.description && (
                      <div className="text-sm text-gray-500">{agent.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{AgentTypeLabels[agent.type]}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      agent.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {agent.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {agent.type === AgentType.REST && (
                      agent.configuration?.url || 'N/A'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {!selectable && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(agent.id, agent.active);
                          }}
                          className={`text-xs px-2 py-1 rounded ${
                            agent.active 
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {agent.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <Link
                          to={`/agents/${agent.id}`}
                          className="text-indigo-600 hover:text-indigo-900 text-xs px-2 py-1 bg-indigo-100 rounded"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(agent.id);
                          }}
                          className="text-red-600 hover:text-red-900 text-xs px-2 py-1 bg-red-100 rounded"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AgentList;
