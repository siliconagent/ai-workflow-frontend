import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaPause, FaPlay, FaSearch, FaFilter, FaSort, FaCogs, FaCheck, FaTimes } from 'react-icons/fa';
import api from '@/lib/api';
import useAuth from '@/hooks/useAuth';

interface Rule {
  id: string;
  name: string;
  description?: string;
  ruleType: string;
  priority: number;
  active: boolean;
  conditions: {
    field: string;
    operator: string;
    value: any;
  }[];
  actions: {
    type: string;
    target: string;
    value?: any;
  }[];
  appliesTo?: 'all' | string[];
  createdAt: string;
  updatedAt: string;
}

const RulesIndex: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('priority');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchRules = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await api.get('/rules');
        setRules(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch rules');
        console.error('Error fetching rules:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchRules();
    }
  }, [isAuthenticated]);

  const handleActivate = async (id: string) => {
    try {
      await api.patch(`/rules/${id}/activate`);
      // Update the local state
      setRules(prevRules => 
        prevRules.map(rule => 
          rule.id === id ? { ...rule, active: true } : rule
        )
      );
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to activate rule ${id}`);
      console.error(`Error activating rule ${id}:`, err);
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await api.patch(`/rules/${id}/deactivate`);
      // Update the local state
      setRules(prevRules => 
        prevRules.map(rule => 
          rule.id === id ? { ...rule, active: false } : rule
        )
      );
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to deactivate rule ${id}`);
      console.error(`Error deactivating rule ${id}:`, err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this rule?')) {
      return;
    }
    
    try {
      await api.delete(`/rules/${id}`);
      // Update the local state
      setRules(prevRules => 
        prevRules.filter(rule => rule.id !== id)
      );
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to delete rule ${id}`);
      console.error(`Error deleting rule ${id}:`, err);
    }
  };

  const handleEvaluateRule = async (id: string) => {
    try {
      const testData = { example: 'data' };
      const response = await api.post(`/rules/${id}/evaluate`, testData);
      
      // Here you could show the evaluation result in a popup/modal
      alert(`Rule evaluation result: ${JSON.stringify(response.data)}`);
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to evaluate rule ${id}`);
      console.error(`Error evaluating rule ${id}:`, err);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle sort direction
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to descending for priority, ascending for others
      setSortField(field);
      setSortDirection(field === 'priority' ? 'desc' : 'asc');
    }
  };

  // Filter and sort rules
  const filteredRules = rules
    .filter(rule => {
      // Apply search filter
      const searchFilter = searchTerm.toLowerCase();
      const matchesSearch = 
        rule.name.toLowerCase().includes(searchFilter) ||
        (rule.description?.toLowerCase().includes(searchFilter) || false);
      
      // Apply type filter
      const matchesType = filterType === 'all' || rule.ruleType === filterType;
      
      // Apply status filter
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'active' && rule.active) || 
        (filterStatus === 'inactive' && !rule.active);
      
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      // Apply sorting
      let comparison = 0;
      
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'type') {
        comparison = a.ruleType.localeCompare(b.ruleType);
      } else if (sortField === 'status') {
        comparison = (a.active === b.active) ? 0 : a.active ? -1 : 1;
      } else if (sortField === 'priority') {
        comparison = b.priority - a.priority; // Higher priority first by default
      } else if (sortField === 'updatedAt') {
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  // Get unique rule types for filter dropdown
  const ruleTypes = ['all', ...new Set(rules.map(rule => rule.ruleType))];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Business Rules</h1>
        <Link 
          to="/rules/new" 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md flex items-center"
        >
          <FaPlus className="mr-2" />
          New Rule
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
            placeholder="Search rules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full px-4 py-2 border border-border rounded-md"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            <FaFilter className="mr-2 text-muted-foreground" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-border rounded-md bg-background"
            >
              <option value="all">All Types</option>
              {ruleTypes.filter(t => t !== 'all').map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-border rounded-md bg-background"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredRules.length === 0 ? (
        <div className="bg-background border border-border rounded-md p-8 text-center">
          <FaCogs className="mx-auto text-muted-foreground text-4xl mb-4 opacity-20" />
          <p className="text-xl text-muted-foreground mb-4">No rules found</p>
          <p className="text-muted-foreground mb-6">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first business rule'}
          </p>
          
          {!searchTerm && filterType === 'all' && filterStatus === 'all' && (
            <Link
              to="/rules/new"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md inline-flex items-center"
            >
              <FaPlus className="mr-2" />
              Create Rule
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
                  onClick={() => handleSort('priority')}
                >
                  <div className="flex items-center">
                    Priority
                    {sortField === 'priority' && (
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
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-secondary/20">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/rules/${rule.id}`} className="font-medium text-primary hover:text-primary/80">
                      {rule.name}
                    </Link>
                    {rule.description && (
                      <p className="text-xs text-muted-foreground mt-1 truncate max-w-xs">
                        {rule.description}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-secondary/50 rounded-full text-xs">
                      {rule.ruleType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="px-2 py-1 bg-secondary/50 rounded-full text-xs">
                      {rule.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {rule.active ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs flex items-center w-fit">
                        <FaCheck className="mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 rounded-full text-xs flex items-center w-fit">
                        <FaTimes className="mr-1" />
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEvaluateRule(rule.id)}
                        className="text-primary hover:text-primary/80 p-1"
                        title="Evaluate"
                      >
                        <FaCogs />
                      </button>
                      <Link
                        to={`/rules/${rule.id}/edit`}
                        className="text-primary hover:text-primary/80 p-1"
                        title="Edit"
                      >
                        <FaEdit />
                      </Link>
                      {rule.active ? (
                        <button
                          onClick={() => handleDeactivate(rule.id)}
                          className="text-amber-500 hover:text-amber-700 p-1"
                          title="Deactivate"
                        >
                          <FaPause />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(rule.id)}
                          className="text-green-500 hover:text-green-700 p-1"
                          title="Activate"
                        >
                          <FaPlay />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(rule.id)}
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

export default RulesIndex;
