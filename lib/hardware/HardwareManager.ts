/**
 * Hardware Manager
 * Manages hardware instances with event integration
 * Integrates with Simulation, Network, and Placement engines via events
 */

import type {
  HardwareInstance,
  HardwareConfig,
  HardwareEvent,
  HardwareEventListener,
} from './types';
import {
  HardwareEventType,
  calculateMaintenanceStatus,
} from './types';
import { HardwareFactory } from './HardwareFactory';

/**
 * Hardware manager class
 */
export class HardwareManager {
  private instances: Map<string, HardwareInstance>;
  private factory: HardwareFactory;
  private config: HardwareConfig;
  private eventListeners: Map<HardwareEventType, Set<HardwareEventListener>>;
  
  // Integration flags
  private simulationIntegration: boolean;
  private networkIntegration: boolean;
  private placementIntegration: boolean;

  constructor(config?: Partial<HardwareConfig>) {
    this.config = {
      idPrefix: 'HW',
      serialNumberFormat: 'SN-{category}-{manufacturer}-{random}',
      defaultManufacturer: 'Generic',
      rarityProbabilities: {
        common: 0.6,
        uncommon: 0.25,
        rare: 0.1,
        epic: 0.04,
        legendary: 0.009,
        mythic: 0.001,
      },
      qualityProbabilities: {
        poor: 0.1,
        fair: 0.2,
        good: 0.4,
        excellent: 0.25,
        perfect: 0.05,
      },
      maintenanceThresholds: {
        excellent: 90,
        good: 70,
        needsMaintenance: 50,
        critical: 20,
      },
      defaultFirmwareVersion: {
        major: 1,
        minor: 0,
        patch: 0,
        build: 0,
      },
      enableSimulationIntegration: true,
      enableNetworkIntegration: true,
      enablePlacementIntegration: true,
      ...config,
    };
    
    this.factory = new HardwareFactory(this.config);
    this.instances = new Map();
    this.eventListeners = new Map();
    
    this.simulationIntegration = this.config.enableSimulationIntegration;
    this.networkIntegration = this.config.enableNetworkIntegration;
    this.placementIntegration = this.config.enablePlacementIntegration;
  }

  /**
   * Create hardware instance
   */
  createInstance(
    type: string,
    ownerId: string,
    options?: {
      manufacturer?: string;
      rarity?: string;
      quality?: string;
      firmwareVersion?: { major: number; minor: number; patch: number; build: number };
      configuration?: Record<string, unknown>;
    }
  ): HardwareInstance {
    const instance = this.factory.createInstance({
      type: type as any,
      ownerId,
      manufacturer: options?.manufacturer,
      rarity: options?.rarity as any,
      quality: options?.quality as any,
      firmwareVersion: options?.firmwareVersion,
      configuration: options?.configuration,
    });

    this.instances.set(instance.id, instance);

    // Fire instance created event
    this.fireEvent({
      type: HardwareEventType.INSTANCE_CREATED,
      instanceId: instance.id,
      timestamp: Date.now(),
      instance,
    } as any);

    // Integrate with other engines
    this.integrateWithSimulation(instance);
    this.integrateWithNetwork(instance);
    this.integrateWithPlacement(instance);

    return instance;
  }

  /**
   * Destroy hardware instance
   */
  destroyInstance(instanceId: string): boolean {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      return false;
    }

    this.instances.delete(instanceId);

    // Fire instance destroyed event
    this.fireEvent({
      type: HardwareEventType.INSTANCE_DESTROYED,
      instanceId: instance.id,
      timestamp: Date.now(),
      instance,
    } as any);

    return true;
  }

  /**
   * Get instance by ID
   */
  getInstance(instanceId: string): HardwareInstance | null {
    return this.instances.get(instanceId) || null;
  }

  /**
   * Get all instances
   */
  getAllInstances(): HardwareInstance[] {
    return Array.from(this.instances.values());
  }

  /**
   * Get instances by owner
   */
  getInstancesByOwner(ownerId: string): HardwareInstance[] {
    return Array.from(this.instances.values()).filter(
      instance => instance.ownerId === ownerId
    );
  }

  /**
   * Get instances by type
   */
  getInstancesByType(type: string): HardwareInstance[] {
    return Array.from(this.instances.values()).filter(
      instance => instance.type === type
    );
  }

  /**
   * Get instances by category
   */
  getInstancesByCategory(category: string): HardwareInstance[] {
    return Array.from(this.instances.values()).filter(
      instance => instance.category === category
    );
  }

  /**
   * Get instances by rarity
   */
  getInstancesByRarity(rarity: string): HardwareInstance[] {
    return Array.from(this.instances.values()).filter(
      instance => instance.rarity === rarity
    );
  }

  /**
   * Update instance
   */
  updateInstance(
    instanceId: string,
    updates: Partial<HardwareInstance>
  ): boolean {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      return false;
    }

    const oldInstance = { ...instance };
    Object.assign(instance, updates);
    instance.updatedAt = Date.now();
    instance.version++;

    // Recalculate maintenance status if health or durability changed
    if (updates.health !== undefined || updates.durability !== undefined) {
      instance.maintenanceStatus = calculateMaintenanceStatus(
        instance.health,
        instance.durability,
        this.config.maintenanceThresholds
      );
    }

    // Fire instance updated event
    this.fireEvent({
      type: HardwareEventType.INSTANCE_UPDATED,
      instanceId: instance.id,
      timestamp: Date.now(),
      changes: updates,
    } as any);

    // Fire specific property change events
    if (updates.health !== undefined && oldInstance.health !== updates.health) {
      this.fireEvent({
        type: HardwareEventType.HEALTH_CHANGED,
        instanceId: instance.id,
        timestamp: Date.now(),
        oldHealth: oldInstance.health,
        newHealth: updates.health,
      } as any);
    }

    if (updates.durability !== undefined && oldInstance.durability !== updates.durability) {
      this.fireEvent({
        type: HardwareEventType.DURABILITY_CHANGED,
        instanceId: instance.id,
        timestamp: Date.now(),
        oldDurability: oldInstance.durability,
        newDurability: updates.durability,
      } as any);
    }

    if (updates.efficiency !== undefined && oldInstance.efficiency !== updates.efficiency) {
      this.fireEvent({
        type: HardwareEventType.EFFICIENCY_CHANGED,
        instanceId: instance.id,
        timestamp: Date.now(),
        oldEfficiency: oldInstance.efficiency,
        newEfficiency: updates.efficiency,
      } as any);
    }

    return true;
  }

  /**
   * Install instance at position
   */
  installInstance(instanceId: string, position: { x: number; y: number }): boolean {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      return false;
    }

    instance.installedPosition = position;
    instance.installationDate = Date.now();

    // Fire instance installed event
    this.fireEvent({
      type: HardwareEventType.INSTANCE_INSTALLED,
      instanceId: instance.id,
      timestamp: Date.now(),
      position,
    } as any);

    // Integrate with placement engine
    if (this.placementIntegration) {
      this.integrateWithPlacement(instance);
    }

    return true;
  }

  /**
   * Remove instance from position
   */
  removeInstance(instanceId: string): boolean {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      return false;
    }

    const position = instance.installedPosition;
    instance.installedPosition = undefined;

    // Fire instance removed event
    this.fireEvent({
      type: HardwareEventType.INSTANCE_REMOVED,
      instanceId: instance.id,
      timestamp: Date.now(),
      position: position || { x: 0, y: 0 },
    } as any);

    return true;
  }

  /**
   * Perform maintenance on instance
   */
  performMaintenance(instanceId: string): boolean {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      return false;
    }

    const oldStatus = instance.maintenanceStatus;
    
    // Restore health and durability
    instance.health = 100;
    instance.durability = 100;
    instance.lastMaintenanceDate = Date.now();
    instance.maintenanceStatus = calculateMaintenanceStatus(
      instance.health,
      instance.durability,
      this.config.maintenanceThresholds
    );
    instance.updatedAt = Date.now();
    instance.version++;

    // Fire maintenance performed event
    this.fireEvent({
      type: HardwareEventType.MAINTENANCE_PERFORMED,
      instanceId: instance.id,
      timestamp: Date.now(),
      oldStatus,
      newStatus: instance.maintenanceStatus,
    } as any);

    return true;
  }

  /**
   * Update firmware on instance
   */
  updateFirmware(
    instanceId: string,
    newVersion: { major: number; minor: number; patch: number; build: number }
  ): boolean {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      return false;
    }

    const oldVersion = { ...instance.firmware };
    instance.firmware = newVersion;
    instance.updatedAt = Date.now();
    instance.version++;

    // Fire firmware updated event
    this.fireEvent({
      type: HardwareEventType.FIRMWARE_UPDATED,
      instanceId: instance.id,
      timestamp: Date.now(),
      oldVersion,
      newVersion,
    } as any);

    return true;
  }

  /**
   * Integrate with simulation engine
   */
  private integrateWithSimulation(instance: HardwareInstance): void {
    if (!this.simulationIntegration) return;

    // In a real implementation, this would:
    // 1. Create a simulation entity for the hardware
    // 2. Map hardware properties to simulation entity properties
    // 3. Register with simulation engine
    // 4. Subscribe to simulation events
    
    // For now, we just log the integration
    console.log(`[Hardware Manager] Integrating instance ${instance.id} with simulation engine`);
  }

  /**
   * Integrate with network engine
   */
  private integrateWithNetwork(instance: HardwareInstance): void {
    if (!this.networkIntegration) return;

    // In a real implementation, this would:
    // 1. Create a network node for the hardware
    // 2. Set node capacities based on hardware properties
    // 3. Register with network engine
    // 4. Subscribe to network events
    
    // For now, we just log the integration
    console.log(`[Hardware Manager] Integrating instance ${instance.id} with network engine`);
  }

  /**
   * Integrate with placement engine
   */
  private integrateWithPlacement(instance: HardwareInstance): void {
    if (!this.placementIntegration) return;

    // In a real implementation, this would:
    // 1. Place the hardware on the grid
    // 2. Set grid tile properties based on hardware
    // 3. Register with placement engine
    // 4. Subscribe to placement events
    
    // For now, we just log the integration
    console.log(`[Hardware Manager] Integrating instance ${instance.id} with placement engine`);
  }

  /**
   * Register event listener
   */
  on(eventType: HardwareEventType, listener: HardwareEventListener): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(listener);
  }

  /**
   * Unregister event listener
   */
  off(eventType: HardwareEventType, listener: HardwareEventListener): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Fire event to listeners
   */
  private fireEvent(event: HardwareEvent): void {
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
  updateConfig(config: Partial<HardwareConfig>): void {
    this.config = { ...this.config, ...config };
    this.factory.updateConfig(this.config);
    
    this.simulationIntegration = this.config.enableSimulationIntegration;
    this.networkIntegration = this.config.enableNetworkIntegration;
    this.placementIntegration = this.config.enablePlacementIntegration;
  }

  /**
   * Get configuration
   */
  getConfig(): HardwareConfig {
    return { ...this.config };
  }

  /**
   * Get factory
   */
  getFactory(): HardwareFactory {
    return this.factory;
  }

  /**
   * Get instance count
   */
  getInstanceCount(): number {
    return this.instances.size;
  }

  /**
   * Clear all instances
   */
  clear(): void {
    this.instances.clear();
  }

  /**
   * Serialize all instances
   */
  serialize(): string {
    const instances = Array.from(this.instances.values()).map(instance => ({
      ...instance,
      resources: Array.from((instance as any).resources || []),
      capacities: Array.from((instance as any).capacities || []),
      connections: Array.from((instance as any).connections || []),
    }));

    return JSON.stringify({
      config: this.config,
      instances,
    });
  }

  /**
   * Deserialize instances
   */
  static deserialize(data: string): HardwareManager {
    const parsed = JSON.parse(data);
    const manager = new HardwareManager(parsed.config);

    for (const instanceData of parsed.instances) {
      const instance: HardwareInstance = {
        ...instanceData,
        resources: new Map(instanceData.resources),
        capacities: new Map(instanceData.capacities),
        connections: new Set(instanceData.connections),
      };
      manager.instances.set(instance.id, instance);
    }

    return manager;
  }
}
