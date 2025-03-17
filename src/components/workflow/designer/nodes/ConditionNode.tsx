import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FaCodeBranch, FaPencilAlt, FaTrash } from 'react-icons/fa';
import { NodeStatus } from '../../../../types/workflow.types';

interface ConditionNodeData {
  label: string;
  description?: string;
  status?: NodeStatus;
  expression?: string;
  ruleId?: string;
  ruleName?: string;
  onEdit?: (nodeId: string) => void;
  onDelete?: (nodeId: string) => void;
}

const ConditionNode: React.FC<NodeProps<ConditionNodeData>> = ({ id, data, selected }) => {
  const status = data.status || NodeStatus.IDLE;
  
  // Determine node status color
  const getStatusColor = () => {
    switch (status) {
      case NodeStatus.RUNNING: return '#3b82f6'; // blue
      case NodeStatus.COMPLETED: return '#10b981'; // green
      case NodeStatus.ERROR: return '#ef4444'; // red
      case NodeStatus.SKIPPED: return '#6b7280'; // gray
      default: return '#ef4444'; // default red for condition
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

  // Truncate expression for display
  const getShortExpression = () => {
    if (!data.expression) return null;
    if (data.expression.length <= 50) return data.expression;
    return data.expression.substring(0, 47) + '...';
  };

  return (
    <div 
      className={`node condition ${selected ? 'selected' : ''}`} 
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
          <FaCodeBranch size={14} />
          <div className="node-title">{data.label || 'Condition'}</div>
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
        
        {data.ruleId && data.ruleName && (
          <div className="node-rule text-sm">
            <strong>Rule:</strong> {data.ruleName}
          </div>
        )}
        
        {data.expression && !data.ruleId && (
          <div className="node-expression text-sm">
            <strong>Expression:</strong> {getShortExpression()}
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
      
      {/* True path */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        style={{ 
          background: '#10b981',
          left: '30%' 
        }}
      />
      
      {/* False path */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        style={{ 
          background: '#ef4444',
          left: '70%' 
        }}
      />
    </div>
  );
};

export default ConditionNode;
