import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaPause, FaPlay, FaSearch, FaFilter, FaSort, FaSync, FaCheck, FaTimes } from 'react-icons/fa';
import useAgents from '@/hooks/useAgents';
import { AgentStatus } from '@/types/agent.types';

const AgentsIndex: React.FC = () => {
  const {
    agents,
    loading,
    error,
    getAgents,
    activateAgent,
    deactivateAgent,
    deleteAgent,
    testAgentConnectivity
  } = useAgents();
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [testingAgentId, setTestingAgentId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});

  const handleActivate = async (id: string) => {
    await activateAgent(id);
  };

  const handleDeactivate = async (id: string) => {
    await deactivateAgent(id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this agent?')) {
      return;
    }
    
    await deleteAgent(id);
  };

  const handleTestConnection = async (id: string) => {
    setTestingAgentId(id);
    try {
      const result = await testAgentConnectivity(id);
      setTestResults({
        ...testResults,
        [id]: result
      });
    } finally {
      setTestingAgentId(null);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle sort direction
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort agents
  const filteredAgents = agents
    .filter(agent => {
      // Apply search filter
      const searchFilter = searchTerm.toLowerCase();
      const matchesSearch = 
        agent.name.toLowerCase().includes(searchFilter) ||
        (agent.description?.toLowerCase().includes(searchFilter) || false);
      
      // Apply type filter
      const matchesType = filterType === 'all' || agent.type === filterType;
      
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      // Apply sorting
      let comparison = 0;
      
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'type') {
        comparison = a.type.localeCompare(b.type);
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status);
      } else if (sortField === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        // Default to updatedAt
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  // Get unique agent types for filter dropdown
  const agentTypes = ['all', ...new Set(agents.map(agent => agent.type))];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Agents</h1>
        <Link 
          to="/agents/new" 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md flex items-center"
        >
          <FaPlus className="mr-2" />
          New Agent
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full px-4 py-2 border border-border rounded-md"
          />
        </div>
        
        <div className="flex items-center">
          <FaFilter className="mr-2 text-muted-foreground" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-border rounded-md bg-background"
          >
            {agentTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="bg-background border border-border rounded-md p-8 text-center">
          <p className="text-xl text-muted-foreground mb-4">No agents found</p>
          <p className="text-muted-foreground mb-6">
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first agent'}
          </p>
          
          {!searchTerm && filterType === 'all' && (
            <Link
              to="/agents/new"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md inline-flex items-center"
            >
              <FaPlus className="mr-2" />
              Create Agent
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-background border border-border rounded-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Name
                    {sortField === 'name' && (
                      <FaSort className="ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center">
                    Type
                    {sortField === 'type' && (
                      <FaSort className="ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    Status
                    {sortField === 'status' && (
                      <FaSort className="ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('updatedAt')}
                >
                  <div className="flex items-center">
                    Last Updated
                    {sortField === 'updatedAt' && (
                      <FaSort className="ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Connection
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAgents.map((agent) => (
                <tr key={agent.id} className="hover:bg-secondary/20">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/agents/${agent.id}`} className="font-medium text-primary hover:text-primary/80">
                      {agent.name}
                    </Link>
                    {agent.description && (
                      <p className="text-xs text-muted-foreground mt-1 truncate max-w-xs">
                        {agent.description}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-secondary/50 rounded-full text-xs">
                      {agent.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {agent.status === ('active' as AgentStatus) ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs flex items-center w-fit">
                        <FaCheck className="mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 rounded-full text-xs flex items-center w-fit">
                        <FaPause className="mr-1" />
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(agent.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {testingAgentId === agent.id ? (
                      <span className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary mr-2"></div>
                        Testing...
                      </span>
                    ) : testResults[agent.id] ? (
                      testResults[agent.id].success ? (
                        <span className="text-xs flex items-center text-green-600">
                          <FaCheck className="mr-1" />
                          Connected
                        </span>
                      ) : (
                        <span className="text-xs flex items-center text-red-600">
                          <FaTimes className="mr-1" />
                          Failed
                        </span>
                      )
                    ) : (
                      <button
                        onClick={() => handleTestConnection(agent.id)}
                        className="text-xs flex items-center text-primary hover:text-primary/80"
                      >
                        <FaSync className="mr-1" />
                        Test Connection
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        to={`/agents/${agent.id}`}
                        className="text-primary hover:text-primary/80 p-1"
                        title="View"
                      >
                        <FaPlay />
                      </Link>
                      <Link
                        to={`/agents/${agent.id}/edit`}
                        className="text-primary hover:text-primary/80 p-1"
                        title="Edit"
                      >
                        <FaEdit />
                      </Link>
                      {agent.status === ('active' as AgentStatus) ? (
                        <button
                          onClick={() => handleDeactivate(agent.id)}
                          className="text-amber-500 hover:text-amber-700 p-1"
                          title="Deactivate"
                        >
                          <FaPause />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(agent.id)}
                          className="text-green-500 hover:text-green-700 p-1"
                          title="Activate"
                        >
                          <FaPlay />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(agent.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
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

export default AgentsIndex;
