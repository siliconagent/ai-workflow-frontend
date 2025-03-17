import React, { useState, useEffect } from 'react';
import { Rule, RuleType, Condition, RuleAction, OperatorType } from '../../../types/rule.types';
import {useRules} from '../../../hooks/useRules';

interface RuleEditorProps {
  rule?: Rule;
  onSuccess?: () => void;
  onCancel?: () => void;
  nodes?: { id: string; label: string }[]; // Add this line
  onSave?: (rule: any) => void; // Add this line for compatibility
}

const RuleEditor: React.FC<RuleEditorProps> = ({
  rule,
  onSuccess,
  onCancel
}) => {
  const { createRule, updateRule } = useRules();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<Rule>>({
    name: '',
    description: '',
    type: RuleType.BUSINESS,
    priority: 1,
    active: true,
    conditions: [],
    actions: []
  });
  
  useEffect(() => {
    if (rule) {
      setFormData({
        ...rule,
        name: rule.name || '',
        description: rule.description || '',
        type: rule.type || RuleType.BUSINESS,
        priority: rule.priority || 1,
        active: rule.active !== undefined ? rule.active : true,
        conditions: rule.conditions || [],
        actions: rule.actions || []
      });
    }
  }, [rule]);
  
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
  
  // Handle condition changes
  const handleConditionChange = (index: number, field: keyof Condition, value: string) => {
    setFormData(prev => {
      const updatedConditions = [...(prev.conditions || [])];
      updatedConditions[index] = {
        ...updatedConditions[index],
        [field]: value
      };
      
      return {
        ...prev,
        conditions: updatedConditions
      };
    });
  };
  
  const handleAddCondition = () => {
    setFormData(prev => ({
      ...prev,
      conditions: [
        ...(prev.conditions || []),
        { id: '', type: 'SIMPLE', field: '', operator: '==' as OperatorType, value: '' } as Condition
      ]
    }));
  };
  
  const handleRemoveCondition = (index: number) => {
    setFormData(prev => {
      const updatedConditions = [...(prev.conditions || [])];
      updatedConditions.splice(index, 1);
      
      return {
        ...prev,
        conditions: updatedConditions
      };
    });
  };
  
  // Handle action changes
  const handleActionChange = (index: number, field: keyof RuleAction, value: string) => {
    setFormData(prev => {
      const updatedActions = [...(prev.actions || [])];
      updatedActions[index] = {
        ...updatedActions[index],
        [field]: value
      };
      
      return {
        ...prev,
        actions: updatedActions
      };
    });
  };
  
  const handleAddAction = () => {
    setFormData(prev => ({
      ...prev,
      actions: [
        ...(prev.actions || []),
        { type: 'SET_VALUE', target: '', value: '' }  as RuleAction
      ]
    }));
  };
  
  const handleRemoveAction = (index: number) => {
    setFormData(prev => {
      const updatedActions = [...(prev.actions || [])];
      updatedActions.splice(index, 1);
      
      return {
        ...prev,
        actions: updatedActions
      };
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      let savedRule;
      if (rule?.id) {
        savedRule = await updateRule(rule.id, formData as Rule);
      } else {
        savedRule = await createRule(formData as Rule);
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save rule');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">{rule ? 'Edit Rule' : 'Create New Rule'}</h2>
        
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Rule Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value={RuleType.BUSINESS}>Business Rule</option>
                <option value={RuleType.DATA}>Data Rule</option>
                <option value={RuleType.SECURITY}>Security Rule</option>
                <option value={RuleType.VALIDATION}>Validation Rule</option>
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
              Rule is active
            </label>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Conditions</h3>
        <p className="text-sm text-gray-600 mb-4">
          Define conditions that determine when this rule should trigger
        </p>
        
        <div className="space-y-4">
          {(formData.conditions || []).map((condition, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-md bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">Condition {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => handleRemoveCondition(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-700 mb-1">Field</label>
                  <input
                    type="text"
                    value={condition.field || ''}
                    onChange={(e) => handleConditionChange(index, 'field', e.target.value)}
                    placeholder="e.g., data.amount"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-700 mb-1">Operator</label>
                  <select
                    value={condition.operator || '=='}
                    onChange={(e) => handleConditionChange(index, 'operator', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                    <option value="==">Equals (==)</option>
                    <option value="!=">Not Equals (!=)</option>
                    <option value=">">Greater Than (>)</option>
                    <option value=">=">Greater Than or Equal (>=)</option>
                    <option value="<">Less Than (<)</option>
                    <option value="<=">Less Than or Equal (<=)</option>
                    <option value="contains">Contains</option>
                    <option value="startsWith">Starts With</option>
                    <option value="endsWith">Ends With</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs text-gray-700 mb-1">Value</label>
                  <input
                    type="text"
                    value={condition.value?.toString() || ''}
                    onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
                    placeholder="Value to compare"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    required
                  />
                </div>
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={handleAddCondition}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Condition
          </button>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Actions</h3>
        <p className="text-sm text-gray-600 mb-4">
          Define actions to be taken when the conditions are met
        </p>
        
        <div className="space-y-4">
          {(formData.actions || []).map((action, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-md bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">Action {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => handleRemoveAction(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-700 mb-1">Action Type</label>
                  <select
                    value={action.type || 'setValue'}
                    onChange={(e) => handleActionChange(index, 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                    <option value="setValue">Set Value</option>
                    <option value="setVisibility">Set Visibility</option>
                    <option value="triggerEvent">Trigger Event</option>
                    <option value="callService">Call Service</option>
                    <option value="navigateTo">Navigate To</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs text-gray-700 mb-1">Target</label>
                  <input
                    type="text"
                    value={action.target || ''}
                    onChange={(e) => handleActionChange(index, 'target', e.target.value)}
                    placeholder="Field or target ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-700 mb-1">Value</label>
                  <input
                    type="text"
                    value={action.value || ''}
                    onChange={(e) => handleActionChange(index, 'value', e.target.value)}
                    placeholder="Value or parameter"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={handleAddAction}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Action
          </button>
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
          {loading ? 'Saving...' : rule ? 'Update Rule' : 'Create Rule'}
        </button>
      </div>
    </form>
  );
};

export default RuleEditor;
