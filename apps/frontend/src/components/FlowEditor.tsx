import { useCallback, useState } from 'react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  type OnConnect,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  InputNode,
  OutputNode,
  LLMNode,
  ConditionNode,
  ToolNode,
} from './CustomNodes';
import { useGraphStore } from '../store/graphStore';

const nodeTypes = {
  input: InputNode,
  output: OutputNode,
  llm: LLMNode,
  condition: ConditionNode,
  tool: ToolNode,
};

export default function FlowEditor() {
  const { currentGraph, setCurrentGraph, addNode, addEdge, updateNode, removeNode } = useGraphStore();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(currentGraph?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(currentGraph?.edges || []);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Sync with store when graph changes
  useCallback(() => {
    if (currentGraph) {
      setNodes(currentGraph.nodes);
      setEdges(currentGraph.edges);
    }
  }, [currentGraph, setNodes, setEdges]);

  const onConnect: OnConnect = useCallback(
    (params) => {
      const newEdge: Edge = {
        ...params,
        id: `edge-${params.source}-${params.target}`,
        data: {
          label: '',
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
      addEdge(newEdge);
    },
    [setEdges, addEdge]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node.id);
    },
    []
  );

  const addNewNode = (type: string) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
      },
    };
    setNodes((nds) => nds.concat(newNode));
    addNode(newNode);
  };

  return (
    <div className="w-full h-full flex">
      {/* Toolbar */}
      <div className="w-48 bg-gray-50 border-r p-4 space-y-2">
        <h3 className="font-bold text-gray-700 mb-4">Add Nodes</h3>
        <button
          onClick={() => addNewNode('input')}
          className="w-full px-3 py-2 bg-blue-100 hover:bg-blue-200 rounded text-sm"
        >
          📥 Input
        </button>
        <button
          onClick={() => addNewNode('llm')}
          className="w-full px-3 py-2 bg-purple-100 hover:bg-purple-200 rounded text-sm"
        >
          🤖 LLM
        </button>
        <button
          onClick={() => addNewNode('condition')}
          className="w-full px-3 py-2 bg-orange-100 hover:bg-orange-200 rounded text-sm"
        >
          ⚖️ Condition
        </button>
        <button
          onClick={() => addNewNode('tool')}
          className="w-full px-3 py-2 bg-teal-100 hover:bg-teal-200 rounded text-sm"
        >
          🔧 Tool
        </button>
        <button
          onClick={() => addNewNode('output')}
          className="w-full px-3 py-2 bg-green-100 hover:bg-green-200 rounded text-sm"
        >
          📤 Output
        </button>

        {selectedNode && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="font-semibold text-sm text-gray-600 mb-2">Selected:</h4>
            <p className="text-xs text-gray-500 truncate">{selectedNode}</p>
            <button
              onClick={() => {
                removeNode(selectedNode);
                setSelectedNode(null);
              }}
              className="mt-2 w-full px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Canvas */}
      <div className="flex-1 h-[600px]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <Controls />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}
