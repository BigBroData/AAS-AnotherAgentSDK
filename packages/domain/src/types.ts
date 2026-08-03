/**
 * Domain Types for Visual Agent Architect
 * Согласно контракту v1.0
 */

export type NodeType = 'llm' | 'condition' | 'tool' | 'input' | 'output';

export interface NodePosition {
  x: number;
  y: number;
}

export interface NodeParameters {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

export interface ToolConfig {
  name: string;
  arguments?: Record<string, any>;
}

export interface NodeData {
  label: string;
  model?: string;
  prompt?: string;
  systemPrompt?: string;
  parameters?: NodeParameters;
  toolConfig?: ToolConfig;
  conditionLogic?: string;
}

export interface Node {
  id: string;
  type: NodeType;
  position: NodePosition;
  data: NodeData;
}

export interface EdgeData {
  condition?: string;
  label?: string;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  data?: EdgeData;
}

export interface GraphMetadata {
  createdAt: string;
  updatedAt: string;
  author?: string;
}

export interface Graph {
  id: string;
  name: string;
  version: string;
  nodes: Node[];
  edges: Edge[];
  metadata: GraphMetadata;
}

export interface HistoryEntry {
  nodeId: string;
  input: any;
  output: any;
  timestamp: string;
}

export interface ExecutionMetadata {
  startedAt: string;
  currentPath: string[];
  errors?: Array<{ nodeId: string; error: string }>;
}

export interface ExecutionState {
  input: any;
  context: Record<string, any>;
  history: HistoryEntry[];
  metadata: ExecutionMetadata;
}

export interface ExecuteRequest {
  graphId: string;
  input: any;
  mode: 'live' | 'simulation';
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
