// src/pages/index.tsx
import React, { useEffect } from 'react';
import Layout from '../components/layout/Layout';
import useWorkflowStore from '../store/workflowStore';

const HomePage: React.FC = () => {
  const { workflows, fetchWorkflows, workflowStatus } = useWorkflowStore();

  useEffect(() => {
    // Fetch workflows when the component mounts
    fetchWorkflows();
  }, [fetchWorkflows]);

  // Loading state
  if (workflowStatus === 'loading' && workflows.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading workflows...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (workflowStatus === 'error') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="bg-red-100 text-red-800 p-4 rounded-md">
            <p className="font-semibold">Failed to load workflows</p>
            <p className="text-sm mt-2">Please try again later or contact support</p>
          </div>
          <button 
            onClick={() => fetchWorkflows()}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <Layout workflows={workflows} />;
};

export default HomePage;
