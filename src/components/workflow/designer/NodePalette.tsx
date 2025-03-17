import React, { useState } from 'react';
import { FaUser, FaCogs, FaRobot, FaServer, FaDatabase, FaEnvelope, FaCodeBranch, FaNetworkWired, FaSearch, FaCaretDown, FaCaretRight, FaGlobe } from 'react-icons/fa';
import { NodeType } from '../../../types/workflow.types';

interface NodeTypeInfo {
  type: NodeType;
  label: string;
  description: string;
  icon: React.ReactNode;
  defaultData: {
    label: string;
    description?: string;
    [key: string]: any;
  };
}

interface CategoryInfo {
  name: string;
  nodes: NodeTypeInfo[];
}

const nodeTypes: NodeTypeInfo[] = [
  {
    type: NodeType.START,
    label: 'Start',
    description: 'Starting point of the workflow',
    icon: <FaCaretRight className="text-green-500" />,
    defaultData: {
      label: 'Start',
      description: 'Workflow starts here',
      type: NodeType.START
    }
  },
  {
    type: NodeType.END,
    label: 'End',
    description: 'End point of the workflow',
    icon: <FaCaretDown className="text-red-500" />,
    defaultData: {
      label: 'End',
      description: 'Workflow ends here',
      type: NodeType.END
    }
  },
  {
    type: NodeType.HUMAN,
    label: 'Human Task',
    description: 'Task requiring human intervention',
    icon: <FaUser className="text-blue-500" />,
    defaultData: {
      label: 'Human Task',
      description: 'Task requires human input',
      type: NodeType.HUMAN
    }
  },
  {
    type: NodeType.SYSTEM,
    label: 'System Task',
    description: 'Automated system operation',
    icon: <FaCogs className="text-purple-500" />,
    defaultData: {
      label: 'System Task',
      description: 'Automated system operation',
      type: NodeType.SYSTEM
    }
  },
  {
    type: NodeType.AI,
    label: 'AI Task',
    description: 'AI-powered decision or action',
    icon: <FaRobot className="text-indigo-500" />,
    defaultData: {
      label: 'AI Task',
      description: 'AI-powered decision or action',
      type: NodeType.AI
    }
  },
  {
    type: NodeType.DECISION,
    label: 'Decision',
    description: 'Conditional branching point',
    icon: <FaCodeBranch className="text-amber-500" />,
    defaultData: {
      label: 'Decision',
      description: 'Conditional branching point',
      type: NodeType.DECISION
    }
  },
  {
    type: NodeType.DB,
    label: 'Database',
    description: 'Database operation or query',
    icon: <FaDatabase className="text-green-500" />,
    defaultData: {
      label: 'Database',
      description: 'Database operation or query',
      type: NodeType.DB
    }
  },
  {
    type: NodeType.MAIL,
    label: 'Email',
    description: 'Send email notification',
    icon: <FaEnvelope className="text-yellow-500" />,
    defaultData: {
      label: 'Email',
      description: 'Send email notification',
      type: NodeType.MAIL
    }
  },
  {
    type: NodeType.REST,
    label: 'REST API Task',
    description: 'HTTP API requests and integrations',
    icon: <FaGlobe className="text-sky-500" />,
    defaultData: {
        label: 'Rest',
        description: 'HTTP API requests and integrations',
        type: NodeType.REST
    }
  },  
  {
    type: NodeType.AGENT,
    label: 'Agent',
    description: 'Integration with external agent',
    icon: <FaNetworkWired className="text-teal-500" />,
    defaultData: {
      label: 'Agent',
      description: 'Integration with external agent',
      type: NodeType.AGENT
    }
  }
];

// Group nodes by category
const categories: CategoryInfo[] = [
  {
    name: 'Flow Control',
    nodes: nodeTypes.filter(node => 
      [NodeType.START, NodeType.END, NodeType.DECISION].includes(node.type)
    )
  },
  {
    name: 'Human & AI',
    nodes: nodeTypes.filter(node => 
      [NodeType.HUMAN, NodeType.AI].includes(node.type)
    )
  },
  {
    name: 'System',
    nodes: nodeTypes.filter(node => 
      [NodeType.SYSTEM, NodeType.DB, NodeType.MAIL, NodeType.AGENT].includes(node.type)
    )
  }
];

const NodePalette: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
    categories.reduce((acc, category) => {
      acc[category.name] = true; // All expanded by default
      return acc;
    }, {} as Record<string, boolean>)
  );

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: NodeType, nodeData: any) => {
    event.dataTransfer.setData('application/reactflow/type', nodeType);
    event.dataTransfer.setData('application/reactflow/data', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };

  // Filter nodes based on search term
  const filteredCategories = categories.map(category => ({
    ...category,
    nodes: category.nodes.filter(node => 
      node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.nodes.length > 0);

  return (
    <div className="node-palette bg-card border-r border-border w-64 h-full flex flex-col">
      <div className="palette-header p-3 border-b border-border">
        <div className="relative">
          <FaSearch className="absolute left-3 top-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 p-2 w-full bg-background border border-border rounded-md"
          />
        </div>
      </div>
      
      <div className="palette-content overflow-y-auto flex-grow p-3 space-y-4">
        {filteredCategories.map((category) => (
          <div key={category.name} className="category">
            <div 
              className="flex items-center justify-between py-2 cursor-pointer"
              onClick={() => toggleCategory(category.name)}
            >
              <h3 className="font-medium">{category.name}</h3>
              {expandedCategories[category.name] ? <FaCaretDown /> : <FaCaretRight />}
            </div>
            
            {expandedCategories[category.name] && (
              <div className="grid grid-cols-1 gap-2 mt-2">
                {category.nodes.map((node) => (
                  <div
                    key={node.type}
                    className="node-item border border-border rounded-md p-3 hover:border-primary cursor-grab bg-background"
                    draggable
                    onDragStart={(e) => handleDragStart(e, node.type, node.defaultData)}
                  >
                    <div className="flex items-center mb-1">
                      <div className="node-icon p-1.5 rounded-md bg-secondary/40 mr-2">
                        {node.icon}
                      </div>
                      <span className="font-medium">{node.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {node.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {filteredCategories.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            No nodes match your search
          </div>
        )}
      </div>
    </div>
  );
};

export default NodePalette;
