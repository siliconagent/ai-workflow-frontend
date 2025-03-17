import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaPause, FaPlay, FaSearch, FaFilter, FaSort, FaDownload, FaUpload, FaShieldAlt, FaCheck, FaBan } from 'react-icons/fa';
import usePolicies from '@/hooks/usePolicies';
import { PolicyEffect, PolicyStatus } from '@/types/policy.types';

const PoliciesIndex: React.FC = () => {
  const {
    policies,
    loading,
    error,
    getPolicies,
    activatePolicy,
    deactivatePolicy,
    deletePolicy,
    loadAllPolicies
  } = usePolicies();
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterEffect, setFilterEffect] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('priority');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleActivate = async (id: string) => {
    await activatePolicy(id);
  };

  const handleDeactivate = async (id: string) => {
    await deactivatePolicy(id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this policy?')) {
      return;
    }
    
    await deletePolicy(id);
  };

  const handleLoadAllPolicies = async () => {
    setIsLoading(true);
    try {
      await loadAllPolicies();
      // Refresh the policies list
      await getPolicies();
    } finally {
      setIsLoading(false);
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

  // Filter and sort policies
  const filteredPolicies = policies
    .filter(policy => {
      // Apply search filter
      const searchFilter = searchTerm.toLowerCase();
      const matchesSearch = 
        policy.name.toLowerCase().includes(searchFilter) ||
        (policy.description?.toLowerCase().includes(searchFilter) || false) ||
        policy.resource?.toLowerCase().includes(searchFilter) ||
        policy.action?.toLowerCase().includes(searchFilter);
      
      // Apply type filter
      const matchesType = filterType === 'all' || policy.policyType === filterType;
      
      // Apply effect filter
      const matchesEffect = filterEffect === 'all' || policy.effect === filterEffect;
      
      return matchesSearch && matchesType && matchesEffect;
    })
    .sort((a, b) => {
      // Apply sorting
      let comparison = 0;
      
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'type') {
        comparison = a.policyType.localeCompare(b.policyType);
      } else if (sortField === 'effect') {
        comparison = (a.effect ?? '').localeCompare(b.effect ?? '');
      } else if (sortField === 'priority') {
        comparison = b.priority - a.priority; // Higher priority first
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status);
      } else if (sortField === 'updatedAt') {
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  // Get unique policy types for filter dropdown
  const policyTypes = ['all', ...new Set(policies.map(policy => policy.policyType))];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Security Policies</h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleLoadAllPolicies}
            disabled={isLoading}
            className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md flex items-center text-sm"
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Loading...
              </>
            ) : (
              <>
                <FaDownload className="mr-1.5" />
                Load All Policies
              </>
            )}
          </button>
          <Link 
            to="/policies/new" 
            className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md flex items-center text-sm"
          >
            <FaPlus className="mr-1.5" />
            New Policy
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search policies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full px-4 py-2 border border-border rounded-md"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background appearance-none pr-8"
            >
              <option value="all">All Types</option>
              {policyTypes.filter(t => t !== 'all').map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <FaFilter className="text-muted-foreground text-xs" />
            </div>
          </div>
          
          <div className="relative">
            <select
              value={filterEffect}
              onChange={(e) => setFilterEffect(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background appearance-none pr-8"
            >
              <option value="all">All Effects</option>
              <option value="allow">Allow</option>
              <option value="deny">Deny</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <FaFilter className="text-muted-foreground text-xs" />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredPolicies.length === 0 ? (
        <div className="bg-background border border-border rounded-md p-8 text-center">
          <FaShieldAlt className="mx-auto text-muted-foreground text-4xl mb-4 opacity-20" />
          <p className="text-xl text-muted-foreground mb-4">No policies found</p>
          <p className="text-muted-foreground mb-6">
            {searchTerm || filterType !== 'all' || filterEffect !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first security policy'}
          </p>
          
          {!searchTerm && filterType === 'all' && filterEffect === 'all' && (
            <Link
              to="/policies/new"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md inline-flex items-center"
            >
              <FaPlus className="mr-2" />
              Create Policy
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
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Resource/Action
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('effect')}
                >
                  <div className="flex items-center">
                    Effect
                    {sortField === 'effect' && (
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
              {filteredPolicies.map((policy) => (
                <tr key={policy.id} className="hover:bg-secondary/20">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/policies/${policy.id}`} className="font-medium text-primary hover:text-primary/80">
                      {policy.name}
                    </Link>
                    {policy.description && (
                      <p className="text-xs text-muted-foreground mt-1 truncate max-w-xs">
                        {policy.description}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-secondary/50 rounded-full text-xs">
                      {policy.policyType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs">
                      <div className="font-medium">Resource:</div>
                      <div className="text-muted-foreground font-mono mb-1">{policy.resource}</div>
                      <div className="font-medium">Action:</div>
                      <div className="text-muted-foreground font-mono">{policy.action}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {policy.effect === 'allow' as PolicyEffect? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs flex items-center w-fit">
                        <FaCheck className="mr-1" />
                        Allow
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full text-xs flex items-center w-fit">
                        <FaBan className="mr-1" />
                        Deny
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="px-2 py-1 bg-secondary/50 rounded-full text-xs">
                      {policy.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {policy.status === ('active'  as PolicyStatus) ? (
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
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        to={`/policies/${policy.id}`}
                        className="text-primary hover:text-primary/80 p-1"
                        title="View"
                      >
                        <FaShieldAlt />
                      </Link>
                      <Link
                        to={`/policies/${policy.id}/edit`}
                        className="text-primary hover:text-primary/80 p-1"
                        title="Edit"
                      >
                        <FaEdit />
                      </Link>
                      {policy.status === 'active' as PolicyStatus ? (
                        <button
                          onClick={() => handleDeactivate(policy.id)}
                          className="text-amber-500 hover:text-amber-700 p-1"
                          title="Deactivate"
                        >
                          <FaPause />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(policy.id)}
                          className="text-green-500 hover:text-green-700 p-1"
                          title="Activate"
                        >
                          <FaPlay />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(policy.id)}
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

export default PoliciesIndex;
