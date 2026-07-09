/**
 * Thermal System
 * Manages heat generation, transfer, accumulation, and cooling
 * Supports cooling coverage, efficiency, overheating, emergency shutdown, and thermal recovery
 */

import type {
  HeatSourceConfig,
  CoolingConfig,
  ThermalState,
  EnergyEvent,
  EnergyEventListener,
  EnergySystemConfig,
} from './types';
import {
  HeatSourceType,
  HeatTransferType,
  CoolingType,
  EnergyEventType,
  DEFAULT_ENERGY_CONFIG,
} from './types';

/**
 * Position interface for coverage calculation
 */
interface Position {
  x: number;
  y: number;
  z?: number;
}

/**
 * Thermal system class
 */
export class ThermalSystem {
  private state: ThermalState;
  private config: EnergySystemConfig;
  private heatSources: Map<string, HeatSourceConfig>;
  private coolingSystems: Map<string, CoolingConfig>;
  private eventListeners: Map<EnergyEventType, Set<EnergyEventListener>>;
  private updateInterval: NodeJS.Timeout | null;
  private hardwarePositions: Map<string, Position>;

  constructor(config?: Partial<EnergySystemConfig>) {
    this.config = {
      ...DEFAULT_ENERGY_CONFIG,
      ...config,
    };

    this.state = {
      ambientTemperature: 25, // Default ambient temperature (°C)
      totalHeatGeneration: 0,
      totalCoolingCapacity: 0,
      heatSurplus: 0,
      isBalanced: true,
      emergencyCoolingActive: false,
      emergencyShutdownActive: false,
      lastUpdated: Date.now(),
    };

    this.heatSources = new Map();
    this.coolingSystems = new Map();
    this.eventListeners = new Map();
    this.updateInterval = null;
    this.hardwarePositions = new Map();

    this.startUpdates();
  }

  /**
   * Add heat source
   */
  addHeatSource(source: HeatSourceConfig, position?: Position): void {
    this.heatSources.set(source.id, source);
    if (position) {
      this.hardwarePositions.set(source.hardwareId, position);
    }
    this.recalculateThermal();
  }

  /**
   * Remove heat source
   */
  removeHeatSource(sourceId: string): void {
    const source = this.heatSources.get(sourceId);
    if (source) {
      this.hardwarePositions.delete(source.hardwareId);
    }
    this.heatSources.delete(sourceId);
    this.recalculateThermal();
  }

  /**
   * Update heat source generation
   */
  updateHeatGeneration(sourceId: string, generation: number): void {
    const source = this.heatSources.get(sourceId);
    if (!source) return;

    source.currentGeneration = generation;
    this.recalculateThermal();
  }

  /**
   * Set hardware position
   */
  setHardwarePosition(hardwareId: string, position: Position): void {
    this.hardwarePositions.set(hardwareId, position);
    this.recalculateCoolingCoverage();
  }

  /**
   * Add cooling system
   */
  addCoolingSystem(cooling: CoolingConfig, position?: Position): void {
    this.coolingSystems.set(cooling.id, cooling);
    if (position && cooling.hardwareId) {
      this.hardwarePositions.set(cooling.hardwareId, position);
    }
    this.recalculateThermal();
  }

  /**
   * Remove cooling system
   */
  removeCoolingSystem(coolingId: string): void {
    const cooling = this.coolingSystems.get(coolingId);
    if (cooling && cooling.hardwareId) {
      this.hardwarePositions.delete(cooling.hardwareId);
    }
    this.coolingSystems.delete(coolingId);
    this.recalculateThermal();
  }

  /**
   * Update cooling system capacity
   */
  updateCoolingCapacity(coolingId: string, capacity: number): void {
    const cooling = this.coolingSystems.get(coolingId);
    if (!cooling) return;

    cooling.currentCapacity = Math.min(capacity, cooling.baseCapacity);
    this.recalculateThermal();
  }

  /**
   * Set cooling system active status
   */
  setCoolingActive(coolingId: string, isActive: boolean): void {
    const cooling = this.coolingSystems.get(coolingId);
    if (!cooling) return;

    cooling.isActive = isActive;
    cooling.currentCapacity = isActive ? cooling.baseCapacity : 0;
    this.recalculateThermal();
  }

  /**
   * Set ambient temperature
   */
  setAmbientTemperature(temperature: number): void {
    this.state.ambientTemperature = temperature;
    this.recalculateThermal();
  }

  /**
   * Recalculate thermal state
   */
  private recalculateThermal(): void {
    let totalHeatGeneration = 0;
    let totalCoolingCapacity = 0;

    // Calculate total heat generation
    for (const source of this.heatSources.values()) {
      totalHeatGeneration += source.currentGeneration;
    }

    // Calculate total cooling capacity
    for (const cooling of this.coolingSystems.values()) {
      if (cooling.isActive) {
        totalCoolingCapacity += cooling.currentCapacity * cooling.efficiency;
      }
    }

    this.state.totalHeatGeneration = totalHeatGeneration;
    this.state.totalCoolingCapacity = totalCoolingCapacity;
    this.state.heatSurplus = Math.max(0, totalHeatGeneration - totalCoolingCapacity);
    this.state.isBalanced = this.state.heatSurplus === 0;
    this.state.lastUpdated = Date.now();

    // Update heat source temperatures
    this.updateTemperatures();

    // Check for overheating
    this.checkOverheating();

    // Handle heat surplus
    if (this.state.heatSurplus > 0) {
      this.handleHeatSurplus();
    }
  }

  /**
   * Recalculate cooling coverage
   */
  private recalculateCoolingCoverage(): void {
    // Calculate cooling coverage for each heat source
    for (const source of this.heatSources.values()) {
      const sourcePosition = this.hardwarePositions.get(source.hardwareId);
      if (!sourcePosition) continue;

      let totalCooling = 0;

      for (const cooling of this.coolingSystems.values()) {
        if (!cooling.isActive) continue;

        const coolingPosition = this.hardwarePositions.get(cooling.hardwareId);
        if (!coolingPosition) continue;

        const distance = this.calculateDistance(sourcePosition, coolingPosition);
        
        if (distance <= cooling.coverage) {
          // Cooling efficiency decreases with distance
          const coverageEfficiency = 1 - (distance / cooling.coverage);
          totalCooling += cooling.currentCapacity * cooling.efficiency * coverageEfficiency;
        }
      }

      // Apply cooling to heat source
      this.applyCoolingToSource(source, totalCooling);
    }
  }

  /**
   * Calculate distance between two positions
   */
  private calculateDistance(pos1: Position, pos2: Position): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = (pos1.z || 0) - (pos2.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Apply cooling to heat source
   */
  private applyCoolingToSource(source: HeatSourceConfig, cooling: number): void {
    // Net heat = generation - cooling
    const netHeat = source.currentGeneration - cooling;

    // Temperature change based on net heat
    // Simplified thermal model: temperature change proportional to net heat
    const temperatureChange = netHeat * 0.01; // Scaling factor

    source.temperature = Math.max(
      this.state.ambientTemperature,
      source.temperature + temperatureChange
    );

    // Clamp to max temperature
    source.temperature = Math.min(source.temperature, source.maxTemperature);
  }

  /**
   * Update temperatures for all heat sources
   */
  private updateTemperatures(): void {
    this.recalculateCoolingCoverage();

    for (const source of this.heatSources.values()) {
      // Natural cooling towards ambient temperature
      if (source.temperature > this.state.ambientTemperature) {
        const coolingRate = (source.temperature - this.state.ambientTemperature) * 0.001;
        source.temperature -= coolingRate;
      }
    }
  }

  /**
   * Check for overheating
   */
  private checkOverheating(): void {
    for (const source of this.heatSources.values()) {
      const wasOverheated = source.isOverheated;
      source.isOverheated = source.temperature >= this.config.overheatingThreshold;

      if (!wasOverheated && source.isOverheated) {
        this.fireEvent({
          type: EnergyEventType.OVERHEATED,
          timestamp: Date.now(),
          hardwareId: source.hardwareId,
        } as any);
      }

      if (wasOverheated && !source.isOverheated) {
        this.fireEvent({
          type: EnergyEventType.COOLED_DOWN,
          timestamp: Date.now(),
          hardwareId: source.hardwareId,
        } as any);
      }

      // Check for emergency cooling threshold
      if (source.temperature >= this.config.emergencyCoolingThreshold && !this.state.emergencyCoolingActive) {
        this.activateEmergencyCooling();
      }

      // Check for emergency shutdown threshold
      if (source.temperature >= this.config.emergencyShutdownThreshold) {
        this.triggerEmergencyShutdown(source.hardwareId, source.temperature);
      }
    }
  }

  /**
   * Handle heat surplus
   */
  private handleHeatSurplus(): void {
    // Increase ambient temperature gradually
    this.state.ambientTemperature += this.state.heatSurplus * 0.0001;
  }

  /**
   * Activate emergency cooling
   */
  private activateEmergencyCooling(): void {
    if (this.state.emergencyCoolingActive) return;

    this.state.emergencyCoolingActive = true;

    // Activate all emergency cooling systems
    for (const cooling of this.coolingSystems.values()) {
      if (cooling.isEmergency) {
        cooling.isActive = true;
        cooling.currentCapacity = cooling.baseCapacity * 2; // Double capacity for emergency
      }
    }

    this.fireEvent({
      type: EnergyEventType.EMERGENCY_COOLING,
      timestamp: Date.now(),
    } as any);

    this.recalculateThermal();
  }

  /**
   * Deactivate emergency cooling
   */
  private deactivateEmergencyCooling(): void {
    if (!this.state.emergencyCoolingActive) return;

    this.state.emergencyCoolingActive = false;

    // Reset emergency cooling systems
    for (const cooling of this.coolingSystems.values()) {
      if (cooling.isEmergency) {
        cooling.currentCapacity = cooling.baseCapacity;
      }
    }

    this.recalculateThermal();
  }

  /**
   * Trigger emergency shutdown
   */
  private triggerEmergencyShutdown(hardwareId: string, temperature: number): void {
    this.state.emergencyShutdownActive = true;

    // Shut down the overheating hardware
    const source = this.heatSources.get(hardwareId);
    if (source) {
      source.currentGeneration = 0;
    }

    this.fireEvent({
      type: EnergyEventType.EMERGENCY_SHUTDOWN,
      timestamp: Date.now(),
      hardwareId,
    } as any);
  }

  /**
   * Thermal recovery
   */
  private thermalRecovery(): void {
    if (!this.state.emergencyShutdownActive) return;

    let allCooled = true;

    for (const source of this.heatSources.values()) {
      if (source.temperature > this.config.overheatingThreshold) {
        allCooled = false;
        // Recovery cooling
        source.temperature -= this.config.thermalRecoveryRate;
      }
    }

    if (allCooled) {
      this.state.emergencyShutdownActive = false;
      this.deactivateEmergencyCooling();
    }
  }

  /**
   * Start automatic updates
   */
  private startUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(() => {
      this.update();
    }, this.config.balanceInterval);
  }

  /**
   * Stop automatic updates
   */
  private stopUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Update thermal system
   */
  private update(): void {
    this.recalculateThermal();
    this.thermalRecovery();
  }

  /**
   * Get heat source
   */
  getHeatSource(sourceId: string): HeatSourceConfig | undefined {
    return this.heatSources.get(sourceId);
  }

  /**
   * Get all heat sources
   */
  getAllHeatSources(): HeatSourceConfig[] {
    return Array.from(this.heatSources.values());
  }

  /**
   * Get cooling system
   */
  getCoolingSystem(coolingId: string): CoolingConfig | undefined {
    return this.coolingSystems.get(coolingId);
  }

  /**
   * Get all cooling systems
   */
  getAllCoolingSystems(): CoolingConfig[] {
    return Array.from(this.coolingSystems.values());
  }

  /**
   * Get thermal state
   */
  getThermalState(): ThermalState {
    return { ...this.state };
  }

  /**
   * Get state
   */
  getState(): {
    thermal: ThermalState;
    heatSources: Map<string, HeatSourceConfig>;
    coolingSystems: Map<string, CoolingConfig>;
    hardwarePositions: Map<string, Position>;
  } {
    return {
      thermal: { ...this.state },
      heatSources: new Map(this.heatSources),
      coolingSystems: new Map(this.coolingSystems),
      hardwarePositions: new Map(this.hardwarePositions),
    };
  }

  /**
   * Set state
   */
  setState(state: {
    thermal: ThermalState;
    heatSources: Map<string, HeatSourceConfig>;
    coolingSystems: Map<string, CoolingConfig>;
    hardwarePositions: Map<string, Position>;
  }): void {
    this.state = { ...state.thermal };
    this.heatSources = new Map(state.heatSources);
    this.coolingSystems = new Map(state.coolingSystems);
    this.hardwarePositions = new Map(state.hardwarePositions);
  }

  /**
   * Reset thermal system
   */
  reset(): void {
    this.state = {
      ambientTemperature: 25,
      totalHeatGeneration: 0,
      totalCoolingCapacity: 0,
      heatSurplus: 0,
      isBalanced: true,
      emergencyCoolingActive: false,
      emergencyShutdownActive: false,
      lastUpdated: Date.now(),
    };

    this.heatSources.clear();
    this.coolingSystems.clear();
    this.hardwarePositions.clear();
  }

  /**
   * Register event listener
   */
  on(eventType: EnergyEventType, listener: EnergyEventListener): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(listener);
  }

  /**
   * Unregister event listener
   */
  off(eventType: EnergyEventType, listener: EnergyEventListener): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Fire event to listeners
   */
  private fireEvent(event: EnergyEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      for (const listener of listeners) {
        listener(event);
      }
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<EnergySystemConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get configuration
   */
  getConfig(): EnergySystemConfig {
    return { ...this.config };
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stopUpdates();
  }
}
