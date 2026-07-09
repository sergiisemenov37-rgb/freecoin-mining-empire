'use client';

/**
 * Energy Overlay
 * Developer tool for visualizing power flow, heat map, cooling coverage, energy bottlenecks, overheated objects, power usage, and battery charge
 */

import { useState, useEffect, useRef } from 'react';
import { EnergySystem } from '@/lib/energy/EnergySystem';

interface EnergyOverlayProps {
  energySystem: EnergySystem;
}

export default function EnergyOverlay({ energySystem }: EnergyOverlayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'power' | 'thermal' | 'hardware'>('power');
  
  // Power state
  const [gridState, setGridState] = useState<any>(null);
  const [powerSources, setPowerSources] = useState<any[]>([]);
  const [powerConsumers, setPowerConsumers] = useState<any[]>([]);
  const [batteries, setBatteries] = useState<any[]>([]);
  
  // Thermal state
  const [thermalState, setThermalState] = useState<any>(null);
  const [heatSources, setHeatSources] = useState<any[]>([]);
  const [coolingSystems, setCoolingSystems] = useState<any[]>([]);
  
  // Hardware state
  const [hardwareStates, setHardwareStates] = useState<any[]>([]);

  const refreshInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const refresh = () => {
      const powerSystem = energySystem.getPowerSystem();
      const thermalSystem = energySystem.getThermalSystem();
      
      setGridState(powerSystem.getGridState());
      setPowerSources(powerSystem.getAllPowerSources());
      setPowerConsumers(powerSystem.getAllPowerConsumers());
      setBatteries(powerSystem.getAllBatteries());
      
      setThermalState(thermalSystem.getThermalState());
      setHeatSources(thermalSystem.getAllHeatSources());
      setCoolingSystems(thermalSystem.getAllCoolingSystems());
      
      setHardwareStates(energySystem.getAllHardwareStates());
    };

    refresh();
    refreshInterval.current = setInterval(refresh, 500);

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [energySystem]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold z-50"
      >
        Energy Overlay
      </button>
    );
  }

  const getTemperatureColor = (temp: number, maxTemp: number) => {
    const ratio = temp / maxTemp;
    if (ratio < 0.5) return 'bg-green-500';
    if (ratio < 0.75) return 'bg-yellow-500';
    if (ratio < 0.9) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 0.8) return 'text-green-400';
    if (efficiency >= 0.5) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Energy & Cooling Overlay</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('power')}
            className={`px-4 py-2 text-sm font-semibold ${
              activeTab === 'power' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Power
          </button>
          <button
            onClick={() => setActiveTab('thermal')}
            className={`px-4 py-2 text-sm font-semibold ${
              activeTab === 'thermal' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Thermal
          </button>
          <button
            onClick={() => setActiveTab('hardware')}
            className={`px-4 py-2 text-sm font-semibold ${
              activeTab === 'hardware' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Hardware
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[70vh]">
          {activeTab === 'power' && gridState && (
            <div className="space-y-4">
              <div className="bg-gray-800 rounded p-4">
                <h3 className="text-lg font-bold text-white mb-3">Power Grid Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm">Generation</label>
                    <div className="text-2xl font-bold text-green-400">{gridState.totalGeneration.toFixed(0)} W</div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Consumption</label>
                    <div className="text-2xl font-bold text-blue-400">{gridState.totalConsumption.toFixed(0)} W</div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Surplus</label>
                    <div className={`text-2xl font-bold ${gridState.surplus > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                      {gridState.surplus.toFixed(0)} W
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Deficit</label>
                    <div className={`text-2xl font-bold ${gridState.deficit > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                      {gridState.deficit.toFixed(0)} W
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Status</label>
                    <div className={`text-2xl font-bold ${gridState.isBalanced ? 'text-green-400' : 'text-red-400'}`}>
                      {gridState.isBalanced ? 'Balanced' : 'Unbalanced'}
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Outage</label>
                    <div className={`text-2xl font-bold ${gridState.isInOutage ? 'text-red-400' : 'text-green-400'}`}>
                      {gridState.isInOutage ? 'Active' : 'None'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded p-4">
                <h3 className="text-lg font-bold text-white mb-3">Power Sources</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {powerSources.map((source) => (
                    <div key={source.id} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${source.isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-white text-sm">{source.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white text-sm">{source.currentOutput.toFixed(0)} / {source.maxOutput.toFixed(0)} W</div>
                        <div className="text-gray-400 text-xs">{(source.efficiency * 100).toFixed(0)}% efficiency</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 rounded p-4">
                <h3 className="text-lg font-bold text-white mb-3">Power Consumers</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {powerConsumers.map((consumer) => (
                    <div key={consumer.id} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${consumer.isPowered ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-white text-sm">{consumer.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white text-sm">{consumer.currentConsumption.toFixed(0)} W</div>
                        <div className="text-gray-400 text-xs">{consumer.priority}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 rounded p-4">
                <h3 className="text-lg font-bold text-white mb-3">Batteries</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {batteries.map((battery) => (
                    <div key={battery.id} className="p-2 bg-gray-700 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white text-sm">{battery.name}</span>
                        <span className={`text-xs px-2 py-1 rounded ${battery.isReserve ? 'bg-yellow-600' : 'bg-gray-600'}`}>
                          {battery.isReserve ? 'Reserve' : 'Normal'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(battery.currentCharge / battery.capacity) * 100}%` }}
                          />
                        </div>
                        <span className="text-gray-400 text-xs">{(battery.currentCharge / battery.capacity * 100).toFixed(0)}%</span>
                      </div>
                      <div className="text-gray-400 text-xs mt-1">
                        {battery.currentCharge.toFixed(0)} / {battery.capacity.toFixed(0)} Wh
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'thermal' && thermalState && (
            <div className="space-y-4">
              <div className="bg-gray-800 rounded p-4">
                <h3 className="text-lg font-bold text-white mb-3">Thermal Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm">Ambient Temp</label>
                    <div className="text-2xl font-bold text-white">{thermalState.ambientTemperature.toFixed(1)} °C</div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Heat Generation</label>
                    <div className="text-2xl font-bold text-red-400">{thermalState.totalHeatGeneration.toFixed(0)} W</div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Cooling Capacity</label>
                    <div className="text-2xl font-bold text-blue-400">{thermalState.totalCoolingCapacity.toFixed(0)} W</div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Heat Surplus</label>
                    <div className={`text-2xl font-bold ${thermalState.heatSurplus > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {thermalState.heatSurplus.toFixed(0)} W
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Status</label>
                    <div className={`text-2xl font-bold ${thermalState.isBalanced ? 'text-green-400' : 'text-red-400'}`}>
                      {thermalState.isBalanced ? 'Balanced' : 'Unbalanced'}
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Emergency Cooling</label>
                    <div className={`text-2xl font-bold ${thermalState.emergencyCoolingActive ? 'text-red-400' : 'text-green-400'}`}>
                      {thermalState.emergencyCoolingActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded p-4">
                <h3 className="text-lg font-bold text-white mb-3">Heat Map</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {heatSources.map((source) => (
                    <div key={source.id} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${getTemperatureColor(source.temperature, source.maxTemperature)}`} />
                        <span className="text-white text-sm">{source.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white text-sm">{source.temperature.toFixed(1)} °C</div>
                        <div className="text-gray-400 text-xs">{source.currentGeneration.toFixed(0)} W</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 rounded p-4">
                <h3 className="text-lg font-bold text-white mb-3">Cooling Systems</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {coolingSystems.map((cooling) => (
                    <div key={cooling.id} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${cooling.isActive ? 'bg-blue-500' : 'bg-gray-500'}`} />
                        <span className="text-white text-sm">{cooling.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white text-sm">{cooling.currentCapacity.toFixed(0)} W</div>
                        <div className="text-gray-400 text-xs">{(cooling.efficiency * 100).toFixed(0)}% efficiency</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hardware' && (
            <div className="space-y-4">
              <div className="bg-gray-800 rounded p-4">
                <h3 className="text-lg font-bold text-white mb-3">Hardware Efficiency</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {hardwareStates.map((state) => (
                    <div key={state.hardwareId} className="p-3 bg-gray-700 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-semibold">{state.hardwareId}</span>
                        <span className={`text-lg font-bold ${getEfficiencyColor(state.overallEfficiency)}`}>
                          {(state.overallEfficiency * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div>
                          <label className="text-gray-400">Power</label>
                          <div className={`text-white ${(state.powerEfficiency * 100).toFixed(0)}%`}>
                            {(state.powerEfficiency * 100).toFixed(0)}%
                          </div>
                        </div>
                        <div>
                          <label className="text-gray-400">Cooling</label>
                          <div className={`text-white ${getEfficiencyColor(state.coolingEfficiency)}`}>
                            {(state.coolingEfficiency * 100).toFixed(0)}%
                          </div>
                        </div>
                        <div>
                          <label className="text-gray-400">Sim</label>
                          <div className="text-white">{(state.simulationEfficiency * 100).toFixed(0)}%</div>
                        </div>
                        <div>
                          <label className="text-gray-400">Net</label>
                          <div className="text-white">{(state.networkEfficiency * 100).toFixed(0)}%</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-gray-400 text-xs">Temp:</span>
                        <span className={`text-white text-xs ${state.isOverheated ? 'text-red-400' : ''}`}>
                          {state.temperature.toFixed(1)} °C
                        </span>
                        {state.isOverheated && (
                          <span className="text-red-400 text-xs font-semibold">OVERHEATED</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
