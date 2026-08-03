import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Graph, ExecuteRequest, ValidationResult } from '@vaa/domain';
import { GraphEngine, GraphValidator } from '@vaa/engine';

// In-memory storage for MVP (в будущем заменить на БД)
const graphsStore: Map<string, Graph> = new Map();

const app = new Hono();

// CORS middleware
app.use('/*', cors());

// Health check
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// === Graphs CRUD ===

app.get('/api/graphs', (c) => {
  const graphs = Array.from(graphsStore.values());
  return c.json(graphs);
});

app.get('/api/graphs/:id', (c) => {
  const id = c.req.param('id');
  const graph = graphsStore.get(id);
  if (!graph) {
    return c.json({ error: 'Graph not found' }, 404);
  }
  return c.json(graph);
});

app.post('/api/graphs', async (c) => {
  const body = await c.req.json<Graph>();
  
  // Валидация перед сохранением
  const validation = GraphValidator.validate(body);
  if (!validation.isValid) {
    return c.json({ error: 'Invalid graph', details: validation.errors }, 400);
  }

  const id = body.id || crypto.randomUUID();
  const graph: Graph = {
    ...body,
    id,
    metadata: {
      ...body.metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
  
  graphsStore.set(id, graph);
  return c.json(graph, 201);
});

app.put('/api/graphs/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<Graph>();
  
  const existingGraph = graphsStore.get(id);
  if (!existingGraph) {
    return c.json({ error: 'Graph not found' }, 404);
  }

  const validation = GraphValidator.validate(body);
  if (!validation.isValid) {
    return c.json({ error: 'Invalid graph', details: validation.errors }, 400);
  }

  const graph: Graph = {
    ...body,
    id,
    metadata: {
      ...existingGraph.metadata,
      updatedAt: new Date().toISOString(),
    },
  };
  
  graphsStore.set(id, graph);
  return c.json(graph);
});

app.delete('/api/graphs/:id', (c) => {
  const id = c.req.param('id');
  if (!graphsStore.has(id)) {
    return c.json({ error: 'Graph not found' }, 404);
  }
  graphsStore.delete(id);
  return c.json({ success: true });
});

// === Validation ===

app.post('/api/validate', async (c) => {
  const body = await c.req.json<Graph>();
  const result = GraphValidator.validate(body);
  return c.json(result);
});

// === Execution ===

app.post('/api/execute', async (c) => {
  const body = await c.req.json<ExecuteRequest>();
  const { graphId, input, mode } = body;

  const graph = graphsStore.get(graphId);
  if (!graph) {
    return c.json({ error: 'Graph not found' }, 404);
  }

  // Валидация графа перед исполнением
  const validation = GraphValidator.validate(graph);
  if (!validation.isValid) {
    return c.json({ error: 'Invalid graph', details: validation.errors }, 400);
  }

  const isSimulation = mode === 'simulation';
  const engine = new GraphEngine(graph, isSimulation);

  // Для простоты возвращаем результат сразу (в будущем можно добавить WebSocket)
  const state = await engine.execute(input);
  
  return c.json({
    success: true,
    state,
    mode,
  });
});

// WebSocket endpoint для стриминга (MVP - заглушка)
app.get('/api/ws/execute/:sessionId', (c) => {
  // В полной реализации здесь будет upgrade до WebSocket
  return c.json({ 
    message: 'WebSocket endpoint - implement with Bun.serve for full functionality',
    sessionId: c.req.param('sessionId')
  });
});

export default app;
