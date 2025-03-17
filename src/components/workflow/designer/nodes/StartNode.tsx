import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FaPlay, FaStop, FaPencilAlt, FaTrash } from 'react-icons/fa';
import { NodeStatus, NodeType } from '../../../../types/workflow.types';

interface StartEndNodeData {
  label?: string;
  status?: NodeStatus;
  onEdit?: (nodeId: string) => void;
  onDelete?: (nodeId: string) => void;
}

export const StartNode: React.FC<NodeProps<StartEndNodeData>> = ({ id, data, selected }) => {
  const status = data.status || NodeStatus.IDLE;
  
  // Determine node status color
  const getStatusColor = () => {
    switch (status) {
      case NodeStatus.RUNNING: return '#3b82f6'; // blue
      case NodeStatus.COMPLETED: return '#10b981'; // green
      case NodeStatus.ERROR: return '#ef4444'; // red
      default: return '#06b6d4'; // default cyan for start node
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
      className={`node start ${selected ? 'selected' : ''}`} 
      style={{ borderColor: getStatusColor() }}
    >
      <div className="node-header">
        <div className="flex items-center gap-2">
          <FaPlay size={14} />
          <div className="node-title">{data.label || 'Start'}</div>
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
