import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { 
  Agent, 
  AgentInput, 
  AgentType, 
  AgentStatus,
  ConnectionTestResult
} from '@/types/agent.types';

interface UseAgentsReturn {
  agents: Agent[];
  loading: boolean;
  error: string | null;
  getAgents: () => Promise<void>;
  fetchAgents: () => Promise<void>; // Alias for getAgents for compatibility
  getAgent: (id: string) => Promise<Agent | null>;
  createAgent: (agentData: Partial<Agent>) => Promise<Agent | null>;
  updateAgent: (id: string, agentData: Partial<Agent>) => Promise<Agent | null>;
  deleteAgent: (id: string) => Promise<boolean>;
  activateAgent: (id: string) => Promise<Agent | null>;
  deactivateAgent: (id: string) => Promise<Agent | null>;
  testAgentConnectivity: (id: string) => Promise<ConnectionTestResult>;
  toggleAgentStatus: (id: string) => Promise<Agent | null>;
}

export const useAgents = (): UseAgentsReturn => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getAgents = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/agents');
      setAgents(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch agents');
      console.error('Error fetching agents:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Alias for getAgents to maintain compatibility with components
  const fetchAgents = useCallback(async () => {
    return getAgents();
  }, [getAgents]);

  const getAgent = useCallback(async (id: string): Promise<Agent | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/agents/${id}`);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to fetch agent with ID ${id}`);
      console.error(`Error fetching agent ${id}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createAgent = useCallback(async (agentData: Partial<Agent>): Promise<Agent | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/agents', agentData);
      const newAgent = response.data;
      
      // Update local state
      setAgents(prev => [...prev, newAgent]);
      
      return newAgent;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create agent');
      console.error('Error creating agent:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAgent = useCallback(async (id: string, agentData: Partial<Agent>): Promise<Agent | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.put(`/agents/${id}`, agentData);
      const updatedAgent = response.data;
      
      // Update local state
      setAgents(prev => prev.map(agent => 
        agent.id === id ? updatedAgent : agent
      ));
      
      return updatedAgent;
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to update agent with ID ${id}`);
      console.error(`Error updating agent ${id}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAgent = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await api.delete(`/agents/${id}`);
      
      // Update local state
      setAgents(prev => prev.filter(agent => agent.id !== id));
      
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to delete agent with ID ${id}`);
      console.error(`Error deleting agent ${id}:`, err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const activateAgent = useCallback(async (id: string): Promise<Agent | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.patch(`/agents/${id}/activate`, {});
      const updatedAgent = response.data;
      
      // Update local state
      setAgents(prev => prev.map(agent => 
        agent.id === id ? updatedAgent : agent
      ));
      
      return updatedAgent;
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to activate agent with ID ${id}`);
      console.error(`Error activating agent ${id}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deactivateAgent = useCallback(async (id: string): Promise<Agent | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.patch(`/agents/${id}/deactivate`, {});
      const updatedAgent = response.data;
      
      // Update local state
      setAgents(prev => prev.map(agent => 
        agent.id === id ? updatedAgent : agent
      ));
      
      return updatedAgent;
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to deactivate agent with ID ${id}`);
      console.error(`Error deactivating agent ${id}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const testAgentConnectivity = useCallback(async (id: string): Promise<ConnectionTestResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/agents/${id}/test-connectivity`);
      return response.data as ConnectionTestResult;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || `Failed to test connection for agent with ID ${id}`;
      setError(errorMessage);
      console.error(`Error testing connection for agent ${id}:`, err);
      return {
        success: false,
        message: errorMessage,
        timestamp: new Date().toISOString()
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle agent status (active/inactive)
  const toggleAgentStatus = useCallback(async (id: string): Promise<Agent | null> => {
    const agent = agents.find(a => a.id === id);
    if (!agent) return null;
    
    if (agent.status === AgentStatus.ACTIVE) {
      return deactivateAgent(id);
    } else {
      return activateAgent(id);
    }
  }, [agents, activateAgent, deactivateAgent]);

  // Load agents on initial mount
  useEffect(() => {
    getAgents();
  }, [getAgents]);

  return {
    agents,
    loading,
    error,
    getAgents,
    fetchAgents,
    getAgent,
    createAgent,
    updateAgent,
    deleteAgent,
    activateAgent,
    deactivateAgent,
    testAgentConnectivity,
    toggleAgentStatus
  };
};

export default useAgents;
