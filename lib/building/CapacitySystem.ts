/**
 * Capacity System
 * Manages building capacity for power, cooling, network, hardware, robots, and decorations
 */

import type {
  BuildingProperties,
  Capacity,
  BuildingSystemConfig,
} from './types';
import { DEFAULT_BUILDING_CONFIG } from './types';

/**
 * Capacity system class
 */
export class CapacitySystem {
  private buildings: Map<string, BuildingProperties>;
  private config: BuildingSystemConfig;
  private updateInterval: NodeJS.Timeout | null;

  constructor(config?: Partial<BuildingSystemConfig>) {
    this.config = {
      ...DEFAULT_BUILDING_CONFIG,
      ...config,
    };

    this.buildings = new Map();
    this.updateInterval = null;

    this.startUpdates();
  }

  /**
   * Set buildings map
   */
  setBuildings(buildings: Map<string, BuildingProperties>): void {
    this.buildings = buildings;
  }

  /**
   * Calculate total capacity across all buildings
   */
  calculateTotalCapacity(): Capacity {
    let totalPowerCapacity = 0;
    let totalPowerUsed = 0;
    let totalCoolingCapacity = 0;
    let totalCoolingUsed = 0;
    let totalNetworkCapacity = 0;
    let totalNetworkUsed = 0;
    let totalMaxHardware = 0;
    let totalCurrentHardware = 0;
    let totalMaxRobots = 0;
    let totalCurrentRobots = 0;
    let totalMaxDecorations = 0;
    let totalCurrentDecorations = 0;

    for (const building of this.buildings.values()) {
      if (building.constructionState !== 'completed') continue;

      totalPowerCapacity += building.powerCapacity;
      totalCoolingCapacity += building.coolingCapacity;
      totalNetworkCapacity += building.networkCapacity;
      totalMaxHardware += building.maxHardware;
      totalMaxRobots += building.maxRobots;
      totalMaxDecorations += building.maxDecorations;

      totalCurrentHardware += building.currentHardware;
      totalCurrentRobots += building.currentRobots;
      totalCurrentDecorations += building.currentDecorations;

      // Calculate power used based on hardware
      // Assuming each hardware unit uses 100W
      totalPowerUsed += building.currentHardware * 100;

      // Calculate cooling used based on hardware
      // Assuming each hardware unit generates 80W of heat
      totalCoolingUsed += building.currentHardware * 80;

      // Calculate network used based on hardware
      // Assuming each hardware unit uses 10Mbps
      totalNetworkUsed += building.currentHardware * 10;
    }

    return {
      power: {
        capacity: totalPowerCapacity,
        used: totalPowerUsed,
        available: Math.max(0, totalPowerCapacity - totalPowerUsed),
      },
      cooling: {
        capacity: totalCoolingCapacity,
        used: totalCoolingUsed,
        available: Math.max(0, totalCoolingCapacity - totalCoolingUsed),
      },
      network: {
        capacity: totalNetworkCapacity,
        used: totalNetworkUsed,
        available: Math.max(0, totalNetworkCapacity - totalNetworkUsed),
      },
      hardware: {
        capacity: totalMaxHardware,
        used: totalCurrentHardware,
        available: Math.max(0, totalMaxHardware - totalCurrentHardware),
      },
      robots: {
        capacity: totalMaxRobots,
        used: totalCurrentRobots,
        available: Math.max(0, totalMaxRobots - totalCurrentRobots),
      },
      decorations: {
        capacity: totalMaxDecorations,
        used: totalCurrentDecorations,
        available: Math.max(0, totalMaxDecorations - totalCurrentDecorations),
      },
    };
  }

  /**
   * Calculate capacity for a specific building
   */
  calculateBuildingCapacity(buildingId: string): Capacity | null {
    const building = this.buildings.get(buildingId);
    if (!building) return null;

    if (building.constructionState !== 'completed') {
      return {
        power: { capacity: 0, used: 0, available: 0 },
        cooling: { capacity: 0, used: 0, available: 0 },
        network: { capacity: 0, used: 0, available: 0 },
        hardware: { capacity: 0, used: 0, available: 0 },
        robots: { capacity: 0, used: 0, available: 0 },
        decorations: { capacity: 0, used: 0, available: 0 },
      };
    }

    const powerUsed = building.currentHardware * 100;
    const coolingUsed = building.currentHardware * 80;
    const networkUsed = building.currentHardware * 10;

    return {
      power: {
        capacity: building.powerCapacity,
        used: powerUsed,
        available: Math.max(0, building.powerCapacity - powerUsed),
      },
      cooling: {
        capacity: building.coolingCapacity,
        used: coolingUsed,
        available: Math.max(0, building.coolingCapacity - coolingUsed),
      },
      network: {
        capacity: building.networkCapacity,
        used: networkUsed,
        available: Math.max(0, building.networkCapacity - networkUsed),
      },
      hardware: {
        capacity: building.maxHardware,
        used: building.currentHardware,
        available: Math.max(0, building.maxHardware - building.currentHardware),
      },
      robots: {
        capacity: building.maxRobots,
        used: building.currentRobots,
        available: Math.max(0, building.maxRobots - building.currentRobots),
      },
      decorations: {
        capacity: building.maxDecorations,
        used: building.currentDecorations,
        available: Math.max(0, building.maxDecorations - building.currentDecorations),
      },
    };
  }

  /**
   * Check if building can add hardware
   */
  canAddHardware(buildingId: string, count: number = 1): boolean {
    const capacity = this.calculateBuildingCapacity(buildingId);
    if (!capacity) return false;

    return capacity.hardware.available >= count;
  }

  /**
   * Check if building can add robots
   */
  canAddRobots(buildingId: string, count: number = 1): boolean {
    const capacity = this.calculateBuildingCapacity(buildingId);
    if (!capacity) return false;

    return capacity.robots.available >= count;
  }

  /**
   * Check if building can add decorations
   */
  canAddDecorations(buildingId: string, count: number = 1): boolean {
    const capacity = this.calculateBuildingCapacity(buildingId);
    if (!capacity) return false;

    return capacity.decorations.available >= count;
  }

  /**
   * Add hardware to building
   */
  addHardware(buildingId: string, count: number = 1): boolean {
    if (!this.canAddHardware(buildingId, count)) return false;

    const building = this.buildings.get(buildingId);
    if (!building) return false;

    building.currentHardware += count;
    building.updatedAt = Date.now();
    return true;
  }

  /**
   * Remove hardware from building
   */
  removeHardware(buildingId: string, count: number = 1): boolean {
    const building = this.buildings.get(buildingId);
    if (!building) return false;

    if (building.currentHardware < count) return false;

    building.currentHardware -= count;
    building.updatedAt = Date.now();
    return true;
  }

  /**
   * Add robots to building
   */
  addRobots(buildingId: string, count: number = 1): boolean {
    if (!this.canAddRobots(buildingId, count)) return false;

    const building = this.buildings.get(buildingId);
    if (!building) return false;

    building.currentRobots += count;
    building.updatedAt = Date.now();
    return true;
  }

  /**
   * Remove robots from building
   */
  removeRobots(buildingId: string, count: number = 1): boolean {
    const building = this.buildings.get(buildingId);
    if (!building) return false;

    if (building.currentRobots < count) return false;

    building.currentRobots -= count;
    building.updatedAt = Date.now();
    return true;
  }

  /**
   * Add decorations to building
   */
  addDecorations(buildingId: string, count: number = 1): boolean {
    if (!this.canAddDecorations(buildingId, count)) return false;

    const building = this.buildings.get(buildingId);
    if (!building) return false;

    building.currentDecorations += count;
    building.updatedAt = Date.now();
    return true;
  }

  /**
   * Remove decorations from building
   */
  removeDecorations(buildingId: string, count: number = 1): boolean {
    const building = this.buildings.get(buildingId);
    if (!building) return false;

    if (building.currentDecorations < count) return false;

    building.currentDecorations -= count;
    building.updatedAt = Date.now();
    return true;
  }

  /**
   * Get capacity utilization percentage
   */
  getCapacityUtilization(buildingId?: string): {
    power: number;
    cooling: number;
    network: number;
    hardware: number;
    robots: number;
    decorations: number;
  } {
    const capacity = buildingId 
      ? this.calculateBuildingCapacity(buildingId)
      : this.calculateTotalCapacity();

    if (!capacity) {
      return {
        power: 0,
        cooling: 0,
        network: 0,
        hardware: 0,
        robots: 0,
        decorations: 0,
      };
    }

    return {
      power: capacity.power.capacity > 0 
        ? (capacity.power.used / capacity.power.capacity) * 100 
        : 0,
      cooling: capacity.cooling.capacity > 0 
        ? (capacity.cooling.used / capacity.cooling.capacity) * 100 
        : 0,
      network: capacity.network.capacity > 0 
        ? (capacity.network.used / capacity.network.capacity) * 100 
        : 0,
      hardware: capacity.hardware.capacity > 0 
        ? (capacity.hardware.used / capacity.hardware.capacity) * 100 
        : 0,
      robots: capacity.robots.capacity > 0 
        ? (capacity.robots.used / capacity.robots.capacity) * 100 
        : 0,
      decorations: capacity.decorations.capacity > 0 
        ? (capacity.decorations.used / capacity.decorations.capacity) * 100 
        : 0,
    };
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
    }, this.config.capacityUpdateInterval);
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
   * Update capacity system
   */
  private update(): void {
    // Capacity is calculated on demand, no periodic updates needed
    // This interval is reserved for future features like maintenance
  }

  /**
   * Get state
   */
  getState(): {
    buildings: Map<string, BuildingProperties>;
  } {
    return {
      buildings: new Map(this.buildings),
    };
  }

  /**
   * Set state
   */
  setState(state: {
    buildings: Map<string, BuildingProperties>;
  }): void {
    this.buildings = new Map(state.buildings);
  }

  /**
   * Reset capacity system
   */
  reset(): void {
    this.buildings.clear();
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<BuildingSystemConfig>): void {
    this.config = { ...this.config, ...config };
    
    this.stopUpdates();
    this.startUpdates();
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
