# AAS (Another Agent SDK)

**High-performance, low-level SDK for building AI Agents with Bun/TypeScript.**

## Philosophy
- **No Magic:** Explicit control over data flow and state.
- **Zero-Copy:** State is passed by reference and mutated in place to avoid serialization overhead.
- **Linear by Default:** Optimized for sequential pipelines (Layer A -> Layer B), with optional routing.
- **Transport Agnostic:** Currently supports HTTP (Ollama), designed for direct FFI (llama.cpp) integration.

## Project Structure
```
src/
  core/
    types.ts       # Contracts: ILayer, AgentState
    engine.ts      # High-performance executor
  layers/
    ollama-layer.ts # HTTP-based inference layer
    logic-layer.ts  # Pure TS transformation layer
benchmarks/
  hello-world.ts   # Latency comparison: HTTP vs Simulated FFI
```

## Quick Start

### 1. Install Dependencies
```bash
bun install
```

### 2. Run Benchmark
Compare HTTP overhead vs. simulated direct memory access.
*(Requires `ollama serve` running locally for the HTTP test)*

```bash
bun run benchmarks/hello-world.ts
```

### 3. Build Your Agent
```typescript
import { AgentEngine } from './src/core/engine';
import { OllamaInferenceLayer } from './src/layers/ollama-layer';
import { LogicLayer } from './src/layers/logic-layer';

const agent = new AgentEngine({
  layers: [
    new LogicLayer({
      id: 'input',
      handler: (state) => {
        state.context.query = "Explain quantum computing";
      }
    }),
    new OllamaInferenceLayer({
      id: 'llm',
      model: 'tinyllama',
      promptTemplate: (ctx) => ctx.query
    }),
    new LogicLayer({
      id: 'output',
      handler: (state) => {
        console.log(state.messages[state.messages.length - 1].content);
      }
    })
  ]
});

await agent.run({
  messages: [],
  context: {},
  metadata: { startTime: 0 }
});
```

## Roadmap
- [x] Core Engine (Linear Pipeline)
- [x] Basic Layers (Ollama HTTP, Logic)
- [ ] **Direct llama.cpp Integration (FFI)** - *Next Priority*
- [ ] Conditional Routing Logic
- [ ] Streaming Support

## Why AAS?
Existing frameworks (LangChain, CrewAI) add heavy abstraction layers. AAS focuses on raw speed and predictability by treating agents as simple function pipelines with shared mutable state.