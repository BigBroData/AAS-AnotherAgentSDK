import React from 'react';
import { useGraphStore } from '../store/graphStore';

interface ToolbarProps {
  onSimulate: () => void;
  onSave: () => void;
  onLoad: () => void;
  simulationRunning: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onSimulate,
  onSave,
  onLoad,
  simulationRunning,
}) => {
  const exportGraph = useGraphStore((state) => state.exportGraph);
  const clearGraph = useGraphStore((state) => state.clearGraph);

  const handleExport = () => {
    const graph = exportGraph();
    const dataStr = JSON.stringify(graph, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'agent-graph.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      height: '50px',
      background: '#fff',
      borderBottom: '1px solid #eee',
      display: 'flex',
      alignItems: 'center',
      padding: '0 15px',
      gap: '10px',
    }}>
      <h1 style={{ fontSize: '16px', fontWeight: 600, marginRight: '20px' }}>
        🤖 Agent Graph Editor
      </h1>
      
      <button
        onClick={onSimulate}
        disabled={simulationRunning}
        style={{
          padding: '8px 16px',
          background: simulationRunning ? '#ccc' : '#3b82f6',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: simulationRunning ? 'not-allowed' : 'pointer',
          fontSize: '12px',
          fontWeight: 500,
        }}
      >
        {simulationRunning ? 'Running...' : '▶ Simulate'}
      </button>

      <button
        onClick={onSave}
        style={{
          padding: '8px 16px',
          background: '#10b981',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 500,
        }}
      >
        💾 Save to Backend
      </button>

      <button
        onClick={onLoad}
        style={{
          padding: '8px 16px',
          background: '#8b5cf6',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 500,
        }}
      >
        📂 Load from Backend
      </button>

      <button
        onClick={handleExport}
        style={{
          padding: '8px 16px',
          background: '#f59e0b',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 500,
        }}
      >
        📥 Export JSON
      </button>

      <button
        onClick={clearGraph}
        style={{
          padding: '8px 16px',
          background: '#ef4444',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 500,
        }}
      >
        🗑 Clear
      </button>
    </div>
  );
};
