import React, { useState, useEffect } from 'react';
import { Policy, PolicyType, PolicyEffect } from '../../../types/policy.types';
import { usePolicies } from '../../../hooks/usePolicies';

interface PolicyEditorProps {
  policy?: Policy;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PolicyEditor: React.FC<PolicyEditorProps> = ({
  policy,
  onSuccess,
  onCancel
}) => {
  const { createPolicy, updatePolicy } = usePolicies();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<Policy>>({
    name: '',
    description: '',
    type: PolicyType.ACCESS_CONTROL,
    resource: '',
    action: '',
    effect: PolicyEffect.ALLOW,
    conditions: {},
    priority: 1,
    active: true
  });
  
  // Condition editor state
  const [conditionKey, setConditionKey] = useState('');
  const [conditionValue, setConditionValue] = useState('');
  
  useEffect(() => {
    if (policy) {
      setFormData(policy);
    }
  }, [policy]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseInt(value, 10)
    }));
  };
  
  const handleAddCondition = () => {
    if (!conditionKey.trim() || !conditionValue.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        [conditionKey]: conditionValue
      }
    }));
    
    // Reset the inputs
    setConditionKey('');
    setConditionValue('');
  };
  
  const handleRemoveCondition = (key: string) => {
    setFormData(prev => {
      const newConditions = { ...prev.conditions };
      delete newConditions[key];
      
      return {
        ...prev,
        conditions: newConditions
      };
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (policy?.id) {
        await updatePolicy(policy.id, formData);
      } else {
        await createPolicy(formData);
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save policy');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">{policy ? 'Edit Policy' : 'Create New Policy'}</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Policy Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value={PolicyType.ACCESS_CONTROL}>Access Control</option>
                <option value={PolicyType.DATA_PROTECTION}>Data Protection</option>
                <option value={PolicyType.AUTHORIZATION}>Authorization</option>
                <option value={PolicyType.COMPLIANCE}>Compliance</option>
                <option value={PolicyType.CUSTOM}>Custom</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <input
                type="number"
                name="priority"
                value={formData.priority || 1}
                onChange={handleNumberChange}
                min={1}
                max={100}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resource</label>
              <input
                type="text"
                name="resource"
                value={formData.resource || ''}
                onChange={handleChange}
                placeholder="e.g., workflow:*, node:humanTask, data:customer.*"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
              <input
                type="text"
                name="action"
                value={formData.action || ''}
                onChange={handleChange}
                placeholder="e.g., read, write, execute, *"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Effect</label>
            <div className="flex space-x-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="effect-allow"
                  name="effect"
                  value={PolicyEffect.ALLOW}
                  checked={formData.effect === PolicyEffect.ALLOW}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <label htmlFor="effect-allow" className="ml-2 block text-sm text-gray-700">
                  Allow
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="radio"
                  id="effect-deny"
                  name="effect"
                  value={PolicyEffect.DENY}
                  checked={formData.effect === PolicyEffect.DENY}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <label htmlFor="effect-deny" className="ml-2 block text-sm text-gray-700">
                  Deny
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              name="active"
              checked={!!formData.active}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
              Active
            </label>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Conditions</h3>
        <p className="text-sm text-gray-600 mb-4">
          Add conditions that determine when this policy applies. For example, user.role == "admin"
        </p>
        
        <div className="mb-4">
          <div className="flex space-x-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
              <input
                type="text"
                value={conditionKey}
                onChange={(e) => setConditionKey(e.target.value)}
                placeholder="e.g., user.role, request.ip"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
              <input
                type="text"
                value={conditionValue}
                onChange={(e) => setConditionValue(e.target.value)}
                placeholder="e.g., admin, 192.168.1.*"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleAddCondition}
                className="mb-0.5 px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add
              </button>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          {Object.entries(formData.conditions || {}).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="flex-1">
                <span className="font-medium">{key}:</span> {value}
              </div>
              <button
                type="button"
                onClick={() => handleRemoveCondition(key)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
          
          {Object.keys(formData.conditions || {}).length === 0 && (
            <div className="p-4 border border-dashed border-gray-300 rounded-md text-gray-500 text-center">
              No conditions defined. This policy will apply to all matching resources and actions.
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={loading}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {loading ? 'Saving...' : policy ? 'Update Policy' : 'Create Policy'}
        </button>
      </div>
    </form>
  );
};

export default PolicyEditor;
