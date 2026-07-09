/**
 * Energy System
 * Central coordinator for power and thermal systems
 * Calculates hardware efficiency based on Power, Cooling, Simulation, and Network requirements
 */

import { PowerSystem } from './PowerSystem';
import { ThermalSystem } from './ThermalSystem';
import type {
  HardwareEnergyRequirements,
  HardwareEnergyState,
  EnergyEvent,
  EnergyEventListener,
  EnergySystemConfig,
} from './types';
import {
  EnergyEventType,
  DEFAULT_ENERGY_CONFIG,
} from './types';

/**
 * Energy system class
 */
export class EnergySystem {
  private powerSystem: PowerSystem;
  private thermalSystem: ThermalSystem;
  private config: EnergySystemConfig;
  private hardwareStates: Map<string, HardwareEnergyState>;
  private hardwareRequirements: Map<string, HardwareEnergyRequirements>;
  private eventListeners: Map<EnergyEventType, Set<EnergyEventListener>>;
  private updateInterval: NodeJS.Timeout | null;

  constructor(config?: Partial<EnergySystemConfig>) {
    this.config = {
      ...DEFAULT_ENERGY_CONFIG,
      ...config,
    };

    this.powerSystem = new PowerSystem(this.config);
    this.thermalSystem = new ThermalSystem(this.config);
    this.hardwareStates = new Map();
    this.hardwareRequirements = new Map();
    this.eventListeners = new Map();
    this.updateInterval = null;

    this.setupEventIntegration();
    this.startUpdates();
  }

  /**
   * Setup event integration between power and thermal systems
   */
  private setupEventIntegration(): void {
    // Forward power system events
    const powerEvents: EnergyEventType[] = [
      EnergyEventType.POWER_LOST,
      EnergyEventType.POWER_RESTORED,
      EnergyEventType.BATTERY_CHARGED,
      EnergyEventType.BATTERY_EMPTY,
      EnergyEventType.GENERATOR_STARTED,
      EnergyEventType.GENERATOR_STOPPED,
      EnergyEventType.POWER_PRIORITY_CHANGED,
      EnergyEventType.BATTERY_STATUS_CHANGED,
    ];

    for (const eventType of powerEvents) {
      this.powerSystem.on(eventType, (event) => {
        this.handlePowerEvent(event);
      });
    }

    // Forward thermal system events
    const thermalEvents: EnergyEventType[] = [
      EnergyEventType.OVERHEATED,
      EnergyEventType.COOLED_DOWN,
      EnergyEventType.EMERGENCY_SHUTDOWN,
      EnergyEventType.EMERGENCY_COOLING,
    ];

    for (const eventType of thermalEvents) {
      this.thermalSystem.on(eventType, (event) => {
        this.handleThermalEvent(event);
      });
    }
  }

  /**
   * Handle power system events
   */
  private handlePowerEvent(event: EnergyEvent): void {
    this.fireEvent(event);

    // Update hardware efficiency when power changes
    if (event.hardwareId) {
      this.updateHardwareEfficiency(event.hardwareId);
    }
  }

  /**
   * Handle thermal system events
   */
  private handleThermalEvent(event: EnergyEvent): void {
    this.fireEvent(event);

    // Update hardware efficiency when thermal state changes
    if (event.hardwareId) {
      this.updateHardwareEfficiency(event.hardwareId);
    }
  }

  /**
   * Register hardware with energy requirements
   */
  registerHardware(
    hardwareId: string,
    requirements: HardwareEnergyRequirements
  ): void {
    this.hardwareRequirements.set(hardwareId, requirements);

    // Initialize hardware state
    this.hardwareStates.set(hardwareId, {
      hardwareId,
      powerReceived: 0,
      powerEfficiency: 0,
      coolingReceived: 0,
      coolingEfficiency: 0,
      simulationEfficiency: 1,
      networkEfficiency: 1,
      overallEfficiency: 0,
      temperature: this.thermalSystem.getThermalState().ambientTemperature,
      isOverheated: false,
      isEmergencyShutdown: false,
      lastUpdated: Date.now(),
    });

    // Add as power consumer
    this.powerSystem.addPowerConsumer({
      id: `consumer_${hardwareId}`,
      hardwareId,
      name: `Hardware ${hardwareId}`,
      baseConsumption: requirements.powerRequired,
      currentConsumption: requirements.powerRequired,
      priority: 'medium' as any,
      isPowered: true,
      efficiency: 1,
    });

    // Add as heat source
    this.thermalSystem.addHeatSource({
      id: `heat_${hardwareId}`,
      hardwareId,
      type: 'computation' as any,
      name: `Hardware ${hardwareId} Heat`,
      baseGeneration: requirements.coolingRequired * 0.5, // Heat is 50% of cooling requirement
      currentGeneration: requirements.coolingRequired * 0.5,
      temperature: this.thermalSystem.getThermalState().ambientTemperature,
      maxTemperature: this.config.maxTemperature,
      isOverheated: false,
    });
  }

  /**
   * Unregister hardware
   */
  unregisterHardware(hardwareId: string): void {
    this.hardwareRequirements.delete(hardwareId);
    this.hardwareStates.delete(hardwareId);

    this.powerSystem.removePowerConsumer(`consumer_${hardwareId}`);
    this.thermalSystem.removeHeatSource(`heat_${hardwareId}`);
  }

  /**
   * Update hardware efficiency
   */
  private updateHardwareEfficiency(hardwareId: string): void {
    const requirements = this.hardwareRequirements.get(hardwareId);
    const state = this.hardwareStates.get(hardwareId);
    if (!requirements || !state) return;

    // Get power consumer
    const consumer = this.powerSystem.getPowerConsumer(`consumer_${hardwareId}`);
    if (!consumer) return;

    // Get heat source
    const heatSource = this.thermalSystem.getHeatSource(`heat_${hardwareId}`);
    if (!heatSource) return;

    // Calculate power efficiency
    if (consumer.isPowered) {
      state.powerReceived = requirements.powerRequired;
      state.powerEfficiency = consumer.efficiency;
    } else {
      state.powerReceived = 0;
      state.powerEfficiency = 0;
    }

    // Calculate cooling efficiency based on temperature
    const temperature = heatSource.temperature;
    const maxTemp = heatSource.maxTemperature;
    const ambientTemp = this.thermalSystem.getThermalState().ambientTemperature;

    // Cooling efficiency decreases as temperature increases
    const tempRatio = (temperature - ambientTemp) / (maxTemp - ambientTemp);
    state.coolingEfficiency = Math.max(0, 1 - tempRatio);
    state.coolingReceived = requirements.coolingRequired * state.coolingEfficiency;

    // Update temperature and overheating state
    state.temperature = temperature;
    state.isOverheated = heatSource.isOverheated;

    // Calculate overall efficiency
    // Overall = (Power + Cooling + Simulation + Network) / 4
    // Each component is weighted equally
    const powerComponent = state.powerEfficiency;
    const coolingComponent = state.coolingEfficiency;
    const simulationComponent = state.simulationEfficiency;
    const networkComponent = state.networkEfficiency;

    state.overallEfficiency = (powerComponent + coolingComponent + simulationComponent + networkComponent) / 4;

    // If any component is 0, overall efficiency is significantly reduced
    if (powerComponent === 0 || coolingComponent === 0) {
      state.overallEfficiency *= 0.5;
    }

    state.lastUpdated = Date.now();
  }

  /**
   * Update all hardware efficiencies
   */
  private updateAllHardwareEfficiencies(): void {
    for (const hardwareId of this.hardwareRequirements.keys()) {
      this.updateHardwareEfficiency(hardwareId);
    }
  }

  /**
   * Get hardware efficiency
   */
  getHardwareEfficiency(hardwareId: string): number {
    const state = this.hardwareStates.get(hardwareId);
    return state ? state.overallEfficiency : 0;
  }

  /**
   * Get hardware state
   */
  getHardwareState(hardwareId: string): HardwareEnergyState | undefined {
    return this.hardwareStates.get(hardwareId);
  }

  /**
   * Get all hardware states
   */
  getAllHardwareStates(): HardwareEnergyState[] {
    return Array.from(this.hardwareStates.values());
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
   * Update energy system
   */
  private update(): void {
    this.updateAllHardwareEfficiencies();
  }

  /**
   * Get power system
   */
  getPowerSystem(): PowerSystem {
    return this.powerSystem;
  }

  /**
   * Get thermal system
   */
  getThermalSystem(): ThermalSystem {
    return this.thermalSystem;
  }

  /**
   * Get state
   */
  getState(): {
    power: ReturnType<PowerSystem['getState']>;
    thermal: ReturnType<ThermalSystem['getState']>;
    hardwareStates: Map<string, HardwareEnergyState>;
    hardwareRequirements: Map<string, HardwareEnergyRequirements>;
  } {
    return {
      power: this.powerSystem.getState(),
      thermal: this.thermalSystem.getState(),
      hardwareStates: new Map(this.hardwareStates),
      hardwareRequirements: new Map(this.hardwareRequirements),
    };
  }

  /**
   * Set state
   */
  setState(state: {
    power: ReturnType<PowerSystem['getState']>;
    thermal: ReturnType<ThermalSystem['getState']>;
    hardwareStates: Map<string, HardwareEnergyState>;
    hardwareRequirements: Map<string, HardwareEnergyRequirements>;
  }): void {
    this.powerSystem.setState(state.power);
    this.thermalSystem.setState(state.thermal);
    this.hardwareStates = new Map(state.hardwareStates);
    this.hardwareRequirements = new Map(state.hardwareRequirements);
  }

  /**
   * Reset energy system
   */
  reset(): void {
    this.powerSystem.reset();
    this.thermalSystem.reset();
    this.hardwareStates.clear();
    this.hardwareRequirements.clear();
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
    this.powerSystem.updateConfig(config);
    this.thermalSystem.updateConfig(config);
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
    this.powerSystem.destroy();
    this.thermalSystem.destroy();
  }
}
