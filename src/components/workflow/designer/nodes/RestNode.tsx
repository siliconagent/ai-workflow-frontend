import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FaGlobe, FaPencilAlt, FaTrash } from 'react-icons/fa';
import { NodeStatus } from '../../../../types/workflow.types';

interface RestNodeData {
  label: string;
  description?: string;
  status?: NodeStatus;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | string;
  url?: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retryCount?: number;
  authentication?: {
    type: 'NONE' | 'BASIC' | 'BEARER' | 'API_KEY' | 'OAUTH2' | string;
    credentials?: any;
  };
  onEdit?: (nodeId: string) => void;
  onDelete?: (nodeId: string) => void;
}

const RestNode: React.FC<NodeProps<RestNodeData>> = ({ id, data, selected }) => {
  const status = data.status || NodeStatus.IDLE;
  
  // Determine node status color
  const getStatusColor = () => {
    switch (status) {
      case NodeStatus.RUNNING: return '#3b82f6'; // blue
      case NodeStatus.COMPLETED: return '#10b981'; // green
      case NodeStatus.ERROR: return '#ef4444'; // red
      case NodeStatus.SKIPPED: return '#6b7280'; // gray
      default: return '#0ea5e9'; // default sky-blue for REST
    }
  };
  
  // Method color
  const getMethodColor = () => {
    switch (data.method) {
      case 'GET': return '#10b981'; // green
      case 'POST': return '#3b82f6'; // blue
      case 'PUT': return '#f59e0b'; // amber
      case 'DELETE': return '#ef4444'; // red
      case 'PATCH': return '#8b5cf6'; // purple
      default: return '#64748b'; // slate
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

  // Truncate URL for display
  const getShortUrl = () => {
    if (!data.url) return null;
    if (data.url.length <= 30) return data.url;
    return data.url.substring(0, 27) + '...';
  };

  return (
    <div 
      className={`node rest-task ${selected ? 'selected' : ''}`} 
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
          <FaGlobe size={14} />
          <div className="node-title">{data.label || 'REST API Task'}</div>
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
        
        <div className="node-method-url flex items-center gap-1 mb-1">
          {data.method && (
            <span 
              className="text-xs font-bold px-2 py-0.5 rounded" 
              style={{ 
                backgroundColor: getMethodColor(),
                color: 'white'
              }}
            >
              {data.method}
            </span>
          )}
          
          {data.url && (
            <span className="text-xs text-gray-600 truncate">
              {getShortUrl()}
            </span>
          )}
        </div>
        
        {data.authentication && data.authentication.type !== 'NONE' && (
          <div className="node-auth text-xs">
            <strong>Auth:</strong> {data.authentication.type}
          </div>
        )}
        
        {data.headers && Object.keys(data.headers).length > 0 && (
          <div className="node-headers text-xs">
            <strong>Headers:</strong> {Object.keys(data.headers).length}
          </div>
        )}
        
        {data.retryCount && data.retryCount > 0 && (
          <div className="node-retry text-xs">
            <strong>Retries:</strong> {data.retryCount}
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

export default RestNode;
