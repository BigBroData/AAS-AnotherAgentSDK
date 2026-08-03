import { useEffect } from 'react';
import FlowEditor from './components/FlowEditor';
import { useGraphStore } from './store/graphStore';

function App() {
  const { loadGraphs, currentGraph, setCurrentGraph, saveGraph } = useGraphStore();

  useEffect(() => {
    loadGraphs();
  }, [loadGraphs]);

  const createNewGraph = () => {
    const newGraph = {
      id: crypto.randomUUID(),
      name: 'New Agent Graph',
      version: '1.0.0',
      nodes: [],
      edges: [],
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
    setCurrentGraph(newGraph);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">
          🎨 Visual Agent Architect
        </h1>
        <div className="flex gap-3">
          <button
            onClick={createNewGraph}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            New Graph
          </button>
          {currentGraph && (
            <button
              onClick={saveGraph}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save Graph
            </button>
          )}
        </div>
      </header>

      <main className="p-6">
        {currentGraph ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="border-b px-4 py-2 bg-gray-50">
              <h2 className="font-semibold text-gray-700">{currentGraph.name}</h2>
            </div>
            <FlowEditor />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[400px] bg-white rounded-lg shadow">
            <p className="text-gray-500 mb-4">No graph selected</p>
            <button
              onClick={createNewGraph}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Your First Graph
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
