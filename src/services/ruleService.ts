import api from '../lib/api';
import { 
  Rule, 
  RuleFilterParams, 
  RuleInput, 
  ConditionEvaluationRequest, 
  ConditionEvaluationResult, 
  RuleEvaluationRequest, 
  RuleEvaluationResult 
} from '../types/rule.types';

export const ruleService = {
  /**
   * Get all rules with optional filtering
   */
  async getRules(params?: RuleFilterParams): Promise<Rule[]> {
    const response = await api.get('/api/rules', { params });
    return response.data;
  },

  /**
   * Get rule by ID
   */
  async getRule(id: string): Promise<Rule> {
    const response = await api.get(`/api/rules/${id}`);
    return response.data;
  },

  /**
   * Create a new rule
   */
  async createRule(rule: RuleInput): Promise<Rule> {
    const response = await api.post('/api/rules', rule);
    return response.data;
  },

  /**
   * Update an existing rule
   */
  async updateRule(id: string, rule: RuleInput): Promise<Rule> {
    const response = await api.put(`/api/rules/${id}`, rule);
    return response.data;
  },

  /**
   * Deactivate a rule
   */
  async deactivateRule(id: string): Promise<Rule> {
    const response = await api.patch(`/api/rules/${id}/deactivate`);
    return response.data;
  },

  /**
   * Delete a rule
   */
  async deleteRule(id: string): Promise<void> {
    await api.delete(`/api/rules/${id}`);
  },

  /**
   * Evaluate a rule
   */
  async evaluateRule(request: RuleEvaluationRequest): Promise<RuleEvaluationResult> {
    const response = await api.post(`/api/rules/${request.ruleId}/evaluate`, {
      contextData: request.contextData
    });
    return response.data;
  },

  /**
   * Evaluate a condition
   */
  async evaluateCondition(request: ConditionEvaluationRequest): Promise<ConditionEvaluationResult> {
    const response = await api.post('/api/rules/evaluate-condition', request);
    return response.data;
  },

  /**
   * Clone an existing rule
   */
  async cloneRule(id: string, newName: string): Promise<Rule> {
    // First get the original rule
    const original = await this.getRule(id);
    
    // Create a new rule based on the original
    const cloneInput: RuleInput = {
      name: newName,
      description: `Clone of ${original.name}`,
      type: original.type,
      condition: JSON.parse(JSON.stringify(original.condition)), // Deep copy
      actions: original.actions ? JSON.parse(JSON.stringify(original.actions)) : undefined,
      priority: original.priority,
      effectiveFrom: original.effectiveFrom,
      effectiveTo: original.effectiveTo,
      category: original.category,
      active: original.active,
      tags: original.tags ? [...original.tags] : []
    };
    
    // Save the cloned rule
    return this.createRule(cloneInput);
  }
};
