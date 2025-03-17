import { useState, useEffect, useCallback } from 'react';
import { useRuleStore } from '../store/ruleStore';
import { 
  Rule, 
  RuleFilterParams, 
  RuleInput, 
  RuleType, 
  Condition, 
  ConditionEvaluationRequest, 
  RuleEvaluationRequest, 
  OperatorType 
} from '../types/rule.types';

export const useRules = (ruleId?: string) => {
  const {
    rules,
    currentRule,
    isLoading,
    error,
    evaluationResult,
    conditionResult,
    fetchRules,
    fetchRule,
    createRule,
    updateRule,
    deactivateRule,
    deleteRule,
    evaluateRule,
    evaluateCondition,
    setCurrentRule,
    clearError,
    clearEvaluationResults
  } = useRuleStore();

  const [isSaving, setIsSaving] = useState(false);

  // Load rule if ID is provided
  useEffect(() => {
    if (ruleId) {
      fetchRule(ruleId);
    }
  }, [ruleId, fetchRule]);

  // Create a new rule
  const createNewRule = useCallback(async (rule: RuleInput) => {
    setIsSaving(true);
    try {
      const newRule = await createRule(rule);
      setCurrentRule(newRule);
      return newRule;
    } catch (error) {
      console.error('Error creating rule:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [createRule, setCurrentRule]);

  // Save the current rule
  const saveRule = useCallback(async (ruleData: RuleInput) => {
    if (!currentRule) return null;
    
    setIsSaving(true);
    try {
      const savedRule = await updateRule(currentRule.id, ruleData);
      setCurrentRule(savedRule);
      return savedRule;
    } catch (error) {
      console.error('Error saving rule:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [currentRule, updateRule, setCurrentRule]);

  // Test a rule with specific data
  const testRule = useCallback(async (ruleId: string, contextData: Record<string, any>) => {
    const request: RuleEvaluationRequest = {
      ruleId,
      contextData
    };
    return await evaluateRule(request);
  }, [evaluateRule]);

  // Test a condition with specific data
  const testCondition = useCallback(async (condition: Condition, contextData: Record<string, any>) => {
    const request: ConditionEvaluationRequest = {
      condition,
      contextData
    };
    return await evaluateCondition(request);
  }, [evaluateCondition]);

  // Create a simple condition
  const createSimpleCondition = useCallback((field: string, operator: OperatorType, value: any): Condition => {
    return {
      id: `condition-${Math.random().toString(36).substr(2, 9)}`,
      type: 'SIMPLE',
      field,
      operator,
      value
    };
  }, []);

  // Create a group condition
  const createGroupCondition = useCallback((operator: 'AND' | 'OR' | 'NOT', children: Condition[] = []): Condition => {
    return {
      id: `condition-group-${Math.random().toString(36).substr(2, 9)}`,
      type: 'GROUP',
      operator: operator as OperatorType,
      children
    };
  }, []);

  // Get a default condition
  const getDefaultCondition = useCallback((): Condition => {
    return createSimpleCondition('', OperatorType.EQUALS, '');
  }, [createSimpleCondition]);

  // Validate a rule
  const validateRule = useCallback((rule: RuleInput): {isValid: boolean, errors: string[]} => {
    const errors: string[] = [];
    
    // Check required fields
    if (!rule.name || rule.name.trim() === '') {
      errors.push('Rule must have a name');
    }
    
    if (!rule.type) {
      errors.push('Rule must have a type');
    }
    
    // Validate condition structure
    const validateCondition = (condition: Condition): string[] => {
      const condErrors: string[] = [];
      
      if (condition.type === 'SIMPLE') {
        if (!condition.field) {
          condErrors.push('Simple condition must have a field');
        }
        if (!condition.operator) {
          condErrors.push('Simple condition must have an operator');
        }
        if (condition.operator !== OperatorType.IS_NULL && 
            condition.operator !== OperatorType.IS_NOT_NULL && 
            condition.value === undefined) {
          condErrors.push('Condition must have a value unless using IS_NULL or IS_NOT_NULL operators');
        }
      } else if (condition.type === 'GROUP') {
        if (!condition.operator) {
          condErrors.push('Group condition must have an operator (AND, OR, NOT)');
        }
        if (!condition.children || condition.children.length === 0) {
          condErrors.push('Group condition must have at least one child condition');
        }
        if (condition.operator === OperatorType.NOT && condition.children && condition.children.length > 1) {
          condErrors.push('NOT operator can only have one child condition');
        }
        
        // Recursively validate children
        if (condition.children) {
          condition.children.forEach((child, index) => {
            const childErrors = validateCondition(child);
            childErrors.forEach(err => {
              condErrors.push(`Child condition ${index + 1}: ${err}`);
            });
          });
        }
      }
      
      return condErrors;
    };
    
    const conditionErrors = validateCondition(rule.condition);
    errors.push(...conditionErrors);
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  return {
    rules,
    currentRule,
    isLoading,
    isSaving,
    error,
    evaluationResult,
    conditionResult,
    fetchRules,
    fetchRule,
    createRule: createNewRule,
    saveRule,
    updateRule,
    deactivateRule,
    deleteRule,
    testRule,
    testCondition,
    createSimpleCondition,
    createGroupCondition,
    getDefaultCondition,
    validateRule,
    setCurrentRule,
    clearError,
    clearEvaluationResults
  };
};
