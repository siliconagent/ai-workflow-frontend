import React, { useState } from 'react';
import { FaCode, FaEye, FaPencilRuler, FaPlay, FaExpand, FaCompress } from 'react-icons/fa';
import { Workflow } from '../../types/workflow.types';

// These will be imported from actual components later
const DesignerTab = () => <div>Designer Tab Content</div>;
const CodeTab = () => <div>Code Tab Content</div>;
const PreviewTab = () => <div>Preview Tab Content</div>;
const ExecuteTab = () => <div>Execute Tab Content</div>;

type TabType = 'designer' | 'code' | 'preview' | 'execute';

interface ContextPanelProps {
  selectedWorkflow: Workflow | null;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

const ContextPanel: React.FC<ContextPanelProps> = ({
  selectedWorkflow,
  isFullscreen,
  onToggleFullscreen
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('designer');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'designer':
        return <DesignerTab />;
      case 'code':
        return <CodeTab />;
      case 'preview':
        return <PreviewTab />;
      case 'execute':
        return <ExecuteTab />;
      default:
        return null;
    }
  };

  return (
    <div className={`context-panel flex flex-col h-full ${isFullscreen ? 'w-full' : 'flex-1'}`}>
      {selectedWorkflow ? (
        <>
          <div className="panel-header flex items-center justify-between p-4 border-b border-border bg-card">
            <div>
              <h1 className="text-xl font-bold">{selectedWorkflow.name}</h1>
              <p className="text-sm text-muted-foreground">{selectedWorkflow.description}</p>
            </div>
            <button
              onClick={onToggleFullscreen}
              className="p-2 rounded-md hover:bg-secondary"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <FaCompress /> : <FaExpand />}
            </button>
          </div>
          
          <div className="tab-navigation flex border-b border-border bg-card">
            <button
              className={`flex items-center px-4 py-2 ${
                activeTab === 'designer' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/20'
              }`}
              onClick={() => setActiveTab('designer')}
            >
              <FaPencilRuler className="mr-2" />
              Designer
            </button>
            <button
              className={`flex items-center px-4 py-2 ${
                activeTab === 'code' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/20'
              }`}
              onClick={() => setActiveTab('code')}
            >
              <FaCode className="mr-2" />
              Code
            </button>
            <button
              className={`flex items-center px-4 py-2 ${
                activeTab === 'preview' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/20'
              }`}
              onClick={() => setActiveTab('preview')}
            >
              <FaEye className="mr-2" />
              Preview
            </button>
            <button
              className={`flex items-center px-4 py-2 ${
                activeTab === 'execute' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/20'
              }`}
              onClick={() => setActiveTab('execute')}
            >
              <FaPlay className="mr-2" />
              Execute
            </button>
          </div>
          
          <div className="tab-content flex-grow overflow-auto bg-background">
            {renderTabContent()}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full flex-col">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">No Workflow Selected</h2>
            <p className="text-muted-foreground">
              Select a workflow from the navigation panel or create a new one to get started.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContextPanel;
