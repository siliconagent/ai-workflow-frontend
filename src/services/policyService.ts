import api from '../lib/api';
import { 
  Policy, 
  PolicyFilterParams, 
  PolicyInput, 
  AuthorizationRequest, 
  AuthorizationResponse 
} from '../types/policy.types';

export const policyService = {
  /**
   * Get all policies with optional filtering
   */
  async getPolicies(params?: PolicyFilterParams): Promise<Policy[]> {
    const response = await api.get('/api/policies', { params });
    return response.data;
  },

  /**
   * Get policy by ID
   */
  async getPolicy(id: string): Promise<Policy> {
    const response = await api.get(`/api/policies/${id}`);
    return response.data;
  },

  /**
   * Create a new policy
   */
  async createPolicy(policy: PolicyInput): Promise<Policy> {
    const response = await api.post('/api/policies', policy);
    return response.data;
  },

  /**
   * Update an existing policy
   */
  async updatePolicy(id: string, policy: PolicyInput): Promise<Policy> {
    const response = await api.put(`/api/policies/${id}`, policy);
    return response.data;
  },

  /**
   * Deactivate a policy
   */
  async deactivatePolicy(id: string): Promise<Policy> {
    const response = await api.patch(`/api/policies/${id}/deactivate`);
    return response.data;
  },

  /**
   * Delete a policy
   */
  async deletePolicy(id: string): Promise<void> {
    await api.delete(`/api/policies/${id}`);
  },

  /**
   * Check if a user is authorized to perform an action on a resource
   */
  async checkAuthorization(request: AuthorizationRequest): Promise<AuthorizationResponse> {
    const response = await api.post('/api/policies/check-authorization', request);
    return response.data;
  },

  /**
   * Load all policies into the policy engine
   */
  async loadAllPolicies(): Promise<void> {
    await api.post('/api/policies/load-all');
  },

  /**
   * Clone an existing policy
   */
  async clonePolicy(id: string, newName: string): Promise<Policy> {
    // First get the original policy
    const original = await this.getPolicy(id);
    
    // Create a new policy based on the original
    const cloneInput: PolicyInput = {
      name: newName,
      description: `Clone of ${original.name}`,
      type: original.type,
      statements: JSON.parse(JSON.stringify(original.statements)), // Deep copy
      priority: original.priority,
      effectiveFrom: original.effectiveFrom,
      effectiveTo: original.effectiveTo,
      tags: original.tags ? [...original.tags] : []
    };
    
    // Save the cloned policy
    return this.createPolicy(cloneInput);
  }
};
