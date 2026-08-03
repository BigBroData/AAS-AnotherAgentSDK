import type { Graph, Node, ExecutionState, HistoryEntry } from '@vaa/domain';

interface ExecutionEvent {
  type: 'node_start' | 'node_end' | 'edge_traverse' | 'error' | 'complete';
  nodeId?: string;
  edgeId?: string;
  state?: ExecutionState;
  error?: string;
  timestamp: string;
}

export type EventCallback = (event: ExecutionEvent) => void;

/**
 * Graph Execution Engine
 * Реализует обход графа с поддержкой условий и симуляции
 */
export class GraphEngine {
  private graph: Graph;
  private state: ExecutionState;
  private eventCallback?: EventCallback;
  private isSimulation: boolean;
  private maxSteps: number = 100; // Защита от бесконечных циклов

  constructor(graph: Graph, isSimulation: boolean = false) {
    this.graph = graph;
    this.isSimulation = isSimulation;
    this.state = {
      input: null,
      context: {},
      history: [],
      metadata: {
        startedAt: new Date().toISOString(),
        currentPath: [],
        errors: [],
      },
    };
  }

  setEventCallback(callback: EventCallback) {
    this.eventCallback = callback;
  }

  private emitEvent(event: ExecutionEvent) {
    if (this.eventCallback) {
      this.eventCallback(event);
    }
  }

  async execute(input: any): Promise<ExecutionState> {
    this.state.input = input;
    this.state.metadata.startedAt = new Date().toISOString();
    this.state.metadata.currentPath = [];
    this.state.history = [];
    this.state.metadata.errors = [];

    this.emitEvent({
      type: 'node_start',
      timestamp: new Date().toISOString(),
    });

    // Найти входной узел
    let currentNode = this.findStartNode();
    if (!currentNode) {
      const error = 'No start node found (input node or node without incoming edges)';
      this.state.metadata.errors?.push({ nodeId: 'system', error });
      this.emitEvent({ type: 'error', error, timestamp: new Date().toISOString() });
      return this.state;
    }

    let steps = 0;
    while (currentNode && steps < this.maxSteps) {
      steps++;

      this.state.metadata.currentPath.push(currentNode.id);

      this.emitEvent({
        type: 'node_start',
        nodeId: currentNode.id,
        state: { ...this.state },
        timestamp: new Date().toISOString(),
      });

      try {
        // Выполнить узел
        const output = await this.executeNode(currentNode);

        // Записать в историю
        const historyEntry: HistoryEntry = {
          nodeId: currentNode.id,
          input: this.getContextForNode(currentNode),
          output,
          timestamp: new Date().toISOString(),
        };
        this.state.history.push(historyEntry);

        // Обновить контекст
        this.state.context[currentNode.id] = output;

        this.emitEvent({
          type: 'node_end',
          nodeId: currentNode.id,
          state: { ...this.state },
          timestamp: new Date().toISOString(),
        });

        // Найти следующий узел
        const nextNode = this.findNextNode(currentNode, output);
        if (nextNode) {
          const edge = this.findEdge(currentNode.id, nextNode.id);
          if (edge) {
            this.emitEvent({
              type: 'edge_traverse',
              edgeId: edge.id,
              timestamp: new Date().toISOString(),
            });
          }
        }
        currentNode = nextNode;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.state.metadata.errors?.push({
          nodeId: currentNode.id,
          error: errorMessage,
        });
        this.emitEvent({
          type: 'error',
          nodeId: currentNode.id,
          error: errorMessage,
          timestamp: new Date().toISOString(),
        });
        break;
      }
    }

    if (steps >= this.maxSteps) {
      const error = `Maximum execution steps (${this.maxSteps}) reached. Possible infinite loop.`;
      this.state.metadata.errors?.push({ nodeId: 'system', error });
      this.emitEvent({ type: 'error', error, timestamp: new Date().toISOString() });
    }

    this.emitEvent({
      type: 'complete',
      state: { ...this.state },
      timestamp: new Date().toISOString(),
    });

    return this.state;
  }

  private findStartNode(): Node | null {
    // Приоритет: узел типа 'input'
    const inputNode = this.graph.nodes.find((n) => n.type === 'input');
    if (inputNode) return inputNode;

    // Или узел без входящих связей
    const targetIds = new Set(this.graph.edges.map((e) => e.target));
    return this.graph.nodes.find((n) => !targetIds.has(n.id)) || null;
  }

  private findEdge(source: string, target: string) {
    return this.graph.edges.find((e) => e.source === source && e.target === target);
  }

  private findNextNode(currentNode: Node, nodeOutput: any): Node | null {
    const outgoingEdges = this.graph.edges.filter((e) => e.source === currentNode.id);

    if (outgoingEdges.length === 0) {
      return null;
    }

    // Если есть условия на связях, проверить их
    for (const edge of outgoingEdges) {
      const condition = edge.data?.condition || currentNode.data.conditionLogic;
      if (condition) {
        if (this.evaluateCondition(condition, nodeOutput)) {
          return this.graph.nodes.find((n) => n.id === edge.target) || null;
        }
      } else {
        // Если условия нет, перейти по первой связи
        return this.graph.nodes.find((n) => n.id === edge.target) || null;
      }
    }

    // Если ни одно условие не выполнилось, вернуть первый таргет
    if (outgoingEdges.length > 0) {
      return this.graph.nodes.find((n) => n.id === outgoingEdges[0].target) || null;
    }

    return null;
  }

  private evaluateCondition(condition: string, output: any): boolean {
    try {
      // Безопасное выполнение условия через Function constructor
      // В продакшене лучше использовать vm module в Bun
      const evalFunc = new Function('state', 'output', `return ${condition}`);
      return !!evalFunc(this.state, output);
    } catch (error) {
      console.error(`Condition evaluation error: ${condition}`, error);
      return false;
    }
  }

  private getContextForNode(node: Node): any {
    return {
      input: this.state.input,
      context: this.state.context,
      previousOutputs: this.state.history.map((h) => ({
        nodeId: h.nodeId,
        output: h.output,
      })),
    };
  }

  private async executeNode(node: Node): Promise<any> {
    // Симуляция вместо реальных вызовов
    if (this.isSimulation) {
      return this.simulateNodeExecution(node);
    }

    switch (node.type) {
      case 'input':
        return this.state.input;

      case 'llm':
        return await this.executeLLMNode(node);

      case 'condition':
        return this.executeConditionNode(node);

      case 'tool':
        return await this.executeToolNode(node);

      case 'output':
        return this.state.context[this.graph.edges.find((e) => e.target === node.id)?.source || ''];

      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }

  private simulateNodeExecution(node: Node): any {
    const mockResponses: Record<NodeType, any> = {
      input: '[SIMULATION] Input received',
      llm: `[SIMULATION] LLM response from ${node.data.model || 'unknown'}`,
      condition: true,
      tool: `[SIMULATION] Tool ${node.data.toolConfig?.name || 'unknown'} executed`,
      output: '[SIMULATION] Output',
    };
    return mockResponses[node.type];
  }

  private async executeLLMNode(node: Node): Promise<any> {
    // TODO: Интеграция с реальными LLM SDK (OpenAI, Anthropic, ollama.js)
    // Пока заглушка
    const prompt = node.data.prompt || '';
    return {
      model: node.data.model,
      prompt,
      response: '[LLM Response not implemented yet]',
    };
  }

  private executeConditionNode(node: Node): boolean {
    const condition = node.data.conditionLogic;
    if (!condition) {
      throw new Error(`Condition node ${node.id} has no conditionLogic`);
    }
    return this.evaluateCondition(condition, null);
  }

  private async executeToolNode(node: Node): Promise<any> {
    // TODO: Реализация инструментов
    const toolName = node.data.toolConfig?.name;
    return {
      tool: toolName,
      result: '[Tool execution not implemented yet]',
    };
  }
}
