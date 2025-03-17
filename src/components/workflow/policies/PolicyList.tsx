import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Policy, PolicyType, PolicyEffect } from '../../../types/policy.types';
import { usePolicies } from '../../../hooks/usePolicies';

interface PolicyListProps {
  onSelect?: (policy: Policy) => void;
  selectable?: boolean;
}

const PolicyTypeLabels: Record<PolicyType, string> = {
  [PolicyType.ACCESS_CONTROL]: 'Access Control',
  [PolicyType.DATA_PROTECTION]: 'Data Protection',
  [PolicyType.AUTHORIZATION]: 'Authorization',
  [PolicyType.COMPLIANCE]: 'Compliance',
  [PolicyType.CUSTOM]: 'Custom',
  [PolicyType.GOVERNANCE]: 'Governance',
  [PolicyType.VALIDATION]: 'Validation'
};

const PolicyList: React.FC<PolicyListProps> = ({ onSelect, selectable = false }) => {
  const { policies, loading, error, fetchPolicies, deletePolicy, togglePolicyStatus } = usePolicies();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<PolicyType | 'all'>('all');
  const [effectFilter, setEffectFilter] = useState<PolicyEffect | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this policy?')) {
      try {
        await deletePolicy(id);
      } catch (error) {
        console.error('Failed to delete policy:', error);
      }
    }
  };
  
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await togglePolicyStatus(id);
    } catch (error) {
      console.error('Failed to toggle policy status:', error);
    }
  };
  
  const filteredPolicies = policies.filter((policy) => {
    // Filter by search term
    const matchesSearch = 
      policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (policy.resource ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (policy.action ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by type
    const matchesType = typeFilter === 'all' || policy.type === typeFilter;
    
    // Filter by effect
    const matchesEffect = effectFilter === 'all' || policy.effect === effectFilter;
    
    // Filter by status
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && policy.active) ||
      (statusFilter === 'inactive' && !policy.active);
    
    return matchesSearch && matchesType && matchesEffect && matchesStatus;
  });
  
  if (loading && policies.length === 0) {
    return <div className="text-center p-6">Loading policies...</div>;
  }
  
  if (error) {
    return <div className="text-center p-6 text-red-600">Error loading policies: {error}</div>;
  }
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="relative">
            <input
              type="text"
              placeholder="Search policies..."
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
          
          <div className="flex flex-wrap gap-2">
            <select
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as PolicyType | 'all')}
            >
              <option value="all">All Types</option>
              {Object.entries(PolicyTypeLabels).map(([type, label]) => (
                <option key={type} value={type}>{label}</option>
              ))}
            </select>
            
            <select
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={effectFilter}
              onChange={(e) => setEffectFilter(e.target.value as PolicyEffect | 'all')}
            >
              <option value="all">All Effects</option>
              <option value={PolicyEffect.ALLOW}>Allow</option>
              <option value={PolicyEffect.DENY}>Deny</option>
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
                to="/policies/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Policy
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {filteredPolicies.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          No policies found matching your criteria.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Effect</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPolicies.map((policy) => (
                <tr 
                  key={policy.id} 
                  className={selectable ? 'cursor-pointer hover:bg-gray-50' : ''}
                  onClick={selectable ? () => onSelect?.(policy) : undefined}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{policy.name}</div>
                    {policy.description && (
                      <div className="text-xs text-gray-500">{policy.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{PolicyTypeLabels[policy.type]}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{policy.resource}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{policy.action}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      policy.effect === PolicyEffect.ALLOW ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {policy.effect}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      policy.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {policy.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {!selectable && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(policy.id, policy.active? false : true);
                          }}
                          className={`text-xs px-2 py-1 rounded ${
                            policy.active 
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {policy.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <Link
                          to={`/policies/${policy.id}`}
                          className="text-indigo-600 hover:text-indigo-900 text-xs px-2 py-1 bg-indigo-100 rounded"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Edit
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(policy.id);
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

export default PolicyList;
