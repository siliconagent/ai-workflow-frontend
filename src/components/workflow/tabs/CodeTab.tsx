import React, { useState, useEffect } from 'react';
import { FaCode, FaCopy, FaCheck, FaFileExport, FaCodeBranch } from 'react-icons/fa';
import { Workflow } from '../../../types/workflow.types';

interface CodeTabProps {
  workflow: Workflow;
}

const CodeTab: React.FC<CodeTabProps> = ({ workflow }) => {
  const [formatType, setFormatType] = useState<'json' | 'yaml'>('json');
  const [showCopyConfirmation, setShowCopyConfirmation] = useState(false);
  const [code, setCode] = useState('');
  
  useEffect(() => {
    // Generate code based on the selected format type
    if (formatType === 'json') {
      // Format with indentation for readability
      setCode(JSON.stringify(workflow, null, 2));
    } else {
      // Convert to YAML
      setCode(convertToYaml(workflow));
    }
  }, [workflow, formatType]);
  
  const convertToYaml = (obj: any): string => {
    // For the demo, we'll implement a simple JSON-to-YAML conversion
    // In a real app, you'd use a library like js-yaml
    
    const indentLevel = (level: number): string => {
      return '  '.repeat(level);
    };
    
    const processValue = (value: any, level: number): string => {
      if (value === null || value === undefined) {
        return 'null';
      }
      
      if (typeof value === 'string') {
        // If string contains special characters, wrap in quotes
        if (value.match(/[:#\[\]{},"'&*?|<>=!%@`]/)) {
          return `"${value.replace(/"/g, '\\"')}"`;
        }
        return value;
      }
      
      if (typeof value === 'number' || typeof value === 'boolean') {
        return value.toString();
      }
      
      if (Array.isArray(value)) {
        if (value.length === 0) return '[]';
        
        return value.map(item => {
          if (typeof item === 'object' && item !== null) {
            return `${indentLevel(level)}- ${processObject(item, level + 1).trimStart()}`;
          }
          return `${indentLevel(level)}- ${processValue(item, level + 1)}`;
        }).join('\n');
      }
      
      if (typeof value === 'object') {
        return `\n${processObject(value, level + 1)}`;
      }
      
      return String(value);
    };
    
    const processObject = (obj: Record<string, any>, level: number): string => {
      if (Object.keys(obj).length === 0) return '{}';
      
      return Object.entries(obj).map(([key, value]) => {
        return `${indentLevel(level - 1)}${key}: ${processValue(value, level)}`;
      }).join('\n');
    };
    
    return processObject(obj, 1);
  };
  
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(code).then(() => {
      setShowCopyConfirmation(true);
      setTimeout(() => setShowCopyConfirmation(false), 2000);
    });
  };
  
  const handleExport = () => {
    // Create a blob and download it
    const blob = new Blob([code], { type: formatType === 'json' ? 'application/json' : 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-${workflow.id}.${formatType}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border flex justify-between">
        <h2 className="text-lg font-semibold flex items-center">
          <FaCode className="mr-2 text-primary" />
          Workflow Code
        </h2>
        
        <div className="flex items-center">
          <div className="mr-4">
            <span className="text-sm mr-2">Format:</span>
            <select
              value={formatType}
              onChange={(e) => setFormatType(e.target.value as 'json' | 'yaml')}
              className="px-2 py-1 border border-border rounded-md bg-background"
            >
              <option value="json">JSON</option>
              <option value="yaml">YAML</option>
            </select>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleCopyToClipboard}
              className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md flex items-center"
              title="Copy to Clipboard"
            >
              {showCopyConfirmation ? (
                <>
                  <FaCheck className="mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <FaCopy className="mr-1" />
                  Copy
                </>
              )}
            </button>
            
            <button
              onClick={handleExport}
              className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md flex items-center"
              title="Export"
            >
              <FaFileExport className="mr-1" />
              Export
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex-grow overflow-auto p-4 bg-secondary/10">
        <div className="bg-card h-full border border-border rounded-md overflow-hidden">
          <div className="p-2 border-b border-border bg-secondary/30 flex items-center">
            <FaCodeBranch className="mr-2 text-muted-foreground" />
            <span className="text-sm">{formatType === 'json' ? 'workflow.json' : 'workflow.yaml'}</span>
          </div>
          <pre className="p-4 overflow-auto h-[calc(100%-36px)] text-sm font-mono">
            {code}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default CodeTab;
