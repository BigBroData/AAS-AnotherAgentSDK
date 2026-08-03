import React from 'react';
import { useGraphStore } from '../store/graphStore';
import { NodeType } from '../types';

const nodeTypes: { type: NodeType; label: string; color: string }[] = [
  { type: 'input', label: 'Input', color: '#4ade80' },
  { type: 'llm', label: 'LLM Layer', color: '#60a5fa' },
  { type: 'condition', label: 'Condition', color: '#fbbf24' },
  { type: 'tool', label: 'Tool', color: '#c084fc' },
  { type: 'output', label: 'Output', color: '#f87171' },
];

export const NodePanel: React.FC = () => {
  const addNode = useGraphStore((state) => state.addNode);

  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div style={{
      width: '200px',
      padding: '10px',
      background: '#fff',
      borderRight: '1px solid #eee',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    }}>
      <h3 style={{ fontSize: '14px', marginBottom: '10px' }}>Nodes</h3>
      {nodeTypes.map((node) => (
        <div
          key={node.type}
          draggable
          onDragStart={(e) => onDragStart(e, node.type)}
          style={{
            padding: '10px',
            borderRadius: '4px',
            background: node.color,
            color: '#fff',
            cursor: 'grab',
            fontSize: '12px',
            textAlign: 'center',
            fontWeight: 500,
          }}
        >
          {node.label}
        </div>
      ))}
      <div style={{ marginTop: '20px', fontSize: '11px', color: '#666' }}>
        <p>Drag nodes to the canvas</p>
      </div>
    </div>
  );
};
