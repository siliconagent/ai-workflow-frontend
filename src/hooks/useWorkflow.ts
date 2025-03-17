import { useState, useEffect, useCallback } from 'react';
import useWorkflowStore from '../store/workflowStore';
import { Workflow, WorkflowNode, WorkflowEdge, NodeType, WorkflowStatus } from '../types/workflow.types';
import { nanoid } from 'nanoid';

// Define a Position interface if not already in workflow.types.ts
interface Position {
    x: number;
    y: number;
  }
  
export const useWorkflow = (workflowId?: string) => {
  const {
    workflows,
    currentWorkflow,
    fetchWorkflows,
    fetchWorkflow,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    addNode,
    updateNode,
    removeNode,
    addEdge,
    updateEdge,
    removeEdge,
    setCurrentWorkflow
  } = useWorkflowStore();

  const [isSaving, setIsSaving] = useState(false);

  // Load workflow if ID is provided
  useEffect(() => {
    if (workflowId) {
      fetchWorkflow(workflowId);
    }
  }, [workflowId, fetchWorkflow]);

  
    // Add a node to the current workflow
    const addNodeToWorkflow = useCallback((nodeData: {
        type: string,
        position: Position,
        data: Record<string, any>
      }) => {
        if (!currentWorkflow) {
          console.error('No workflow selected');
          return;
        }
    
        // Generate a unique node ID
        const nodeId = `node_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        
        // Create the new node
        const newNode: WorkflowNode = {
          id: nodeId,
          type: nodeData.type as NodeType,
          position: nodeData.position,
          data: {
            ...nodeData.data,
            label: nodeData.data.label || `${nodeData.type.charAt(0).toUpperCase() + nodeData.type.slice(1)} Node`,
            type: nodeData.type as NodeType
          }
        };
        
        // Add the node to the workflow
        addNode(newNode);
        
        return nodeId;
      }, [currentWorkflow, addNode]);

  // Create a new node in the workflow
  const createNode = useCallback((
    type: NodeType,
    position: { x: number, y: number },
    data: any = {}
  ): WorkflowNode => {
    const nodeId = `node-${nanoid(6)}`;
    const newNode: WorkflowNode = {
      id: nodeId,
      type,
      position,
      data: {
        ...data,
        label: data.label || `New ${type} Node`,
      }
    };
    
    addNode(newNode);
    return newNode;
  }, [addNode]);

  // Create a connection between nodes
  const connectNodes = useCallback((
    sourceId: string,
    targetId: string,
    data: any = {}
  ): WorkflowEdge => {
    const edgeId = `edge-${nanoid(6)}`;
    const newEdge: WorkflowEdge = {
      id: edgeId,
      source: sourceId,
      target: targetId,
      data
    };
    
    addEdge(newEdge);
    return newEdge;
  }, [addEdge]);

  // Save the current workflow
  const saveWorkflow = useCallback(async (workflowData?: Partial<Workflow>) => {
    if (!currentWorkflow) return null;
    
    setIsSaving(true);
    try {
      let savedWorkflow;
      
      const workflowToSave = {
        ...currentWorkflow,
        ...workflowData
      };
      
      if (currentWorkflow.id) {
        savedWorkflow = await updateWorkflow(currentWorkflow.id, workflowToSave);
      } else {
        savedWorkflow = await createWorkflow(workflowToSave);
      }
      
      setCurrentWorkflow(savedWorkflow);
      return savedWorkflow;
    } catch (error) {
      console.error('Error saving workflow:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [currentWorkflow, updateWorkflow, createWorkflow, setCurrentWorkflow]);

  // Create a new workflow
  const createNewWorkflow = useCallback(async (name: string, description: string = '') => {
    const newWorkflow: Partial<Workflow> = {
      name,
      description,
      nodes: [],
      edges: [],
      version: 1,
      status: WorkflowStatus.DRAFT
    };
    
    try {
      const createdWorkflow = await createWorkflow(newWorkflow);
      setCurrentWorkflow(createdWorkflow);
      return createdWorkflow;
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw error;
    }
  }, [createWorkflow, setCurrentWorkflow]);

  // Duplicate an existing workflow
  const duplicateWorkflow = useCallback(async (workflowToCopy: Workflow, newName: string) => {
    const duplicatedWorkflow: Partial<Workflow> = {
      name: newName,
      description: `Copy of ${workflowToCopy.name}`,
      nodes: JSON.parse(JSON.stringify(workflowToCopy.nodes)),
      edges: JSON.parse(JSON.stringify(workflowToCopy.edges)),
      version: 1,
      status: WorkflowStatus.DRAFT
    };
    
    try {
      const createdWorkflow = await createWorkflow(duplicatedWorkflow);
      return createdWorkflow;
    } catch (error) {
      console.error('Error duplicating workflow:', error);
      throw error;
    }
  }, [createWorkflow]);

  // Validate workflow
  const validateWorkflow = useCallback((workflow: Workflow): {isValid: boolean, errors: string[]} => {
    const errors: string[] = [];
    
    // Check if workflow has a name
    if (!workflow.name || workflow.name.trim() === '') {
      errors.push('Workflow must have a name');
    }
    
    // Check if workflow has at least one node
    if (!workflow.nodes || workflow.nodes.length === 0) {
      errors.push('Workflow must have at least one node');
    }
    
    // Check for START and END nodes
    const startNodes = workflow.nodes.filter(node => node.type === NodeType.START);
    const endNodes = workflow.nodes.filter(node => node.type === NodeType.END);
    
    if (startNodes.length === 0) {
      errors.push('Workflow must have a START node');
    }
    
    if (startNodes.length > 1) {
      errors.push('Workflow can only have one START node');
    }
    
    if (endNodes.length === 0) {
      errors.push('Workflow must have at least one END node');
    }
    
    // Check for disconnected nodes
    const connectedNodeIds = new Set<string>();
    
    // Add start node to connected nodes
    if (startNodes.length === 1) {
      connectedNodeIds.add(startNodes[0].id);
    }
    
    // Find all nodes reachable from connected nodes
    let prevSize = 0;
    
    // Keep iterating until no more nodes are added
    while (prevSize !== connectedNodeIds.size) {
      prevSize = connectedNodeIds.size;
      
      for (const edge of workflow.edges) {
        if (connectedNodeIds.has(edge.source)) {
          connectedNodeIds.add(edge.target);
        }
      }
    }
    
    // Check for nodes that aren't connected
    for (const node of workflow.nodes) {
      if (!connectedNodeIds.has(node.id) && node.type !== NodeType.START) {
        errors.push(`Node "${node.data?.label || node.id}" is not connected to the workflow`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  return {
    workflows,
    currentWorkflow,
    isSaving,
    fetchWorkflows,
    fetchWorkflow,
    createWorkflow: createNewWorkflow,
    saveWorkflow,
    deleteWorkflow,
    duplicateWorkflow,
    createNode,
    updateNode,
    removeNode,
    connectNodes,
    updateEdge,
    removeEdge,
    validateWorkflow,
    addNodeToWorkflow,
    setCurrentWorkflow
  };
};
