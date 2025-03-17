import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FaUser, FaPencilAlt, FaTrash } from 'react-icons/fa';
import { NodeStatus } from '../../../../types/workflow.types';

interface HumanTaskNodeData {
  label: string;
  description?: string;
  status?: NodeStatus;
  formSchema?: any;
  assignee?: string;
  timeoutMinutes?: number;
  onEdit?: (nodeId: string) => void;
  onDelete?: (nodeId: string) => void;
}

const HumanTaskNode: React.FC<NodeProps<HumanTaskNodeData>> = ({ id, data, selected }) => {
  const status = data.status || NodeStatus.IDLE;
  
  // Determine node status color
  const getStatusColor = () => {
    switch (status) {
      case NodeStatus.RUNNING: return '#3b82f6'; // blue
      case NodeStatus.COMPLETED: return '#10b981'; // green
      case NodeStatus.ERROR: return '#ef4444'; // red
      case NodeStatus.SKIPPED: return '#6b7280'; // gray
      default: return '#6366f1'; // default purple
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

  return (
    <div 
      className={`node human-task ${selected ? 'selected' : ''}`} 
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
          <FaUser size={14} />
          <div className="node-title">{data.label || 'Human Task'}</div>
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
        
        {data.assignee && (
          <div className="node-assignee">
            <strong>Assignee:</strong> {data.assignee}
          </div>
        )}
        
        {data.timeoutMinutes && (
          <div className="node-timeout">
            <strong>Timeout:</strong> {data.timeoutMinutes} min
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

export default HumanTaskNode;
