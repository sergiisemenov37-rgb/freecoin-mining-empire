/**
 * Robot Definitions
 * Configurable robot type definitions with stats, capabilities, and costs
 */

import type { RobotDefinition, RobotType } from './types';
import { RobotType as RobotTypeEnum } from './types';

/**
 * Robot definitions class
 */
export class RobotDefinitions {
  private static definitions: Map<string, RobotDefinition>;

  static {
    this.definitions = new Map();
    this.initializeDefaultDefinitions();
  }

  /**
   * Initialize default robot definitions
   */
  private static initializeDefaultDefinitions(): void {
    // Builder Robot
    this.registerDefinition({
      type: RobotTypeEnum.BUILDER,
      name: 'Builder Robot',
      description: 'Construction robot for building and upgrading structures',
      baseSpeed: 1.0,
      baseBatteryCapacity: 10000,
      baseEfficiency: 0.8,
      baseCarryCapacity: 50,
      basePowerConsumption: 100,
      canBuild: true,
      canRepair: true,
      canTransport: true,
      canRecharge: false,
      canClean: false,
      canPatrol: false,
      canOptimize: false,
      maxLevel: 10,
      maxModules: 5,
      buildCost: {
        credits: 1000,
        resources: { steel: 100, electronics: 50 },
      },
    });

    // Worker Robot
    this.registerDefinition({
      type: RobotTypeEnum.WORKER,
      name: 'Worker Robot',
      description: 'General purpose robot for various tasks',
      baseSpeed: 1.2,
      baseBatteryCapacity: 8000,
      baseEfficiency: 0.7,
      baseCarryCapacity: 30,
      basePowerConsumption: 80,
      canBuild: false,
      canRepair: true,
      canTransport: true,
      canRecharge: false,
      canClean: true,
      canPatrol: false,
      canOptimize: false,
      maxLevel: 10,
      maxModules: 4,
      buildCost: {
        credits: 500,
        resources: { steel: 50, electronics: 25 },
      },
    });

    // Maintenance Robot
    this.registerDefinition({
      type: RobotTypeEnum.MAINTENANCE,
      name: 'Maintenance Robot',
      description: 'Specialized robot for maintenance and repair',
      baseSpeed: 0.8,
      baseBatteryCapacity: 12000,
      baseEfficiency: 0.9,
      baseCarryCapacity: 40,
      basePowerConsumption: 120,
      canBuild: false,
      canRepair: true,
      canTransport: false,
      canRecharge: false,
      canClean: true,
      canPatrol: false,
      canOptimize: true,
      maxLevel: 10,
      maxModules: 5,
      buildCost: {
        credits: 1500,
        resources: { steel: 150, electronics: 75 },
      },
    });

    // Logistics Robot
    this.registerDefinition({
      type: RobotTypeEnum.LOGISTICS,
      name: 'Logistics Robot',
      description: 'Transport robot for moving resources and items',
      baseSpeed: 1.5,
      baseBatteryCapacity: 15000,
      baseEfficiency: 0.75,
      baseCarryCapacity: 100,
      basePowerConsumption: 150,
      canBuild: false,
      canRepair: false,
      canTransport: true,
      canRecharge: false,
      canClean: false,
      canPatrol: false,
      canOptimize: false,
      maxLevel: 10,
      maxModules: 4,
      buildCost: {
        credits: 800,
        resources: { steel: 80, electronics: 40 },
      },
    });

    // Energy Robot
    this.registerDefinition({
      type: RobotTypeEnum.ENERGY,
      name: 'Energy Robot',
      description: 'Energy management robot for power systems',
      baseSpeed: 1.0,
      baseBatteryCapacity: 20000,
      baseEfficiency: 0.85,
      baseCarryCapacity: 20,
      basePowerConsumption: 200,
      canBuild: false,
      canRepair: true,
      canTransport: false,
      canRecharge: true,
      canClean: false,
      canPatrol: true,
      canOptimize: true,
      maxLevel: 10,
      maxModules: 5,
      buildCost: {
        credits: 2000,
        resources: { steel: 100, electronics: 100 },
      },
    });

    // Cooling Robot
    this.registerDefinition({
      type: RobotTypeEnum.COOLING,
      name: 'Cooling Robot',
      description: 'Thermal management robot for cooling systems',
      baseSpeed: 1.0,
      baseBatteryCapacity: 18000,
      baseEfficiency: 0.8,
      baseCarryCapacity: 25,
      basePowerConsumption: 180,
      canBuild: false,
      canRepair: true,
      canTransport: false,
      canRecharge: false,
      canClean: true,
      canPatrol: true,
      canOptimize: true,
      maxLevel: 10,
      maxModules: 5,
      buildCost: {
        credits: 1800,
        resources: { steel: 90, electronics: 90 },
      },
    });

    // Security Robot
    this.registerDefinition({
      type: RobotTypeEnum.SECURITY,
      name: 'Security Robot',
      description: 'Security robot for patrolling and monitoring',
      baseSpeed: 1.3,
      baseBatteryCapacity: 10000,
      baseEfficiency: 0.7,
      baseCarryCapacity: 10,
      basePowerConsumption: 90,
      canBuild: false,
      canRepair: false,
      canTransport: false,
      canRecharge: false,
      canClean: false,
      canPatrol: true,
      canOptimize: false,
      maxLevel: 10,
      maxModules: 4,
      buildCost: {
        credits: 2500,
        resources: { steel: 200, electronics: 100 },
      },
    });

    // Inspector Robot
    this.registerDefinition({
      type: RobotTypeEnum.INSPECTOR,
      name: 'Inspector Robot',
      description: 'Inspection robot for monitoring and analysis',
      baseSpeed: 0.9,
      baseBatteryCapacity: 9000,
      baseEfficiency: 0.95,
      baseCarryCapacity: 15,
      basePowerConsumption: 70,
      canBuild: false,
      canRepair: false,
      canTransport: false,
      canRecharge: false,
      canClean: false,
      canPatrol: true,
      canOptimize: true,
      maxLevel: 10,
      maxModules: 6,
      buildCost: {
        credits: 3000,
        resources: { steel: 150, electronics: 150 },
      },
    });

    // AI Supervisor
    this.registerDefinition({
      type: RobotTypeEnum.AI_SUPERVISOR,
      name: 'AI Supervisor',
      description: 'Advanced AI robot for coordinating other robots',
      baseSpeed: 1.0,
      baseBatteryCapacity: 25000,
      baseEfficiency: 1.0,
      baseCarryCapacity: 0,
      basePowerConsumption: 300,
      canBuild: false,
      canRepair: false,
      canTransport: false,
      canRecharge: false,
      canClean: false,
      canPatrol: false,
      canOptimize: true,
      maxLevel: 10,
      maxModules: 8,
      buildCost: {
        credits: 10000,
        resources: { steel: 500, electronics: 500 },
      },
    });
  }

  /**
   * Register robot definition
   */
  static registerDefinition(definition: RobotDefinition): void {
    const definitionId = `${definition.type}_definition`;
    this.definitions.set(definitionId, definition);
  }

  /**
   * Get robot definition by type
   */
  static getDefinition(type: RobotType): RobotDefinition | undefined {
    const definitionId = `${type}_definition`;
    return this.definitions.get(definitionId);
  }

  /**
   * Get all definitions
   */
  static getAllDefinitions(): RobotDefinition[] {
    return Array.from(this.definitions.values());
  }

  /**
   * Calculate stats for robot at level
   */
  static calculateStats(type: RobotType, level: number): {
    speed: number;
    batteryCapacity: number;
    efficiency: number;
    carryCapacity: number;
    powerConsumption: number;
  } {
    const definition = this.getDefinition(type);
    if (!definition) {
      return {
        speed: 1.0,
        batteryCapacity: 10000,
        efficiency: 0.5,
        carryCapacity: 10,
        powerConsumption: 100,
      };
    }

    const levelMultiplier = 1 + (level - 1) * 0.1;

    return {
      speed: definition.baseSpeed * levelMultiplier,
      batteryCapacity: definition.baseBatteryCapacity * levelMultiplier,
      efficiency: Math.min(1.0, definition.baseEfficiency + (level - 1) * 0.02),
      carryCapacity: definition.baseCarryCapacity * levelMultiplier,
      powerConsumption: definition.basePowerConsumption * levelMultiplier,
    };
  }

  /**
   * Get upgrade cost for robot
   */
  static getUpgradeCost(type: RobotType, currentLevel: number): {
    credits: number;
    resources?: Record<string, number>;
  } {
    const definition = this.getDefinition(type);
    if (!definition) {
      return { credits: 1000 };
    }

    const levelMultiplier = Math.pow(1.5, currentLevel);

    if (definition.buildCost.resources) {
      const resources: Record<string, number> = {};
      for (const [resource, amount] of Object.entries(definition.buildCost.resources)) {
        resources[resource] = amount * levelMultiplier;
      }
      return {
        credits: definition.buildCost.credits * levelMultiplier,
        resources,
      };
    }

    return {
      credits: definition.buildCost.credits * levelMultiplier,
    };
  }

  /**
   * Check if robot can perform task type
   */
  static canPerformTask(type: RobotType, taskType: string): boolean {
    const definition = this.getDefinition(type);
    if (!definition) return false;

    switch (taskType) {
      case 'build':
        return definition.canBuild;
      case 'upgrade':
        return definition.canBuild;
      case 'repair':
        return definition.canRepair;
      case 'transport':
        return definition.canTransport;
      case 'recharge':
        return definition.canRecharge;
      case 'clean':
        return definition.canClean;
      case 'patrol':
        return definition.canPatrol;
      case 'optimize':
        return definition.canOptimize;
      default:
        return false;
    }
  }

  /**
   * Reset definitions
   */
  static reset(): void {
    this.definitions.clear();
    this.initializeDefaultDefinitions();
  }
}
