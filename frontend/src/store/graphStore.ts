import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import { GraphData, NodeData, NodeType } from '../types';

interface GraphState {
  nodes: Node<NodeData>[];
  edges: Edge[];
  selectedNode: Node<NodeData> | null;
  simulationRunning: boolean;
  simulationTrace: any[];
  
  // Actions
  onNodesChange: OnNodesChange<Node<NodeData>>;
  onEdgesChange: OnEdgesChange<Edge>;
  onConnect: OnConnect;
  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  updateNodeData: (nodeId: string, data: Partial<NodeData>) => void;
  deleteSelectedNode: () => void;
  setSelectedNode: (node: Node<NodeData> | null) => void;
  loadGraph: (graph: GraphData) => void;
  exportGraph: () => GraphData;
  setSimulationRunning: (running: boolean) => void;
  setSimulationTrace: (trace: any[]) => void;
  clearGraph: () => void;
}

const initialNodes: Node<NodeData>[] = [
  {
    id: '1',
    type: 'input',
    position: { x: 100, y: 200 },
    data: { label: 'Input', type: 'input' },
  },
  {
    id: '2',
    type: 'llm',
    position: { x: 400, y: 200 },
    data: { 
      label: 'LLM Layer', 
      type: 'llm',
      prompt: 'You are a helpful assistant.',
      model: 'gpt-3.5-turbo',
      temperature: 0.7
    },
  },
  {
    id: '3',
    type: 'output',
    position: { x: 700, y: 200 },
    data: { label: 'Output', type: 'output' },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', label: '' },
  { id: 'e2-3', source: '2', target: '3', label: '' },
];

export const useGraphStore = create<GraphState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  selectedNode: null,
  simulationRunning: false,
  simulationTrace: [],

  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },

  addNode: (type: NodeType, position) => {
    const newNode: Node<NodeData> = {
      id: `${Date.now()}`,
      type,
      position,
      data: {
        label: `${type.toUpperCase()}`,
        type,
        ...(type === 'llm' ? {
          prompt: 'You are a helpful assistant.',
          model: 'gpt-3.5-turbo',
          temperature: 0.7,
        } : {}),
        ...(type === 'condition' ? {
          condition: 'true',
        } : {}),
      },
    };
    set({ nodes: [...get().nodes, newNode] });
  },

  updateNodeData: (nodeId: string, data: Partial<NodeData>) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } }
          : node
      ),
    });
  },

  deleteSelectedNode: () => {
    const { selectedNode, nodes, edges } = get();
    if (!selectedNode) return;
    
    set({
      nodes: nodes.filter((n) => n.id !== selectedNode.id),
      edges: edges.filter(
        (e) => e.source !== selectedNode.id && e.target !== selectedNode.id
      ),
      selectedNode: null,
    });
  },

  setSelectedNode: (node) => {
    set({ selectedNode: node });
  },

  loadGraph: (graph: GraphData) => {
    set({
      nodes: graph.nodes as Node<NodeData>[],
      edges: graph.edges as Edge[],
    });
  },

  exportGraph: (): GraphData => {
    const { nodes, edges } = get();
    return {
      nodes: nodes as any[],
      edges: edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        condition: (e as any).condition,
      })),
    };
  },

  setSimulationRunning: (running: boolean) => {
    set({ simulationRunning: running });
  },

  setSimulationTrace: (trace: any[]) => {
    set({ simulationTrace: trace });
  },

  clearGraph: () => {
    set({ nodes: [], edges: [], selectedNode: null });
  },
}));
