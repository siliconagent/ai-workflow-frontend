import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FaEnvelope, FaPencilAlt, FaTrash } from 'react-icons/fa';
import { NodeStatus } from '../../../../types/workflow.types';

interface MailNodeData {
  label: string;
  description?: string;
  status?: NodeStatus;
  to?: string[];
  cc?: string[];
  bcc?: string[];
  subject?: string;
  templateId?: string;
  templateName?: string;
  attachments?: string[];
  onEdit?: (nodeId: string) => void;
  onDelete?: (nodeId: string) => void;
}

const MailNode: React.FC<NodeProps<MailNodeData>> = ({ id, data, selected }) => {
  const status = data.status || NodeStatus.IDLE;
  
  // Determine node status color
  const getStatusColor = () => {
    switch (status) {
      case NodeStatus.RUNNING: return '#3b82f6'; // blue
      case NodeStatus.COMPLETED: return '#10b981'; // green
      case NodeStatus.ERROR: return '#ef4444'; // red
      case NodeStatus.SKIPPED: return '#6b7280'; // gray
      default: return '#8b5cf6'; // default purple for mail
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

  // Format recipient list for display
  const formatRecipients = (recipients?: string[]) => {
    if (!recipients || recipients.length === 0) return null;
    if (recipients.length === 1) return recipients[0];
    if (recipients.length === 2) return recipients.join(', ');
    return `${recipients[0]}, ${recipients[1]}, +${recipients.length - 2} more`;
  };

  return (
    <div 
      className={`node mail-task ${selected ? 'selected' : ''}`} 
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
          <FaEnvelope size={14} />
          <div className="node-title">{data.label || 'Mail Task'}</div>
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
        
        {data.subject && (
          <div className="node-subject text-sm">
            <strong>Subject:</strong> {data.subject}
          </div>
        )}
        
        {data.to && data.to.length > 0 && (
          <div className="node-recipients text-sm">
            <strong>To:</strong> {formatRecipients(data.to)}
          </div>
        )}
        
        {data.templateName && (
          <div className="node-template text-sm">
            <strong>Template:</strong> {data.templateName}
          </div>
        )}
        
        {data.attachments && data.attachments.length > 0 && (
          <div className="node-attachments text-sm">
            <strong>Attachments:</strong> {data.attachments.length}
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

export default MailNode;
