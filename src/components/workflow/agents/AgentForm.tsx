import React, { useState, useEffect } from 'react';
import { AgentType, Agent } from '../../../types/agent.types';
import { useAgents } from '../../../hooks/useAgents';

interface AgentFormProps {
  agent?: Agent;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const AgentForm: React.FC<AgentFormProps> = ({ agent, onSuccess, onCancel }) => {
  const { createAgent, updateAgent, testAgentConnectivity } = useAgents();
  const [loading, setLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  
  const [formData, setFormData] = useState<Partial<Agent>>({
    name: '',
    description: '',
    type: AgentType.REST,
    configuration: {
      url: '',
      method: 'GET',
      headers: {},
      authentication: {
        type: 'none',
        username: '',
        password: '',
        token: ''
      }
    },
    active: true
  });
  
  useEffect(() => {
    if (agent) {
      setFormData(agent);
    }
  }, [agent]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };
  
  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration!,
        [name]: value
      }
    }));
  };
  
  const handleAuthChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration!,
        authentication: {
          ...prev.configuration!.authentication,
          [name]: value
        }
      }
    }));
  };
  
  const handleHeaderAdd = () => {
    setFormData(prev => {
      const newHeaders = { ...prev.configuration?.headers, '': '' };
      return {
        ...prev,
        configuration: {
          ...prev.configuration!,
          headers: newHeaders
        }
      };
    });
  };
  
  const handleHeaderChange = (oldKey: string, newKey: string, value: string) => {
    setFormData(prev => {
      const headers = { ...prev.configuration?.headers };
      if (oldKey !== newKey && oldKey in headers) {
        delete headers[oldKey];
      }
      headers[newKey] = value;
      
      return {
        ...prev,
        configuration: {
          ...prev.configuration!,
          headers
        }
      };
    });
  };
  
  const handleHeaderRemove = (key: string) => {
    setFormData(prev => {
      const headers = { ...prev.configuration?.headers };
      delete headers[key];
      
      return {
        ...prev,
        configuration: {
          ...prev.configuration!,
          headers
        }
      };
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (agent?.id) {
        await updateAgent(agent.id, formData);
      } else {
        await createAgent(formData);
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to save agent:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTestConnection = async () => {
    if (!formData || !formData.configuration) return;
    
    setTestStatus('loading');
    setTestMessage('');
    
    try {
      const result = await testAgentConnectivity(formData.configuration?.url || '');
      setTestStatus(result.success ? 'success' : 'error');
      setTestMessage(result.message);
    } catch (error) {
      setTestStatus('error');
      setTestMessage(error instanceof Error ? error.message : 'Connection test failed');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">{agent ? 'Edit Agent' : 'Create New Agent'}</h2>
        
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value={AgentType.REST}>REST API</option>
              <option value={AgentType.SOAP}>SOAP API</option>
              <option value={AgentType.DATABASE}>Database</option>
              <option value={AgentType.MESSAGING}>Messaging Service</option>
              <option value={AgentType.CUSTOM}>Custom</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              name="active"
              id="active"
              checked={formData.active}
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
        <h3 className="text-lg font-medium mb-4">Configuration</h3>
        
        {formData.type === AgentType.REST && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
              <input
                type="url"
                name="url"
                value={formData.configuration?.url || ''}
                onChange={handleConfigChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
              <select
                name="method"
                value={formData.configuration?.method || 'GET'}
                onChange={handleConfigChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Headers</label>
              <div className="space-y-2">
                {Object.entries(formData.configuration?.headers || {}).map(([key, value], index) => (
                  <div key={index} className="flex space-x-2">
                    <input
                      type="text"
                      value={key}
                      onChange={(e) => handleHeaderChange(key, e.target.value, value as string)}
                      placeholder="Key"
                      className="w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      value={value as string}
                      onChange={(e) => handleHeaderChange(key, key, e.target.value)}
                      placeholder="Value"
                      className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleHeaderRemove(key)}
                      className="px-2 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleHeaderAdd}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Header
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Authentication</label>
              <select
                name="type"
                value={formData.configuration?.authentication.type || 'none'}
                onChange={handleAuthChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="none">None</option>
                <option value="basic">Basic Auth</option>
                <option value="bearer">Bearer Token</option>
              </select>
            </div>
            
            {formData.configuration?.authentication.type === 'basic' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.configuration?.authentication.username || ''}
                    onChange={handleAuthChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.configuration?.authentication.password || ''}
                    onChange={handleAuthChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            )}
            
            {formData.configuration?.authentication.type === 'bearer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Token</label>
                <input
                  type="text"
                  name="token"
                  value={formData.configuration?.authentication.token || ''}
                  onChange={handleAuthChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            )}
          </div>
        )}
        
        {/* Additional configuration sections for other agent types would go here */}
        
        <div className="mt-4">
          <button
            type="button"
            onClick={handleTestConnection}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Test Connection
          </button>
          
          {testStatus !== 'idle' && (
            <div className={`mt-2 p-2 rounded ${
              testStatus === 'loading' ? 'bg-gray-100' :
              testStatus === 'success' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {testStatus === 'loading' ? 'Testing connection...' : testMessage}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {loading ? 'Saving...' : agent ? 'Update Agent' : 'Create Agent'}
        </button>
      </div>
    </form>
  );
};

export default AgentForm;
