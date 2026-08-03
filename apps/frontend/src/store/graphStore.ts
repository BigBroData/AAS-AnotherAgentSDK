import { create } from 'zustand';
import type { Graph, Node, Edge } from '@vaa/domain';

interface GraphState {
  graphs: Graph[];
  currentGraph: Graph | null;
  selectedNodeId: string | null;
  
  // Actions
  setGraphs: (graphs: Graph[]) => void;
  setCurrentGraph: (graph: Graph | null) => void;
  addNode: (node: Node) => void;
  updateNode: (nodeId: string, data: Partial<Node>) => void;
  removeNode: (nodeId: string) => void;
  addEdge: (edge: Edge) => void;
  removeEdge: (edgeId: string) => void;
  setSelectedNode: (nodeId: string | null) => void;
  saveGraph: () => Promise<void>;
  loadGraphs: () => Promise<void>;
}

export const useGraphStore = create<GraphState>((set, get) => ({
  graphs: [],
  currentGraph: null,
  selectedNodeId: null,

  setGraphs: (graphs) => set({ graphs }),
  
  setCurrentGraph: (graph) => set({ currentGraph: graph }),
  
  addNode: (node) => set((state) => {
    if (!state.currentGraph) return state;
    const updatedGraph = {
      ...state.currentGraph,
      nodes: [...state.currentGraph.nodes, node],
    };
    return { currentGraph: updatedGraph };
  }),
  
  updateNode: (nodeId, data) => set((state) => {
    if (!state.currentGraph) return state;
    const updatedNodes = state.currentGraph.nodes.map((node) =>
      node.id === nodeId ? { ...node, ...data } : node
    );
    return {
      currentGraph: {
        ...state.currentGraph,
        nodes: updatedNodes,
      },
    };
  }),
  
  removeNode: (nodeId) => set((state) => {
    if (!state.currentGraph) return state;
    const updatedNodes = state.currentGraph.nodes.filter((n) => n.id !== nodeId);
    const updatedEdges = state.currentGraph.edges.filter(
      (e) => e.source !== nodeId && e.target !== nodeId
    );
    return {
      currentGraph: {
        ...state.currentGraph,
        nodes: updatedNodes,
        edges: updatedEdges,
      },
      selectedNodeId: null,
    };
  }),
  
  addEdge: (edge) => set((state) => {
    if (!state.currentGraph) return state;
    return {
      currentGraph: {
        ...state.currentGraph,
        edges: [...state.currentGraph.edges, edge],
      },
    };
  }),
  
  removeEdge: (edgeId) => set((state) => {
    if (!state.currentGraph) return state;
    return {
      currentGraph: {
        ...state.currentGraph,
        edges: state.currentGraph.edges.filter((e) => e.id !== edgeId),
      },
    };
  }),
  
  setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),
  
  saveGraph: async () => {
    const { currentGraph } = get();
    if (!currentGraph) return;
    
    try {
      const response = await fetch('/api/graphs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentGraph),
      });
      
      if (!response.ok) throw new Error('Failed to save graph');
      
      const savedGraph = await response.json();
      set((state) => ({
        currentGraph: savedGraph,
        graphs: [...state.graphs.filter(g => g.id !== savedGraph.id), savedGraph],
      }));
    } catch (error) {
      console.error('Error saving graph:', error);
    }
  },
  
  loadGraphs: async () => {
    try {
      const response = await fetch('/api/graphs');
      if (!response.ok) throw new Error('Failed to load graphs');
      const graphs = await response.json();
      set({ graphs });
    } catch (error) {
      console.error('Error loading graphs:', error);
    }
  },
}));
