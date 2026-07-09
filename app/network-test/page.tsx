'use client';

/**
 * Network Test Page
 * Developer tool for testing resource network engine with 10000+ nodes
 */

import { useEffect, useRef, useState } from 'react';
import { ResourceNetworkEngine } from '@/lib/network/ResourceNetworkEngine';
import { ResourceType, NodePriority, NodeStatus } from '@/lib/network/types';
import NetworkVisualizer from '@/components/network/NetworkVisualizer';

export default function NetworkTestPage() {
  const engineRef = useRef<ResourceNetworkEngine | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [nodeCount, setNodeCount] = useState(100);

  useEffect(() => {
    if (!engineRef.current) {
      engineRef.current = new ResourceNetworkEngine();
      setIsInitialized(true);
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
      }
    };
  }, []);

  const initializeNodes = (count: number) => {
    if (!engineRef.current) return;

    engineRef.current.clear();

    // Create nodes in a grid pattern
    const gridSize = Math.ceil(Math.sqrt(count));
    const spacing = 50;

    for (let i = 0; i < count; i++) {
      const x = (i % gridSize) * spacing;
      const y = Math.floor(i / gridSize) * spacing;

      const node = {
        id: `node_${i}`,
        position: { x, y },
        type: i % 3 === 0 ? 'producer' : i % 3 === 1 ? 'consumer' : 'relay',
        resources: new Map([
          [ResourceType.POWER, { input: 0, output: 0, net: 0, capacity: 1000, utilization: 0 }],
          [ResourceType.COOLING, { input: 0, output: 0, net: 0, capacity: 5000, utilization: 0 }],
          [ResourceType.NETWORK, { input: 0, output: 0, net: 0, capacity: 1000, utilization: 0 }],
          [ResourceType.MAINTENANCE, { input: 0, output: 0, net: 0, capacity: 100, utilization: 0 }],
        ]),
        priority: NodePriority.NORMAL,
        status: NodeStatus.ACTIVE,
        capacities: new Map([
          [ResourceType.POWER, 1000],
          [ResourceType.COOLING, 5000],
          [ResourceType.NETWORK, 1000],
          [ResourceType.MAINTENANCE, 100],
        ]),
        connections: new Set<string>(),
        load: 0,
        lastUpdated: Date.now(),
        version: 0,
      };

      engineRef.current.addNode(node);
    }

    // Auto-connect nearby nodes
    const nodes = engineRef.current.getAllNodes();
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const nodeA = nodes[i];
        const nodeB = nodes[j];

        const dx = nodeA.position.x - nodeB.position.x;
        const dy = nodeA.position.y - nodeB.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= 75) {
          engineRef.current.addConnection(nodeA.id, nodeB.id, 'automatic');
        }
      }
    }

    setNodeCount(count);
  };

  const handleStartStop = () => {
    if (!engineRef.current) return;

    if (engineRef.current.isActive()) {
      engineRef.current.stop();
    } else {
      engineRef.current.start();
    }
  };

  const handleReset = () => {
    if (!engineRef.current) return;
    engineRef.current.clear();
  };

  const handleAddNodes = () => {
    initializeNodes(nodeCount);
  };

  const handleAdd1000 = () => {
    initializeNodes(1000);
  };

  const handleAdd5000 = () => {
    initializeNodes(5000);
  };

  const handleAdd10000 = () => {
    initializeNodes(10000);
  };

  if (!isInitialized || !engineRef.current) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-xl">Initializing network engine...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <NetworkVisualizer engine={engineRef.current} />

      <div className="max-w-4xl mx-auto mt-4">
        <h1 className="text-3xl font-bold mb-8">Resource Network Engine Test</h1>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Controls</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={handleStartStop}
              className={`px-4 py-2 rounded font-semibold ${
                engineRef.current.isActive()
                  ? 'bg-red-600 hover:bg-red-500'
                  : 'bg-green-600 hover:bg-green-500'
              }`}
            >
              {engineRef.current.isActive() ? 'Stop' : 'Start'}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded font-semibold"
            >
              Reset
            </button>
            <button
              onClick={handleAddNodes}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-semibold"
            >
              Add {nodeCount} Nodes
            </button>
            <button
              onClick={handleAdd1000}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded font-semibold"
            >
              Add 1000 Nodes
            </button>
            <button
              onClick={handleAdd5000}
              className="px-4 py-2 bg-pink-600 hover:bg-pink-500 rounded font-semibold"
            >
              Add 5000 Nodes
            </button>
            <button
              onClick={handleAdd10000}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 rounded font-semibold"
            >
              Add 10000 Nodes
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Node Count</h2>
          <div className="flex gap-2 flex-wrap">
            {[100, 500, 1000, 2500, 5000, 10000].map((count) => (
              <button
                key={count}
                onClick={() => setNodeCount(count)}
                className={`px-3 py-1 rounded ${
                  nodeCount === count
                    ? 'bg-green-600'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>Click "Add X Nodes" to populate the network</li>
            <li>Click "Start" to begin network updates</li>
            <li>Use the visualizer to inspect the network graph</li>
            <li>Select resource type to view different flows</li>
            <li>Toggle display options to show flow, capacity, bottlenecks</li>
            <li>Test with 10000+ nodes to verify performance</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
