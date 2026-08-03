import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useGraphStore } from './store/graphStore';
import { NodePanel } from './components/NodePanel';
import { PropertyPanel } from './components/PropertyPanel';
import { Toolbar } from './components/Toolbar';
import { SimulationPanel } from './components/SimulationPanel';
import { NodeData } from './types';
import axios from 'axios';

const App: React.FC = () => {
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect, 
    setSelectedNode,
    setSimulationRunning,
    setSimulationTrace,
    loadGraph,
    exportGraph
  } = useGraphStore();

  const [simulationInput, setSimulationInput] = useState('');

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node<NodeData>) => {
      setSelectedNode(node);
    },
    [setSelectedNode]
  );

  const handleSimulate = async () => {
    const input = prompt('Enter simulation input:', 'Hello, help me with a task');
    if (!input) return;

    setSimulationRunning(true);
    setSimulationTrace([]);

    try {
      const graph = exportGraph();
      const response = await axios.post('/api/graphs/simulate', {
        graph,
        initialState: {
          input,
          context: {},
        },
      });

      if (response.data.success) {
        setSimulationTrace(response.data.trace || []);
      } else {
        alert('Simulation failed: ' + response.data.error);
      }
    } catch (error: any) {
      console.error('Simulation error:', error);
      alert('Simulation error: ' + (error.response?.data?.message || error.message));
    } finally {
      setSimulationRunning(false);
    }
  };

  const handleSave = async () => {
    try {
      const graph = exportGraph();
      const response = await axios.post('/api/graphs', graph);
      alert('Graph saved successfully! ID: ' + response.data.id);
    } catch (error: any) {
      console.error('Save error:', error);
      alert('Save error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleLoad = async () => {
    try {
      const response = await axios.get('/api/graphs');
      const graphs = response.data;
      
      if (graphs.length === 0) {
        alert('No graphs found in backend');
        return;
      }

      const graphId = prompt(
        `Available graphs:\n${graphs.map((g: any) => `- ${g.id}: ${g.name || 'Unnamed'}`).join('\n')}\n\nEnter graph ID to load:`
      );

      if (graphId) {
        const graphResponse = await axios.get(`/api/graphs/${graphId}`);
        loadGraph(graphResponse.data);
      }
    } catch (error: any) {
      console.error('Load error:', error);
      alert('Load error: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Toolbar
        onSimulate={handleSimulate}
        onSave={handleSave}
        onLoad={handleLoad}
        simulationRunning={false}
      />
      
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <NodePanel />
        
        <div style={{ flex: 1, position: 'relative' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            fitView
            snapToGrid
            snapGrid={[15, 15]}
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: true,
              style: { stroke: '#64748b', strokeWidth: 2 },
            }}
          >
            <Controls />
            <Background color="#aaa" gap={15} />
          </ReactFlow>
          
          <SimulationPanel />
        </div>
        
        <PropertyPanel />
      </div>
    </div>
  );
};

export default App;
