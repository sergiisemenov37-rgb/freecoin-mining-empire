'use client';

/**
 * Hardware Test Page
 * Developer tool for testing hardware system with thousands of instances
 */

import { useEffect, useRef, useState } from 'react';
import { HardwareManager } from '@/lib/hardware/HardwareManager';
import HardwareInspector from '@/components/hardware/HardwareInspector';

export default function HardwareTestPage() {
  const managerRef = useRef<HardwareManager | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [instanceCount, setInstanceCount] = useState(100);

  useEffect(() => {
    if (!managerRef.current) {
      managerRef.current = new HardwareManager();
      setIsInitialized(true);
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  const initializeInstances = (count: number) => {
    if (!managerRef.current) return;

    managerRef.current.clear();

    const types = ['gpu_basic', 'gpu_standard', 'gpu_advanced', 'asic_basic', 'asic_standard', 'battery_small', 'battery_medium', 'solar_basic', 'solar_standard', 'cooling_fan', 'cooling_liquid'];

    for (let i = 0; i < count; i++) {
      const randomType = types[Math.floor(Math.random() * types.length)];
      managerRef.current.createInstance(randomType, 'player_1');
    }

    setInstanceCount(count);
  };

  const handleCreateInstances = () => {
    initializeInstances(instanceCount);
  };

  const handleCreate1000 = () => {
    initializeInstances(1000);
  };

  const handleCreate5000 = () => {
    initializeInstances(5000);
  };

  const handleCreate10000 = () => {
    initializeInstances(10000);
  };

  const handleClear = () => {
    if (!managerRef.current) return;
    managerRef.current.clear();
  };

  if (!isInitialized || !managerRef.current) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-xl">Initializing hardware system...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <HardwareInspector manager={managerRef.current} />

      <div className="max-w-4xl mx-auto mt-4">
        <h1 className="text-3xl font-bold mb-8">Hardware System Test</h1>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Controls</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={handleCreateInstances}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-semibold"
            >
              Add {instanceCount} Instances
            </button>
            <button
              onClick={handleCreate1000}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded font-semibold"
            >
              Add 1000 Instances
            </button>
            <button
              onClick={handleCreate5000}
              className="px-4 py-2 bg-pink-600 hover:bg-pink-500 rounded font-semibold"
            >
              Add 5000 Instances
            </button>
            <button
              onClick={handleCreate10000}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 rounded font-semibold"
            >
              Add 10000 Instances
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded font-semibold"
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Instance Count</h2>
          <div className="flex gap-2 flex-wrap">
            {[100, 500, 1000, 2500, 5000, 10000].map((count) => (
              <button
                key={count}
                onClick={() => setInstanceCount(count)}
                className={`px-3 py-1 rounded ${
                  instanceCount === count
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
          <h2 className="text-xl font-semibold mb-4">Statistics</h2>
          <div className="text-gray-300 text-sm space-y-1">
            <p>Total Instances: {managerRef.current.getInstanceCount()}</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>Click "Add X Instances" to populate the hardware system</li>
            <li>Use the inspector to view and filter instances</li>
            <li>Select an instance to view detailed properties</li>
            <li>Perform maintenance or update firmware on selected instances</li>
            <li>Test with 10000+ instances to verify performance</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
