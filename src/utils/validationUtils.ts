// src\utils\validationUtils.ts (add this function)
import { Activity } from '../types/activity.types';

export const validateActivityForm = (formData: Partial<Activity>): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (!formData.name?.trim()) {
    errors.name = 'Name is required';
  } else if (formData.name.length < 3) {
    errors.name = 'Name must be at least 3 characters';
  }
  
  if (!formData.type) {
    errors.type = 'Activity type is required';
  }
  
  // Add more validations as needed for specific activity types
  if (formData.type === 'system' && !formData.config?.code) {
    errors.code = 'Code implementation is required for system activities';
  }
  
  if (formData.type === 'human' && !formData.config?.formTemplate) {
    errors.formTemplate = 'Form template is required for human activities';
  }
  
  return errors;
};
