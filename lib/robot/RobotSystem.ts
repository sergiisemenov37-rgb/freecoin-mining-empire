/**
 * Robot System
 * Central coordinator integrating all robot subsystems
 * Integrates with Buildings, Hardware, Energy, Research, Progression
 */

import { RobotInstances } from './RobotInstances';
import { TaskSystem } from './TaskSystem';
import { TaskScheduler } from './TaskScheduler';
import { AIStateMachine } from './AIStateMachine';
import { ChargingStations } from './ChargingStations';
import { RobotUpgrades } from './RobotUpgrades';
import type {
  RobotInstance,
  RobotType,
  Task,
  ChargingStation,
  RobotModule,
  RobotEvent,
  RobotEventListener,
  RobotSystemConfig,
} from './types';
import {
  RobotEventType,
  DEFAULT_ROBOT_CONFIG,
} from './types';

/**
 * Robot system class
 */
export class RobotSystem {
  private robotInstances: RobotInstances;
  private taskSystem: TaskSystem;
  private taskScheduler: TaskScheduler;
  private aiStateMachine: AIStateMachine;
  private chargingStations: ChargingStations;
  private robotUpgrades: RobotUpgrades;
  private config: RobotSystemConfig;
  private eventListeners: Map<RobotEventType, Set<RobotEventListener>>;

  constructor(config?: Partial<RobotSystemConfig>) {
    this.config = {
      ...DEFAULT_ROBOT_CONFIG,
      ...config,
    };

    this.robotInstances = new RobotInstances(this.config);
    this.taskSystem = new TaskSystem(this.config);
    this.chargingStations = new ChargingStations(this.robotInstances, this.config);
    this.robotUpgrades = new RobotUpgrades(this.robotInstances, this.config);
    this.taskScheduler = new TaskScheduler(
      this.taskSystem,
      this.robotInstances,
      this.config
    );
    this.aiStateMachine = new AIStateMachine(
      this.robotInstances,
      this.taskSystem,
      this.config
    );
    this.eventListeners = new Map();

    this.setupEventIntegration();
    this.syncChargingStations();
  }

  /**
   * Setup event integration between subsystems
   */
  private setupEventIntegration(): void {
    // Forward robot instances events
    const robotInstanceEvents: RobotEventType[] = [
      RobotEventType.ROBOT_CREATED,
      RobotEventType.ROBOT_DESTROYED,
      RobotEventType.ROBOT_UPGRADED,
      RobotEventType.ROBOT_MODULE_ADDED,
      RobotEventType.ROBOT_MODULE_REMOVED,
      RobotEventType.ROBOT_STATE_CHANGED,
      RobotEventType.ROBOT_MAINTENANCE_REQUIRED,
      RobotEventType.ROBOT_MAINTENANCE_COMPLETED,
    ];

    for (const eventType of robotInstanceEvents) {
      this.robotInstances.on(eventType, (event) => {
        this.handleRobotInstanceEvent(event);
      });
    }

    // Forward task system events
    const taskEvents: RobotEventType[] = [
      RobotEventType.TASK_CREATED,
      RobotEventType.TASK_ASSIGNED,
      RobotEventType.TASK_STARTED,
      RobotEventType.TASK_COMPLETED,
      RobotEventType.TASK_FAILED,
      RobotEventType.TASK_CANCELLED,
    ];

    for (const eventType of taskEvents) {
      this.taskSystem.on(eventType, (event) => {
        this.handleTaskEvent(event);
      });
    }

    // Forward charging stations events
    const chargingEvents: RobotEventType[] = [
      RobotEventType.CHARGING_STATION_BUILT,
      RobotEventType.CHARGING_STATION_DESTROYED,
      RobotEventType.ROBOT_CHARGING_STARTED,
      RobotEventType.ROBOT_CHARGING_COMPLETED,
    ];

    for (const eventType of chargingEvents) {
      this.chargingStations.on(eventType, (event) => {
        this.handleChargingEvent(event);
      });
    }

    // Forward robot upgrades events
    this.robotUpgrades.on(RobotEventType.ROBOT_UPGRADED, (event) => {
      this.handleRobotUpgradeEvent(event);
    });
  }

  /**
   * Handle robot instance events
   */
  private handleRobotInstanceEvent(event: RobotEvent): void {
    this.fireEvent(event);
  }

  /**
   * Handle task events
   */
  private handleTaskEvent(event: RobotEvent): void {
    this.fireEvent(event);

    // Update robot when task completes
    if (event.type === RobotEventType.TASK_COMPLETED && event.robotId) {
      this.robotInstances.completeTask(event.robotId);
    }

    // Update robot when task fails
    if (event.type === RobotEventType.TASK_FAILED && event.robotId) {
      this.robotInstances.failTask(event.robotId);
    }
  }

  /**
   * Handle charging events
   */
  private handleChargingEvent(event: RobotEvent): void {
    this.fireEvent(event);

    // Sync charging stations with AI state machine
    if (event.type === RobotEventType.CHARGING_STATION_BUILT ||
        event.type === RobotEventType.CHARGING_STATION_DESTROYED) {
      this.syncChargingStations();
    }
  }

  /**
   * Handle robot upgrade events
   */
  private handleRobotUpgradeEvent(event: RobotEvent): void {
    this.fireEvent(event);
  }

  /**
   * Sync charging stations with AI state machine
   */
  private syncChargingStations(): void {
    this.aiStateMachine.setChargingStations(this.chargingStations.getState());
  }

  // ============================================
  // ROBOT MANAGEMENT API
  // ============================================

  /**
   * Create robot
   */
  createRobot(
    type: RobotType,
    name: string,
    position: { x: number; y: number; z?: number }
  ): RobotInstance | null {
    return this.robotInstances.createRobot(type, name, position);
  }

  /**
   * Remove robot
   */
  removeRobot(robotId: string): boolean {
    return this.robotInstances.removeRobot(robotId);
  }

  /**
   * Get robot
   */
  getRobot(robotId: string): RobotInstance | undefined {
    return this.robotInstances.getRobot(robotId);
  }

  /**
   * Get all robots
   */
  getAllRobots(): RobotInstance[] {
    return this.robotInstances.getAllRobots();
  }

  /**
   * Get robots by type
   */
  getRobotsByType(type: RobotType): RobotInstance[] {
    return this.robotInstances.getRobotsByType(type);
  }

  /**
   * Get available robots
   */
  getAvailableRobots(): RobotInstance[] {
    return this.robotInstances.getAvailableRobots();
  }

  // ============================================
  // TASK MANAGEMENT API
  // ============================================

  /**
   * Create task
   */
  createTask(
    type: string,
    priority: number,
    parameters: Record<string, unknown>,
    targetId?: string,
    targetPosition?: { x: number; y: number; z?: number }
  ): Task | null {
    return this.taskSystem.createTask(
      type as any,
      priority as any,
      parameters,
      targetId,
      targetPosition
    );
  }

  /**
   * Cancel task
   */
  cancelTask(taskId: string): boolean {
    return this.taskSystem.cancelTask(taskId);
  }

  /**
   * Get task
   */
  getTask(taskId: string): Task | undefined {
    return this.taskSystem.getTask(taskId);
  }

  /**
   * Get all tasks
   */
  getAllTasks(): Task[] {
    return this.taskSystem.getAllTasks();
  }

  /**
   * Get pending tasks
   */
  getPendingTasks(): Task[] {
    return this.taskSystem.getPendingTasks();
  }

  // ============================================
  // CHARGING STATIONS API
  // ============================================

  /**
   * Add charging station
   */
  addChargingStation(station: ChargingStation): void {
    this.chargingStations.addStation(station);
    this.syncChargingStations();
  }

  /**
   * Remove charging station
   */
  removeChargingStation(stationId: string): boolean {
    const result = this.chargingStations.removeStation(stationId);
    this.syncChargingStations();
    return result;
  }

  /**
   * Get charging station
   */
  getChargingStation(stationId: string): ChargingStation | undefined {
    return this.chargingStations.getStation(stationId);
  }

  /**
   * Get all charging stations
   */
  getAllChargingStations(): ChargingStation[] {
    return this.chargingStations.getAllStations();
  }

  // ============================================
  // UPGRADES AND MODULES API
  // ============================================

  /**
   * Upgrade robot
   */
  upgradeRobot(robotId: string): boolean {
    return this.robotUpgrades.upgradeRobot(robotId);
  }

  /**
   * Add module to robot
   */
  addModuleToRobot(robotId: string, moduleId: string): boolean {
    return this.robotUpgrades.addModuleToRobot(robotId, moduleId);
  }

  /**
   * Remove module from robot
   */
  removeModuleFromRobot(robotId: string, moduleId: string): boolean {
    return this.robotUpgrades.removeModuleFromRobot(robotId, moduleId);
  }

  /**
   * Get all available modules
   */
  getAllModules(): RobotModule[] {
    return this.robotUpgrades.getAllModules();
  }

  /**
   * Get upgrade cost
   */
  getUpgradeCost(robotId: string): {
    credits: number;
    resources?: Record<string, number>;
  } {
    return this.robotUpgrades.getUpgradeCost(robotId);
  }

  // ============================================
  // SCHEDULER AND AI API
  // ============================================

  /**
   * Get task statistics
   */
  getTaskStatistics() {
    return this.taskScheduler.getTaskStatistics();
  }

  /**
   * Make AI decision for robot
   */
  makeAIDecision(robotId: string) {
    return this.aiStateMachine.makeDecision(robotId);
  }

  // ============================================
  // STATE MANAGEMENT
  // ============================================

  /**
   * Get state
   */
  getState() {
    return {
      robots: this.robotInstances.getState(),
      tasks: this.taskSystem.getState(),
      chargingStations: this.chargingStations.getState(),
    };
  }

  /**
   * Set state
   */
  setState(state: {
    robots: ReturnType<RobotInstances['getState']>;
    tasks: ReturnType<TaskSystem['getState']>;
    chargingStations: ReturnType<ChargingStations['getState']>;
  }): void {
    this.robotInstances.setState(state.robots);
    this.taskSystem.setState(state.tasks);
    this.chargingStations.setState(state.chargingStations);
    this.syncChargingStations();
  }

  /**
   * Reset robot system
   */
  reset(): void {
    this.robotInstances.reset();
    this.taskSystem.reset();
    this.chargingStations.reset();
    this.syncChargingStations();
  }

  // ============================================
  // EVENT MANAGEMENT
  // ============================================

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

  // ============================================
  // CONFIGURATION
  // ============================================

  /**
   * Update configuration
   */
  updateConfig(config: Partial<RobotSystemConfig>): void {
    this.config = { ...this.config, ...config };
    this.robotInstances.updateConfig(config);
    this.taskSystem.updateConfig(config);
    this.taskScheduler.updateConfig(config);
    this.aiStateMachine.updateConfig(config);
    this.chargingStations.updateConfig(config);
    this.robotUpgrades.updateConfig(config);
  }

  /**
   * Get configuration
   */
  getConfig(): RobotSystemConfig {
    return { ...this.config };
  }

  // ============================================
  // SUBSYSTEM ACCESS
  // ============================================

  /**
   * Get robot instances system
   */
  getRobotInstances(): RobotInstances {
    return this.robotInstances;
  }

  /**
   * Get task system
   */
  getTaskSystem(): TaskSystem {
    return this.taskSystem;
  }

  /**
   * Get task scheduler
   */
  getTaskScheduler(): TaskScheduler {
    return this.taskScheduler;
  }

  /**
   * Get AI state machine
   */
  getAIStateMachine(): AIStateMachine {
    return this.aiStateMachine;
  }

  /**
   * Get charging stations
   */
  getChargingStations(): ChargingStations {
    return this.chargingStations;
  }

  /**
   * Get robot upgrades
   */
  getRobotUpgrades(): RobotUpgrades {
    return this.robotUpgrades;
  }

  // ============================================
  // CLEANUP
  // ============================================

  /**
   * Cleanup
   */
  destroy(): void {
    this.robotInstances.destroy();
    this.taskSystem.destroy();
    this.taskScheduler.destroy();
    this.aiStateMachine.destroy();
    this.chargingStations.destroy();
  }
}
