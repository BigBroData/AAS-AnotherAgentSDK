import { useCallback } from 'react';
import { useGraphStore } from '../store/graphStore';
import type { Node } from '@vaa/domain';

interface PropertiesPanelProps {
  nodeId: string | null;
}

export default function PropertiesPanel({ nodeId }: PropertiesPanelProps) {
  const { currentGraph, updateNode } = useGraphStore();
  
  const node = currentGraph?.nodes.find((n) => n.id === nodeId);

  const updateNodeData = useCallback(
    (field: string, value: any) => {
      if (!node) return;
      updateNode(nodeId!, {
        data: {
          ...node.data,
          [field]: value,
        },
      });
    },
    [node, nodeId, updateNode]
  );

  const updateNestedData = useCallback(
    (parentField: string, nestedField: string, value: any) => {
      if (!node) return;
      updateNode(nodeId!, {
        data: {
          ...node.data,
          [parentField]: {
            ...(node.data as any)[parentField],
            [nestedField]: value,
          },
        },
      });
    },
    [node, nodeId, updateNode]
  );

  if (!node) {
    return (
      <div className="w-80 bg-white border-l p-4">
        <p className="text-gray-500 text-sm">Select a node to edit its properties</p>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l overflow-y-auto">
      <div className="p-4 border-b">
        <h3 className="font-bold text-gray-800">{node.data.label}</h3>
        <p className="text-xs text-gray-500 uppercase">{node.type} Node</p>
        <p className="text-xs text-gray-400 font-mono mt-1">{node.id}</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Label */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
          <input
            type="text"
            value={node.data.label}
            onChange={(e) => updateNodeData('label', e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* LLM-specific fields */}
        {node.type === 'llm' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <select
                value={node.data.model || ''}
                onChange={(e) => updateNodeData('model', e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select model</option>
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                <option value="claude-3-opus">Claude 3 Opus</option>
                <option value="ollama/llama3">Ollama - Llama 3</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">System Prompt</label>
              <textarea
                value={node.data.systemPrompt || ''}
                onChange={(e) => updateNodeData('systemPrompt', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="You are a helpful assistant..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User Prompt Template</label>
              <textarea
                value={node.data.prompt || ''}
                onChange={(e) => updateNodeData('prompt', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Use {{variable}} for dynamic content"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Temperature</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  value={node.data.parameters?.temperature || 0.7}
                  onChange={(e) =>
                    updateNestedData('parameters', 'temperature', parseFloat(e.target.value))
                  }
                  className="w-full px-2 py-1 border rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Max Tokens</label>
                <input
                  type="number"
                  value={node.data.parameters?.maxTokens || 1024}
                  onChange={(e) =>
                    updateNestedData('parameters', 'maxTokens', parseInt(e.target.value))
                  }
                  className="w-full px-2 py-1 border rounded-md text-sm"
                />
              </div>
            </div>
          </>
        )}

        {/* Condition-specific fields */}
        {node.type === 'condition' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Condition Logic (JS Expression)
            </label>
            <textarea
              value={node.data.conditionLogic || ''}
              onChange={(e) => updateNodeData('conditionLogic', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border rounded-md text-sm font-mono bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="state.context.confidence < 0.8"
            />
            <p className="text-xs text-gray-500 mt-1">
              Available variables: <code className="bg-gray-100 px-1">state</code>,{' '}
              <code className="bg-gray-100 px-1">output</code>
            </p>
          </div>
        )}

        {/* Tool-specific fields */}
        {node.type === 'tool' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tool Name</label>
              <input
                type="text"
                value={node.data.toolConfig?.name || ''}
                onChange={(e) =>
                  updateNestedData('toolConfig', 'name', e.target.value)
                }
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., webSearch, calculator"
              />
            </div>
          </>
        )}

        {/* Input/Output nodes info */}
        {(node.type === 'input' || node.type === 'output') && (
          <div className="p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              {node.type === 'input'
                ? '📥 Entry point for the graph execution'
                : '📤 Exit point where the result is returned'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
