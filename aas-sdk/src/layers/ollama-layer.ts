import { AgentState, ILayer } from '../core/types';

/**
 * Configuration for Ollama Inference Layer
 */
export interface OllamaLayerConfig {
  id: string;
  model: string;
  promptTemplate?: (context: any) => string;
  baseUrl?: string; // Default: http://localhost:11434
}

/**
 * InferenceLayer using Ollama via HTTP.
 * NOTE: This is the "Scenario A" implementation for benchmarking.
 * Future optimization: Replace fetch with direct llama.cpp FFI (Scenario B).
 */
export class OllamaInferenceLayer implements ILayer {
  public readonly id: string;
  public readonly type: 'inference' = 'inference';
  
  private model: string;
  private baseUrl: string;
  private promptTemplate?: (context: any) => string;

  constructor(config: OllamaLayerConfig) {
    this.id = config.id;
    this.model = config.model;
    this.baseUrl = config.baseUrl || 'http://localhost:11434';
    this.promptTemplate = config.promptTemplate;
  }

  async execute(state: AgentState): Promise<void> {
    // Construct prompt
    let prompt = '';
    if (this.promptTemplate) {
      prompt = this.promptTemplate(state.context);
    } else {
      // Default: use last message or raw context
      const lastMsg = state.messages[state.messages.length - 1];
      prompt = lastMsg?.content || JSON.stringify(state.context);
    }

    // Call Ollama API
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedText = data.response;

    // Mutate state in place (Zero-Copy philosophy)
    state.messages.push({
      role: 'assistant',
      content: generatedText,
      layerId: this.id,
      timestamp: Date.now(),
    });

    // Store raw response in context for downstream layers if needed
    state.context[`last_output_${this.id}`] = generatedText;
  }
}
