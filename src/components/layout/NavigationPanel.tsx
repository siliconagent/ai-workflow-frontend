import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaPlus, FaPlay, FaPencilAlt, FaAngleDown, FaAngleUp } from 'react-icons/fa';
import { Workflow } from '../../types/workflow.types';
import { useNavigate } from 'react-router-dom';

interface NavigationPanelProps {
  workflows: Workflow[];
  onSelectWorkflow: (workflow: Workflow) => void;
  selectedWorkflowId?: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface AppCategory {
  name: string;
  workflows: Workflow[];
}

const NavigationPanel: React.FC<NavigationPanelProps> = ({
  workflows,
  onSelectWorkflow,
  selectedWorkflowId,
  collapsed,
  onToggleCollapse
}) => {
  const navigate = useNavigate();
  
  // Group workflows by application
  const groupWorkflowsByApp = (): AppCategory[] => {
    if (!Array.isArray(workflows)) {
      return [];
    }

    const grouped: Record<string, Workflow[]> = {};

    workflows.forEach(workflow => {
      const app = workflow.application || 'General';
      if (!grouped[app]) {
        grouped[app] = [];
      }
      grouped[app].push(workflow);
    });

    return Object.keys(grouped).map(app => ({
      name: app,
      workflows: grouped[app]
    }));
  };

  const appCategories = groupWorkflowsByApp();
  
  // Keep track of which categories are expanded
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
    appCategories.reduce((acc, category) => {
      acc[category.name] = true; // All expanded by default
      return acc;
    }, {} as Record<string, boolean>)
  );

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleCreateWorkflow = () => {
    navigate('/workflows/new');
  };

  const handleEditWorkflow = (workflow: Workflow, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/workflows/${workflow.id}`);
  };

  const handleRunWorkflow = (workflow: Workflow, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/workflows/${workflow.id}/execute`);
  };

  return (
    <div className={`navigation-panel h-full bg-card border-r border-border flex flex-col ${collapsed ? 'w-16' : 'w-64'} transition-all duration-300`}>
      <div className="panel-header flex items-center justify-between p-4 border-b border-border">
        {!collapsed && <h2 className="text-lg font-semibold">Workflows</h2>}
        <button 
          onClick={onToggleCollapse}
          className="p-2 rounded-md hover:bg-secondary"
        >
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>
      
      <div className="overflow-y-auto flex-grow">
        {appCategories.map((category) => (
          <div key={category.name} className="category">
            <div 
              className="flex items-center justify-between py-2 px-4 hover:bg-secondary/30 cursor-pointer"
              onClick={() => !collapsed && toggleCategory(category.name)}
            >
              {!collapsed && (
                <>
                  <span className="font-medium">{category.name}</span>
                  {expandedCategories[category.name] ? <FaAngleUp /> : <FaAngleDown />}
                </>
              )}
              {collapsed && <div className="h-6 w-full border-b border-border" />}
            </div>
            
            {!collapsed && expandedCategories[category.name] && (
              <div className="workflows pl-4">
                {category.workflows.map((workflow) => (
                  <div 
                    key={workflow.id}
                    className={`workflow py-2 px-4 flex items-center justify-between rounded-md my-1 cursor-pointer ${
                      selectedWorkflowId === workflow.id ? 'bg-primary/10 text-primary' : 'hover:bg-secondary/30'
                    }`}
                    onClick={() => onSelectWorkflow(workflow)}
                  >
                    <span className="truncate">{workflow.name}</span>
                    <div className="flex space-x-1">
                      <button 
                        className="p-1 rounded-md hover:bg-secondary"
                        onClick={(e) => handleEditWorkflow(workflow, e)}
                        title="Edit Workflow"
                      >
                        <FaPencilAlt size={12} />
                      </button>
                      <button 
                        className="p-1 rounded-md hover:bg-secondary"
                        onClick={(e) => handleRunWorkflow(workflow, e)}
                        title="Run Workflow"
                      >
                        <FaPlay size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="panel-footer p-4 border-t border-border">
        <button 
          onClick={handleCreateWorkflow}
          className={`flex items-center justify-center space-x-2 w-full p-2 bg-primary text-primary-foreground rounded-md ${
            collapsed ? 'px-2' : 'px-4'
          }`}
        >
          <FaPlus />
          {!collapsed && <span>Create New</span>}
        </button>
      </div>
    </div>
  );
};

export default NavigationPanel;
