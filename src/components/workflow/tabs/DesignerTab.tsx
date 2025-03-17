import React, { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge
} from 'reactflow';
import 'reactflow/dist/style.css';
import useWorkflowStore from '../../../store/workflowStore';
import { Workflow, WorkflowNode, WorkflowEdge } from '../../../types/workflow.types';
import NodePalette from '../designer/NodePalette';

// This will be implemented later with custom nodes
const nodeTypes = {};

interface DesignerTabProps {
  workflow?: Workflow;
}

const DesignerTab: React.FC<DesignerTabProps> = ({ workflow }) => {
  // Convert workflow nodes and edges to ReactFlow format if workflow exists
  const initialNodes: Node[] = workflow?.nodes.map(node => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: node.data
  })) || [];
  
  const initialEdges: Edge[] = workflow?.edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle ?? undefined,
    targetHandle: edge.targetHandle ?? undefined,
    data: edge.data
  })) || [];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const { updateWorkflow } = useWorkflowStore();

  const onConnect = useCallback(
    (connection: Connection) => {
      // Create a unique ID for the new edge
      const edgeId = `e${connection.source}-${connection.target}`;
      setEdges(eds => addEdge({ ...connection, id: edgeId }, eds));
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      // Get node data from drag event
      const nodeType = event.dataTransfer.getData('application/reactflow/type');
      const nodeData = event.dataTransfer.getData('application/reactflow/data');

      if (!nodeType || !nodeData) {
        return;
      }

      // Parse the node data
      const data = JSON.parse(nodeData);

      // Get the position from the drop coordinates
      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top
      };

      // Create a new node
      const newNode: Node = {
        id: `node_${Date.now()}`,
        type: nodeType,
        position,
        data
      };

      // Add the new node to the canvas
      setNodes(nds => [...nds, newNode]);
    },
    [setNodes]
  );

  const handleSave = useCallback(() => {
    if (!workflow) return;
    
    // Convert ReactFlow nodes and edges back to workflow format
    const workflowNodes: WorkflowNode[] = nodes.map(node => ({
      id: node.id,
      type: node.type as any,
      position: node.position,
      data: node.data
    }));
    
    const workflowEdges: WorkflowEdge[] = edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle ?? undefined,
      targetHandle: edge.targetHandle ?? undefined,
      data: edge.data
    }));
    
    // Update the workflow
    updateWorkflow(workflow.id, {
      nodes: workflowNodes,
      edges: workflowEdges
    });
  }, [nodes, edges, workflow, updateWorkflow]);

  if (!workflow) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No workflow selected</p>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      <NodePalette />
      
      <div className="flex-grow h-full" onDragOver={onDragOver} onDrop={onDrop}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap 
            nodeStrokeWidth={3}
            zoomable
            pannable
          />
          <Panel position="top-right">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Save Workflow
            </button>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
};

export default DesignerTab;
