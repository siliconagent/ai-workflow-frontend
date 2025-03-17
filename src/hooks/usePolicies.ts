import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { 
  Policy, 
  PolicyInput, 
  PolicyType, 
  PolicyStatus, 
  AuthorizationRequest, 
  AuthorizationResponse,
  PolicyEffect
} from '@/types/policy.types';

interface UsePoliciesReturn {
  policies: Policy[];
  loading: boolean;
  error: string | null;
  getPolicies: () => Promise<void>;
  fetchPolicies: () => Promise<void>; // Alias for getPolicies for compatibility
  getPolicy: (id: string) => Promise<Policy | null>;
  createPolicy: (policyData: Partial<Policy>) => Promise<Policy | null>;
  updatePolicy: (id: string, policyData: Partial<Policy>) => Promise<Policy | null>;
  deletePolicy: (id: string) => Promise<boolean>;
  activatePolicy: (id: string) => Promise<Policy | null>;
  deactivatePolicy: (id: string) => Promise<Policy | null>;
  togglePolicyStatus: (id: string) => Promise<Policy | null>;
  checkAuthorization: (request: AuthorizationRequest) => Promise<AuthorizationResponse>;
  loadAllPolicies: () => Promise<boolean>;
}

export const usePolicies = (): UsePoliciesReturn => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getPolicies = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/policies');
      setPolicies(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch policies');
      console.error('Error fetching policies:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Alias for getPolicies to maintain compatibility with components
  const fetchPolicies = useCallback(async () => {
    return getPolicies();
  }, [getPolicies]);

  const getPolicy = useCallback(async (id: string): Promise<Policy | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/policies/${id}`);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to fetch policy with ID ${id}`);
      console.error(`Error fetching policy ${id}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createPolicy = useCallback(async (policyData: Partial<Policy>): Promise<Policy | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/policies', policyData);
      const newPolicy = response.data;
      
      // Update local state
      setPolicies(prev => [...prev, newPolicy]);
      
      return newPolicy;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create policy');
      console.error('Error creating policy:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePolicy = useCallback(async (id: string, policyData: Partial<Policy>): Promise<Policy | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.put(`/policies/${id}`, policyData);
      const updatedPolicy = response.data;
      
      // Update local state
      setPolicies(prev => prev.map(policy => 
        policy.id === id ? updatedPolicy : policy
      ));
      
      return updatedPolicy;
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to update policy with ID ${id}`);
      console.error(`Error updating policy ${id}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePolicy = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await api.delete(`/policies/${id}`);
      
      // Update local state
      setPolicies(prev => prev.filter(policy => policy.id !== id));
      
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to delete policy with ID ${id}`);
      console.error(`Error deleting policy ${id}:`, err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const activatePolicy = useCallback(async (id: string): Promise<Policy | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.patch(`/policies/${id}/activate`, {});
      const updatedPolicy = response.data;
      
      // Update local state
      setPolicies(prev => prev.map(policy => 
        policy.id === id ? updatedPolicy : policy
      ));
      
      return updatedPolicy;
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to activate policy with ID ${id}`);
      console.error(`Error activating policy ${id}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deactivatePolicy = useCallback(async (id: string): Promise<Policy | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.patch(`/policies/${id}/deactivate`, {});
      const updatedPolicy = response.data;
      
      // Update local state
      setPolicies(prev => prev.map(policy => 
        policy.id === id ? updatedPolicy : policy
      ));
      
      return updatedPolicy;
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to deactivate policy with ID ${id}`);
      console.error(`Error deactivating policy ${id}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle policy status (active/inactive)
  const togglePolicyStatus = useCallback(async (id: string): Promise<Policy | null> => {
    const policy = policies.find(p => p.id === id);
    if (!policy) return null;
    
    if (policy.status === PolicyStatus.ACTIVE) {
      return deactivatePolicy(id);
    } else {
      return activatePolicy(id);
    }
  }, [policies, activatePolicy, deactivatePolicy]);

  const checkAuthorization = useCallback(async (request: AuthorizationRequest): Promise<AuthorizationResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/policies/check-authorization', request);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to check authorization');
      console.error('Error checking authorization:', err);
      return {
        authorized: false,
        reason: err.response?.data?.message || 'Error checking authorization'
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAllPolicies = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await api.post('/policies/load-all');
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load all policies');
      console.error('Error loading all policies:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load policies on initial mount
  useEffect(() => {
    getPolicies();
  }, [getPolicies]);

  return {
    policies,
    loading,
    error,
    getPolicies,
    fetchPolicies,
    getPolicy,
    createPolicy,
    updatePolicy,
    deletePolicy,
    activatePolicy,
    deactivatePolicy,
    togglePolicyStatus,
    checkAuthorization,
    loadAllPolicies
  };
};

export default usePolicies;
