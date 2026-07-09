'use client';

/**
 * Building Developer Tools
 * Comprehensive developer tool for building inspection, construction queue, capacity viewing, and expansion preview
 */

import { useState, useEffect, useRef } from 'react';
import { BuildingSystem } from '@/lib/building/BuildingSystem';

interface BuildingDeveloperToolsProps {
  buildingSystem: BuildingSystem;
}

export default function BuildingDeveloperTools({ buildingSystem }: BuildingDeveloperToolsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'inspector' | 'queue' | 'capacity' | 'expansion'>('inspector');
  
  // Inspector state
  const [buildings, setBuildings] = useState<any[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<any>(null);
  
  // Queue state
  const [constructionQueue, setConstructionQueue] = useState<any[]>([]);
  
  // Capacity state
  const [totalCapacity, setTotalCapacity] = useState<any>(null);
  const [buildingCapacity, setBuildingCapacity] = useState<any>(null);
  
  // Expansion state
  const [expansions, setExpansions] = useState<any[]>([]);
  const [expansionDefinitions, setExpansionDefinitions] = useState<any[]>([]);

  const refreshInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const refresh = () => {
      setBuildings(buildingSystem.getAllBuildings());
      setConstructionQueue(buildingSystem.getConstructionQueue());
      setTotalCapacity(buildingSystem.calculateTotalCapacity());
      setExpansions(buildingSystem.getExpansionSystem().getAllExpansionStates());
      setExpansionDefinitions(buildingSystem.getExpansionDefinitions());
      
      if (selectedBuilding) {
        setBuildingCapacity(buildingSystem.calculateBuildingCapacity(selectedBuilding.id));
      }
    };

    refresh();
    refreshInterval.current = setInterval(refresh, 500);

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [buildingSystem, selectedBuilding]);

  const handleSelectBuilding = (building: any) => {
    setSelectedBuilding(building);
    setBuildingCapacity(buildingSystem.calculateBuildingCapacity(building.id));
  };

  const handleStartConstruction = () => {
    const buildingId = `building_${Date.now()}`;
    const type = 'starter_room';
    const position = { x: 0, y: 0, z: 0 };
    buildingSystem.startConstruction(buildingId, type, position, true);
  };

  const handleStartUpgrade = () => {
    if (selectedBuilding) {
      buildingSystem.startUpgrade(selectedBuilding.id, selectedBuilding.level + 1, true);
    }
  };

  const handleStartExpansion = (expansionType: string) => {
    if (selectedBuilding) {
      buildingSystem.startExpansion(selectedBuilding.id, expansionType, true);
    }
  };

  const getConstructionStateColor = (state: string) => {
    switch (state) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'paused': return 'bg-orange-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCapacityColor = (used: number, capacity: number) => {
    const ratio = capacity > 0 ? used / capacity : 0;
    if (ratio < 0.5) return 'bg-green-500';
    if (ratio < 0.75) return 'bg-yellow-500';
    if (ratio < 0.9) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold z-50"
      >
        Building Tools
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Building Developer Tools</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('inspector')}
            className={`px-4 py-2 text-sm font-semibold ${
              activeTab === 'inspector' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Inspector
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 text-sm font-semibold ${
              activeTab === 'queue' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Queue
          </button>
          <button
            onClick={() => setActiveTab('capacity')}
            className={`px-4 py-2 text-sm font-semibold ${
              activeTab === 'capacity' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Capacity
          </button>
          <button
            onClick={() => setActiveTab('expansion')}
            className={`px-4 py-2 text-sm font-semibold ${
              activeTab === 'expansion' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Expansion
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[70vh]">
          {activeTab === 'inspector' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={handleStartConstruction}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-semibold"
                >
                  + New Building
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 rounded p-4">
                  <h3 className="text-lg font-bold text-white mb-3">Buildings</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {buildings.map((building) => (
                      <div
                        key={building.id}
                        onClick={() => handleSelectBuilding(building)}
                        className={`p-2 rounded cursor-pointer ${
                          selectedBuilding?.id === building.id ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white text-sm">{building.name}</span>
                          <span className={`w-3 h-3 rounded-full ${getConstructionStateColor(building.constructionState)}`} />
                        </div>
                        <div className="text-gray-400 text-xs">Level {building.level} • {building.type}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedBuilding && (
                  <div className="bg-gray-800 rounded p-4">
                    <h3 className="text-lg font-bold text-white mb-3">Building Details</h3>
                    <div className="space-y-2">
                      <div>
                        <label className="text-gray-400 text-sm">Name</label>
                        <div className="text-white">{selectedBuilding.name}</div>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Type</label>
                        <div className="text-white">{selectedBuilding.type}</div>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Level</label>
                        <div className="text-white">{selectedBuilding.level}</div>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">State</label>
                        <div className="text-white">{selectedBuilding.constructionState}</div>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Dimensions</label>
                        <div className="text-white">{selectedBuilding.width}m × {selectedBuilding.height}m × {selectedBuilding.floors} floors</div>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Position</label>
                        <div className="text-white">({selectedBuilding.position.x}, {selectedBuilding.position.y})</div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={handleStartUpgrade}
                          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-semibold"
                        >
                          Upgrade
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'queue' && (
            <div className="space-y-4">
              <div className="bg-gray-800 rounded p-4">
                <h3 className="text-lg font-bold text-white mb-3">Construction Queue</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {constructionQueue.length === 0 ? (
                    <div className="text-gray-400 text-center py-4">No items in queue</div>
                  ) : (
                    constructionQueue.map((item) => (
                      <div key={item.queueId} className="p-3 bg-gray-700 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-semibold">{item.buildingId}</span>
                          <span className={`text-xs px-2 py-1 rounded ${item.isPaused ? 'bg-orange-600' : 'bg-green-600'}`}>
                            {item.isPaused ? 'Paused' : 'Active'}
                          </span>
                        </div>
                        <div className="text-gray-400 text-sm">Type: {item.type}</div>
                        <div className="text-gray-400 text-sm">Target Level: {item.targetLevel || 'N/A'}</div>
                        <div className="text-gray-400 text-xs mt-1">
                          Est. completion: {new Date(item.estimatedCompletionTime).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'capacity' && totalCapacity && (
            <div className="space-y-4">
              <div className="bg-gray-800 rounded p-4">
                <h3 className="text-lg font-bold text-white mb-3">Total Capacity</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm">Power</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div
                          className={getCapacityColor(totalCapacity.power.used, totalCapacity.power.capacity)}
                          style={{ width: `${(totalCapacity.power.used / totalCapacity.power.capacity) * 100}%` }}
                        />
                      </div>
                      <span className="text-white text-sm">{totalCapacity.power.used.toFixed(0)} / {totalCapacity.power.capacity.toFixed(0)} W</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Cooling</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div
                          className={getCapacityColor(totalCapacity.cooling.used, totalCapacity.cooling.capacity)}
                          style={{ width: `${(totalCapacity.cooling.used / totalCapacity.cooling.capacity) * 100}%` }}
                        />
                      </div>
                      <span className="text-white text-sm">{totalCapacity.cooling.used.toFixed(0)} / {totalCapacity.cooling.capacity.toFixed(0)} W</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Network</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div
                          className={getCapacityColor(totalCapacity.network.used, totalCapacity.network.capacity)}
                          style={{ width: `${(totalCapacity.network.used / totalCapacity.network.capacity) * 100}%` }}
                        />
                      </div>
                      <span className="text-white text-sm">{totalCapacity.network.used.toFixed(0)} / {totalCapacity.network.capacity.toFixed(0)} Mbps</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Hardware</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div
                          className={getCapacityColor(totalCapacity.hardware.used, totalCapacity.hardware.capacity)}
                          style={{ width: `${(totalCapacity.hardware.used / totalCapacity.hardware.capacity) * 100}%` }}
                        />
                      </div>
                      <span className="text-white text-sm">{totalCapacity.hardware.used} / {totalCapacity.hardware.capacity}</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedBuilding && buildingCapacity && (
                <div className="bg-gray-800 rounded p-4">
                  <h3 className="text-lg font-bold text-white mb-3">Building Capacity: {selectedBuilding.name}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-400 text-sm">Power</label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div
                            className={getCapacityColor(buildingCapacity.power.used, buildingCapacity.power.capacity)}
                            style={{ width: `${(buildingCapacity.power.used / buildingCapacity.power.capacity) * 100}%` }}
                          />
                        </div>
                        <span className="text-white text-sm">{buildingCapacity.power.used.toFixed(0)} / {buildingCapacity.power.capacity.toFixed(0)} W</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">Cooling</label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div
                            className={getCapacityColor(buildingCapacity.cooling.used, buildingCapacity.cooling.capacity)}
                            style={{ width: `${(buildingCapacity.cooling.used / buildingCapacity.cooling.capacity) * 100}%` }}
                          />
                        </div>
                        <span className="text-white text-sm">{buildingCapacity.cooling.used.toFixed(0)} / {buildingCapacity.cooling.capacity.toFixed(0)} W</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">Network</label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div
                            className={getCapacityColor(buildingCapacity.network.used, buildingCapacity.network.capacity)}
                            style={{ width: `${(buildingCapacity.network.used / buildingCapacity.network.capacity) * 100}%` }}
                          />
                        </div>
                        <span className="text-white text-sm">{buildingCapacity.network.used.toFixed(0)} / {buildingCapacity.network.capacity.toFixed(0)} Mbps</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">Hardware</label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div
                            className={getCapacityColor(buildingCapacity.hardware.used, buildingCapacity.hardware.capacity)}
                            style={{ width: `${(buildingCapacity.hardware.used / buildingCapacity.hardware.capacity) * 100}%` }}
                          />
                        </div>
                        <span className="text-white text-sm">{buildingCapacity.hardware.used} / {buildingCapacity.hardware.capacity}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'expansion' && (
            <div className="space-y-4">
              <div className="bg-gray-800 rounded p-4">
                <h3 className="text-lg font-bold text-white mb-3">Available Expansions</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {expansionDefinitions.map((def) => (
                    <div key={def.type} className="p-3 bg-gray-700 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-semibold">{def.name}</span>
                        <span className="text-gray-400 text-xs">{def.cost.time / 1000}s</span>
                      </div>
                      <div className="text-gray-400 text-sm">{def.description}</div>
                      {selectedBuilding && (
                        <button
                          onClick={() => handleStartExpansion(def.type)}
                          className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm"
                        >
                          Apply to {selectedBuilding.name}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 rounded p-4">
                <h3 className="text-lg font-bold text-white mb-3">Active Expansions</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {expansions.length === 0 ? (
                    <div className="text-gray-400 text-center py-4">No active expansions</div>
                  ) : (
                    expansions.map((expansion) => (
                      <div key={expansion.expansionId} className="p-3 bg-gray-700 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-semibold">{expansion.type}</span>
                          <span className={`text-xs px-2 py-1 rounded ${expansion.isCompleted ? 'bg-green-600' : 'bg-yellow-600'}`}>
                            {expansion.isCompleted ? 'Completed' : 'In Progress'}
                          </span>
                        </div>
                        <div className="text-gray-400 text-sm">Building: {expansion.buildingId}</div>
                        <div className="text-gray-400 text-sm">Level: {expansion.level} / {expansion.maxLevel}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
