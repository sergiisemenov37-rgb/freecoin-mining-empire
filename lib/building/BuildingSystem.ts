/**
 * Building System
 * Central coordinator integrating Construction, Expansion, and Capacity systems
 * Integrates with Placement, Simulation, Energy, and Progression systems
 */

import { ConstructionSystem } from './ConstructionSystem';
import { ExpansionSystem } from './ExpansionSystem';
import { CapacitySystem } from './CapacitySystem';
import type {
  BuildingProperties,
  BuildingEvent,
  BuildingEventListener,
  BuildingSystemConfig,
} from './types';
import {
  BuildingEventType,
  DEFAULT_BUILDING_CONFIG,
} from './types';

/**
 * Building system class
 */
export class BuildingSystem {
  private constructionSystem: ConstructionSystem;
  private expansionSystem: ExpansionSystem;
  private capacitySystem: CapacitySystem;
  private config: BuildingSystemConfig;
  private eventListeners: Map<BuildingEventType, Set<BuildingEventListener>>;

  constructor(config?: Partial<BuildingSystemConfig>) {
    this.config = {
      ...DEFAULT_BUILDING_CONFIG,
      ...config,
    };

    this.constructionSystem = new ConstructionSystem(this.config);
    this.expansionSystem = new ExpansionSystem(this.config);
    this.capacitySystem = new CapacitySystem(this.config);
    this.eventListeners = new Map();

    this.setupEventIntegration();
    this.syncBuildings();
  }

  /**
   * Setup event integration between subsystems
   */
  private setupEventIntegration(): void {
    // Forward construction system events
    const constructionEvents: BuildingEventType[] = [
      BuildingEventType.CONSTRUCTION_STARTED,
      BuildingEventType.CONSTRUCTION_FINISHED,
      BuildingEventType.CONSTRUCTION_CANCELLED,
      BuildingEventType.CONSTRUCTION_PAUSED,
      BuildingEventType.CONSTRUCTION_RESUMED,
      BuildingEventType.UPGRADE_STARTED,
      BuildingEventType.UPGRADE_FINISHED,
      BuildingEventType.UPGRADE_CANCELLED,
    ];

    for (const eventType of constructionEvents) {
      this.constructionSystem.on(eventType, (event) => {
        this.handleConstructionEvent(event);
      });
    }

    // Forward expansion system events
    const expansionEvents: BuildingEventType[] = [
      BuildingEventType.BUILDING_EXPANDED,
      BuildingEventType.CAPACITY_CHANGED,
    ];

    for (const eventType of expansionEvents) {
      this.expansionSystem.on(eventType, (event) => {
        this.handleExpansionEvent(event);
      });
    }
  }

  /**
   * Handle construction system events
   */
  private handleConstructionEvent(event: BuildingEvent): void {
    this.fireEvent(event);
    this.syncBuildings();
  }

  /**
   * Handle expansion system events
   */
  private handleExpansionEvent(event: BuildingEvent): void {
    this.fireEvent(event);
    this.syncBuildings();
  }

  /**
   * Sync buildings between subsystems
   */
  private syncBuildings(): void {
    const buildings = this.constructionSystem.getAllBuildings();
    const buildingsMap = new Map(buildings.map(b => [b.id, b]));
    
    this.expansionSystem.setBuildings(buildingsMap);
    this.capacitySystem.setBuildings(buildingsMap);
  }

  // ============================================
  // CONSTRUCTION API
  // ============================================

  /**
   * Start building construction
   */
  startConstruction(
    buildingId: string,
    type: string,
    position: { x: number; y: number; z?: number },
    instant: boolean = false
  ): boolean {
    const result = this.constructionSystem.startConstruction(buildingId, type, position, instant);
    this.syncBuildings();
    return result;
  }

  /**
   * Cancel construction
   */
  cancelConstruction(buildingId: string, reason?: string): boolean {
    const result = this.constructionSystem.cancelConstruction(buildingId, reason);
    this.syncBuildings();
    return result;
  }

  /**
   * Pause construction
   */
  pauseConstruction(buildingId: string): boolean {
    return this.constructionSystem.pauseConstruction(buildingId);
  }

  /**
   * Resume construction
   */
  resumeConstruction(buildingId: string): boolean {
    return this.constructionSystem.resumeConstruction(buildingId);
  }

  /**
   * Start building upgrade
   */
  startUpgrade(buildingId: string, targetLevel: number, instant: boolean = false): boolean {
    const result = this.constructionSystem.startUpgrade(buildingId, targetLevel, instant);
    this.syncBuildings();
    return result;
  }

  /**
   * Cancel upgrade
   */
  cancelUpgrade(buildingId: string): boolean {
    const result = this.constructionSystem.cancelUpgrade(buildingId);
    this.syncBuildings();
    return result;
  }

  // ============================================
  // EXPANSION API
  // ============================================

  /**
   * Start expansion
   */
  startExpansion(
    buildingId: string,
    expansionType: string,
    instant: boolean = false
  ): boolean {
    const result = this.expansionSystem.startExpansion(buildingId, expansionType as any, instant);
    this.syncBuildings();
    return result;
  }

  /**
   * Cancel expansion
   */
  cancelExpansion(expansionId: string): boolean {
    const result = this.expansionSystem.cancelExpansion(expansionId);
    this.syncBuildings();
    return result;
  }

  // ============================================
  // CAPACITY API
  // ============================================

  /**
   * Calculate total capacity
   */
  calculateTotalCapacity() {
    return this.capacitySystem.calculateTotalCapacity();
  }

  /**
   * Calculate building capacity
   */
  calculateBuildingCapacity(buildingId: string) {
    return this.capacitySystem.calculateBuildingCapacity(buildingId);
  }

  /**
   * Can add hardware
   */
  canAddHardware(buildingId: string, count?: number): boolean {
    return this.capacitySystem.canAddHardware(buildingId, count);
  }

  /**
   * Add hardware
   */
  addHardware(buildingId: string, count?: number): boolean {
    const result = this.capacitySystem.addHardware(buildingId, count);
    this.syncBuildings();
    return result;
  }

  /**
   * Remove hardware
   */
  removeHardware(buildingId: string, count?: number): boolean {
    const result = this.capacitySystem.removeHardware(buildingId, count);
    this.syncBuildings();
    return result;
  }

  /**
   * Can add robots
   */
  canAddRobots(buildingId: string, count?: number): boolean {
    return this.capacitySystem.canAddRobots(buildingId, count);
  }

  /**
   * Add robots
   */
  addRobots(buildingId: string, count?: number): boolean {
    const result = this.capacitySystem.addRobots(buildingId, count);
    this.syncBuildings();
    return result;
  }

  /**
   * Remove robots
   */
  removeRobots(buildingId: string, count?: number): boolean {
    const result = this.capacitySystem.removeRobots(buildingId, count);
    this.syncBuildings();
    return result;
  }

  /**
   * Can add decorations
   */
  canAddDecorations(buildingId: string, count?: number): boolean {
    return this.capacitySystem.canAddDecorations(buildingId, count);
  }

  /**
   * Add decorations
   */
  addDecorations(buildingId: string, count?: number): boolean {
    const result = this.capacitySystem.addDecorations(buildingId, count);
    this.syncBuildings();
    return result;
  }

  /**
   * Remove decorations
   */
  removeDecorations(buildingId: string, count?: number): boolean {
    const result = this.capacitySystem.removeDecorations(buildingId, count);
    this.syncBuildings();
    return result;
  }

  /**
   * Get capacity utilization
   */
  getCapacityUtilization(buildingId?: string) {
    return this.capacitySystem.getCapacityUtilization(buildingId);
  }

  // ============================================
  // BUILDING API
  // ============================================

  /**
   * Get building
   */
  getBuilding(buildingId: string): BuildingProperties | undefined {
    return this.constructionSystem.getBuilding(buildingId);
  }

  /**
   * Get all buildings
   */
  getAllBuildings(): BuildingProperties[] {
    return this.constructionSystem.getAllBuildings();
  }

  /**
   * Get construction queue
   */
  getConstructionQueue() {
    return this.constructionSystem.getConstructionQueue();
  }

  /**
   * Get expansion definitions
   */
  getExpansionDefinitions() {
    return this.expansionSystem.getAllExpansionDefinitions();
  }

  /**
   * Get building expansions
   */
  getBuildingExpansions(buildingId: string) {
    return this.expansionSystem.getBuildingExpansions(buildingId);
  }

  // ============================================
  // STATE MANAGEMENT
  // ============================================

  /**
   * Get state
   */
  getState() {
    return {
      construction: this.constructionSystem.getState(),
      expansion: this.expansionSystem.getState(),
      capacity: this.capacitySystem.getState(),
    };
  }

  /**
   * Set state
   */
  setState(state: {
    construction: ReturnType<ConstructionSystem['getState']>;
    expansion: ReturnType<ExpansionSystem['getState']>;
    capacity: ReturnType<CapacitySystem['getState']>;
  }): void {
    this.constructionSystem.setState(state.construction);
    this.expansionSystem.setState(state.expansion);
    this.capacitySystem.setState(state.capacity);
    this.syncBuildings();
  }

  /**
   * Reset building system
   */
  reset(): void {
    this.constructionSystem.reset();
    this.expansionSystem.reset();
    this.capacitySystem.reset();
    this.syncBuildings();
  }

  // ============================================
  // EVENT MANAGEMENT
  // ============================================

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

  // ============================================
  // CONFIGURATION
  // ============================================

  /**
   * Update configuration
   */
  updateConfig(config: Partial<BuildingSystemConfig>): void {
    this.config = { ...this.config, ...config };
    this.constructionSystem.updateConfig(config);
    this.expansionSystem.updateConfig(config);
    this.capacitySystem.updateConfig(config);
  }

  /**
   * Get configuration
   */
  getConfig(): BuildingSystemConfig {
    return { ...this.config };
  }

  // ============================================
  // SUBSYSTEM ACCESS
  // ============================================

  /**
   * Get construction system
   */
  getConstructionSystem(): ConstructionSystem {
    return this.constructionSystem;
  }

  /**
   * Get expansion system
   */
  getExpansionSystem(): ExpansionSystem {
    return this.expansionSystem;
  }

  /**
   * Get capacity system
   */
  getCapacitySystem(): CapacitySystem {
    return this.capacitySystem;
  }

  // ============================================
  // CLEANUP
  // ============================================

  /**
   * Cleanup
   */
  destroy(): void {
    this.constructionSystem.destroy();
    this.expansionSystem.destroy();
    this.capacitySystem.destroy();
  }
}
