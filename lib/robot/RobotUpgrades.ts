/**
 * Robot Upgrades and Modules
 * Manages robot upgrades and module system
 */

import type {
  RobotInstance,
  RobotType,
  RobotModule,
  RobotModuleType,
  RobotEvent,
  RobotEventListener,
  RobotSystemConfig,
} from './types';
import {
  RobotEventType,
  DEFAULT_ROBOT_CONFIG,
} from './types';
import { RobotDefinitions } from './RobotDefinitions';
import { RobotInstances } from './RobotInstances';

/**
 * Robot upgrades and modules system class
 */
export class RobotUpgrades {
  private robotInstances: RobotInstances;
  private config: RobotSystemConfig;
  private eventListeners: Map<RobotEventType, Set<RobotEventListener>>;
  private availableModules: Map<string, RobotModule>;

  constructor(
    robotInstances: RobotInstances,
    config?: Partial<RobotSystemConfig>
  ) {
    this.robotInstances = robotInstances;
    this.config = {
      ...DEFAULT_ROBOT_CONFIG,
      ...config,
    };

    this.eventListeners = new Map();
    this.availableModules = new Map();

    this.initializeDefaultModules();
  }

  /**
   * Initialize default modules
   */
  private initializeDefaultModules(): void {
    // Speed Boost Module
    this.registerModule({
      id: 'module_speed_boost_1',
      type: 'speed_boost' as any,
      name: 'Speed Boost I',
      description: 'Increases movement speed by 10%',
      level: 1,
      maxLevel: 3,
      effects: { speed: 0.1 },
    });

    // Efficiency Boost Module
    this.registerModule({
      id: 'module_efficiency_boost_1',
      type: 'efficiency_boost' as any,
      name: 'Efficiency Boost I',
      description: 'Increases task efficiency by 5%',
      level: 1,
      maxLevel: 3,
      effects: { efficiency: 0.05 },
    });

    // Battery Boost Module
    this.registerModule({
      id: 'module_battery_boost_1',
      type: 'battery_boost' as any,
      name: 'Battery Boost I',
      description: 'Increases battery capacity by 20%',
      level: 1,
      maxLevel: 3,
      effects: { batteryCapacity: 0.2 },
    });

    // Carry Boost Module
    this.registerModule({
      id: 'module_carry_boost_1',
      type: 'carry_boost' as any,
      name: 'Carry Boost I',
      description: 'Increases carry capacity by 15%',
      level: 1,
      maxLevel: 3,
      effects: { carryCapacity: 0.15 },
    });

    // Sensor Module
    this.registerModule({
      id: 'module_sensor_1',
      type: 'sensor' as any,
      name: 'Advanced Sensor I',
      description: 'Improves detection and awareness',
      level: 1,
      maxLevel: 2,
      effects: {},
    });

    // Communication Module
    this.registerModule({
      id: 'module_communication_1',
      type: 'communication' as any,
      name: 'Communication Module I',
      description: 'Enables advanced communication',
      level: 1,
      maxLevel: 2,
      effects: {},
    });

    // Navigation Module
    this.registerModule({
      id: 'module_navigation_1',
      type: 'navigation' as any,
      name: 'Navigation Module I',
      description: 'Improves pathfinding efficiency',
      level: 1,
      maxLevel: 2,
      effects: { speed: 0.05 },
    });
  }

  /**
   * Register module
   */
  registerModule(module: RobotModule): void {
    this.availableModules.set(module.id, module);
  }

  /**
   * Get module
   */
  getModule(moduleId: string): RobotModule | undefined {
    return this.availableModules.get(moduleId);
  }

  /**
   * Get all modules
   */
  getAllModules(): RobotModule[] {
    return Array.from(this.availableModules.values());
  }

  /**
   * Get modules by type
   */
  getModulesByType(type: RobotModuleType): RobotModule[] {
    return Array.from(this.availableModules.values()).filter(
      module => module.type === type
    );
  }

  /**
   * Upgrade robot
   */
  upgradeRobot(robotId: string): boolean {
    const robot = this.robotInstances.getRobot(robotId);
    if (!robot) return false;

    const definition = RobotDefinitions.getDefinition(robot.type);
    if (!definition) return false;

    if (robot.level >= definition.maxLevel) return false;

    // Level up robot
    this.robotInstances.levelUp(robotId);

    // Fire event
    this.fireEvent({
      type: RobotEventType.ROBOT_UPGRADED,
      timestamp: Date.now(),
      robotId,
    } as any);

    return true;
  }

  /**
   * Add module to robot
   */
  addModuleToRobot(robotId: string, moduleId: string): boolean {
    const module = this.availableModules.get(moduleId);
    if (!module) return false;

    return this.robotInstances.addModule(robotId, module);
  }

  /**
   * Remove module from robot
   */
  removeModuleFromRobot(robotId: string, moduleId: string): boolean {
    return this.robotInstances.removeModule(robotId, moduleId);
  }

  /**
   * Upgrade module on robot
   */
  upgradeModuleOnRobot(robotId: string, moduleId: string): boolean {
    const robot = this.robotInstances.getRobot(robotId);
    if (!robot) return false;

    const module = robot.modules.find(m => m.id === moduleId);
    if (!module) return false;

    if (module.level >= module.maxLevel) return false;

    // Remove current module
    this.robotInstances.removeModule(robotId, moduleId);

    // Upgrade module
    const upgradedModule: RobotModule = {
      ...module,
      level: module.level + 1,
      effects: {
        speed: module.effects.speed ? module.effects.speed * 1.2 : undefined,
        efficiency: module.effects.efficiency ? module.effects.efficiency * 1.2 : undefined,
        batteryCapacity: module.effects.batteryCapacity ? module.effects.batteryCapacity * 1.2 : undefined,
        carryCapacity: module.effects.carryCapacity ? module.effects.carryCapacity * 1.2 : undefined,
      },
    };

    // Add upgraded module
    return this.robotInstances.addModule(robotId, upgradedModule);
  }

  /**
   * Get upgrade cost for robot
   */
  getUpgradeCost(robotId: string): {
    credits: number;
    resources?: Record<string, number>;
  } {
    const robot = this.robotInstances.getRobot(robotId);
    if (!robot) {
      return { credits: 1000 };
    }

    return RobotDefinitions.getUpgradeCost(robot.type, robot.level);
  }

  /**
   * Get module cost
   */
  getModuleCost(moduleId: string, level: number = 1): {
    credits: number;
    resources?: Record<string, number>;
  } {
    const module = this.availableModules.get(moduleId);
    if (!module) {
      return { credits: 500 };
    }

    const levelMultiplier = Math.pow(2, level - 1);

    return {
      credits: 500 * levelMultiplier,
      resources: { electronics: 50 * levelMultiplier },
    };
  }

  /**
   * Get robot upgrade requirements
   */
  getUpgradeRequirements(robotId: string): {
    canUpgrade: boolean;
    reason?: string;
    cost: {
      credits: number;
      resources?: Record<string, number>;
    };
  } {
    const robot = this.robotInstances.getRobot(robotId);
    if (!robot) {
      return {
        canUpgrade: false,
        reason: 'Robot not found',
        cost: { credits: 0 },
      };
    }

    const definition = RobotDefinitions.getDefinition(robot.type);
    if (!definition) {
      return {
        canUpgrade: false,
        reason: 'Robot definition not found',
        cost: { credits: 0 },
      };
    }

    if (robot.level >= definition.maxLevel) {
      return {
        canUpgrade: false,
        reason: 'Max level reached',
        cost: { credits: 0 },
      };
    }

    const cost = this.getUpgradeCost(robotId);

    return {
      canUpgrade: true,
      cost,
    };
  }

  /**
   * Register event listener
   */
  on(eventType: RobotEventType, listener: RobotEventListener): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(listener);
  }

  /**
   * Unregister event listener
   */
  off(eventType: RobotEventType, listener: RobotEventListener): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Fire event to listeners
   */
  private fireEvent(event: RobotEvent): void {
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
  updateConfig(config: Partial<RobotSystemConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get configuration
   */
  getConfig(): RobotSystemConfig {
    return { ...this.config };
  }
}
