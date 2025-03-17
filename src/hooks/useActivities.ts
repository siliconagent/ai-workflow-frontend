import { useState, useEffect, useCallback } from 'react';
import { useActivityStore } from '../store/activityStore';
import { Activity, ActivityFilterParams, ActivityInput, ActivityType } from '../types/activity.types';

export const useActivities = (activityId?: string) => {
  const {
    activities,
    currentActivity,
    isLoading,
    error,
    fetchActivities,
    fetchActivity,
    createActivity,
    updateActivity,
    deactivateActivity,
    deleteActivity,
    setCurrentActivity,
    clearError,
    toggleActivityStatus
  } = useActivityStore();

  const [isSaving, setIsSaving] = useState(false);

  // Load activity if ID is provided
  useEffect(() => {
    if (activityId) {
      fetchActivity(activityId);
    }
  }, [activityId, fetchActivity]);

  // Create a new activity
  const createNewActivity = useCallback(async (activity: ActivityInput) => {
    setIsSaving(true);
    try {
      const newActivity = await createActivity(activity);
      setCurrentActivity(newActivity);
      return newActivity;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [createActivity, setCurrentActivity]);

  // Save the current activity
  const saveActivity = useCallback(async (activityData: ActivityInput) => {
    if (!currentActivity) return null;
    
    setIsSaving(true);
    try {
      const savedActivity = await updateActivity(currentActivity.id, activityData);
      setCurrentActivity(savedActivity);
      return savedActivity;
    } catch (error) {
      console.error('Error saving activity:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [currentActivity, updateActivity, setCurrentActivity]);

  // Get activities by type
  const getActivitiesByType = useCallback((type: ActivityType) => {
    return activities.filter(activity => activity.type === type);
  }, [activities]);

  // Get a default config for a specific activity type
  const getDefaultConfig = useCallback((type: ActivityType) => {
    switch (type) {
      case ActivityType.HUMAN:
        return {
          formSchema: {
            fields: []
          },
          assignmentType: 'ROLE',
          timeoutMinutes: 60
        };
      case ActivityType.SYSTEM:
        return {
          serviceEndpoint: '',
          method: 'GET',
          headers: {},
          requestTemplate: '{}',
          responseMapping: {},
          retryPolicy: {
            maxRetries: 3,
            backoffFactor: 2,
            initialDelayMs: 1000
          }
        };
      case ActivityType.AI:
        return {
          modelId: '',
          promptTemplate: '',
          outputMapping: {},
          temperature: 0.7,
          maxTokens: 1000
        };
      case ActivityType.DB:
        return {
          agentId: '',
          operation: '',
          inputMapping: {},
          outputMapping: {},
          timeout: 30
        };
      case ActivityType.MAIL:
        return {
          agentId: '',
          operation: '',
          inputMapping: {},
          outputMapping: {},
          timeout: 30
        };
      case ActivityType.REST:
        return {
          agentId: '',
          operation: '',
          inputMapping: {},
          outputMapping: {},
          timeout: 30
        };
      case ActivityType.CONDITION:
        return {
          expression: '',
          ruleId: ''
        };
      default:
        return {};
    }
  }, []);

  // Validate an activity configuration
  const validateActivity = useCallback((activity: ActivityInput): {isValid: boolean, errors: string[]} => {
    const errors: string[] = [];
    
    // Check required common fields
    if (!activity.name || activity.name.trim() === '') {
      errors.push('Activity must have a name');
    }
    
    if (!activity.type) {
      errors.push('Activity must have a type');
    }
    
    // Type-specific validation
    switch (activity.type) {
      case ActivityType.HUMAN:
        const config = activity.configuration as any;
        if (!config.formSchema) {
          errors.push('Human task must have a form schema');
        }
        if (!config.assignmentType) {
          errors.push('Human task must have an assignment type');
        }
        break;
      
      case ActivityType.SYSTEM:
        const sysConfig = activity.configuration as any;
        if (!sysConfig.serviceEndpoint) {
          errors.push('System task must have a service endpoint');
        }
        if (!sysConfig.method) {
          errors.push('System task must have an HTTP method');
        }
        break;
      
      case ActivityType.AI:
        const aiConfig = activity.configuration as any;
        if (!aiConfig.modelId) {
          errors.push('AI task must specify a model');
        }
        if (!aiConfig.promptTemplate) {
          errors.push('AI task must have a prompt template');
        }
        break;
      
      case ActivityType.DB:
        const dbConfig = activity.configuration as any;
        if (!dbConfig.agentId) {
          errors.push('Agent task must specify an agent');
        }
        if (!dbConfig.operation) {
          errors.push('Agent task must specify an operation');
        }
        break;
      case ActivityType.MAIL:
        const mailConfig = activity.configuration as any;
        if (!mailConfig.agentId) {
          errors.push('Agent task must specify an agent');
        }
        if (!mailConfig.operation) {
          errors.push('Agent task must specify an operation');
        }
        break;
      case ActivityType.REST:
        const restConfig = activity.configuration as any;
        if (!restConfig.agentId) {
          errors.push('Agent task must specify an agent');
        }
        if (!restConfig.operation) {
          errors.push('Agent task must specify an operation');
        }
        break;
      
      case ActivityType.CONDITION:
        const condConfig = activity.configuration as any;
        if (!condConfig.expression && !condConfig.ruleId) {
          errors.push('Condition must have either an expression or a rule ID');
        }
        break;
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);
  
  return {
    activities,
    currentActivity,
    isLoading,
    isSaving,
    error,
    fetchActivities,
    fetchActivity,
    createActivity: createNewActivity,
    saveActivity,
    updateActivity,
    deactivateActivity,
    deleteActivity,
    getActivitiesByType,
    getDefaultConfig,
    validateActivity,
    setCurrentActivity,
    clearError,
    toggleActivityStatus
  };
};
