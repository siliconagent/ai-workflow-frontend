import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  Rule, 
  RuleFilterParams, 
  RuleInput, 
  ConditionEvaluationRequest, 
  ConditionEvaluationResult,
  RuleEvaluationRequest,
  RuleEvaluationResult
} from '../types/rule.types';
import { ruleService } from '../services/ruleService';

interface RuleState {
  rules: Rule[];
  currentRule: Rule | null;
  isLoading: boolean;
  error: string | null;
  evaluationResult: RuleEvaluationResult | null;
  conditionResult: ConditionEvaluationResult | null;

  // Actions
  fetchRules: (params?: RuleFilterParams) => Promise<void>;
  fetchRule: (id: string) => Promise<void>;
  createRule: (rule: RuleInput) => Promise<Rule>;
  updateRule: (id: string, rule: RuleInput) => Promise<Rule>;
  deactivateRule: (id: string) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
  evaluateRule: (request: RuleEvaluationRequest) => Promise<RuleEvaluationResult>;
  evaluateCondition: (request: ConditionEvaluationRequest) => Promise<ConditionEvaluationResult>;
  setCurrentRule: (rule: Rule | null) => void;
  clearError: () => void;
  clearEvaluationResults: () => void;
}

export const useRuleStore = create<RuleState>()(
  devtools(
    (set, get) => ({
      rules: [],
      currentRule: null,
      isLoading: false,
      error: null,
      evaluationResult: null,
      conditionResult: null,

      fetchRules: async (params) => {
        set({ isLoading: true, error: null });
        try {
          const rules = await ruleService.getRules(params);
          set({ rules, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch rules', 
            isLoading: false 
          });
        }
      },

      fetchRule: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const rule = await ruleService.getRule(id);
          set({ currentRule: rule, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch rule', 
            isLoading: false 
          });
        }
      },

      createRule: async (rule) => {
        set({ isLoading: true, error: null });
        try {
          const newRule = await ruleService.createRule(rule);
          set((state) => ({ 
            rules: [...state.rules, newRule], 
            isLoading: false 
          }));
          return newRule;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create rule', 
            isLoading: false 
          });
          throw error;
        }
      },

      updateRule: async (id, rule) => {
        set({ isLoading: true, error: null });
        try {
          const updatedRule = await ruleService.updateRule(id, rule);
          set((state) => ({ 
            rules: state.rules.map(r => r.id === id ? updatedRule : r),
            currentRule: state.currentRule?.id === id ? updatedRule : state.currentRule,
            isLoading: false 
          }));
          return updatedRule;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update rule', 
            isLoading: false 
          });
          throw error;
        }
      },

      deactivateRule: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const updatedRule = await ruleService.deactivateRule(id);
          set((state) => ({ 
            rules: state.rules.map(r => r.id === id ? updatedRule : r),
            currentRule: state.currentRule?.id === id ? updatedRule : state.currentRule,
            isLoading: false 
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to deactivate rule', 
            isLoading: false 
          });
        }
      },

      deleteRule: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await ruleService.deleteRule(id);
          set((state) => ({ 
            rules: state.rules.filter(r => r.id !== id),
            currentRule: state.currentRule?.id === id ? null : state.currentRule,
            isLoading: false 
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete rule', 
            isLoading: false 
          });
        }
      },

      evaluateRule: async (request) => {
        set({ isLoading: true, error: null });
        try {
          const result = await ruleService.evaluateRule(request);
          set({ evaluationResult: result, isLoading: false });
          return result;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to evaluate rule', 
            isLoading: false 
          });
          throw error;
        }
      },

      evaluateCondition: async (request) => {
        set({ isLoading: true, error: null });
        try {
          const result = await ruleService.evaluateCondition(request);
          set({ conditionResult: result, isLoading: false });
          return result;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to evaluate condition', 
            isLoading: false 
          });
          throw error;
        }
      },

      setCurrentRule: (rule) => {
        set({ currentRule: rule });
      },

      clearError: () => {
        set({ error: null });
      },

      clearEvaluationResults: () => {
        set({ evaluationResult: null, conditionResult: null });
      }
    }),
    { name: 'rule-store' }
  )
);
