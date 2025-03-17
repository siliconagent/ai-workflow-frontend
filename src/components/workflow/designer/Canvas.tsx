import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Background, 
  Controls,
  MiniMap,
  ReactFlowProvider,
  NodeTypes,
  EdgeTypes,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeChange,
  EdgeChange,
  ConnectionLineType,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';

import { NodeType, WorkflowNode, WorkflowEdge } from '../../../types/workflow.types';
import HumanTaskNode from './nodes/HumanTaskNode';
import SystemTaskNode from './nodes/SystemTaskNode';
import AINode from './nodes/AINode';
import AgentNode from './nodes/AgentNode';
import DBNode from './nodes/DBNode';
import MailNode from './nodes/MailNode';
import RestNode from './nodes/RestNode';
import ConditionNode from './nodes/ConditionNode';
import { StartNode} from './nodes/StartNode';
import { EndNode } from './nodes/EndNode';
import { useWorkflow } from '../../../hooks/useWorkflow';

interface CanvasProps {
  workflowId?: string;
  readOnly?: boolean;
  onNodeSelect?: (nodeId: string) => void;
}

const Canvas: React.FC<CanvasProps> = ({ workflowId, readOnly = false, onNodeSelect }) => {
  const { currentWorkflow, createNode, connectNodes, updateNode, removeNode, removeEdge } = useWorkflow(workflowId);
  
  // State for node selection
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  
  // Convert workflow nodes/edges to ReactFlow format
  const rfNodes: Node[] = useMemo(() => {
    if (!currentWorkflow) return [];
    
    return currentWorkflow.nodes.map(node => ({
      id: node.id,
      type: mapNodeType(node.type),
      position: node.position,
      data: {
        ...node.data,
        onEdit: (nodeId: string) => handleNodeEdit(nodeId),
        onDelete: !readOnly ? (nodeId: string) => handleNodeDelete(nodeId) : undefined
      }
    }));
  }, [currentWorkflow, readOnly]);
  
  const rfEdges: Edge[] = useMemo(() => {
    if (!currentWorkflow) return [];
    
    return currentWorkflow.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'default',
      data: edge.data,
      animated: true
    }));
  }, [currentWorkflow]);
  
  // Set up ReactFlow states
  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);
  
  // Update React Flow when workflow changes
  React.useEffect(() => {
    setNodes(rfNodes);
    setEdges(rfEdges);
  }, [rfNodes, rfEdges, setNodes, setEdges]);
  
  // Map our node types to ReactFlow node types
  const nodeTypes = useMemo<NodeTypes>(() => ({
    humanTask: HumanTaskNode,
    systemTask: SystemTaskNode,
    aiTask: AINode,
    agentTask: AgentNode,
    condition: ConditionNode,
    start: StartNode,
    end: EndNode,
    mail: MailNode,
    db: DBNode,
    rest: RestNode
  }), []);
  
  // Helper to map our NodeType enum to ReactFlow node types
  const mapNodeType = (type: NodeType): string => {
    switch (type) {
      case NodeType.HUMAN: return 'human';
      case NodeType.SYSTEM: return 'system';
      case NodeType.AI: return 'ai';
      case NodeType.AGENT: return 'agent';
      case NodeType.CONDITION: return 'condition';
      case NodeType.START: return 'start';
      case NodeType.DB: return 'db';
      case NodeType.MAIL: return 'mail';
      case NodeType.REST: return 'rest';
      case NodeType.END: return 'end';
      default: return 'default';
    }
  };
  
  // Event Handlers
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    if (readOnly) return;
    
    onNodesChange(changes);
    
    // Handle position changes
    changes.forEach(change => {
      if (change.type === 'position' && change.position && currentWorkflow) {
        const node = currentWorkflow.nodes.find(n => n.id === change.id);
        if (node) {
          updateNode(change.id, { ...node.data });
          node.position = change.position;
          updateNode(change.id, { ...node.data });
        }
      }
    });
  }, [readOnly, onNodesChange, currentWorkflow, updateNode]);
  
  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    if (readOnly) return;
    
    onEdgesChange(changes);
    
    // Handle edge removal
    changes.forEach(change => {
      if (change.type === 'remove') {
        removeEdge(change.id);
      }
    });
  }, [readOnly, onEdgesChange, removeEdge]);
  
  const handleConnect = useCallback((connection: Connection) => {
    if (readOnly) return;
    
    if (connection.source && connection.target) {
      const newEdge = {
        id: `edge-${connection.source}-${connection.target}`,
        source: connection.source,
        target: connection.target,
        data: {
          sourceHandle: connection.sourceHandle,
          targetHandle: connection.targetHandle
        }
      };
      
      setEdges(eds => addEdge(newEdge, eds));
      connectNodes(connection.source, connection.target, {
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle
      });
    }
  }, [readOnly, setEdges, connectNodes]);
  
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id);
    if (onNodeSelect) {
      onNodeSelect(node.id);
    }
  }, [onNodeSelect]);
  
  const handleNodeEdit = useCallback((nodeId: string) => {
    if (onNodeSelect) {
      onNodeSelect(nodeId);
    }
  }, [onNodeSelect]);
  
  const handleNodeDelete = useCallback((nodeId: string) => {
    if (readOnly) return;
    
    removeNode(nodeId);
  }, [readOnly, removeNode]);
  
  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);
  
  // Drop handling for new nodes from palette
  const handleDrop = useCallback((event: React.DragEvent) => {
    if (readOnly) return;
    
    event.preventDefault();
    
    const nodeType = event.dataTransfer.getData('application/reactflow/type') as NodeType;
    if (!nodeType) return;
    
    // Get the canvas bounds
    const reactFlowBounds = event.currentTarget.getBoundingClientRect();
    
    // Get position from drop
    const position = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top
    };
    
    // Create the new node
    createNode(nodeType, position);
  }, [readOnly, createNode]);
  
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div className="canvas-container">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={handleConnect}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          nodeTypes={nodeTypes}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          connectionLineType={ConnectionLineType.SmoothStep}
          connectionLineStyle={{ stroke: '#999' }}
          defaultEdgeOptions={{ type: 'default', animated: true }}
          fitView
          snapToGrid
          snapGrid={[15, 15]}
          nodesDraggable={!readOnly}
          nodesConnectable={!readOnly}
          elementsSelectable={!readOnly}
        >
          <Controls />
          <MiniMap 
            nodeStrokeWidth={3}
            nodeColor={(node) => {
              switch (node.type) {
                case 'humanTask': return '#6366f1';
                case 'systemTask': return '#10b981';
                case 'aiTask': return '#8b5cf6';
                case 'agentTask': return '#f59e0b';
                case 'condition': return '#ef4444';
                case 'start': return '#06b6d4';
                case 'mail': return '#8b5cf6';
                case 'db': return '#2563eb';
                case 'rest': return '#0ea5e9';
                case 'end': return '#64748b';
                default: return '#999';
              }
            }}
          />
          <Background color="#f0f0f0" gap={16} />
          
          <Panel position="top-right" className="p-2 bg-white rounded shadow">
            {readOnly ? (
              <div className="text-sm text-gray-500">View Only Mode</div>
            ) : (
              <div className="text-sm text-gray-500">Drag to connect nodes</div>
            )}
          </Panel>
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export default Canvas;
