import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaTrash, FaPause, FaPlay, FaCode, FaCheck, FaTimes, FaSync } from 'react-icons/fa';
import useAgents from '@/hooks/useAgents';

const AgentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getAgent,
    activateAgent,
    deactivateAgent,
    deleteAgent,
    testAgentConnectivity,
    error
  } = useAgents();
  
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [configView, setConfigView] = useState<'formatted' | 'raw'>('formatted');
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const fetchAgent = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const data = await getAgent(id);
        setAgent(data);
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [id, getAgent]);

  const handleActivate = async () => {
    if (!agent) return;
    
    try {
      const updatedAgent = await activateAgent(agent.id);
      if (updatedAgent) {
        setAgent(updatedAgent);
      }
    } catch (err) {
      console.error('Error activating agent:', err);
    }
  };

  const handleDeactivate = async () => {
    if (!agent) return;
    
    try {
      const updatedAgent = await deactivateAgent(agent.id);
      if (updatedAgent) {
        setAgent(updatedAgent);
      }
    } catch (err) {
      console.error('Error deactivating agent:', err);
    }
  };

  const handleDelete = async () => {
    if (!agent) return;
    
    if (!window.confirm('Are you sure you want to delete this agent?')) {
      return;
    }
    
    try {
      const success = await deleteAgent(agent.id);
      if (success) {
        navigate('/agents');
      }
    } catch (err) {
      console.error('Error deleting agent:', err);
    }
  };

  const handleTestConnection = async () => {
    if (!agent) return;
    
    setTesting(true);
    setTestResult(null);
    
    try {
      const result = await testAgentConnectivity(agent.id);
      setTestResult(result);
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
          {error}
        </div>
        <Link to="/agents" className="flex items-center text-primary hover:underline">
          <FaArrowLeft className="mr-2" />
          Back to Agents
        </Link>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-amber-100 text-amber-700 p-4 rounded-md mb-4">
          Agent not found
        </div>
        <Link to="/agents" className="flex items-center text-primary hover:underline">
          <FaArrowLeft className="mr-2" />
          Back to Agents
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link to="/agents" className="flex items-center text-primary hover:underline mb-2">
            <FaArrowLeft className="mr-2" />
            Back to Agents
          </Link>
          <h1 className="text-2xl font-bold">{agent.name}</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Link
            to={`/agents/${agent.id}/edit`}
            className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md flex items-center text-sm"
          >
            <FaEdit className="mr-1.5" />
            Edit
          </Link>
          
          {agent.status === 'active' ? (
            <button
              onClick={handleDeactivate}
              className="px-3 py-1.5 bg-amber-500 text-white rounded-md flex items-center text-sm"
            >
              <FaPause className="mr-1.5" />
              Deactivate
            </button>
          ) : (
            <button
              onClick={handleActivate}
              className="px-3 py-1.5 bg-green-500 text-white rounded-md flex items-center text-sm"
            >
              <FaPlay className="mr-1.5" />
              Activate
            </button>
          )}
          
          <button
            onClick={handleDelete}
            className="px-3 py-1.5 bg-red-500 text-white rounded-md flex items-center text-sm"
          >
            <FaTrash className="mr-1.5" />
            Delete
          </button>
        </div>
      </div>

      <div className="bg-background border border-border rounded-lg overflow-hidden shadow-sm">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Agent Details</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-muted-foreground">Type:</span>
                  <div className="mt-1">
                    <span className="px-2 py-1 bg-secondary/50 rounded-full text-xs">
                      {agent.type}
                    </span>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <div className="mt-1">
                    {agent.status === 'active' ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs flex items-center w-fit">
                        <FaCheck className="mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 rounded-full text-xs flex items-center w-fit">
                        <FaPause className="mr-1" />
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-muted-foreground">Endpoint:</span>
                  <div className="mt-1 text-sm font-mono bg-secondary/20 p-2 rounded">
                    {agent.endpoint}
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-muted-foreground">Created:</span>
                  <div className="mt-1 text-sm">
                    {new Date(agent.createdAt).toLocaleString()}
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-muted-foreground">Last Updated:</span>
                  <div className="mt-1 text-sm">
                    {new Date(agent.updatedAt).toLocaleString()}
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-muted-foreground">Connection:</span>
                  <div className="mt-1 flex items-center space-x-2">
                    {testing ? (
                      <span className="flex items-center text-sm">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary mr-2"></div>
                        Testing connection...
                      </span>
                    ) : testResult ? (
                      <>
                        {testResult.success ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs flex items-center">
                            <FaCheck className="mr-1" />
                            Connected
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full text-xs flex items-center">
                            <FaTimes className="mr-1" />
                            Failed
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">{testResult.message}</span>
                      </>
                    ) : (
                      <button
                        onClick={handleTestConnection}
                        className="flex items-center text-sm text-primary hover:text-primary/80"
                      >
                        <FaSync className="mr-1" />
                        Test Connection
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-4">Description</h2>
              <div className="bg-secondary/20 p-4 rounded-md min-h-[100px]">
                {agent.description ? (
                  <p>{agent.description}</p>
                ) : (
                  <p className="text-muted-foreground italic">No description provided</p>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Configuration</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setConfigView('formatted')}
                  className={`px-2 py-1 text-xs rounded-md ${
                    configView === 'formatted' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  Formatted
                </button>
                <button
                  onClick={() => setConfigView('raw')}
                  className={`px-2 py-1 text-xs rounded-md flex items-center ${
                    configView === 'raw' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  <FaCode className="mr-1" />
                  Raw JSON
                </button>
              </div>
            </div>
            
            {configView === 'formatted' ? (
              <div className="bg-secondary/20 p-4 rounded-md">
                <FormattedConfig config={agent.config} />
              </div>
            ) : (
              <pre className="bg-secondary/20 p-4 rounded-md overflow-x-auto text-sm">
                {JSON.stringify(agent.config, null, 2)}
              </pre>
            )}
          </div>
          
          {/* API Key (masked) */}
          {agent.apiKey && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4">API Key</h2>
              <div className="bg-secondary/20 p-4 rounded-md">
                <div className="font-mono text-sm">
                  {agent.apiKey.substring(0, 4)}****{agent.apiKey.substring(agent.apiKey.length - 4)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  API key is masked for security. You can update it in edit mode.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper component to display formatted config
interface FormattedConfigProps {
  config: Record<string, any>;
  level?: number;
}

const FormattedConfig: React.FC<FormattedConfigProps> = ({ config, level = 0 }) => {
  if (!config || Object.keys(config).length === 0) {
    return <div className="text-muted-foreground italic">No configuration</div>;
  }

  return (
    <div className="space-y-2" style={{ marginLeft: level * 16 }}>
      {Object.entries(config).map(([key, value]) => (
        <div key={key} className="text-sm">
          <div className="font-medium">{key}:</div>
          <div className="ml-4">
            {typeof value === 'object' && value !== null ? (
              <FormattedConfig config={value} level={level + 1} />
            ) : (
              <span>{value === null ? 'null' : String(value)}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AgentDetail;
