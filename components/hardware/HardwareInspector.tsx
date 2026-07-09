'use client';

/**
 * Hardware Inspector
 * Developer tool for inspecting hardware instances
 * Supports filtering, search, and property display
 */

import { useEffect, useState } from 'react';
import { HardwareManager } from '@/lib/hardware/HardwareManager';
import type { HardwareInstance } from '@/lib/hardware/types';
import { Rarity, Quality, MaintenanceStatus, HardwareCategory } from '@/lib/hardware/types';
import { getRarityColor, getQualityColor, formatFirmwareVersion } from '@/lib/hardware/types';

interface HardwareInspectorProps {
  manager: HardwareManager;
}

export default function HardwareInspector({ manager }: HardwareInspectorProps) {
  const [instances, setInstances] = useState<HardwareInstance[]>([]);
  const [filteredInstances, setFilteredInstances] = useState<HardwareInstance[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<HardwareInstance | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadInstances();
  }, [manager]);

  useEffect(() => {
    applyFilters();
  }, [instances, searchQuery, filterCategory, filterRarity, filterStatus]);

  const loadInstances = () => {
    setInstances(manager.getAllInstances());
  };

  const applyFilters = () => {
    let filtered = [...instances];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        instance =>
          instance.id.toLowerCase().includes(query) ||
          instance.serialNumber.toLowerCase().includes(query) ||
          instance.manufacturer.toLowerCase().includes(query) ||
          instance.model.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(instance => instance.category === filterCategory);
    }

    // Rarity filter
    if (filterRarity !== 'all') {
      filtered = filtered.filter(instance => instance.rarity === filterRarity);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(instance => instance.maintenanceStatus === filterStatus);
    }

    setFilteredInstances(filtered);
  };

  const handleCreateInstance = () => {
    const types = ['gpu_basic', 'gpu_standard', 'asic_basic', 'battery_small', 'solar_basic'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    const instance = manager.createInstance(randomType, 'player_1', {});
    
    loadInstances();
    setSelectedInstance(instance);
  };

  const handlePerformMaintenance = (instanceId: string) => {
    manager.performMaintenance(instanceId);
    loadInstances();
    setSelectedInstance(manager.getInstance(instanceId));
  };

  const handleUpdateFirmware = (instanceId: string) => {
    const currentVersion = manager.getInstance(instanceId)?.firmware;
    if (currentVersion) {
      manager.updateFirmware(instanceId, {
        major: currentVersion.major,
        minor: currentVersion.minor + 1,
        patch: 0,
        build: 0,
      });
      loadInstances();
      setSelectedInstance(manager.getInstance(instanceId));
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-white">Hardware Inspector (Developer)</h1>

      <div className="flex gap-4">
        {/* Instance List */}
        <div className="flex-1 bg-gray-800 rounded-lg p-4">
          <div className="flex gap-2 mb-4">
            <button
              onClick={handleCreateInstance}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded"
            >
              Create Instance
            </button>
            <button
              onClick={loadInstances}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded"
            >
              Refresh
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 bg-gray-700 text-white rounded"
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 bg-gray-700 text-white rounded"
            >
              <option value="all">All Categories</option>
              <option value="gpu">GPU</option>
              <option value="asic">ASIC</option>
              <option value="cpu_cluster">CPU Cluster</option>
              <option value="battery">Battery</option>
              <option value="generator">Generator</option>
              <option value="solar_panel">Solar Panel</option>
              <option value="cooling_unit">Cooling Unit</option>
              <option value="network_device">Network Device</option>
              <option value="robot_station">Robot Station</option>
            </select>
            <select
              value={filterRarity}
              onChange={(e) => setFilterRarity(e.target.value)}
              className="px-3 py-2 bg-gray-700 text-white rounded"
            >
              <option value="all">All Rarities</option>
              <option value="common">Common</option>
              <option value="uncommon">Uncommon</option>
              <option value="rare">Rare</option>
              <option value="epic">Epic</option>
              <option value="legendary">Legendary</option>
              <option value="mythic">Mythic</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-gray-700 text-white rounded"
            >
              <option value="all">All Status</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="needs_maintenance">Needs Maintenance</option>
              <option value="critical">Critical</option>
              <option value="broken">Broken</option>
            </select>
          </div>

          {/* Instance List */}
          <div className="text-gray-300 text-sm mb-2">
            Showing {filteredInstances.length} of {instances.length} instances
          </div>

          <div className="max-h-[600px] overflow-y-auto space-y-2">
            {filteredInstances.map((instance) => (
              <button
                key={instance.id}
                onClick={() => setSelectedInstance(instance)}
                className={`w-full text-left p-3 rounded ${
                  selectedInstance?.id === instance.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{instance.model}</div>
                    <div className="text-xs opacity-75">{instance.serialNumber}</div>
                  </div>
                  <div className="text-right">
                    <div
                      className="text-xs font-semibold"
                      style={{ color: getRarityColor(instance.rarity as Rarity) }}
                    >
                      {instance.rarity}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: getQualityColor(instance.quality as Quality) }}
                    >
                      {instance.quality}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Instance Details */}
        {selectedInstance && (
          <div className="w-96 bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-bold text-white mb-4">Instance Details</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">ID:</span>
                <span className="text-white">{selectedInstance.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Serial Number:</span>
                <span className="text-white">{selectedInstance.serialNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Category:</span>
                <span className="text-white">{selectedInstance.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Type:</span>
                <span className="text-white">{selectedInstance.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Manufacturer:</span>
                <span className="text-white">{selectedInstance.manufacturer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Model:</span>
                <span className="text-white">{selectedInstance.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Rarity:</span>
                <span
                  className="font-semibold"
                  style={{ color: getRarityColor(selectedInstance.rarity as Rarity) }}
                >
                  {selectedInstance.rarity}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Quality:</span>
                <span
                  className="font-semibold"
                  style={{ color: getQualityColor(selectedInstance.quality as Quality) }}
                >
                  {selectedInstance.quality}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Firmware:</span>
                <span className="text-white">{formatFirmwareVersion(selectedInstance.firmware)}</span>
              </div>

              <div className="border-t border-gray-700 pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Health:</span>
                  <span className="text-white">{selectedInstance.health.toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Durability:</span>
                  <span className="text-white">{selectedInstance.durability.toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Efficiency:</span>
                  <span className="text-white">{(selectedInstance.efficiency * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Power Usage:</span>
                  <span className="text-white">{selectedInstance.powerConsumption.toFixed(0)}W</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Power Generation:</span>
                  <span className="text-white">{selectedInstance.powerGeneration.toFixed(0)}W</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Heat Generation:</span>
                  <span className="text-white">{selectedInstance.heatGeneration.toFixed(0)}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cooling Capacity:</span>
                  <span className="text-white">{selectedInstance.coolingCapacity.toFixed(0)} BTU</span>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Maintenance Status:</span>
                  <span className="text-white">{selectedInstance.maintenanceStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Maintenance:</span>
                  <span className="text-white">
                    {new Date(selectedInstance.lastMaintenanceDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Owner:</span>
                  <span className="text-white">{selectedInstance.ownerId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Installed:</span>
                  <span className="text-white">
                    {selectedInstance.installedPosition
                      ? `(${selectedInstance.installedPosition.x}, ${selectedInstance.installedPosition.y})`
                      : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Created:</span>
                  <span className="text-white">
                    {new Date(selectedInstance.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Updated:</span>
                  <span className="text-white">
                    {new Date(selectedInstance.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Version:</span>
                  <span className="text-white">{selectedInstance.version}</span>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-3 mt-3 space-y-2">
                <button
                  onClick={() => handlePerformMaintenance(selectedInstance.id)}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded"
                >
                  Perform Maintenance
                </button>
                <button
                  onClick={() => handleUpdateFirmware(selectedInstance.id)}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded"
                >
                  Update Firmware
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
