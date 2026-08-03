/**
 * AAS Core Types
 * Defines the fundamental contracts for Agents, Layers, and State.
 */

/**
 * AgentState - Centralized state container.
 * Passed by reference to minimize copying (Zero-Copy philosophy).
 */
export interface AgentState {
  messages: Record<string, any>[];
  context: Record<string, any>;
  metadata: {
    startTime: number;
    [key: string]: any;
  };
}

/**
 * Layer Interface
 * Every layer must implement this.
 * It receives state and mutates it or returns a signal for routing.
 */
export interface ILayer {
  id: string;
  type: 'inference' | 'logic' | 'tool' | 'io';
  
  /**
   * Executes the layer logic.
   * @param state - The shared agent state (mutated in place for performance).
   * @returns Promise<void> or Promise<string> (next step hint)
   */
  execute(state: AgentState): Promise<void | string>;
}

/**
 * Router Function
 * Decides the next layer based on state or layer output.
 * Kept simple for speed: linear by default, conditional if needed.
 */
export type RouterFn = (state: AgentState, lastOutput?: string) => string | null;

/**
 * Agent Configuration
 */
export interface AgentConfig {
  layers: ILayer[];
  router?: RouterFn;
}
