/**
 * Power System
 * Manages power generation, storage, consumption, and priorities
 * Supports reserve batteries, peak load handling, power outages, and balancing
 */

import type {
  PowerSourceConfig,
  PowerConsumerConfig,
  BatteryConfig,
  PowerGridState,
  EnergyEvent,
  EnergyEventListener,
  EnergySystemConfig,
} from './types';
import {
  PowerPriority,
  PowerSourceType,
  EnergyEventType,
  DEFAULT_ENERGY_CONFIG,
} from './types';

/**
 * Power system class
 */
export class PowerSystem {
  private state: PowerGridState;
  private config: EnergySystemConfig;
  private powerSources: Map<string, PowerSourceConfig>;
  private powerConsumers: Map<string, PowerConsumerConfig>;
  private batteries: Map<string, BatteryConfig>;
  private eventListeners: Map<EnergyEventType, Set<EnergyEventListener>>;
  private balanceInterval: NodeJS.Timeout | null;
  private outageTimer: NodeJS.Timeout | null;

  constructor(config?: Partial<EnergySystemConfig>) {
    this.config = {
      ...DEFAULT_ENERGY_CONFIG,
      ...config,
    };

    this.state = {
      totalGeneration: 0,
      totalConsumption: 0,
      totalStorage: 0,
      totalStored: 0,
      surplus: 0,
      deficit: 0,
      isBalanced: true,
      isInOutage: false,
      lastUpdated: Date.now(),
    };

    this.powerSources = new Map();
    this.powerConsumers = new Map();
    this.batteries = new Map();
    this.eventListeners = new Map();
    this.balanceInterval = null;
    this.outageTimer = null;

    if (this.config.autoBalance) {
      this.startBalancing();
    }
  }

  /**
   * Add power source
   */
  addPowerSource(source: PowerSourceConfig): void {
    this.powerSources.set(source.id, source);
    this.recalculateGrid();
  }

  /**
   * Remove power source
   */
  removePowerSource(sourceId: string): void {
    this.powerSources.delete(sourceId);
    this.recalculateGrid();
  }

  /**
   * Update power source output
   */
  updatePowerSourceOutput(sourceId: string, output: number): void {
    const source = this.powerSources.get(sourceId);
    if (!source) return;

    source.currentOutput = Math.min(output, source.maxOutput);
    this.recalculateGrid();
  }

  /**
   * Set power source online status
   */
  setPowerSourceOnline(sourceId: string, isOnline: boolean): void {
    const source = this.powerSources.get(sourceId);
    if (!source) return;

    source.isOnline = isOnline;
    source.currentOutput = isOnline ? source.maxOutput : 0;
    this.recalculateGrid();
  }

  /**
   * Add power consumer
   */
  addPowerConsumer(consumer: PowerConsumerConfig): void {
    this.powerConsumers.set(consumer.id, consumer);
    this.recalculateGrid();
  }

  /**
   * Remove power consumer
   */
  removePowerConsumer(consumerId: string): void {
    this.powerConsumers.delete(consumerId);
    this.recalculateGrid();
  }

  /**
   * Update power consumer consumption
   */
  updatePowerConsumerConsumption(consumerId: string, consumption: number): void {
    const consumer = this.powerConsumers.get(consumerId);
    if (!consumer) return;

    consumer.currentConsumption = consumption;
    this.recalculateGrid();
  }

  /**
   * Set power consumer priority
   */
  setPowerConsumerPriority(consumerId: string, priority: PowerPriority): void {
    const consumer = this.powerConsumers.get(consumerId);
    if (!consumer) return;

    consumer.priority = priority;
    this.recalculateGrid();

    this.fireEvent({
      type: EnergyEventType.POWER_PRIORITY_CHANGED,
      timestamp: Date.now(),
      hardwareId: consumer.hardwareId,
    });
  }

  /**
   * Add battery
   */
  addBattery(battery: BatteryConfig): void {
    this.batteries.set(battery.id, battery);
    this.state.totalStorage += battery.capacity;
    this.state.totalStored += battery.currentCharge;
    this.recalculateGrid();
  }

  /**
   * Remove battery
   */
  removeBattery(batteryId: string): void {
    const battery = this.batteries.get(batteryId);
    if (!battery) return;

    this.state.totalStorage -= battery.capacity;
    this.state.totalStored -= battery.currentCharge;
    this.batteries.delete(batteryId);
    this.recalculateGrid();
  }

  /**
   * Update battery charge
   */
  updateBatteryCharge(batteryId: string, charge: number): void {
    const battery = this.batteries.get(batteryId);
    if (!battery) return;

    const oldCharge = battery.currentCharge;
    battery.currentCharge = Math.max(0, Math.min(charge, battery.capacity));
    this.state.totalStored += battery.currentCharge - oldCharge;

    // Check for battery events
    if (oldCharge < battery.capacity && battery.currentCharge >= battery.capacity) {
      this.fireEvent({
        type: EnergyEventType.BATTERY_CHARGED,
        timestamp: Date.now(),
        sourceId: batteryId,
      } as any);
    }

    if (oldCharge > 0 && battery.currentCharge <= 0) {
      this.fireEvent({
        type: EnergyEventType.BATTERY_EMPTY,
        timestamp: Date.now(),
        sourceId: batteryId,
      } as any);
    }

    this.fireEvent({
      type: EnergyEventType.BATTERY_STATUS_CHANGED,
      timestamp: Date.now(),
      sourceId: batteryId,
    });
  }

  /**
   * Recalculate grid state
   */
  private recalculateGrid(): void {
    let totalGeneration = 0;
    let totalConsumption = 0;

    // Calculate total generation
    for (const source of this.powerSources.values()) {
      if (source.isOnline) {
        totalGeneration += source.currentOutput * source.efficiency;
      }
    }

    // Calculate total consumption
    for (const consumer of this.powerConsumers.values()) {
      if (consumer.isPowered) {
        totalConsumption += consumer.currentConsumption;
      }
    }

    this.state.totalGeneration = totalGeneration;
    this.state.totalConsumption = totalConsumption;
    this.state.surplus = Math.max(0, totalGeneration - totalConsumption);
    this.state.deficit = Math.max(0, totalConsumption - totalGeneration);
    this.state.isBalanced = this.state.deficit === 0;
    this.state.lastUpdated = Date.now();

    // Handle deficit
    if (this.state.deficit > 0) {
      this.handleDeficit();
    } else {
      this.clearOutageTimer();
    }

    // Handle surplus
    if (this.state.surplus > 0) {
      this.handleSurplus();
    }
  }

  /**
   * Handle power deficit
   */
  private handleDeficit(): void {
    // Start outage timer if not already running
    if (!this.outageTimer && this.state.deficit > this.config.maxPowerDeficit) {
      this.outageTimer = setTimeout(() => {
        this.triggerOutage();
      }, this.config.outageThreshold);
    }

    // Try to discharge batteries
    this.dischargeBatteries();
  }

  /**
   * Handle power surplus
   */
  private handleSurplus(): void {
    // Charge batteries with surplus
    this.chargeBatteries();
  }

  /**
   * Trigger power outage
   */
  private triggerOutage(): void {
    if (this.state.isInOutage) return;

    this.state.isInOutage = true;
    this.state.outageStartTime = Date.now();

    // Cut power to low priority consumers first
    this.cutPowerByPriority();

    // Fire events for affected consumers
    for (const consumer of this.powerConsumers.values()) {
      if (!consumer.isPowered) {
        this.fireEvent({
          type: EnergyEventType.POWER_LOST,
          timestamp: Date.now(),
          hardwareId: consumer.hardwareId,
          reason: 'Power outage triggered',
        } as any);
      }
    }
  }

  /**
   * Clear power outage
   */
  private clearOutage(): void {
    if (!this.state.isInOutage) return;

    const outageDuration = Date.now() - (this.state.outageStartTime || Date.now());
    this.state.isInOutage = false;
    this.state.outageStartTime = undefined;

    // Restore power to consumers
    this.restorePower();

    // Fire events for restored consumers
    for (const consumer of this.powerConsumers.values()) {
      if (consumer.isPowered) {
        this.fireEvent({
          type: EnergyEventType.POWER_RESTORED,
          timestamp: Date.now(),
          hardwareId: consumer.hardwareId,
          outageDuration,
        } as any);
      }
    }
  }

  /**
   * Clear outage timer
   */
  private clearOutageTimer(): void {
    if (this.outageTimer) {
      clearTimeout(this.outageTimer);
      this.outageTimer = null;
    }

    if (this.state.isInOutage && this.state.deficit <= this.config.maxPowerDeficit) {
      this.clearOutage();
    }
  }

  /**
   * Cut power by priority
   */
  private cutPowerByPriority(): void {
    const priorityOrder = [
      PowerPriority.RESERVE,
      PowerPriority.LOW,
      PowerPriority.MEDIUM,
      PowerPriority.HIGH,
    ];

    let remainingDeficit = this.state.deficit;

    for (const priority of priorityOrder) {
      if (remainingDeficit <= 0) break;

      for (const consumer of this.powerConsumers.values()) {
        if (consumer.priority === priority && consumer.isPowered) {
          consumer.isPowered = false;
          consumer.efficiency = 0;
          remainingDeficit -= consumer.currentConsumption;
        }
      }
    }
  }

  /**
   * Restore power to consumers
   */
  private restorePower(): void {
    const priorityOrder = [
      PowerPriority.CRITICAL,
      PowerPriority.HIGH,
      PowerPriority.MEDIUM,
      PowerPriority.LOW,
      PowerPriority.RESERVE,
    ];

    let availablePower = this.state.totalGeneration;

    for (const priority of priorityOrder) {
      for (const consumer of this.powerConsumers.values()) {
        if (consumer.priority === priority && !consumer.isPowered) {
          if (availablePower >= consumer.currentConsumption) {
            consumer.isPowered = true;
            consumer.efficiency = 1;
            availablePower -= consumer.currentConsumption;
          }
        }
      }
    }
  }

  /**
   * Discharge batteries
   */
  private dischargeBatteries(): void {
    for (const battery of this.batteries.values()) {
      // Skip reserve batteries unless critical
      if (battery.isReserve && battery.currentCharge / battery.capacity > this.config.reserveBatteryThreshold) {
        continue;
      }

      if (battery.currentCharge > 0 && !battery.isDischarging) {
        battery.isDischarging = true;
        battery.isCharging = false;

        const dischargeAmount = Math.min(
          battery.currentCharge,
          battery.maxDischargeRate * (this.config.balanceInterval / 1000)
        );

        battery.currentCharge -= dischargeAmount * battery.efficiency;
        this.state.totalStored -= dischargeAmount * battery.efficiency;

        // Add discharge to generation
        const dischargePower = dischargeAmount / (this.config.balanceInterval / 1000);
        this.state.totalGeneration += dischargePower;
      }
    }
  }

  /**
   * Charge batteries
   */
  private chargeBatteries(): void {
    for (const battery of this.batteries.values()) {
      if (battery.currentCharge < battery.capacity && !battery.isCharging) {
        battery.isCharging = true;
        battery.isDischarging = false;

        const chargeAmount = Math.min(
          battery.capacity - battery.currentCharge,
          battery.maxChargeRate * (this.config.balanceInterval / 1000)
        );

        battery.currentCharge += chargeAmount * battery.efficiency;
        this.state.totalStored += chargeAmount * battery.efficiency;

        // Subtract charge from surplus
        const chargePower = chargeAmount / (this.config.balanceInterval / 1000);
        this.state.surplus = Math.max(0, this.state.surplus - chargePower);
      }
    }
  }

  /**
   * Start automatic balancing
   */
  private startBalancing(): void {
    if (this.balanceInterval) {
      clearInterval(this.balanceInterval);
    }

    this.balanceInterval = setInterval(() => {
      this.balance();
    }, this.config.balanceInterval);
  }

  /**
   * Stop automatic balancing
   */
  private stopBalancing(): void {
    if (this.balanceInterval) {
      clearInterval(this.balanceInterval);
      this.balanceInterval = null;
    }
  }

  /**
   * Balance power grid
   */
  private balance(): void {
    this.recalculateGrid();
  }

  /**
   * Get power source
   */
  getPowerSource(sourceId: string): PowerSourceConfig | undefined {
    return this.powerSources.get(sourceId);
  }

  /**
   * Get all power sources
   */
  getAllPowerSources(): PowerSourceConfig[] {
    return Array.from(this.powerSources.values());
  }

  /**
   * Get power consumer
   */
  getPowerConsumer(consumerId: string): PowerConsumerConfig | undefined {
    return this.powerConsumers.get(consumerId);
  }

  /**
   * Get all power consumers
   */
  getAllPowerConsumers(): PowerConsumerConfig[] {
    return Array.from(this.powerConsumers.values());
  }

  /**
   * Get battery
   */
  getBattery(batteryId: string): BatteryConfig | undefined {
    return this.batteries.get(batteryId);
  }

  /**
   * Get all batteries
   */
  getAllBatteries(): BatteryConfig[] {
    return Array.from(this.batteries.values());
  }

  /**
   * Get grid state
   */
  getGridState(): PowerGridState {
    return { ...this.state };
  }

  /**
   * Get state
   */
  getState(): {
    grid: PowerGridState;
    sources: Map<string, PowerSourceConfig>;
    consumers: Map<string, PowerConsumerConfig>;
    batteries: Map<string, BatteryConfig>;
  } {
    return {
      grid: { ...this.state },
      sources: new Map(this.powerSources),
      consumers: new Map(this.powerConsumers),
      batteries: new Map(this.batteries),
    };
  }

  /**
   * Set state
   */
  setState(state: {
    grid: PowerGridState;
    sources: Map<string, PowerSourceConfig>;
    consumers: Map<string, PowerConsumerConfig>;
    batteries: Map<string, BatteryConfig>;
  }): void {
    this.state = { ...state.grid };
    this.powerSources = new Map(state.sources);
    this.powerConsumers = new Map(state.consumers);
    this.batteries = new Map(state.batteries);
  }

  /**
   * Reset power system
   */
  reset(): void {
    this.state = {
      totalGeneration: 0,
      totalConsumption: 0,
      totalStorage: 0,
      totalStored: 0,
      surplus: 0,
      deficit: 0,
      isBalanced: true,
      isInOutage: false,
      lastUpdated: Date.now(),
    };

    this.powerSources.clear();
    this.powerConsumers.clear();
    this.batteries.clear();
    this.clearOutageTimer();
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
    
    if (this.config.autoBalance) {
      this.startBalancing();
    } else {
      this.stopBalancing();
    }
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
    this.stopBalancing();
    this.clearOutageTimer();
  }
}
