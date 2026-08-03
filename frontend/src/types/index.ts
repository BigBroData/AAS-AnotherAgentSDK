// Типы данных согласно контракту

export type NodeType = 'llm' | 'condition' | 'input' | 'output' | 'tool';

export interface NodeData {
  label: string;
  type: NodeType;
  prompt?: string;
  model?: string;
  temperature?: number;
  condition?: string;
  [key: string]: any;
}

export interface GraphNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: NodeData;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface ExecutionState {
  currentNodeId?: string;
  visitedNodes: string[];
  context: Record<string, any>;
  history: any[];
  metadata: Record<string, any>;
  status: 'idle' | 'running' | 'completed' | 'error';
  error?: string;
}

export interface SimulationRequest {
  graphId: string;
  initialState: {
    input: string;
    context?: Record<string, any>;
  };
}

export interface SimulationResponse {
  success: boolean;
  trace: ExecutionTrace[];
  finalState: ExecutionState;
}

export interface ExecutionTrace {
  nodeId: string;
  inputData: any;
  outputData: any;
  timestamp: number;
  duration?: number;
}
