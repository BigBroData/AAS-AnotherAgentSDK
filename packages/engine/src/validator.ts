import type { Graph, Node, Edge, ExecutionState, NodeType } from '@vaa/domain';

/**
 * Graph Validator - проверяет корректность графа согласно контракту
 */
export class GraphValidator {
  static validate(graph: Graph): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Проверка наличия узлов
    if (!graph.nodes || graph.nodes.length === 0) {
      errors.push('Graph must have at least one node');
      return { isValid: false, errors, warnings };
    }

    // Проверка наличия входного узла
    const hasInput = graph.nodes.some((node) => node.type === 'input');
    if (!hasInput) {
      warnings.push('No input node found. Graph may not have a clear entry point.');
    }

    // Проверка уникальности ID узлов
    const nodeIds = new Set(graph.nodes.map((n) => n.id));
    if (nodeIds.size !== graph.nodes.length) {
      errors.push('Duplicate node IDs detected');
    }

    // Проверка связей
    for (const edge of graph.edges || []) {
      if (!graph.nodes.find((n) => n.id === edge.source)) {
        errors.push(`Edge ${edge.id} references non-existent source node: ${edge.source}`);
      }
      if (!graph.nodes.find((n) => n.id === edge.target)) {
        errors.push(`Edge ${edge.id} references non-existent target node: ${edge.target}`);
      }
    }

    // Проверка условий в узлах типа condition
    for (const node of graph.nodes) {
      if (node.type === 'condition' && !node.data.conditionLogic) {
        errors.push(`Condition node ${node.id} missing conditionLogic`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
