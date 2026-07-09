/**
 * Robot Instances
 * Manages robot instances with battery, experience, and modules
 */

import type {
  RobotInstance,
  RobotType,
  RobotModule,
  RobotEvent,
  RobotEventListener,
  RobotSystemConfig,
} from './types';
import {
  RobotState,
  RobotEventType,
  DEFAULT_ROBOT_CONFIG,
} from './types';
import { RobotDefinitions } from './RobotDefinitions';

/**
 * Robot instances system class
 */
export class RobotInstances {
  private robots: Map<string, RobotInstance>;
  private config: RobotSystemConfig;
  private eventListeners: Map<RobotEventType, Set<RobotEventListener>>;
  private updateInterval: NodeJS.Timeout | null;

  constructor(config?: Partial<RobotSystemConfig>) {
    this.config = {
      ...DEFAULT_ROBOT_CONFIG,
      ...config,
    };

    this.robots = new Map();
    this.eventListeners = new Map();
    this.updateInterval = null;

    this.startUpdates();
  }

  /**
   * Create robot instance
   */
  createRobot(
    type: RobotType,
    name: string,
    position: { x: number; y: number; z?: number }
  ): RobotInstance | null {
    const definition = RobotDefinitions.getDefinition(type);
    if (!definition) return null;

    const stats = RobotDefinitions.calculateStats(type, 1);

    const robot: RobotInstance = {
      id: `robot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      definitionId: `${type}_definition`,
      name,
      type,
      level: 1,
      experience: 0,
      efficiency: stats.efficiency,
      speed: stats.speed,
      batteryCapacity: stats.batteryCapacity,
      currentBattery: stats.batteryCapacity,
      carryCapacity: stats.carryCapacity,
      powerConsumption: stats.powerConsumption,
      state: RobotState.IDLE,
      position,
      modules: [],
      isCharging: false,
      lastMaintenanceTime: Date.now(),
      maintenanceInterval: this.config.maintenanceInterval,
      needsMaintenance: false,
      tasksCompleted: 0,
      tasksFailed: 0,
      totalDistance: 0,
      totalWorkTime: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastActiveTime: Date.now(),
    };

    this.robots.set(robot.id, robot);

    // Fire event
    this.fireEvent({
      type: RobotEventType.ROBOT_CREATED,
      timestamp: Date.now(),
      robotId: robot.id,
      definitionId: robot.definitionId,
    } as any);

    return robot;
  }

  /**
   * Remove robot instance
   */
  removeRobot(robotId: string): boolean {
    const robot = this.robots.get(robotId);
    if (!robot) return false;

    this.robots.delete(robotId);

    // Fire event
    this.fireEvent({
      type: RobotEventType.ROBOT_DESTROYED,
      timestamp: Date.now(),
      robotId,
    } as any);

    return true;
  }

  /**
   * Get robot instance
   */
  getRobot(robotId: string): RobotInstance | undefined {
    return this.robots.get(robotId);
  }

  /**
   * Get all robots
   */
  getAllRobots(): RobotInstance[] {
    return Array.from(this.robots.values());
  }

  /**
   * Get robots by type
   */
  getRobotsByType(type: RobotType): RobotInstance[] {
    return Array.from(this.robots.values()).filter(robot => robot.type === type);
  }

  /**
   * Get robots by state
   */
  getRobotsByState(state: RobotState): RobotInstance[] {
    return Array.from(this.robots.values()).filter(robot => robot.state === state);
  }

  /**
   * Get available robots (idle and not charging)
   */
  getAvailableRobots(): RobotInstance[] {
    return Array.from(this.robots.values()).filter(robot =>
      robot.state === RobotState.IDLE && !robot.isCharging && !robot.needsMaintenance
    );
  }

  /**
   * Update robot state
   */
  updateRobotState(robotId: string, state: RobotState): void {
    const robot = this.robots.get(robotId);
    if (!robot) return;

    robot.state = state;
    robot.updatedAt = Date.now();
    robot.lastActiveTime = Date.now();

    // Fire event
    this.fireEvent({
      type: RobotEventType.ROBOT_STATE_CHANGED,
      timestamp: Date.now(),
      robotId,
    } as any);
  }

  /**
   * Update robot position
   */
  updateRobotPosition(
    robotId: string,
    position: { x: number; y: number; z?: number },
    distance?: number
  ): void {
    const robot = this.robots.get(robotId);
    if (!robot) return;

    robot.position = position;
    robot.updatedAt = Date.now();
    robot.lastActiveTime = Date.now();

    if (distance) {
      robot.totalDistance += distance;
    }
  }

  /**
   * Update robot battery
   */
  updateRobotBattery(robotId: string, battery: number): void {
    const robot = this.robots.get(robotId);
    if (!robot) return;

    robot.currentBattery = Math.max(0, Math.min(robot.batteryCapacity, battery));
    robot.updatedAt = Date.now();

    const batteryLevel = robot.currentBattery / robot.batteryCapacity;

    // Check for low battery
    if (batteryLevel <= this.config.criticalBatteryThreshold && this.config.autoRecharge) {
      this.fireEvent({
        type: RobotEventType.ROBOT_CHARGING_STARTED,
        timestamp: Date.now(),
        robotId,
      } as any);
    }
  }

  /**
   * Add experience to robot
   */
  addExperience(robotId: string, amount: number): void {
    const robot = this.robots.get(robotId);
    if (!robot) return;

    robot.experience += amount;
    robot.updatedAt = Date.now();

    // Check for level up
    const experienceNeeded = robot.level * 1000;
    if (robot.experience >= experienceNeeded) {
      this.levelUp(robotId);
    }
  }

  /**
   * Level up robot
   */
  levelUp(robotId: string): void {
    const robot = this.robots.get(robotId);
    if (!robot) return;

    if (robot.level >= 10) return;

    robot.level++;
    robot.experience = 0;

    // Recalculate stats
    const stats = RobotDefinitions.calculateStats(robot.type, robot.level);
    robot.efficiency = stats.efficiency;
    robot.speed = stats.speed;
    robot.batteryCapacity = stats.batteryCapacity;
    robot.currentBattery = Math.min(robot.currentBattery, robot.batteryCapacity);
    robot.carryCapacity = stats.carryCapacity;
    robot.powerConsumption = stats.powerConsumption;

    robot.updatedAt = Date.now();

    // Fire event
    this.fireEvent({
      type: RobotEventType.ROBOT_UPGRADED,
      timestamp: Date.now(),
      robotId,
    } as any);
  }

  /**
   * Add module to robot
   */
  addModule(robotId: string, module: RobotModule): boolean {
    const robot = this.robots.get(robotId);
    if (!robot) return false;

    const definition = RobotDefinitions.getDefinition(robot.type);
    if (!definition) return false;

    if (robot.modules.length >= definition.maxModules) return false;

    robot.modules.push(module);

    // Apply module effects
    if (module.effects.speed) {
      robot.speed *= (1 + module.effects.speed);
    }
    if (module.effects.efficiency) {
      robot.efficiency = Math.min(1.0, robot.efficiency + module.effects.efficiency);
    }
    if (module.effects.batteryCapacity) {
      robot.batteryCapacity *= (1 + module.effects.batteryCapacity);
    }
    if (module.effects.carryCapacity) {
      robot.carryCapacity *= (1 + module.effects.carryCapacity);
    }

    robot.updatedAt = Date.now();

    // Fire event
    this.fireEvent({
      type: RobotEventType.ROBOT_MODULE_ADDED,
      timestamp: Date.now(),
      robotId,
    } as any);

    return true;
  }

  /**
   * Remove module from robot
   */
  removeModule(robotId: string, moduleId: string): boolean {
    const robot = this.robots.get(robotId);
    if (!robot) return false;

    const moduleIndex = robot.modules.findIndex(m => m.id === moduleId);
    if (moduleIndex === -1) return false;

    const module = robot.modules[moduleIndex];

    // Remove module effects
    if (module.effects.speed) {
      robot.speed /= (1 + module.effects.speed);
    }
    if (module.effects.efficiency) {
      robot.efficiency = Math.max(0, robot.efficiency - module.effects.efficiency);
    }
    if (module.effects.batteryCapacity) {
      robot.batteryCapacity /= (1 + module.effects.batteryCapacity);
    }
    if (module.effects.carryCapacity) {
      robot.carryCapacity /= (1 + module.effects.carryCapacity);
    }

    robot.modules.splice(moduleIndex, 1);
    robot.updatedAt = Date.now();

    // Fire event
    this.fireEvent({
      type: RobotEventType.ROBOT_MODULE_REMOVED,
      timestamp: Date.now(),
      robotId,
    } as any);

    return true;
  }

  /**
   * Complete task
   */
  completeTask(robotId: string): void {
    const robot = this.robots.get(robotId);
    if (!robot) return;

    robot.tasksCompleted++;
    robot.currentTaskId = undefined;
    robot.state = RobotState.IDLE;
    robot.updatedAt = Date.now();
    robot.lastActiveTime = Date.now();

    // Add experience
    this.addExperience(robotId, 100);
  }

  /**
   * Fail task
   */
  failTask(robotId: string): void {
    const robot = this.robots.get(robotId);
    if (!robot) return;

    robot.tasksFailed++;
    robot.currentTaskId = undefined;
    robot.state = RobotState.IDLE;
    robot.updatedAt = Date.now();
    robot.lastActiveTime = Date.now();
  }

  /**
   * Start maintenance
   */
  startMaintenance(robotId: string): void {
    const robot = this.robots.get(robotId);
    if (!robot) return;

    robot.state = RobotState.MAINTENANCE;
    robot.needsMaintenance = false;
    robot.updatedAt = Date.now();
  }

  /**
   * Complete maintenance
   */
  completeMaintenance(robotId: string): void {
    const robot = this.robots.get(robotId);
    if (!robot) return;

    robot.state = RobotState.IDLE;
    robot.lastMaintenanceTime = Date.now();
    robot.updatedAt = Date.now();
    robot.lastActiveTime = Date.now();

    // Fire event
    this.fireEvent({
      type: RobotEventType.ROBOT_MAINTENANCE_COMPLETED,
      timestamp: Date.now(),
      robotId,
    } as any);
  }

  /**
   * Update robot battery consumption
   */
  private updateBatteryConsumption(): void {
    for (const robot of this.robots.values()) {
      if (robot.state === RobotState.WORKING || robot.state === RobotState.MOVING) {
        const consumption = robot.powerConsumption / 1000; // per tick
        robot.currentBattery -= consumption;
        
        if (robot.currentBattery <= 0) {
          robot.currentBattery = 0;
          robot.state = RobotState.OFFLINE;
        }

        robot.updatedAt = Date.now();
      }
    }
  }

  /**
   * Check maintenance requirements
   */
  private checkMaintenanceRequirements(): void {
    const now = Date.now();

    for (const robot of this.robots.values()) {
      const timeSinceMaintenance = now - robot.lastMaintenanceTime;
      
      if (timeSinceMaintenance >= robot.maintenanceInterval && !robot.needsMaintenance) {
        robot.needsMaintenance = true;
        robot.updatedAt = Date.now();

        // Fire event
        this.fireEvent({
          type: RobotEventType.ROBOT_MAINTENANCE_REQUIRED,
          timestamp: Date.now(),
          robotId: robot.id,
        } as any);
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
    }, 1000); // Update every second
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
   * Update robot instances
   */
  private update(): void {
    this.updateBatteryConsumption();
    this.checkMaintenanceRequirements();
  }

  /**
   * Get state
   */
  getState(): Map<string, RobotInstance> {
    return new Map(this.robots);
  }

  /**
   * Set state
   */
  setState(state: Map<string, RobotInstance>): void {
    this.robots = new Map(state);
  }

  /**
   * Reset robot instances
   */
  reset(): void {
    this.robots.clear();
  }

  /**
   * Get robot count
   */
  getRobotCount(): number {
    return this.robots.size;
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

  /**
   * Cleanup
   */
  destroy(): void {
    this.stopUpdates();
  }
}
