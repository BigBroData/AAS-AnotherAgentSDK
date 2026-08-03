import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { Node as GraphNode } from '@vaa/domain';

interface CustomNodeData {
  label: string;
  description?: string;
}

export const InputNode = memo(({ data, selected }: NodeProps<GraphNode>) => {
  return (
    <div className={`px-4 py-2 shadow-lg rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-300'}`}>
      <div className="flex items-center gap-2">
        <span className="text-lg">📥</span>
        <div>
          <div className="font-bold text-gray-800">{data.label}</div>
          <div className="text-xs text-gray-500">Input Node</div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-blue-500" />
    </div>
  );
});

export const OutputNode = memo(({ data, selected }: NodeProps<GraphNode>) => {
  return (
    <div className={`px-4 py-2 shadow-lg rounded-md bg-white border-2 ${selected ? 'border-green-500' : 'border-gray-300'}`}>
      <div className="flex items-center gap-2">
        <span className="text-lg">📤</span>
        <div>
          <div className="font-bold text-gray-800">{data.label}</div>
          <div className="text-xs text-gray-500">Output Node</div>
        </div>
      </div>
      <Handle type="target" position={Position.Left} className="!bg-green-500" />
    </div>
  );
});

export const LLMNode = memo(({ data, selected }: NodeProps<GraphNode>) => {
  return (
    <div className={`px-4 py-2 shadow-lg rounded-md bg-white border-2 ${selected ? 'border-purple-500' : 'border-gray-300'} min-w-[200px]`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">🤖</span>
        <div>
          <div className="font-bold text-gray-800">{data.label}</div>
          <div className="text-xs text-gray-500">{data.model || 'LLM'}</div>
        </div>
      </div>
      {data.prompt && (
        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded mb-2 max-w-[250px] truncate">
          {data.prompt}
        </div>
      )}
      <Handle type="target" position={Position.Left} className="!bg-purple-500" />
      <Handle type="source" position={Position.Right} className="!bg-purple-500" />
    </div>
  );
});

export const ConditionNode = memo(({ data, selected }: NodeProps<GraphNode>) => {
  return (
    <div className={`px-4 py-2 shadow-lg rounded-md bg-white border-2 ${selected ? 'border-orange-500' : 'border-gray-300'} min-w-[180px]`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">⚖️</span>
        <div>
          <div className="font-bold text-gray-800">{data.label}</div>
          <div className="text-xs text-gray-500">Condition</div>
        </div>
      </div>
      {data.conditionLogic && (
        <div className="text-xs text-orange-700 bg-orange-50 p-2 rounded font-mono">
          {data.conditionLogic}
        </div>
      )}
      <Handle type="target" position={Position.Left} className="!bg-orange-500" />
      <Handle type="source" position={Position.Right} className="!bg-orange-500" />
    </div>
  );
});

export const ToolNode = memo(({ data, selected }: NodeProps<GraphNode>) => {
  return (
    <div className={`px-4 py-2 shadow-lg rounded-md bg-white border-2 ${selected ? 'border-teal-500' : 'border-gray-300'}`}>
      <div className="flex items-center gap-2">
        <span className="text-lg">🔧</span>
        <div>
          <div className="font-bold text-gray-800">{data.label}</div>
          <div className="text-xs text-gray-500">{data.toolConfig?.name || 'Tool'}</div>
        </div>
      </div>
      <Handle type="target" position={Position.Left} className="!bg-teal-500" />
      <Handle type="source" position={Position.Right} className="!bg-teal-500" />
    </div>
  );
});
