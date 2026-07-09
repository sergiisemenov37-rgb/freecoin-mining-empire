'use client';

/**
 * Simulation Debug Overlay
 * Developer tool for monitoring simulation performance and state
 */

import { useEffect, useState } from 'react';
import { SimulationEngine } from '@/lib/simulation/SimulationEngine';
import type { SimulationMetrics } from '@/lib/simulation/types';
import { EntityType, EntityState } from '@/lib/simulation/types';

interface DebugOverlayProps {
  engine: SimulationEngine;
}

export default function DebugOverlay({ engine }: DebugOverlayProps) {
  const [metrics, setMetrics] = useState<SimulationMetrics>(engine.getMetrics());
  const [tickNumber, setTickNumber] = useState(engine.getTickNumber());
  const [isActive, setIsActive] = useState(engine.isActive());
  const [entityCount, setEntityCount] = useState(engine.getAllEntities().length);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(engine.getMetrics());
      setTickNumber(engine.getTickNumber());
      setIsActive(engine.isActive());
      setEntityCount(engine.getAllEntities().length);
    }, 100);

    return () => clearInterval(interval);
  }, [engine]);

  const selectedEntityData = selectedEntity ? engine.getEntity(selectedEntity) : null;

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-green-400 font-mono text-xs p-4 rounded-lg border border-green-500/30 w-80 max-h-[90vh] overflow-y-auto z-50">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-bold text-green-300">SIMULATION DEBUG</h2>
        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`} />
      </div>

      {/* Metrics */}
      <div className="space-y-1 mb-3 pb-3 border-b border-green-500/30">
        <div className="flex justify-between">
          <span>FPS:</span>
          <span className={metrics.fps < 30 ? 'text-red-400' : 'text-green-400'}>
            {metrics.fps.toFixed(1)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Tick Rate:</span>
          <span>{(metrics.tickRate / 1000).toFixed(1)}s</span>
        </div>
        <div className="flex justify-between">
          <span>Tick Number:</span>
          <span>{tickNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Active Entities:</span>
          <span>{metrics.activeEntities}</span>
        </div>
        <div className="flex justify-between">
          <span>Changed Entities:</span>
          <span className={metrics.changedEntities > 100 ? 'text-yellow-400' : 'text-green-400'}>
            {metrics.changedEntities}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Update Time:</span>
          <span className={metrics.updateTime > 16 ? 'text-yellow-400' : 'text-green-400'}>
            {metrics.updateTime.toFixed(2)}ms
          </span>
        </div>
        <div className="flex justify-between">
          <span>Total Time:</span>
          <span>{metrics.totalTime.toFixed(2)}ms</span>
        </div>
        <div className="flex justify-between">
          <span>Memory:</span>
          <span>{metrics.memoryUsage.toFixed(1)}MB</span>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-2 mb-3 pb-3 border-b border-green-500/30">
        <button
          onClick={() => engine.isActive() ? engine.stop() : engine.start()}
          className={`w-full px-3 py-1 rounded ${
            isActive ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'
          } text-white`}
        >
          {isActive ? 'Stop Simulation' : 'Start Simulation'}
        </button>
        <button
          onClick={() => engine.reset()}
          className="w-full px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded"
        >
          Reset Simulation
        </button>
      </div>

      {/* Entity List */}
      <div className="mb-3 pb-3 border-b border-green-500/30">
        <h3 className="text-xs font-bold text-green-300 mb-2">
          ENTITIES ({entityCount})
        </h3>
        <div className="max-h-40 overflow-y-auto space-y-1">
          {engine.getAllEntities().slice(0, 20).map((entity) => (
            <button
              key={entity.id}
              onClick={() => setSelectedEntity(entity.id)}
              className={`w-full text-left px-2 py-1 rounded text-xs ${
                selectedEntity === entity.id
                  ? 'bg-green-600/30 text-green-300'
                  : 'hover:bg-green-600/20'
              }`}
            >
              <div className="flex justify-between">
                <span>{entity.type}</span>
                <span className={getStateColor(entity.state)}>{entity.state}</span>
              </div>
              <div className="text-green-500/70 text-[10px]">
                {entity.id.slice(0, 8)}...
              </div>
            </button>
          ))}
          {entityCount > 20 && (
            <div className="text-green-500/50 text-xs text-center">
              +{entityCount - 20} more
            </div>
          )}
        </div>
      </div>

      {/* Selected Entity Details */}
      {selectedEntityData && (
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-green-300 mb-2">
            ENTITY DETAILS
          </h3>
          <div className="text-[10px] space-y-1">
            <div className="flex justify-between">
              <span>ID:</span>
              <span className="text-green-500/70">{selectedEntityData.id.slice(0, 12)}...</span>
            </div>
            <div className="flex justify-between">
              <span>Type:</span>
              <span>{selectedEntityData.type}</span>
            </div>
            <div className="flex justify-between">
              <span>State:</span>
              <span className={getStateColor(selectedEntityData.state)}>
                {selectedEntityData.state}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Temperature:</span>
              <span className={getTemperatureColor(selectedEntityData.temperature)}>
                {selectedEntityData.temperature.toFixed(1)}°C
              </span>
            </div>
            <div className="flex justify-between">
              <span>Power Usage:</span>
              <span>{selectedEntityData.powerUsage.toFixed(1)}W</span>
            </div>
            <div className="flex justify-between">
              <span>Power Gen:</span>
              <span>{selectedEntityData.powerGeneration.toFixed(1)}W</span>
            </div>
            <div className="flex justify-between">
              <span>Efficiency:</span>
              <span>{(selectedEntityData.efficiency * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Durability:</span>
              <span className={getDurabilityColor(selectedEntityData.durability)}>
                {selectedEntityData.durability.toFixed(0)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Health:</span>
              <span className={getHealthColor(selectedEntityData.health)}>
                {selectedEntityData.health.toFixed(0)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Running:</span>
              <span>{selectedEntityData.status.running ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span>Disabled:</span>
              <span>{selectedEntityData.status.disabled ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span>Needs Repair:</span>
              <span>{selectedEntityData.status.needsRepair ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span>Needs Power:</span>
              <span>{selectedEntityData.status.needsPower ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span>Needs Cooling:</span>
              <span>{selectedEntityData.status.needsCooling ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span>Dependencies:</span>
              <span>{selectedEntityData.dependencies.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Version:</span>
              <span>{selectedEntityData.version}</span>
            </div>
            <div className="flex justify-between">
              <span>Last Updated:</span>
              <span>{new Date(selectedEntityData.lastUpdated).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tick Rate Selector */}
      <div className="mt-3 pt-3 border-t border-green-500/30">
        <h3 className="text-xs font-bold text-green-300 mb-2">TICK RATE</h3>
        <div className="flex gap-1">
          <button
            onClick={() => engine.setTickRate(1000)}
            className={`flex-1 px-2 py-1 rounded text-xs ${
              metrics.tickRate === 1000 ? 'bg-green-600' : 'bg-gray-600 hover:bg-gray-500'
            }`}
          >
            1s
          </button>
          <button
            onClick={() => engine.setTickRate(5000)}
            className={`flex-1 px-2 py-1 rounded text-xs ${
              metrics.tickRate === 5000 ? 'bg-green-600' : 'bg-gray-600 hover:bg-gray-500'
            }`}
          >
            5s
          </button>
          <button
            onClick={() => engine.setTickRate(10000)}
            className={`flex-1 px-2 py-1 rounded text-xs ${
              metrics.tickRate === 10000 ? 'bg-green-600' : 'bg-gray-600 hover:bg-gray-500'
            }`}
          >
            10s
          </button>
        </div>
      </div>
    </div>
  );
}

function getStateColor(state: string): string {
  switch (state) {
    case 'running':
      return 'text-green-400';
    case 'idle':
      return 'text-blue-400';
    case 'overloaded':
      return 'text-yellow-400';
    case 'overheated':
      return 'text-orange-400';
    case 'broken':
      return 'text-red-400';
    case 'repairing':
      return 'text-purple-400';
    case 'disabled':
      return 'text-gray-400';
    default:
      return 'text-green-400';
  }
}

function getTemperatureColor(temp: number): string {
  if (temp >= 85) return 'text-red-400';
  if (temp >= 70) return 'text-orange-400';
  if (temp >= 50) return 'text-yellow-400';
  return 'text-green-400';
}

function getDurabilityColor(durability: number): string {
  if (durability <= 20) return 'text-red-400';
  if (durability <= 50) return 'text-yellow-400';
  return 'text-green-400';
}

function getHealthColor(health: number): string {
  if (health <= 20) return 'text-red-400';
  if (health <= 50) return 'text-yellow-400';
  return 'text-green-400';
}
