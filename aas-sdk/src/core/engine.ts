import { AgentState, ILayer, AgentConfig } from './types';

/**
 * Agent Engine
 * High-performance executor that processes layers sequentially.
 * Focus: Minimal overhead, direct state mutation, deterministic flow.
 */
export class AgentEngine {
  private layers: Map<string, ILayer>;
  private layerOrder: string[];
  private router?: (state: AgentState, lastOutput?: string) => string | null;

  constructor(config: AgentConfig) {
    this.layers = new Map();
    this.layerOrder = [];
    this.router = config.router;

    // Register layers
    for (const layer of config.layers) {
      this.layers.set(layer.id, layer);
      this.layerOrder.push(layer.id);
    }
  }

  /**
   * Runs the agent pipeline.
   * Default behavior: Linear execution (Layer 1 -> Layer 2 -> ...).
   * If router is provided, it can override the next step.
   */
  async run(initialState: AgentState): Promise<AgentState> {
    const state = initialState;
    state.metadata.startTime = Date.now();

    let currentIndex = 0;
    let lastOutput: string | undefined;

    while (currentIndex < this.layerOrder.length) {
      const layerId = this.layerOrder[currentIndex];
      const layer = this.layers.get(layerId);

      if (!layer) {
        throw new Error(`Layer ${layerId} not found`);
      }

      // Execute layer (mutates state in place)
      lastOutput = await layer.execute(state);

      // Determine next step
      if (this.router) {
        const nextStep = this.router(state, lastOutput);
        if (nextStep === null) {
          break; // Stop execution
        }
        if (nextStep && nextStep !== layerId) {
          // Jump to specific layer if router returns an ID
          const newIndex = this.layerOrder.indexOf(nextStep);
          if (newIndex !== -1) {
            currentIndex = newIndex;
            continue;
          }
        }
      }

      currentIndex++;
    }

    return state;
  }
}
