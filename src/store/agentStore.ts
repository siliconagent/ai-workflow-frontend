import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Agent, AgentFilterParams, AgentInput, ConnectionTestResult } from '../types/agent.types';
import { agentService } from '../services/agentService';

interface AgentState {
  agents: Agent[];
  currentAgent: Agent | null;
  isLoading: boolean;
  error: string | null;
  testResult: ConnectionTestResult | null;

  // Actions
  fetchAgents: (params?: AgentFilterParams) => Promise<void>;
  fetchAgent: (id: string) => Promise<void>;
  createAgent: (agent: AgentInput) => Promise<Agent>;
  updateAgent: (id: string, agent: AgentInput) => Promise<Agent>;
  deactivateAgent: (id: string) => Promise<void>;
  deleteAgent: (id: string) => Promise<void>;
  testConnectivity: (id: string) => Promise<ConnectionTestResult>;
  setCurrentAgent: (agent: Agent | null) => void;
  clearError: () => void;
  clearTestResult: () => void;
}

export const useAgentStore = create<AgentState>()(
  devtools(
    (set, get) => ({
      agents: [],
      currentAgent: null,
      isLoading: false,
      error: null,
      testResult: null,

      fetchAgents: async (params) => {
        set({ isLoading: true, error: null });
        try {
          const agents = await agentService.getAgents(params);
          set({ agents, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch agents', 
            isLoading: false 
          });
        }
      },

      fetchAgent: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const agent = await agentService.getAgent(id);
          set({ currentAgent: agent, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch agent', 
            isLoading: false 
          });
        }
      },

      createAgent: async (agent) => {
        set({ isLoading: true, error: null });
        try {
          const newAgent = await agentService.createAgent(agent);
          set((state) => ({ 
            agents: [...state.agents, newAgent], 
            isLoading: false 
          }));
          return newAgent;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create agent', 
            isLoading: false 
          });
          throw error;
        }
      },

      updateAgent: async (id, agent) => {
        set({ isLoading: true, error: null });
        try {
          const updatedAgent = await agentService.updateAgent(id, agent);
          set((state) => ({ 
            agents: state.agents.map(a => a.id === id ? updatedAgent : a),
            currentAgent: state.currentAgent?.id === id ? updatedAgent : state.currentAgent,
            isLoading: false 
          }));
          return updatedAgent;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update agent', 
            isLoading: false 
          });
          throw error;
        }
      },

      deactivateAgent: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const updatedAgent = await agentService.deactivateAgent(id);
          set((state) => ({ 
            agents: state.agents.map(a => a.id === id ? updatedAgent : a),
            currentAgent: state.currentAgent?.id === id ? updatedAgent : state.currentAgent,
            isLoading: false 
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to deactivate agent', 
            isLoading: false 
          });
        }
      },

      deleteAgent: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await agentService.deleteAgent(id);
          set((state) => ({ 
            agents: state.agents.filter(a => a.id !== id),
            currentAgent: state.currentAgent?.id === id ? null : state.currentAgent,
            isLoading: false 
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete agent', 
            isLoading: false 
          });
        }
      },

      testConnectivity: async (id) => {
        set({ isLoading: true, error: null, testResult: null });
        try {
          const result = await agentService.testAgentConnectivity(id);
          set({ testResult: result, isLoading: false });
          return result;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to test agent connectivity', 
            isLoading: false 
          });
          throw error;
        }
      },

      setCurrentAgent: (agent) => {
        set({ currentAgent: agent });
      },

      clearError: () => {
        set({ error: null });
      },

      clearTestResult: () => {
        set({ testResult: null });
      }
    }),
    { name: 'agent-store' }
  )
);
