import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaSearch, FaPlay, FaPencilAlt, FaTrash, FaCopy, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import useWorkflowStore from '../../store/workflowStore';
import { Workflow } from '../../types/workflow.types';

type SortField = 'name' | 'createdAt' | 'updatedAt';
type SortDirection = 'asc' | 'desc';

const WorkflowsPage: React.FC = () => {
  const navigate = useNavigate();
  const { workflows, fetchWorkflows, deleteWorkflow, workflowStatus } = useWorkflowStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [workflowToDelete, setWorkflowToDelete] = useState<string | null>(null);
  
  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);
  
  const handleCreateWorkflow = () => {
    navigate('/workflows/new');
  };
  
  const handleEditWorkflow = (id: string) => {
    navigate(`/workflows/${id}`);
  };
  
  const handleRunWorkflow = (id: string) => {
    navigate(`/workflows/${id}/execute`);
  };
  
  const handleDuplicateWorkflow = async (workflow: Workflow) => {
    // Create a copy of the workflow with a new name
    const newWorkflow: Partial<Workflow> = {
      name: `${workflow.name} (Copy)`,
      description: workflow.description,
      nodes: workflow.nodes,
      edges: workflow.edges,
      tags: workflow.tags,
      application: workflow.application
    };
    
    // Create the workflow
    const createdWorkflow = await useWorkflowStore.getState().createWorkflow(newWorkflow);
    
    if (createdWorkflow) {
      // Refresh the list
      fetchWorkflows();
    }
  };
  
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, set default direction
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const confirmDelete = (id: string) => {
    setWorkflowToDelete(id);
  };
  
  const cancelDelete = () => {
    setWorkflowToDelete(null);
  };
  
  const executeDelete = async () => {
    if (workflowToDelete) {
      await deleteWorkflow(workflowToDelete);
      setWorkflowToDelete(null);
    }
  };
  
  // Filter and sort workflows
  const filteredWorkflows = Array.isArray(workflows) ? workflows
    .filter(workflow => 
      workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (workflow.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    )
    : [];
  
  // Group workflows by application
  const groupedWorkflows: Record<string, Workflow[]> = {};
  filteredWorkflows.forEach(workflow => {
    const appName = workflow.application || 'General';
    if (!groupedWorkflows[appName]) {
      groupedWorkflows[appName] = [];
    }
    groupedWorkflows[appName].push(workflow);
  });
  
  const appGroups = Object.keys(groupedWorkflows).sort();
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Workflows</h1>
          <button
            onClick={handleCreateWorkflow}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md flex items-center"
          >
            <FaPlus className="mr-2" />
            Create Workflow
          </button>
        </div>
        <p className="text-muted-foreground">Manage and organize your automated workflows</p>
      </header>
      
      <div className="mb-6 relative">
        <FaSearch className="absolute left-3 top-3 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search workflows..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 p-2 border border-border rounded-md"
        />
      </div>
      
      {workflowStatus === 'loading' && workflows.length === 0 && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading workflows...</p>
        </div>
      )}
      
      {workflowStatus !== 'loading' && filteredWorkflows.length === 0 && (
        <div className="text-center py-12 border border-dashed border-border rounded-md">
          <p className="text-lg text-muted-foreground">No workflows found</p>
          {searchTerm ? (
            <p className="mt-2 text-muted-foreground">Try adjusting your search terms</p>
          ) : (
            <button
              onClick={handleCreateWorkflow}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md inline-flex items-center"
            >
              <FaPlus className="mr-2" />
              Create your first workflow
            </button>
          )}
        </div>
      )}
      
      {filteredWorkflows.length > 0 && (
        <div className="space-y-6">
          {appGroups.map(appName => (
            <div key={appName} className="app-group">
              <h2 className="text-xl font-semibold mb-3">{appName}</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-secondary/30">
                      <th className="text-left p-3 rounded-tl-md">
                        <button 
                          className="flex items-center"
                          onClick={() => handleSort('name')}
                        >
                          Name
                          {sortField === 'name' && (
                            sortDirection === 'asc' 
                              ? <FaSortAmountUp className="ml-1" />
                              : <FaSortAmountDown className="ml-1" />
                          )}
                        </button>
                      </th>
                      <th className="text-left p-3">Description</th>
                      <th className="text-left p-3">
                        <button 
                          className="flex items-center"
                          onClick={() => handleSort('updatedAt')}
                        >
                          Last Updated
                          {sortField === 'updatedAt' && (
                            sortDirection === 'asc' 
                              ? <FaSortAmountUp className="ml-1" />
                              : <FaSortAmountDown className="ml-1" />
                          )}
                        </button>
                      </th>
                      <th className="text-left p-3 rounded-tr-md">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedWorkflows[appName].map((workflow) => (
                      <tr key={workflow.id} className="border-b border-border hover:bg-secondary/10">
                        <td className="p-3">{workflow.name}</td>
                        <td className="p-3 text-muted-foreground">{workflow.description || '-'}</td>
                        <td className="p-3 text-muted-foreground">
                          {new Date(workflow.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleRunWorkflow(workflow.id)}
                              className="p-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-md"
                              title="Run"
                            >
                              <FaPlay />
                            </button>
                            <button
                              onClick={() => handleEditWorkflow(workflow.id)}
                              className="p-2 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-md"
                              title="Edit"
                            >
                              <FaPencilAlt />
                            </button>
                            <button
                              onClick={() => handleDuplicateWorkflow(workflow)}
                              className="p-2 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 rounded-md"
                              title="Duplicate"
                            >
                              <FaCopy />
                            </button>
                            <button
                              onClick={() => confirmDelete(workflow.id)}
                              className="p-2 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-md"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {workflowToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-card max-w-md w-full p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete this workflow? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-border rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowsPage;
