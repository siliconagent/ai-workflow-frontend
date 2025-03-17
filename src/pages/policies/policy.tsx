import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaTrash, FaPause, FaPlay, FaCode, FaCheck, FaExclamationTriangle, FaBan, FaShieldAlt, FaKey, FaUsers, FaDatabase } from 'react-icons/fa';
import usePolicies from '@/hooks/usePolicies';
import { Policy, PolicyEffect, PolicyStatus } from '@/types/policy.types';

const PolicyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getPolicy,
    activatePolicy,
    deactivatePolicy,
    deletePolicy,
    error: apiError
  } = usePolicies();
  
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(apiError);
  const [conditionsView, setConditionsView] = useState<'formatted' | 'raw'>('formatted');

  useEffect(() => {
    const fetchPolicy = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await getPolicy(id);
        setPolicy(data);
      } catch (err) {
        console.error('Error fetching policy:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
  }, [id, getPolicy]);

  const handleActivate = async () => {
    if (!policy) return;
    
    try {
      const updatedPolicy = await activatePolicy(policy.id);
      if (updatedPolicy) {
        setPolicy(updatedPolicy);
      }
    } catch (err) {
      console.error('Error activating policy:', err);
    }
  };

  const handleDeactivate = async () => {
    if (!policy) return;
    
    try {
      const updatedPolicy = await deactivatePolicy(policy.id);
      if (updatedPolicy) {
        setPolicy(updatedPolicy);
      }
    } catch (err) {
      console.error('Error deactivating policy:', err);
    }
  };

  const handleDelete = async () => {
    if (!policy) return;
    
    if (!window.confirm('Are you sure you want to delete this policy?')) {
      return;
    }
    
    try {
      const success = await deletePolicy(policy.id);
      if (success) {
        navigate('/policies');
      }
    } catch (err) {
      console.error('Error deleting policy:', err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
          {error}
        </div>
        <Link to="/policies" className="flex items-center text-primary hover:underline">
          <FaArrowLeft className="mr-2" />
          Back to Policies
        </Link>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-amber-100 text-amber-700 p-4 rounded-md mb-4">
          Policy not found
        </div>
        <Link to="/policies" className="flex items-center text-primary hover:underline">
          <FaArrowLeft className="mr-2" />
          Back to Policies
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link to="/policies" className="flex items-center text-primary hover:underline mb-2">
            <FaArrowLeft className="mr-2" />
            Back to Policies
          </Link>
          <h1 className="text-2xl font-bold">{policy.name}</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Link
            to={`/policies/${policy.id}/edit`}
            className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md flex items-center text-sm"
          >
            <FaEdit className="mr-1.5" />
            Edit
          </Link>
          
          {policy.status === ('active' as PolicyStatus) ? (
            <button
              onClick={handleDeactivate}
              className="px-3 py-1.5 bg-amber-500 text-white rounded-md flex items-center text-sm"
            >
              <FaPause className="mr-1.5" />
              Deactivate
            </button>
          ) : (
            <button
              onClick={handleActivate}
              className="px-3 py-1.5 bg-green-500 text-white rounded-md flex items-center text-sm"
            >
              <FaPlay className="mr-1.5" />
              Activate
            </button>
          )}
          
          <button
            onClick={handleDelete}
            className="px-3 py-1.5 bg-red-500 text-white rounded-md flex items-center text-sm"
          >
            <FaTrash className="mr-1.5" />
            Delete
          </button>
        </div>
      </div>

      <div className="bg-background border border-border rounded-lg overflow-hidden shadow-sm">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FaShieldAlt className="mr-2 text-primary" />
                Policy Details
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-muted-foreground">Type:</span>
                  <div className="mt-1">
                    <span className="px-2 py-1 bg-secondary/50 rounded-full text-xs">
                      {policy.policyType}
                    </span>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-muted-foreground">Effect:</span>
                  <div className="mt-1">
                    {policy.effect === ('allow' as PolicyEffect) ? (
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
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <div className="mt-1">
                    {policy.status === ('active' as PolicyStatus) ? (
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
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-muted-foreground">Priority:</span>
                  <div className="mt-1 text-sm">
                    <span className="px-2 py-1 bg-secondary/50 rounded-md">
                      {policy.priority}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      (Higher values have higher precedence)
                    </span>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-muted-foreground">Resource:</span>
                  <div className="mt-1 text-sm font-mono bg-secondary/20 p-2 rounded">
                    {policy.resource}
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-muted-foreground">Action:</span>
                  <div className="mt-1 text-sm font-mono bg-secondary/20 p-2 rounded">
                    {policy.action}
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-muted-foreground">Created:</span>
                  <div className="mt-1 text-sm">
                    {new Date(policy.createdAt).toLocaleString()}
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-muted-foreground">Last Updated:</span>
                  <div className="mt-1 text-sm">
                    {new Date(policy.updatedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-4">Description</h2>
              <div className="bg-secondary/20 p-4 rounded-md mb-6">
                {policy.description ? (
                  <p>{policy.description}</p>
                ) : (
                  <p className="text-muted-foreground italic">No description provided</p>
                )}
              </div>
              
              {policy.roles && policy.roles.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-lg font-semibold mb-2 flex items-center">
                    <FaUsers className="mr-2 text-primary" />
                    Applicable Roles
                  </h2>
                  <div className="bg-secondary/20 p-4 rounded-md">
                    <div className="flex flex-wrap gap-2">
                      {policy.roles.map(role => (
                        <span key={role} className="px-2 py-1 bg-secondary rounded-full text-xs">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {policy.dataClassification && (
                <div className="mt-6">
                  <h2 className="text-lg font-semibold mb-2 flex items-center">
                    <FaDatabase className="mr-2 text-primary" />
                    Data Classification
                  </h2>
                  <div className="bg-secondary/20 p-4 rounded-md">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="text-sm font-medium mr-2">Level:</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          policy.dataClassification.level === 'public' ? 'bg-green-100 text-green-800' :
                          policy.dataClassification.level === 'internal' ? 'bg-blue-100 text-blue-800' :
                          policy.dataClassification.level === 'confidential' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {policy.dataClassification.level.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {policy.dataClassification.pii && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs">
                            PII
                          </span>
                        )}
                        {policy.dataClassification.phi && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs">
                            PHI
                          </span>
                        )}
                        {policy.dataClassification.pci && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs">
                            PCI
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {policy.conditions && Object.keys(policy.conditions).length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center">
                  <FaKey className="mr-2 text-primary" />
                  Conditions
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setConditionsView('formatted')}
                    className={`px-2 py-1 text-xs rounded-md ${
                      conditionsView === 'formatted' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    Formatted
                  </button>
                  <button
                    onClick={() => setConditionsView('raw')}
                    className={`px-2 py-1 text-xs rounded-md flex items-center ${
                      conditionsView === 'raw' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    <FaCode className="mr-1" />
                    Raw JSON
                  </button>
                </div>
              </div>
              
              {conditionsView === 'formatted' ? (
                <div className="bg-secondary/20 p-4 rounded-md">
                  <table className="w-full">
                    <thead className="border-b border-border">
                      <tr>
                        <th className="py-2 text-left text-sm font-medium">Key</th>
                        <th className="py-2 text-left text-sm font-medium">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {Object.entries(policy.conditions).map(([key, value]) => (
                        <tr key={key} className="text-sm">
                          <td className="py-2 font-mono">{key}</td>
                          <td className="py-2 font-mono">
                            {typeof value === 'object' 
                              ? JSON.stringify(value) 
                              : String(value)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <pre className="bg-secondary/20 p-4 rounded-md overflow-x-auto text-sm font-mono">
                  {JSON.stringify(policy.conditions, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PolicyDetail;
