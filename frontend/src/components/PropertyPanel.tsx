import React from 'react';
import { useGraphStore } from '../store/graphStore';
import { NodeData, NodeType } from '../types';

export const PropertyPanel: React.FC = () => {
  const { selectedNode, updateNodeData, deleteSelectedNode } = useGraphStore();

  if (!selectedNode) {
    return (
      <div style={{
        width: '250px',
        padding: '10px',
        background: '#fff',
        borderLeft: '1px solid #eee',
        fontSize: '12px',
        color: '#666',
      }}>
        <p>Select a node to edit properties</p>
      </div>
    );
  }

  const data = selectedNode.data;

  const handleChange = (field: keyof NodeData, value: any) => {
    updateNodeData(selectedNode.id, { [field]: value });
  };

  return (
    <div style={{
      width: '280px',
      padding: '15px',
      background: '#fff',
      borderLeft: '1px solid #eee',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      overflowY: 'auto',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '14px', margin: 0 }}>Properties</h3>
        <button
          onClick={deleteSelectedNode}
          style={{
            padding: '4px 8px',
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
          }}
        >
          Delete
        </button>
      </div>

      <div>
        <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '4px' }}>
          Label
        </label>
        <input
          type="text"
          value={data.label || ''}
          onChange={(e) => handleChange('label', e.target.value)}
          style={{
            width: '100%',
            padding: '6px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '12px',
          }}
        />
      </div>

      <div>
        <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '4px' }}>
          Type
        </label>
        <select
          value={data.type}
          onChange={(e) => handleChange('type', e.target.value as NodeType)}
          style={{
            width: '100%',
            padding: '6px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '12px',
          }}
        >
          <option value="input">Input</option>
          <option value="llm">LLM Layer</option>
          <option value="condition">Condition</option>
          <option value="tool">Tool</option>
          <option value="output">Output</option>
        </select>
      </div>

      {data.type === 'llm' && (
        <>
          <div>
            <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '4px' }}>
              Model
            </label>
            <input
              type="text"
              value={data.model || 'gpt-3.5-turbo'}
              onChange={(e) => handleChange('model', e.target.value)}
              style={{
                width: '100%',
                padding: '6px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '12px',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '4px' }}>
              Temperature: {data.temperature ?? 0.7}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={data.temperature ?? 0.7}
              onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '4px' }}>
              System Prompt
            </label>
            <textarea
              value={data.prompt || ''}
              onChange={(e) => handleChange('prompt', e.target.value)}
              rows={5}
              style={{
                width: '100%',
                padding: '6px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '12px',
                resize: 'vertical',
              }}
            />
          </div>
        </>
      )}

      {data.type === 'condition' && (
        <div>
          <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '4px' }}>
            Condition Expression
          </label>
          <input
            type="text"
            value={data.condition || 'true'}
            onChange={(e) => handleChange('condition', e.target.value)}
            placeholder="e.g., confidence > 0.8"
            style={{
              width: '100%',
              padding: '6px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '12px',
            }}
          />
        </div>
      )}

      <div style={{ marginTop: 'auto', paddingTop: '20px', fontSize: '10px', color: '#999' }}>
        ID: {selectedNode.id}
      </div>
    </div>
  );
};
