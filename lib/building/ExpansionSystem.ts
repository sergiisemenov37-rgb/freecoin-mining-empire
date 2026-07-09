/**
 * Expansion System
 * Manages building expansion including width, height, floors, rooms, and district connections
 */

import type {
  BuildingProperties,
  ExpansionDefinition,
  ExpansionState,
  ExpansionType,
  BuildingEvent,
  BuildingEventListener,
  BuildingSystemConfig,
} from './types';
import {
  ExpansionType as ExpansionTypeEnum,
  BuildingEventType,
  DEFAULT_BUILDING_CONFIG,
} from './types';

/**
 * Expansion system class
 */
export class ExpansionSystem {
  private buildings: Map<string, BuildingProperties>;
  private expansions: Map<string, ExpansionState>;
  private expansionDefinitions: Map<ExpansionType, ExpansionDefinition>;
  private config: BuildingSystemConfig;
  private eventListeners: Map<BuildingEventType, Set<BuildingEventListener>>;
  private updateInterval: NodeJS.Timeout | null;

  constructor(config?: Partial<BuildingSystemConfig>) {
    this.config = {
      ...DEFAULT_BUILDING_CONFIG,
      ...config,
    };

    this.buildings = new Map();
    this.expansions = new Map();
    this.expansionDefinitions = new Map();
    this.eventListeners = new Map();
    this.updateInterval = null;

    this.initializeExpansionDefinitions();
    this.startUpdates();
  }

  /**
   * Initialize default expansion definitions
   */
  private initializeExpansionDefinitions(): void {
    // Width expansion
    this.expansionDefinitions.set(ExpansionTypeEnum.WIDTH, {
      type: ExpansionTypeEnum.WIDTH,
      name: 'Width Expansion',
      description: 'Expand building width',
      cost: {
        resources: { credits: 1000 },
        time: 30000,
      },
      effect: {
        width: 5,
        powerCapacity: 500,
        coolingCapacity: 400,
        maxHardware: 10,
      },
      requirements: {
        buildingLevel: 2,
      },
    });

    // Height expansion
    this.expansionDefinitions.set(ExpansionTypeEnum.HEIGHT, {
      type: ExpansionTypeEnum.HEIGHT,
      name: 'Height Expansion',
      description: 'Expand building height',
      cost: {
        resources: { credits: 1500 },
        time: 45000,
      },
      effect: {
        height: 5,
        powerCapacity: 300,
        coolingCapacity: 250,
        maxHardware: 5,
      },
      requirements: {
        buildingLevel: 2,
      },
    });

    // Floor expansion
    this.expansionDefinitions.set(ExpansionTypeEnum.FLOOR, {
      type: ExpansionTypeEnum.FLOOR,
      name: 'Floor Expansion',
      description: 'Add a new floor',
      cost: {
        resources: { credits: 5000 },
        time: 60000,
      },
      effect: {
        floors: 1,
        powerCapacity: 1000,
        coolingCapacity: 800,
        networkCapacity: 200,
        maxHardware: 20,
        maxDecorations: 5,
      },
      requirements: {
        buildingLevel: 3,
      },
    });

    // Room expansion
    this.expansionDefinitions.set(ExpansionTypeEnum.ROOM, {
      type: ExpansionTypeEnum.ROOM,
      name: 'Room Expansion',
      description: 'Add a new room',
      cost: {
        resources: { credits: 2000 },
        time: 20000,
      },
      effect: {
        maxHardware: 5,
        maxDecorations: 2,
      },
      requirements: {
        buildingLevel: 2,
      },
    });

    // District connection
    this.expansionDefinitions.set(ExpansionTypeEnum.DISTRICT_CONNECTION, {
      type: ExpansionTypeEnum.DISTRICT_CONNECTION,
      name: 'District Connection',
      description: 'Connect to a district',
      cost: {
        resources: { credits: 10000 },
        time: 120000,
      },
      effect: {
        networkCapacity: 1000,
        powerCapacity: 2000,
      },
      requirements: {
        buildingLevel: 5,
      },
    });
  }

  /**
   * Set buildings map
   */
  setBuildings(buildings: Map<string, BuildingProperties>): void {
    this.buildings = buildings;
  }

  /**
   * Start expansion
   */
  startExpansion(
    buildingId: string,
    expansionType: ExpansionType,
    instant: boolean = false
  ): boolean {
    const building = this.buildings.get(buildingId);
    if (!building) return false;

    if (building.constructionState !== 'completed') {
      return false;
    }

    // Check expansion limit
    if (building.currentExpansion >= building.maxExpansion) {
      return false;
    }

    // Get expansion definition
    const definition = this.expansionDefinitions.get(expansionType);
    if (!definition) return false;

    // Check requirements
    if (building.level < definition.requirements.buildingLevel) {
      return false;
    }

    // Create expansion state
    const expansionId = `expansion_${buildingId}_${expansionType}_${Date.now()}`;
    const expansion: ExpansionState = {
      expansionId,
      buildingId,
      type: expansionType,
      level: building.currentExpansion + 1,
      maxLevel: building.maxExpansion,
      isCompleted: false,
      startTime: Date.now(),
      completionTime: Date.now() + (definition.cost.time / this.config.expansionSpeedMultiplier),
    };

    this.expansions.set(expansionId, expansion);

    // Fire event
    this.fireEvent({
      type: BuildingEventType.BUILDING_EXPANDED,
      timestamp: Date.now(),
      buildingId,
    } as any);

    // Instant completion
    if (instant) {
      this.completeExpansion(expansionId);
    }

    return true;
  }

  /**
   * Complete expansion
   */
  private completeExpansion(expansionId: string): void {
    const expansion = this.expansions.get(expansionId);
    if (!expansion) return;

    const building = this.buildings.get(expansion.buildingId);
    if (!building) return;

    const definition = this.expansionDefinitions.get(expansion.type);
    if (!definition) return;

    // Apply expansion effects
    if (definition.effect.width) {
      building.width += definition.effect.width;
    }
    if (definition.effect.height) {
      building.height += definition.effect.height;
    }
    if (definition.effect.floors) {
      building.floors += definition.effect.floors;
    }
    if (definition.effect.powerCapacity) {
      const oldValue = building.powerCapacity;
      building.powerCapacity += definition.effect.powerCapacity;
      this.fireCapacityChangedEvent(building.id, 'power', oldValue, building.powerCapacity);
    }
    if (definition.effect.coolingCapacity) {
      const oldValue = building.coolingCapacity;
      building.coolingCapacity += definition.effect.coolingCapacity;
      this.fireCapacityChangedEvent(building.id, 'cooling', oldValue, building.coolingCapacity);
    }
    if (definition.effect.networkCapacity) {
      const oldValue = building.networkCapacity;
      building.networkCapacity += definition.effect.networkCapacity;
      this.fireCapacityChangedEvent(building.id, 'network', oldValue, building.networkCapacity);
    }
    if (definition.effect.maxHardware) {
      const oldValue = building.maxHardware;
      building.maxHardware += definition.effect.maxHardware;
      this.fireCapacityChangedEvent(building.id, 'hardware', oldValue, building.maxHardware);
    }
    if (definition.effect.maxDecorations) {
      const oldValue = building.maxDecorations;
      building.maxDecorations += definition.effect.maxDecorations;
      this.fireCapacityChangedEvent(building.id, 'decorations', oldValue, building.maxDecorations);
    }

    building.currentExpansion = expansion.level;
    building.updatedAt = Date.now();
    expansion.isCompleted = true;

    // Remove completed expansion
    this.expansions.delete(expansionId);
  }

  /**
   * Fire capacity changed event
   */
  private fireCapacityChangedEvent(
    buildingId: string,
    capacityType: 'power' | 'cooling' | 'network' | 'hardware' | 'robots' | 'decorations',
    oldValue: number,
    newValue: number
  ): void {
    this.fireEvent({
      type: BuildingEventType.CAPACITY_CHANGED,
      timestamp: Date.now(),
      buildingId,
    } as any);
  }

  /**
   * Cancel expansion
   */
  cancelExpansion(expansionId: string): boolean {
    const expansion = this.expansions.get(expansionId);
    if (!expansion) return false;

    this.expansions.delete(expansionId);
    return true;
  }

  /**
   * Update expansion progress
   */
  private updateExpansionProgress(): void {
    const now = Date.now();

    for (const [expansionId, expansion] of this.expansions.entries()) {
      if (expansion.isCompleted) continue;

      if (now >= (expansion.completionTime || now)) {
        this.completeExpansion(expansionId);
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
    }, 100);
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
   * Update expansion system
   */
  private update(): void {
    this.updateExpansionProgress();
  }

  /**
   * Get expansion definition
   */
  getExpansionDefinition(type: ExpansionType): ExpansionDefinition | undefined {
    return this.expansionDefinitions.get(type);
  }

  /**
   * Get all expansion definitions
   */
  getAllExpansionDefinitions(): ExpansionDefinition[] {
    return Array.from(this.expansionDefinitions.values());
  }

  /**
   * Get expansion state
   */
  getExpansionState(expansionId: string): ExpansionState | undefined {
    return this.expansions.get(expansionId);
  }

  /**
   * Get all expansion states
   */
  getAllExpansionStates(): ExpansionState[] {
    return Array.from(this.expansions.values());
  }

  /**
   * Get building expansions
   */
  getBuildingExpansions(buildingId: string): ExpansionState[] {
    return Array.from(this.expansions.values()).filter(
      expansion => expansion.buildingId === buildingId
    );
  }

  /**
   * Get state
   */
  getState(): {
    expansions: Map<string, ExpansionState>;
  } {
    return {
      expansions: new Map(this.expansions),
    };
  }

  /**
   * Set state
   */
  setState(state: {
    expansions: Map<string, ExpansionState>;
  }): void {
    this.expansions = new Map(state.expansions);
  }

  /**
   * Reset expansion system
   */
  reset(): void {
    this.expansions.clear();
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
