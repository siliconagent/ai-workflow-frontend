import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FaRobot, FaPencilAlt, FaTrash } from 'react-icons/fa';
import { NodeStatus } from '../../../../types/workflow.types';

interface AINodeData {
  label: string;
  description?: string;
  status?: NodeStatus;
  modelId?: string;
  promptTemplate?: string;
  temperature?: number;
  maxTokens?: number;
  onEdit?: (nodeId: string) => void;
  onDelete?: (nodeId: string) => void;
}

const AINode: React.FC<NodeProps<AINodeData>> = ({ id, data, selected }) => {
  const status = data.status || NodeStatus.IDLE;
  
  // Determine node status color
  const getStatusColor = () => {
    switch (status) {
      case NodeStatus.RUNNING: return '#3b82f6'; // blue
      case NodeStatus.COMPLETED: return '#10b981'; // green
      case NodeStatus.ERROR: return '#ef4444'; // red
      case NodeStatus.SKIPPED: return '#6b7280'; // gray
      default: return '#8b5cf6'; // default purple
    }
  };
  
  const handleEdit = () => {
    if (data.onEdit) {
      data.onEdit(id);
    }
  };
  
  const handleDelete = () => {
    if (data.onDelete) {
      data.onDelete(id);
    }
  };

  // Truncate prompt template for display
  const getShortPrompt = () => {
    if (!data.promptTemplate) return null;
    if (data.promptTemplate.length <= 50) return data.promptTemplate;
    return data.promptTemplate.substring(0, 47) + '...';
  };

  return (
    <div 
      className={`node ai-task ${selected ? 'selected' : ''}`} 
      style={{ borderColor: getStatusColor() }}
    >
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        style={{ background: '#555' }}
      />
      
      <div className="node-header">
        <div className="flex items-center gap-2">
          <FaRobot size={14} />
          <div className="node-title">{data.label || 'AI Task'}</div>
        </div>
        
        {selected && (
          <div className="flex gap-1">
            <button 
              className="node-action" 
              onClick={handleEdit} 
              title="Edit node"
            >
              <FaPencilAlt size={12} />
            </button>
            <button 
              className="node-action" 
              onClick={handleDelete} 
              title="Delete node"
            >
              <FaTrash size={12} />
            </button>
          </div>
        )}
      </div>
      
      <div className="node-body">
        {data.description && (
          <div className="node-description">{data.description}</div>
        )}
        
        {data.modelId && (
          <div className="node-model text-sm">
            <strong>Model:</strong> {data.modelId}
          </div>
        )}
        
        {data.promptTemplate && (
          <div className="node-prompt text-sm">
            <strong>Prompt:</strong> {getShortPrompt()}
          </div>
        )}
        
        {(data.temperature !== undefined || data.maxTokens !== undefined) && (
          <div className="node-params text-sm">
            {data.temperature !== undefined && (
              <span><strong>Temp:</strong> {data.temperature}</span>
            )}
            {data.temperature !== undefined && data.maxTokens !== undefined && ' | '}
            {data.maxTokens !== undefined && (
              <span><strong>Max tokens:</strong> {data.maxTokens}</span>
            )}
          </div>
        )}
        
        <div className="node-status">
          <span 
            className="status-indicator" 
            style={{ backgroundColor: getStatusColor() }}
          />
          <span>{status}</span>
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        style={{ background: '#555' }}
      />
    </div>
  );
};

export default AINode;
