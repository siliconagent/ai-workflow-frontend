// src\components\ai\WorkflowSuggestions.tsx
import React from 'react';
import { FaLightbulb, FaPlus, FaTimes } from 'react-icons/fa';
import { WorkflowSuggestion, WorkflowSuggestionType } from '../../types/ai.types';
import { useAI } from '../../hooks/useAI';
import { useWorkflow } from '../../hooks/useWorkflow';

interface WorkflowSuggestionsProps {
  workflowId: string;
}

const WorkflowSuggestions: React.FC<WorkflowSuggestionsProps> = ({ workflowId }) => {
  const { suggestions, getSuggestionsForWorkflow, isLoading, clearSuggestions } = useAI();
  const { addNodeToWorkflow, saveWorkflow, currentWorkflow } = useWorkflow(workflowId);

  const handleGenerateSuggestions = async () => {
    await getSuggestionsForWorkflow(workflowId);
  };

  const handleApplySuggestion = (suggestion: WorkflowSuggestion) => {
    if (!currentWorkflow) return;

    switch (suggestion.type) {
      case WorkflowSuggestionType.ADD_NODE:
        // Extract node data from suggestion.changes.after
        const nodeData = suggestion.changes.after;
        addNodeToWorkflow({
          type: nodeData.type,
          position: nodeData.position || { x: 100, y: 100 }, // Default position if not provided
          data: {
            label: nodeData.label || nodeData.type,
            description: nodeData.description || suggestion.description
            // Include any other properties from the node data
          }
        });
        break;

      case WorkflowSuggestionType.MODIFY_NODE:
        // Handle node modification
        // This would likely involve updating an existing node
        break;

      case WorkflowSuggestionType.OPTIMIZE:
      case WorkflowSuggestionType.FIX_ERROR:
        // These might involve more complex workflow changes
        if (suggestion.changes.after && confirm(`Apply suggested ${suggestion.type}?`)) {
          // Apply the entire updated workflow by using saveWorkflow instead of updateWorkflow
          saveWorkflow(suggestion.changes.after);
        }
        break;

      // Add other cases as needed
      default:
        console.log(`Suggestion type ${suggestion.type} not implemented yet`);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSuggestionTypeLabel = (type: WorkflowSuggestionType) => {
    switch (type) {
      case WorkflowSuggestionType.ADD_NODE:
        return 'Add Node';
      case WorkflowSuggestionType.MODIFY_NODE:
        return 'Modify Node';
      case WorkflowSuggestionType.DELETE_NODE:
        return 'Delete Node';
      case WorkflowSuggestionType.ADD_CONNECTION:
        return 'Add Connection';
      case WorkflowSuggestionType.MODIFY_CONNECTION:
        return 'Modify Connection';
      case WorkflowSuggestionType.DELETE_CONNECTION:
        return 'Delete Connection';
      case WorkflowSuggestionType.OPTIMIZE:
        return 'Optimize Workflow';
      case WorkflowSuggestionType.FIX_ERROR:
        return 'Fix Error';
      case WorkflowSuggestionType.NEW_WORKFLOW:
        return 'New Workflow';
      default:
        return type;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <FaLightbulb className="text-yellow-500 mr-2" />
          <h3 className="font-medium">AI Suggestions</h3>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleGenerateSuggestions}
            disabled={isLoading}
            className="px-3 py-1 bg-primary text-white rounded-md text-sm flex items-center"
          >
            {isLoading ? (
              <>
                <span className="animate-pulse mr-1">●</span>
                Generating...
              </>
            ) : (
              <>
                <FaLightbulb className="mr-1" />
                Generate Suggestions
              </>
            )}
          </button>
          {suggestions.length > 0 && (
            <button
              onClick={clearSuggestions}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm"
            >
              <FaTimes className="mr-1 inline" />
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        {suggestions.length === 0 && !isLoading ? (
          <div className="text-center py-8 text-gray-500">
            <FaLightbulb size={32} className="mx-auto mb-2 text-yellow-500 opacity-50" />
            <p>No suggestions yet</p>
            <p className="text-sm mt-2">
              Click "Generate Suggestions" to get AI recommendations for your workflow.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="border border-gray-200 rounded-lg p-3 hover:border-primary transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center">
                      <h4 className="font-medium">{getSuggestionTypeLabel(suggestion.type)}</h4>
                      <span className="ml-2 px-2 py-0.5 bg-gray-100 text-xs rounded-full">
                        {new Date(suggestion.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                  </div>
                  <span className={`text-sm font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                    {Math.floor(suggestion.confidence * 100)}% confidence
                  </span>
                </div>
                
                {suggestion.reasoning && (
                  <div className="mt-2 text-xs bg-gray-50 p-2 rounded-md">
                    <span className="font-medium">Reasoning:</span> {suggestion.reasoning}
                  </div>
                )}
                
                <div className="flex justify-end mt-3">
                  <button
                    onClick={() => handleApplySuggestion(suggestion)}
                    className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-md text-sm flex items-center"
                  >
                    <FaPlus className="mr-1" />
                    Apply Suggestion
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowSuggestions;
