import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSave, FaTimes, FaTag, FaTags } from 'react-icons/fa';
import useWorkflowStore from '../../store/workflowStore';
import { NodeType } from '../../types/workflow.types';

const NewWorkflowPage: React.FC = () => {
  const navigate = useNavigate();
  const { createWorkflow, workflowStatus, workflowError } = useWorkflowStore();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [application, setApplication] = useState('General');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const applicationOptions = [
    'General',
    'HRMS',
    'Finance',
    'Sales',
    'Marketing',
    'Operations',
    'Customer Service'
  ];
  
  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return;
    }
    
    // Create basic workflow with start and end nodes
    const startNode = {
      id: `node_${Date.now()}`,
      type: NodeType.START,
      position: { x: 250, y: 50 },
      data: {
        label: 'Start',
        description: 'Workflow starts here',
        type: NodeType.START
      }
    };
    
    const endNode = {
      id: `node_${Date.now() + 1}`,
      type: NodeType.END,
      position: { x: 250, y: 350 },
      data: {
        label: 'End',
        description: 'Workflow ends here',
        type: NodeType.END
      }
    };
    
    const newWorkflow = {
      name,
      description,
      nodes: [startNode, endNode],
      edges: [],
      tags,
      application
    };
    
    const createdWorkflow = await createWorkflow(newWorkflow);
    
    if (createdWorkflow) {
      navigate(`/workflows/${createdWorkflow.id}`);
    }
  };
  
  const handleCancel = () => {
    navigate('/workflows');
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Create New Workflow</h1>
        <p className="text-muted-foreground">Define the basic details for your new workflow</p>
      </header>
      
      {workflowError && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {workflowError}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 p-6 bg-card border border-border rounded-lg shadow-sm">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Workflow Name*
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Enter workflow name"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Describe what this workflow does"
              rows={3}
            />
          </div>
          
          <div>
            <label htmlFor="application" className="block text-sm font-medium mb-1">
              Application
            </label>
            <select
              id="application"
              value={application}
              onChange={(e) => setApplication(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {applicationOptions.map(app => (
                <option key={app} value={app}>{app}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Tags
            </label>
            <div className="flex items-center mb-2">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-grow px-4 py-2 border border-border rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Add tags"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-r-md"
              >
                <FaTag />
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                  <div 
                    key={tag} 
                    className="flex items-center px-3 py-1 bg-secondary text-secondary-foreground rounded-full"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-primary hover:underline flex items-center"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
              <FaTags className="ml-1" />
            </button>
          </div>
          
          {showAdvanced && (
            <div className="space-y-4 p-4 bg-secondary/20 rounded-md">
              <h3 className="font-medium">Advanced Settings</h3>
              <p className="text-sm text-muted-foreground">
                Advanced settings for your workflow will be configurable here.
              </p>
              <div className="text-sm">
                <p>Coming soon:</p>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Security and access control</li>
                  <li>Execution limits</li>
                  <li>Monitoring and alerts</li>
                  <li>Versioning settings</li>
                </ul>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-border rounded-md flex items-center"
          >
            <FaTimes className="mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={workflowStatus === 'loading' || !name.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md flex items-center disabled:opacity-50"
          >
            <FaSave className="mr-2" />
            {workflowStatus === 'loading' ? 'Creating...' : 'Create Workflow'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewWorkflowPage;
