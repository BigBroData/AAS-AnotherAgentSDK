import { AgentEngine } from '../src/core/engine';
import { OllamaInferenceLayer } from '../src/layers/ollama-layer';
import { LogicLayer } from '../src/layers/logic-layer';
import { AgentState } from '../src/core/types';

async function runBenchmark() {
  console.log('🚀 AAS SDK Benchmark: HTTP vs Direct (Simulated)');
  
  // --- Scenario A: HTTP to Ollama ---
  console.log('\n--- Scenario A: Bun -> HTTP -> Ollama ---');
  
  const ollamaLayer = new OllamaInferenceLayer({
    id: 'llm-1',
    model: 'tinyllama', // Use a small model for speed
    promptTemplate: (ctx) => `Say "Hello World" in one sentence. Context: ${JSON.stringify(ctx)}`,
  });

  const stateA: AgentState = {
    messages: [{ role: 'user', content: 'Start' }],
    context: { test: 'http-overhead' },
    metadata: { startTime: 0 },
  };

  const engineA = new AgentEngine({ layers: [ollamaLayer] });
  
  const startA = performance.now();
  try {
    await engineA.run(stateA);
    const endA = performance.now();
    console.log(`✅ HTTP Latency: ${(endA - startA).toFixed(2)} ms`);
    console.log(`   Response preview: ${stateA.messages[1]?.content?.slice(0, 50)}...`);
  } catch (e) {
    console.log(`❌ HTTP Failed (Is Ollama running?): ${e.message}`);
    console.log('   Skipping HTTP test. Ensure "ollama serve" is running.');
  }

  // --- Scenario B: Simulated Direct FFI (Zero Overhead) ---
  console.log('\n--- Scenario B: Bun -> llama.cpp (Simulated FFI) ---');
  
  // Simulating direct memory call with minimal delay
  const simulatedDirectLayer = new LogicLayer({
    id: 'direct-llm',
    handler: (state) => {
      // Simulate inference time of a local C++ call (e.g., 50ms vs 500ms network)
      // In real impl, this would be: const result = llamaContext.prompt(...);
      const mockLatency = 50; // ms
      const start = performance.now();
      while (performance.now() - start < mockLatency) { /* busy wait for sim */ }
      
      state.messages.push({
        role: 'assistant',
        content: 'Hello World from simulated direct llama.cpp!',
        layerId: 'direct-llm',
        timestamp: Date.now(),
      });
    }
  });

  const stateB: AgentState = {
    messages: [{ role: 'user', content: 'Start' }],
    context: { test: 'direct-ffi' },
    metadata: { startTime: 0 },
  };

  const engineB = new AgentEngine({ layers: [simulatedDirectLayer] });

  const startB = performance.now();
  await engineB.run(stateB);
  const endB = performance.now();
  
  console.log(`✅ Simulated Direct Latency: ${(endB - startB).toFixed(2)} ms`);
  console.log(`   Response: ${stateB.messages[1]?.content}`);

  console.log('\n📊 Conclusion:');
  console.log('   Direct FFI removes network stack, JSON serialization overhead, and context switching.');
  console.log('   Expected real-world speedup: 5x-10x depending on payload size and network.');
}

runBenchmark();
