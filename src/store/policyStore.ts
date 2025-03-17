import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  Policy, 
  PolicyFilterParams, 
  PolicyInput, 
  AuthorizationRequest, 
  AuthorizationResponse 
} from '../types/policy.types';
import { policyService } from '../services/policyService';

interface PolicyState {
  policies: Policy[];
  currentPolicy: Policy | null;
  isLoading: boolean;
  error: string | null;
  authorizationResult: AuthorizationResponse | null;

  // Actions
  fetchPolicies: (params?: PolicyFilterParams) => Promise<void>;
  fetchPolicy: (id: string) => Promise<void>;
  createPolicy: (policy: PolicyInput) => Promise<Policy>;
  updatePolicy: (id: string, policy: PolicyInput) => Promise<Policy>;
  deactivatePolicy: (id: string) => Promise<void>;
  deletePolicy: (id: string) => Promise<void>;
  checkAuthorization: (request: AuthorizationRequest) => Promise<AuthorizationResponse>;
  loadAllPolicies: () => Promise<void>;
  setCurrentPolicy: (policy: Policy | null) => void;
  clearError: () => void;
  clearAuthorizationResult: () => void;
}

export const usePolicyStore = create<PolicyState>()(
  devtools(
    (set, get) => ({
      policies: [],
      currentPolicy: null,
      isLoading: false,
      error: null,
      authorizationResult: null,

      fetchPolicies: async (params) => {
        set({ isLoading: true, error: null });
        try {
          const policies = await policyService.getPolicies(params);
          set({ policies, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch policies', 
            isLoading: false 
          });
        }
      },

      fetchPolicy: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const policy = await policyService.getPolicy(id);
          set({ currentPolicy: policy, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch policy', 
            isLoading: false 
          });
        }
      },

      createPolicy: async (policy) => {
        set({ isLoading: true, error: null });
        try {
          const newPolicy = await policyService.createPolicy(policy);
          set((state) => ({ 
            policies: [...state.policies, newPolicy], 
            isLoading: false 
          }));
          return newPolicy;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create policy', 
            isLoading: false 
          });
          throw error;
        }
      },

      updatePolicy: async (id, policy) => {
        set({ isLoading: true, error: null });
        try {
          const updatedPolicy = await policyService.updatePolicy(id, policy);
          set((state) => ({ 
            policies: state.policies.map(p => p.id === id ? updatedPolicy : p),
            currentPolicy: state.currentPolicy?.id === id ? updatedPolicy : state.currentPolicy,
            isLoading: false 
          }));
          return updatedPolicy;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update policy', 
            isLoading: false 
          });
          throw error;
        }
      },

      deactivatePolicy: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const updatedPolicy = await policyService.deactivatePolicy(id);
          set((state) => ({ 
            policies: state.policies.map(p => p.id === id ? updatedPolicy : p),
            currentPolicy: state.currentPolicy?.id === id ? updatedPolicy : state.currentPolicy,
            isLoading: false 
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to deactivate policy', 
            isLoading: false 
          });
        }
      },

      deletePolicy: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await policyService.deletePolicy(id);
          set((state) => ({ 
            policies: state.policies.filter(p => p.id !== id),
            currentPolicy: state.currentPolicy?.id === id ? null : state.currentPolicy,
            isLoading: false 
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete policy', 
            isLoading: false 
          });
        }
      },

      checkAuthorization: async (request) => {
        set({ isLoading: true, error: null });
        try {
          const result = await policyService.checkAuthorization(request);
          set({ authorizationResult: result, isLoading: false });
          return result;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to check authorization', 
            isLoading: false 
          });
          throw error;
        }
      },

      loadAllPolicies: async () => {
        set({ isLoading: true, error: null });
        try {
          await policyService.loadAllPolicies();
          set({ isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load all policies', 
            isLoading: false 
          });
        }
      },

      setCurrentPolicy: (policy) => {
        set({ currentPolicy: policy });
      },

      clearError: () => {
        set({ error: null });
      },

      clearAuthorizationResult: () => {
        set({ authorizationResult: null });
      }
    }),
    { name: 'policy-store' }
  )
);
