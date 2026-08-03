import React from 'react';
import { useGraphStore } from '../store/graphStore';

export const SimulationPanel: React.FC = () => {
  const { simulationTrace, simulationRunning } = useGraphStore();

  if (simulationTrace.length === 0 && !simulationRunning) {
    return null;
  }

  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      right: '20px',
      width: '350px',
      maxHeight: '300px',
      background: '#fff',
      border: '1px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      zIndex: 1000,
    }}>
      <div style={{
        padding: '10px 15px',
        background: '#f8fafc',
        borderBottom: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h3 style={{ fontSize: '13px', fontWeight: 600 }}>Simulation Trace</h3>
        {simulationRunning && (
          <span style={{ 
            fontSize: '11px', 
            color: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <span style={{ 
              width: '8px', 
              height: '8px', 
              background: '#3b82f6', 
              borderRadius: '50%',
              animation: 'pulse 1s infinite'
            }} />
            Running...
          </span>
        )}
      </div>
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '10px',
      }}>
        {simulationTrace.map((trace: any, index: number) => (
          <div
            key={index}
            style={{
              padding: '8px',
              marginBottom: '8px',
              background: index === simulationTrace.length - 1 ? '#eff6ff' : '#f8fafc',
              border: index === simulationTrace.length - 1 ? '1px solid #3b82f6' : '1px solid #eee',
              borderRadius: '4px',
              fontSize: '11px',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: '4px', color: '#1e293b' }}>
              Step {index + 1}: Node {trace.nodeId}
            </div>
            {trace.inputData && (
              <div style={{ color: '#64748b', marginBottom: '4px' }}>
                Input: {JSON.stringify(trace.inputData).slice(0, 100)}...
              </div>
            )}
            {trace.outputData && (
              <div style={{ color: '#059669' }}>
                Output: {JSON.stringify(trace.outputData).slice(0, 100)}...
              </div>
            )}
          </div>
        ))}
        {simulationTrace.length === 0 && simulationRunning && (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
            Starting simulation...
          </div>
        )}
      </div>
    </div>
  );
};
