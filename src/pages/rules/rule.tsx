import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSave, FaTrash, FaArrowLeft, FaPlay } from 'react-icons/fa';
import api from '@/lib/api';
import { convertToRule, WorkflowRule } from '@/types/workflow.types';
import RuleEditor from '@/components/workflow/rules/RuleEditor';
import { Condition } from '@/types/rule.types';

interface RulePageParams {
    id?: string;
    [key: string]: string | undefined; // Add index signature
}
  

const RulePage: React.FC = () => {
  const { id } = useParams<RulePageParams>();
  const navigate = useNavigate();
  const [rule, setRule] = useState<WorkflowRule | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isNew, setIsNew] = useState<boolean>(false);
  const [nodes, setNodes] = useState<{ id: string; label: string }[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(true);
  const [evalResult, setEvalResult] = useState<any>(null);
  const [evalLoading, setEvalLoading] = useState<boolean>(false);

  useEffect(() => {
    // If ID exists, fetch the rule
    if (id && id !== 'new') {
      fetchRule(id);
    } else {
      // Create new rule template
      setIsNew(true);
      setRule({
        id: '',
        name: 'New Rule',
        description: '',
        ruleType: 'business',
        priority: 1,
        active: true,
        conditions: [{ field: '', operator: '==', value: '' }],
        actions: [{ type: 'setValue', target: '', value: '' }]
      });
    }
    
    // Fetch workflow nodes for the rule editor
    fetchWorkflowNodes();
  }, [id]);

  const fetchRule = async (ruleId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/rules/${ruleId}`);
      setRule(response.data);
    } catch (err) {
      setError('Failed to fetch rule. Please try again.');
      console.error('Error fetching rule:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkflowNodes = async () => {
    try {
      // Fetch all workflows to get their nodes
      const response = await api.get('/api/workflows');
      
      // Extract nodes from all workflows
      const allNodes = response.data.flatMap((workflow: any) => 
        workflow.nodes.map((node: any) => ({
          id: node.id,
          label: node.data.label || `Node ${node.id}`
        }))
      );
      
      // Remove duplicates
      const uniqueNodes = allNodes.filter((node: any, index: number, self: any[]) => 
        index === self.findIndex((n) => n.id === node.id)
      );
      
      setNodes(uniqueNodes);
    } catch (err) {
      console.error('Error fetching workflow nodes:', err);
    }
  };

  const handleSave = async (updatedRule: WorkflowRule) => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      
      if (isNew) {
        // Create new rule
        response = await api.post('/api/rules', updatedRule);
        navigate(`/rules/${response.data.id}`);
        setIsNew(false);
      } else {
        // Update existing rule
        response = await api.put(`/api/rules/${id}`, updatedRule);
      }
      
      setRule(response.data);
      alert('Rule saved successfully!');
    } catch (err) {
      setError('Failed to save rule. Please try again.');
      console.error('Error saving rule:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!rule) return;
    
    if (window.confirm('Are you sure you want to delete this rule?')) {
      setLoading(true);
      
      try {
        await api.delete(`/api/rules/${rule.id}`);
        navigate('/rules');
      } catch (err) {
        setError('Failed to delete rule. Please try again.');
        console.error('Error deleting rule:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEvaluate = async () => {
    if (!rule) return;
    
    setEvalLoading(true);
    setEvalResult(null);
    
    try {
      // Prepare test data
      const testData : Record<string, any> = {};
      
      // Extract field names from rule conditions to prepare mock data
      rule.conditions.forEach((condition: any)  => {
        if (condition.field) {
          const parts = condition.field.split('.');
          let current = testData;
          
          // Create nested object structure
          for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]]) {
              current[parts[i]] = {};
            }
            current = current[parts[i]];
          }
          
          // Set mock value based on operator and value
          const lastPart = parts[parts.length - 1];
          
          // Try to determine the right type for the test value
          let testValue = condition.value;
          if (!isNaN(Number(condition.value))) {
            testValue = Number(condition.value);
          } else if (condition.value === 'true') {
            testValue = true;
          } else if (condition.value === 'false') {
            testValue = false;
          }
          
          current[lastPart] = testValue;
        }
      });
      
      // Call API to evaluate rule
      const response = await api.post(`/api/rules/${rule.id}/evaluate`, {
        data: testData
      });
      
      setEvalResult(response.data);
    } catch (err) {
      setError('Failed to evaluate rule. Please try again.');
      console.error('Error evaluating rule:', err);
    } finally {
      setEvalLoading(false);
    }
  };

  if (loading && !rule) {
    return <div className="p-6">Loading rule...</div>;
  }

  if (error && !rule) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  if (!rule) {
    return <div className="p-6">Rule not found.</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/rules')}
            className="mr-4 p-2 rounded-full hover:bg-secondary"
            title="Back to Rules"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl font-bold">{isNew ? 'Create New Rule' : `Edit Rule: ${rule.name}`}</h1>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleEvaluate}
            disabled={evalLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md flex items-center"
          >
            <FaPlay className="mr-2" />
            {evalLoading ? 'Evaluating...' : 'Test Rule'}
          </button>
          <button
            onClick={() => rule && handleSave(rule)}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded-md flex items-center"
          >
            <FaSave className="mr-2" />
            {loading ? 'Saving...' : 'Save Rule'}
          </button>
          {!isNew && (
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 bg-red-500 text-white rounded-md flex items-center"
            >
              <FaTrash className="mr-2" />
              Delete
            </button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {isEditorOpen && (
            <RuleEditor
            rule={convertToRule(rule)} // Convert WorkflowRule to Rule
            nodes={nodes}
            onSave={handleSave}
            onCancel={() => setIsEditorOpen(false)}
          />
          )}
        </div>
        
        <div>
          {evalResult && (
            <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
              <div className="p-3 bg-primary/10 border-b border-border">
                <h3 className="font-medium">Evaluation Result</h3>
              </div>
              <div className="p-4">
                <div className="mb-3">
                  <div className="text-sm font-medium mb-1">Conditions Result:</div>
                  <div className={`text-sm px-2 py-1 rounded-md inline-block ${
                    evalResult.conditionsResult
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {evalResult.conditionsResult ? 'True' : 'False'}
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="text-sm font-medium mb-1">Actions Applied:</div>
                  {evalResult.actionsApplied ? (
                    <div className="text-sm bg-secondary/30 p-2 rounded-md">
                      {evalResult.actions && evalResult.actions.map((action: any, idx: number) => (
                        <div key={idx} className="mb-1">
                          {action.type}: {action.target} = {JSON.stringify(action.value)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No actions were applied (conditions not met)
                    </div>
                  )}
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-1">Test Data:</div>
                  <pre className="text-xs bg-secondary/30 p-2 rounded-md overflow-x-auto">
                    {JSON.stringify(evalResult.testData, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden mt-4">
            <div className="p-3 bg-primary/10 border-b border-border">
              <h3 className="font-medium">Rule Details</h3>
            </div>
            <div className="p-4">
              <div className="mb-3">
                <div className="text-sm font-medium mb-1">Type:</div>
                <div className="text-sm">{rule.ruleType}</div>
              </div>
              
              <div className="mb-3">
                <div className="text-sm font-medium mb-1">Priority:</div>
                <div className="text-sm">{rule.priority}</div>
              </div>
              
              <div className="mb-3">
                <div className="text-sm font-medium mb-1">Status:</div>
                <div className={`text-sm px-2 py-1 rounded-md inline-block ${
                  rule.active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {rule.active ? 'Active' : 'Inactive'}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium mb-1">Description:</div>
                <div className="text-sm text-muted-foreground">
                  {rule.description || 'No description provided.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RulePage;
