import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPencilAlt, FaPlay, FaSave, FaCog, FaTimes } from 'react-icons/fa';
import useWorkflowStore from '../../store/workflowStore';
import Layout from '../../components/layout/Layout';

const WorkflowDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { 
    fetchWorkflow, 
    currentWorkflow, 
    workflowStatus, 
    workflowError,
    updateWorkflow 
  } = useWorkflowStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  
  useEffect(() => {
    if (id) {
      fetchWorkflow(id);
    }
  }, [id, fetchWorkflow]);
  
  useEffect(() => {
    if (currentWorkflow) {
      setName(currentWorkflow.name);
      setDescription(currentWorkflow.description || '');
    }
  }, [currentWorkflow]);
  
  const handleGoBack = () => {
    navigate('/workflows');
  };
  
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    
    if (!isEditing) {
      // Reset form when entering edit mode
      if (currentWorkflow) {
        setName(currentWorkflow.name);
        setDescription(currentWorkflow.description || '');
      }
    }
  };
  
  const handleSaveDetails = async () => {
    if (!currentWorkflow || !id) return;
    
    await updateWorkflow(id, {
      name,
      description
    });
    
    setIsEditing(false);
  };
  
  const handleRunWorkflow = () => {
    if (!id) return;
    navigate(`/workflows/${id}/execute`);
  };
  
  const handleSettingsToggle = () => {
    setShowSettings(!showSettings);
  };
  
  // Handle loading state
  if (workflowStatus === 'loading' && !currentWorkflow) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading workflow...</p>
        </div>
      </div>
    );
  }
  
  // Handle error state
  if (workflowStatus === 'error') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="bg-red-100 text-red-800 p-6 rounded-md max-w-md">
            <p className="font-semibold">Failed to load workflow</p>
            <p className="text-sm mt-2">{workflowError || 'An unknown error occurred'}</p>
            <div className="mt-4 flex justify-center">
              <button 
                onClick={handleGoBack}
                className="mr-3 px-4 py-2 bg-secondary text-secondary-foreground rounded-md"
              >
                Go Back
              </button>
              <button 
                onClick={() => id && fetchWorkflow(id)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Main content - pass current workflow to Layout
  return (
    <>
      <div className="bg-card border-b border-border p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={handleGoBack}
              className="mr-4 p-2 rounded-md hover:bg-secondary"
              title="Back to Workflows"
            >
              <FaArrowLeft />
            </button>
            
            {isEditing ? (
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-2xl font-bold bg-background border border-border rounded-md px-2 py-1"
                />
                <button
                  onClick={handleSaveDetails}
                  className="p-2 bg-primary text-primary-foreground rounded-md"
                  title="Save Changes"
                >
                  <FaSave />
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <h1 className="text-2xl font-bold">{currentWorkflow?.name}</h1>
                <button
                  onClick={handleEditToggle}
                  className="ml-3 p-1.5 hover:bg-secondary rounded-md"
                  title="Edit Details"
                >
                  <FaPencilAlt />
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRunWorkflow}
              className="px-3 py-1.5 bg-green-600 text-white rounded-md flex items-center"
              title="Run Workflow"
            >
              <FaPlay className="mr-2" />
              Run
            </button>
            
            <button
              onClick={handleSettingsToggle}
              className={`p-2 rounded-md ${showSettings ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
              title="Workflow Settings"
            >
              <FaCog />
            </button>
          </div>
        </div>
      </div>
      
      {isEditing && (
        <div className="bg-secondary/20 border-b border-border p-4">
          <div className="max-w-6xl mx-auto">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for this workflow..."
              className="w-full bg-background border border-border rounded-md px-3 py-2 h-20"
            />
          </div>
        </div>
      )}
      
      {!isEditing && currentWorkflow?.description && (
        <div className="bg-secondary/20 border-b border-border p-4">
          <div className="max-w-6xl mx-auto">
            <p className="text-muted-foreground">{currentWorkflow.description}</p>
          </div>
        </div>
      )}
      
      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="w-96 bg-card h-full shadow-lg overflow-y-auto">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold">Workflow Settings</h2>
              <button
                onClick={handleSettingsToggle}
                className="p-2 rounded-md hover:bg-secondary"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">General</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Workflow ID</label>
                      <div className="bg-secondary/20 p-2 rounded-md text-sm font-mono">
                        {currentWorkflow?.id}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Created</label>
                      <div className="text-sm">
                        {currentWorkflow?.createdAt && new Date(currentWorkflow.createdAt).toLocaleString()}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Last Updated</label>
                      <div className="text-sm">
                        {currentWorkflow?.updatedAt && new Date(currentWorkflow.updatedAt).toLocaleString()}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Version</label>
                      <div className="text-sm">{currentWorkflow?.version || 1}</div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-medium mb-2">Access & Security</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm">Public Access</div>
                        <div className="text-xs text-muted-foreground">Make this workflow accessible to anyone with the link</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" />
                        <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm">Require Authentication</div>
                        <div className="text-xs text-muted-foreground">Only authenticated users can execute this workflow</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" checked />
                        <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-medium mb-2">Execution Settings</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Maximum Runtime (seconds)</label>
                      <input
                        type="number"
                        defaultValue="300"
                        className="w-full px-3 py-2 border border-border rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Retry Policy</label>
                      <select
                        className="w-full px-3 py-2 border border-border rounded-md"
                        defaultValue="exponential"
                      >
                        <option value="none">No Retries</option>
                        <option value="fixed">Fixed Interval</option>
                        <option value="exponential">Exponential Backoff</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-medium mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentWorkflow?.tags?.map(tag => (
                      <div key={tag} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                        {tag}
                      </div>
                    ))}
                    {(!currentWorkflow?.tags || currentWorkflow.tags.length === 0) && (
                      <div className="text-sm text-muted-foreground">No tags added</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-border mt-auto">
              <button
                onClick={handleSettingsToggle}
                className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Render Layout with current workflow */}
      {currentWorkflow && <Layout workflows={[currentWorkflow]} />}
    </>
  );
};

export default WorkflowDetailPage;
