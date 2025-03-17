import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FaDatabase, FaPencilAlt, FaTrash } from 'react-icons/fa';
import { NodeStatus } from '../../../../types/workflow.types';

interface DBNodeData {
  label: string;
  description?: string;
  status?: NodeStatus;
  connectionName?: string;
  databaseType?: 'MYSQL' | 'POSTGRES' | 'ORACLE' | 'MSSQL' | 'MONGODB' | string;
  operation?: 'QUERY' | 'UPDATE' | 'INSERT' | 'DELETE' | 'PROCEDURE' | string;
  query?: string;
  parameters?: Record<string, any>;
  timeout?: number;
  maxRows?: number;
  onEdit?: (nodeId: string) => void;
  onDelete?: (nodeId: string) => void;
}

const DBNode: React.FC<NodeProps<DBNodeData>> = ({ id, data, selected }) => {
  const status = data.status || NodeStatus.IDLE;
  
  // Determine node status color
  const getStatusColor = () => {
    switch (status) {
      case NodeStatus.RUNNING: return '#3b82f6'; // blue
      case NodeStatus.COMPLETED: return '#10b981'; // green
      case NodeStatus.ERROR: return '#ef4444'; // red
      case NodeStatus.SKIPPED: return '#6b7280'; // gray
      default: return '#2563eb'; // default deeper blue for database
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

  // Truncate query for display
  const getShortQuery = () => {
    if (!data.query) return null;
    if (data.query.length <= 30) return data.query;
    return data.query.substring(0, 27) + '...';
  };

  return (
    <div 
      className={`node db-task ${selected ? 'selected' : ''}`} 
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
          <FaDatabase size={14} />
          <div className="node-title">{data.label || 'Database Task'}</div>
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
        
        {data.databaseType && (
          <div className="node-db-type text-sm">
            <strong>DB Type:</strong> {data.databaseType}
          </div>
        )}
        
        {data.connectionName && (
          <div className="node-connection text-sm">
            <strong>Connection:</strong> {data.connectionName}
          </div>
        )}
        
        {data.operation && (
          <div className="node-operation text-sm">
            <strong>Operation:</strong> {data.operation}
          </div>
        )}
        
        {data.query && (
          <div className="node-query text-xs text-gray-500 mt-1">
            {getShortQuery()}
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

export default DBNode;
