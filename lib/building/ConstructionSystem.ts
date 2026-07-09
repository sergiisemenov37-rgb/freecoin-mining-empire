/**
 * Construction System
 * Manages building construction, upgrades, cancellation, pausing, resuming, and instant completion
 */

import type {
  BuildingProperties,
  ConstructionState,
  ConstructionQueueItem,
  BuildingEvent,
  BuildingEventListener,
  BuildingSystemConfig,
} from './types';
import {
  ConstructionState as ConstructionStateEnum,
  BuildingEventType,
  DEFAULT_BUILDING_CONFIG,
} from './types';
import { BuildingDefinitions } from './BuildingDefinitions';

/**
 * Construction system class
 */
export class ConstructionSystem {
  private buildings: Map<string, BuildingProperties>;
  private constructionQueue: ConstructionQueueItem[];
  private config: BuildingSystemConfig;
  private eventListeners: Map<BuildingEventType, Set<BuildingEventListener>>;
  private updateInterval: NodeJS.Timeout | null;

  constructor(config?: Partial<BuildingSystemConfig>) {
    this.config = {
      ...DEFAULT_BUILDING_CONFIG,
      ...config,
    };

    this.buildings = new Map();
    this.constructionQueue = [];
    this.eventListeners = new Map();
    this.updateInterval = null;

    this.startUpdates();
  }

  /**
   * Start building construction
   */
  startConstruction(
    buildingId: string,
    type: string,
    position: { x: number; y: number; z?: number },
    instant: boolean = false
  ): boolean {
    // Check if building already exists
    if (this.buildings.has(buildingId)) {
      return false;
    }

    // Check concurrent construction limit
    const activeConstruction = this.constructionQueue.filter(
      item => item.type === 'construction' && !item.isPaused && !item.isInstant
    ).length;

    if (activeConstruction >= this.config.maxConcurrentConstruction && !instant) {
      return false;
    }

    // Get building definition
    const definition = BuildingDefinitions.getDefinition(type as any);
    if (!definition) {
      return false;
    }

    // Create building properties
    const building: BuildingProperties = {
      id: buildingId,
      type: type as any,
      level: 1,
      name: definition.name,
      description: definition.description,
      constructionTime: definition.baseConstructionTime / this.config.constructionSpeedMultiplier,
      upgradeTime: definition.baseUpgradeTime / this.config.constructionSpeedMultiplier,
      constructionState: ConstructionStateEnum.IN_PROGRESS,
      constructionStartTime: Date.now(),
      constructionProgress: 0,
      width: definition.baseWidth,
      height: definition.baseHeight,
      floors: definition.baseFloors,
      maxFloors: definition.baseMaxFloors,
      powerCapacity: definition.basePowerCapacity,
      coolingCapacity: definition.baseCoolingCapacity,
      networkCapacity: definition.baseNetworkCapacity,
      maxHardware: definition.baseMaxHardware,
      maxRobots: definition.baseMaxRobots,
      maxDecorations: definition.baseMaxDecorations,
      maxExpansion: definition.baseMaxExpansion,
      currentHardware: 0,
      currentRobots: 0,
      currentDecorations: 0,
      currentExpansion: 0,
      maintenanceCost: definition.baseMaintenanceCost,
      lastMaintenanceTime: Date.now(),
      theme: definition.defaultTheme,
      position,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.buildings.set(buildingId, building);

    // Add to construction queue
    const queueItem: ConstructionQueueItem = {
      queueId: `queue_${buildingId}_${Date.now()}`,
      buildingId,
      type: 'construction',
      startTime: Date.now(),
      estimatedCompletionTime: Date.now() + building.constructionTime,
      isPaused: false,
      isInstant: instant,
    };

    this.constructionQueue.push(queueItem);

    // Fire event
    this.fireEvent({
      type: BuildingEventType.CONSTRUCTION_STARTED,
      timestamp: Date.now(),
      buildingId,
    } as any);

    // Instant completion
    if (instant) {
      this.completeConstruction(buildingId);
    }

    return true;
  }

  /**
   * Complete construction
   */
  private completeConstruction(buildingId: string): void {
    const building = this.buildings.get(buildingId);
    if (!building) return;

    building.constructionState = ConstructionStateEnum.COMPLETED;
    building.constructionProgress = 1;
    building.updatedAt = Date.now();

    // Remove from queue
    this.constructionQueue = this.constructionQueue.filter(
      item => item.buildingId !== buildingId
    );

    // Fire event
    const duration = Date.now() - (building.constructionStartTime || Date.now());
    this.fireEvent({
      type: BuildingEventType.CONSTRUCTION_FINISHED,
      timestamp: Date.now(),
      buildingId,
    } as any);
  }

  /**
   * Cancel construction
   */
  cancelConstruction(buildingId: string, reason: string = 'User cancelled'): boolean {
    const building = this.buildings.get(buildingId);
    if (!building) return false;

    if (building.constructionState !== ConstructionStateEnum.IN_PROGRESS) {
      return false;
    }

    building.constructionState = ConstructionStateEnum.CANCELLED;
    building.updatedAt = Date.now();

    // Remove from queue
    this.constructionQueue = this.constructionQueue.filter(
      item => item.buildingId !== buildingId
    );

    // Remove building
    this.buildings.delete(buildingId);

    // Fire event
    this.fireEvent({
      type: BuildingEventType.CONSTRUCTION_CANCELLED,
      timestamp: Date.now(),
      buildingId,
    } as any);

    return true;
  }

  /**
   * Pause construction
   */
  pauseConstruction(buildingId: string): boolean {
    const building = this.buildings.get(buildingId);
    if (!building) return false;

    if (building.constructionState !== ConstructionStateEnum.IN_PROGRESS) {
      return false;
    }

    building.constructionState = ConstructionStateEnum.PAUSED;
    building.updatedAt = Date.now();

    // Update queue item
    const queueItem = this.constructionQueue.find(item => item.buildingId === buildingId);
    if (queueItem) {
      queueItem.isPaused = true;
    }

    // Fire event
    this.fireEvent({
      type: BuildingEventType.CONSTRUCTION_PAUSED,
      timestamp: Date.now(),
      buildingId,
    } as any);

    return true;
  }

  /**
   * Resume construction
   */
  resumeConstruction(buildingId: string): boolean {
    const building = this.buildings.get(buildingId);
    if (!building) return false;

    if (building.constructionState !== ConstructionStateEnum.PAUSED) {
      return false;
    }

    building.constructionState = ConstructionStateEnum.IN_PROGRESS;
    building.updatedAt = Date.now();

    // Update queue item
    const queueItem = this.constructionQueue.find(item => item.buildingId === buildingId);
    if (queueItem) {
      queueItem.isPaused = false;
      // Recalculate estimated completion time
      const remainingTime = building.constructionTime * (1 - building.constructionProgress);
      queueItem.estimatedCompletionTime = Date.now() + remainingTime;
    }

    // Fire event
    this.fireEvent({
      type: BuildingEventType.CONSTRUCTION_RESUMED,
      timestamp: Date.now(),
      buildingId,
    } as any);

    return true;
  }

  /**
   * Start building upgrade
   */
  startUpgrade(buildingId: string, targetLevel: number, instant: boolean = false): boolean {
    const building = this.buildings.get(buildingId);
    if (!building) return false;

    if (building.constructionState !== ConstructionStateEnum.COMPLETED) {
      return false;
    }

    if (targetLevel <= building.level) {
      return false;
    }

    // Get building definition
    const definition = BuildingDefinitions.getDefinition(building.type);
    if (!definition) return false;

    // Check upgrade requirements
    if (targetLevel < definition.upgradeRequirements.level) {
      return false;
    }

    // Calculate upgrade time
    const upgradeTime = definition.baseUpgradeTime / this.config.constructionSpeedMultiplier;

    building.constructionState = ConstructionStateEnum.IN_PROGRESS;
    building.constructionStartTime = Date.now();
    building.constructionProgress = 0;
    building.updatedAt = Date.now();

    // Add to construction queue
    const queueItem: ConstructionQueueItem = {
      queueId: `queue_upgrade_${buildingId}_${Date.now()}`,
      buildingId,
      type: 'upgrade',
      targetLevel,
      startTime: Date.now(),
      estimatedCompletionTime: Date.now() + upgradeTime,
      isPaused: false,
      isInstant: instant,
    };

    this.constructionQueue.push(queueItem);

    // Fire event
    const fromLevel = building.level;
    this.fireEvent({
      type: BuildingEventType.UPGRADE_STARTED,
      timestamp: Date.now(),
      buildingId,
    } as any);

    // Instant completion
    if (instant) {
      this.completeUpgrade(buildingId, targetLevel);
    }

    return true;
  }

  /**
   * Complete upgrade
   */
  private completeUpgrade(buildingId: string, targetLevel: number): void {
    const building = this.buildings.get(buildingId);
    if (!building) return;

    const fromLevel = building.level;
    building.level = targetLevel;
    building.constructionState = ConstructionStateEnum.COMPLETED;
    building.constructionProgress = 1;
    building.updatedAt = Date.now();

    // Recalculate properties based on new level
    const definition = BuildingDefinitions.getDefinition(building.type);
    if (definition) {
      const properties = BuildingDefinitions.calculateProperties(building.type, targetLevel);
      building.powerCapacity = properties.basePowerCapacity;
      building.coolingCapacity = properties.baseCoolingCapacity;
      building.networkCapacity = properties.baseNetworkCapacity;
      building.maxHardware = properties.baseMaxHardware;
      building.maxRobots = properties.baseMaxRobots;
      building.maxDecorations = properties.baseMaxDecorations;
      building.maintenanceCost = properties.baseMaintenanceCost;
    }

    // Remove from queue
    this.constructionQueue = this.constructionQueue.filter(
      item => item.buildingId !== buildingId
    );

    // Fire event
    this.fireEvent({
      type: BuildingEventType.UPGRADE_FINISHED,
      timestamp: Date.now(),
      buildingId,
    } as any);
  }

  /**
   * Cancel upgrade
   */
  cancelUpgrade(buildingId: string): boolean {
    const building = this.buildings.get(buildingId);
    if (!building) return false;

    if (building.constructionState !== ConstructionStateEnum.IN_PROGRESS) {
      return false;
    }

    building.constructionState = ConstructionStateEnum.COMPLETED;
    building.constructionProgress = 1;
    building.updatedAt = Date.now();

    // Remove from queue
    this.constructionQueue = this.constructionQueue.filter(
      item => item.buildingId !== buildingId
    );

    // Fire event
    this.fireEvent({
      type: BuildingEventType.UPGRADE_CANCELLED,
      timestamp: Date.now(),
      buildingId,
    } as any);

    return true;
  }

  /**
   * Update construction progress
   */
  private updateConstructionProgress(): void {
    const now = Date.now();

    for (const building of this.buildings.values()) {
      if (building.constructionState !== ConstructionStateEnum.IN_PROGRESS) {
        continue;
      }

      const queueItem = this.constructionQueue.find(item => item.buildingId === building.id);
      if (!queueItem || queueItem.isPaused) {
        continue;
      }

      const totalTime = queueItem.type === 'construction' 
        ? building.constructionTime 
        : building.upgradeTime;

      const elapsed = now - queueItem.startTime;
      building.constructionProgress = Math.min(1, elapsed / totalTime);

      // Check if completed
      if (building.constructionProgress >= 1) {
        if (queueItem.type === 'construction') {
          this.completeConstruction(building.id);
        } else if (queueItem.type === 'upgrade' && queueItem.targetLevel) {
          this.completeUpgrade(building.id, queueItem.targetLevel);
        }
      }
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
    }, 100); // Update every 100ms
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
   * Update construction system
   */
  private update(): void {
    this.updateConstructionProgress();
  }

  /**
   * Get building
   */
  getBuilding(buildingId: string): BuildingProperties | undefined {
    return this.buildings.get(buildingId);
  }

  /**
   * Get all buildings
   */
  getAllBuildings(): BuildingProperties[] {
    return Array.from(this.buildings.values());
  }

  /**
   * Get construction queue
   */
  getConstructionQueue(): ConstructionQueueItem[] {
    return [...this.constructionQueue];
  }

  /**
   * Get state
   */
  getState(): {
    buildings: Map<string, BuildingProperties>;
    constructionQueue: ConstructionQueueItem[];
  } {
    return {
      buildings: new Map(this.buildings),
      constructionQueue: [...this.constructionQueue],
    };
  }

  /**
   * Set state
   */
  setState(state: {
    buildings: Map<string, BuildingProperties>;
    constructionQueue: ConstructionQueueItem[];
  }): void {
    this.buildings = new Map(state.buildings);
    this.constructionQueue = [...state.constructionQueue];
  }

  /**
   * Reset construction system
   */
  reset(): void {
    this.buildings.clear();
    this.constructionQueue = [];
  }

  /**
   * Register event listener
   */
  on(eventType: BuildingEventType, listener: BuildingEventListener): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(listener);
  }

  /**
   * Unregister event listener
   */
  off(eventType: BuildingEventType, listener: BuildingEventListener): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Fire event to listeners
   */
  private fireEvent(event: BuildingEvent): void {
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
  updateConfig(config: Partial<BuildingSystemConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get configuration
   */
  getConfig(): BuildingSystemConfig {
    return { ...this.config };
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stopUpdates();
  }
}
