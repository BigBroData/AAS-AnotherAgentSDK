import { AgentState, ILayer } from '../core/types';

/**
 * Configuration for Logic Layer
 */
export interface LogicLayerConfig {
  id: string;
  handler: (state: AgentState) => void | string;
}

/**
 * LogicLayer
 * Pure TS function for data transformation, routing decisions, or validation.
 * Zero external calls, maximum speed.
 */
export class LogicLayer implements ILayer {
  public readonly id: string;
  public readonly type: 'logic' = 'logic';
  
  private handler: (state: AgentState) => void | string;

  constructor(config: LogicLayerConfig) {
    this.id = config.id;
    this.handler = config.handler;
  }

  async execute(state: AgentState): Promise<void | string> {
    const result = this.handler(state);
    // If handler returns a string, treat it as a routing hint
    if (typeof result === 'string') {
      return result;
    }
    return undefined;
  }
}
