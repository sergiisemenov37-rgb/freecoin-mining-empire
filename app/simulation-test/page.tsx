'use client';

/**
 * Simulation Test Page
 * Developer tool for testing simulation engine with 5000+ entities
 */

import { useEffect, useRef, useState } from 'react';
import { SimulationEngine } from '@/lib/simulation/SimulationEngine';
import { EntityType, EntityState, TickRate } from '@/lib/simulation/types';
import DebugOverlay from '@/components/simulation/DebugOverlay';

export default function SimulationTestPage() {
  const engineRef = useRef<SimulationEngine | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [entityCount, setEntityCount] = useState(100);

  useEffect(() => {
    if (!engineRef.current) {
      engineRef.current = new SimulationEngine();
      setIsInitialized(true);
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
      }
    };
  }, []);

  const initializeEntities = (count: number) => {
    if (!engineRef.current) return;

    engineRef.current.reset();

    for (let i = 0; i < count; i++) {
      const types = Object.values(EntityType);
      const type = types[Math.floor(Math.random() * types.length)];

      const entity = {
        id: `entity_${i}`,
        type,
        state: EntityState.IDLE,
        status: {
          running: false,
          disabled: false,
          needsRepair: false,
          needsPower: false,
          needsCooling: false,
        },
        temperature: 25 + Math.random() * 30,
        powerUsage: 50 + Math.random() * 100,
        powerGeneration: Math.random() > 0.5 ? Math.random() * 50 : 0,
        efficiency: 0.8 + Math.random() * 0.2,
        durability: 80 + Math.random() * 20,
        health: 80 + Math.random() * 20,
        dependencies: [],
        customProperties: {},
        lastUpdated: Date.now(),
        version: 0,
      };

      engineRef.current.addEntity(entity);
    }

    setEntityCount(count);
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
    engineRef.current.reset();
  };

  const handleAddEntities = () => {
    if (!engineRef.current) return;
    initializeEntities(entityCount);
  };

  const handleAdd5000 = () => {
    initializeEntities(5000);
  };

  const handleAdd10000 = () => {
    initializeEntities(10000);
  };

  if (!isInitialized || !engineRef.current) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-xl">Initializing simulation engine...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <DebugOverlay engine={engineRef.current} />

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Simulation Engine Test</h1>

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
              onClick={handleAddEntities}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-semibold"
            >
              Add {entityCount} Entities
            </button>
            <button
              onClick={handleAdd5000}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded font-semibold"
            >
              Add 5000 Entities
            </button>
            <button
              onClick={handleAdd10000}
              className="px-4 py-2 bg-pink-600 hover:bg-pink-500 rounded font-semibold"
            >
              Add 10000 Entities
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Entity Count</h2>
          <div className="flex gap-2">
            {[100, 500, 1000, 2500, 5000, 10000].map((count) => (
              <button
                key={count}
                onClick={() => setEntityCount(count)}
                className={`px-3 py-1 rounded ${
                  entityCount === count
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
            <li>Click "Add X Entities" to populate the simulation</li>
            <li>Click "Start" to begin simulation ticks</li>
            <li>Watch the debug overlay for performance metrics</li>
            <li>Select entities to view detailed state</li>
            <li>Adjust tick rate to test different update frequencies</li>
            <li>Test with 5000+ entities to verify performance</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
