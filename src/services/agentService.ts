import api from '../lib/api';
import { Agent, AgentFilterParams, AgentInput, ConnectionTestResult } from '../types/agent.types';

export const agentService = {
  /**
   * Get all agents with optional filtering
   */
  async getAgents(params?: AgentFilterParams): Promise<Agent[]> {
    const response = await api.get('/api/agents', { params });
    return response.data;
  },

  /**
   * Get agent by ID
   */
  async getAgent(id: string): Promise<Agent> {
    const response = await api.get(`/api/agents/${id}`);
    return response.data;
  },

  /**
   * Create a new agent
   */
  async createAgent(agent: AgentInput): Promise<Agent> {
    const response = await api.post('/api/agents', agent);
    return response.data;
  },

  /**
   * Update an existing agent
   */
  async updateAgent(id: string, agent: AgentInput): Promise<Agent> {
    const response = await api.put(`/api/agents/${id}`, agent);
    return response.data;
  },

  /**
   * Deactivate an agent
   */
  async deactivateAgent(id: string): Promise<Agent> {
    const response = await api.patch(`/api/agents/${id}/deactivate`);
    return response.data;
  },

  /**
   * Delete an agent
   */
  async deleteAgent(id: string): Promise<void> {
    await api.delete(`/api/agents/${id}`);
  },

  /**
   * Test agent connectivity
   */
  async testAgentConnectivity(id: string): Promise<ConnectionTestResult> {
    const response = await api.get(`/api/agents/${id}/test-connectivity`);
    return response.data;
  },

  /**
   * Clone an existing agent
   */
  async cloneAgent(id: string, newName: string): Promise<Agent> {
    // First get the original agent
    const original = await this.getAgent(id);
    
    // Create a new agent based on the original
    const cloneInput: AgentInput = {
      name: newName,
      description: `Clone of ${original.name}`,
      type: original.type,
      configuration: JSON.parse(JSON.stringify(original.configuration)), // Deep copy
      tags: original.tags ? [...original.tags] : [],
      active: original.active
    };
    
    // Save the cloned agent
    return this.createAgent(cloneInput);
  }
};
