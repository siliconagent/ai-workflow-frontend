// src\components\workflow\activities\ActivityForm.tsx
import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaSpinner } from 'react-icons/fa';
import { Activity, ActivityType } from '../../../types/activity.types';
import { useActivities } from '../../../hooks/useActivities';

interface ActivityFormProps {
  activityId?: string;
  onCancel: () => void;
  onSaved?: (activity: Activity) => void;
}

const ActivityForm: React.FC<ActivityFormProps> = ({ 
  activityId, 
  onCancel,
  onSaved
}) => {
  const [formData, setFormData] = useState<Partial<Activity>>({
    name: '',
    description: '',
    type: 'system' as ActivityType,
    config: {},
    active: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { fetchActivity, createActivity, updateActivity, isLoading } = useActivities();

  useEffect(() => {
    const loadActivity = async () => {
      if (activityId) {
        const activity = await fetchActivity(activityId);
        if (activity !== undefined && activity !== null) {
          setFormData(activity);
        }
      }
    };
    loadActivity();
  }, [activityId, fetchActivity]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : value
    }));
    
    // Clear error for this field when it changes
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleConfigChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [key]: value
      }
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Activity name is required';
    }
    
    if (!formData.type) {
      newErrors.type = 'Activity type is required';
    }
    
    // Validate based on activity type
    if (formData.type === 'system' && !formData.config?.code) {
      newErrors.code = 'Code implementation is required for system activities';
    }
    
    if (formData.type === 'human' && !formData.config?.formTemplate) {
      newErrors.formTemplate = 'Form template is required for human activities';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      let savedActivity;
      
      if (activityId) {
        savedActivity = await updateActivity(activityId, formData as Activity);
      } else {
        savedActivity = await createActivity(formData as Activity);
      }
      
      if (savedActivity && onSaved) {
        onSaved(savedActivity);
      }
    } catch (error) {
      console.error('Failed to save activity:', error);
      setErrors({ 
        submit: 'Failed to save activity. Please try again.' 
      });
    }
  };

  const renderConfigFields = () => {
    switch (formData.type) {
      case 'system':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Code Type</label>
              <select
                name="codeType"
                value={(formData.config?.codeType as string) || 'javascript'}
                onChange={(e) => handleConfigChange('codeType', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="csharp">C#</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Code Implementation</label>
              <textarea
                name="code"
                value={(formData.config?.code as string) || ''}
                onChange={(e) => handleConfigChange('code', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md font-mono"
                rows={8}
                placeholder="// Enter your code here"
              />
              {errors.code && (
                <p className="mt-1 text-sm text-red-500">{errors.code}</p>
              )}
            </div>
          </>
        );
        
      case 'human':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Form Template</label>
              <textarea
                name="formTemplate"
                value={(formData.config?.formTemplate as string) || ''}
                onChange={(e) => handleConfigChange('formTemplate', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={8}
                placeholder="Enter form template JSON here"
              />
              {errors.formTemplate && (
                <p className="mt-1 text-sm text-red-500">{errors.formTemplate}</p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Timeout (minutes)</label>
              <input
                type="number"
                name="timeoutMinutes"
                value={(formData.config?.timeoutMinutes as number) || 1440}
                onChange={(e) => handleConfigChange('timeoutMinutes', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md"
                min={1}
              />
            </div>
          </>
        );
        
      case 'ai':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">AI Model</label>
              <select
                name="model"
                value={(formData.config?.model as string) || 'gpt-4'}
                onChange={(e) => handleConfigChange('model', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="claude-v2">Claude v2</option>
                <option value="llama-2">Llama 2</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">System Prompt</label>
              <textarea
                name="systemPrompt"
                value={(formData.config?.systemPrompt as string) || ''}
                onChange={(e) => handleConfigChange('systemPrompt', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={4}
                placeholder="Instructions for the AI model"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Temperature</label>
              <input
                type="range"
                name="temperature"
                value={(formData.config?.temperature as number) || 0.7}
                onChange={(e) => handleConfigChange('temperature', parseFloat(e.target.value))}
                className="w-full"
                min={0}
                max={1}
                step={0.1}
              />
              <div className="flex justify-between text-xs">
                <span>0 - Precise</span>
                <span>0.5 - Balanced</span>
                <span>1 - Creative</span>
              </div>
            </div>
          </>
        );
        
      default:
        return (
          <div className="p-4 bg-gray-100 rounded-md">
            <p className="text-gray-600">No additional configuration needed for this activity type.</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">
          {activityId ? 'Edit Activity' : 'Create New Activity'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <FaTimes size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              className={`w-full p-2 border ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              } rounded-md`}
              placeholder="Activity name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Activity Type</label>
            <select
              name="type"
              value={formData.type || 'system'}
              onChange={handleChange}
              className={`w-full p-2 border ${
                errors.type ? 'border-red-500' : 'border-gray-300'
              } rounded-md`}
            >
              <option value="system">System Task</option>
              <option value="human">Human Task</option>
              <option value="ai">AI Task</option>
              <option value="notification">Notification</option>
              <option value="integration">Integration</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-500">{errors.type}</p>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={3}
            placeholder="Describe what this activity does"
          />
        </div>

        <div className="mb-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="mr-2"
              id="active-checkbox"
            />
            <label htmlFor="active-checkbox" className="text-sm">
              Activity is active
            </label>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-md font-medium mb-2">Activity Configuration</h3>
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            {renderConfigFields()}
          </div>
        </div>

        {errors.submit && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {errors.submit}
          </div>
        )}

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-md flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <FaSave className="mr-2" />
                Save Activity
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ActivityForm;
