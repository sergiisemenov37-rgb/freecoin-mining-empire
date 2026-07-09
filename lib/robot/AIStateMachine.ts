/**
 * AI State Machine
 * State machine for robot AI behavior with pathfinding-ready architecture
 */

import type {
  RobotInstance,
  Task,
  ChargingStation,
  AIDecisionContext,
  AIDecision,
  RobotSystemConfig,
} from './types';
import {
  AIBehaviorState,
  RobotState,
  DEFAULT_ROBOT_CONFIG,
} from './types';
import { RobotInstances } from './RobotInstances';
import { TaskSystem } from './TaskSystem';

/**
 * AI state machine class
 */
export class AIStateMachine {
  private robotInstances: RobotInstances;
  private taskSystem: TaskSystem;
  private config: RobotSystemConfig;
  private updateInterval: NodeJS.Timeout | null;
  private chargingStations: Map<string, ChargingStation>;

  constructor(
    robotInstances: RobotInstances,
    taskSystem: TaskSystem,
    config?: Partial<RobotSystemConfig>
  ) {
    this.robotInstances = robotInstances;
    this.taskSystem = taskSystem;
    this.config = {
      ...DEFAULT_ROBOT_CONFIG,
      ...config,
    };

    this.chargingStations = new Map();
    this.updateInterval = null;
    this.startUpdates();
  }

  /**
   * Set charging stations
   */
  setChargingStations(stations: Map<string, ChargingStation>): void {
    this.chargingStations = new Map(stations);
  }

  /**
   * Add charging station
   */
  addChargingStation(station: ChargingStation): void {
    this.chargingStations.set(station.id, station);
  }

  /**
   * Remove charging station
   */
  removeChargingStation(stationId: string): void {
    this.chargingStations.delete(stationId);
  }

  /**
   * Make AI decision for robot
   */
  makeDecision(robotId: string): AIDecision | null {
    const robot = this.robotInstances.getRobot(robotId);
    if (!robot) return null;

    const context = this.buildDecisionContext(robot);
    const decision = this.processAI(context);

    return decision;
  }

  /**
   * Build decision context
   */
  private buildDecisionContext(robot: RobotInstance): AIDecisionContext {
    const currentTask = robot.currentTaskId 
      ? this.taskSystem.getTask(robot.currentTaskId)
      : undefined;

    const batteryLevel = robot.currentBattery / robot.batteryCapacity;
    const taskQueue = this.taskSystem.getPendingTasks();
    const chargingStations = Array.from(this.chargingStations.values());

    // Find nearby robots (simplified - in real implementation would use spatial index)
    const nearbyRobots = this.robotInstances.getAllRobots().filter(r => {
      const dx = r.position.x - robot.position.x;
      const dy = r.position.y - robot.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < 50 && r.id !== robot.id;
    });

    return {
      robot,
      currentTask,
      batteryLevel,
      taskQueue,
      chargingStations,
      nearbyRobots,
      environment: {},
    };
  }

  /**
   * Process AI decision
   */
  private processAI(context: AIDecisionContext): AIDecision {
    const { robot, currentTask, batteryLevel } = context;

    // Check for critical conditions first
    if (batteryLevel <= this.config.criticalBatteryThreshold) {
      return this.decideRecharge(context);
    }

    if (robot.needsMaintenance) {
      return this.decideMaintenance(context);
    }

    // Check current task
    if (currentTask) {
      if (currentTask.state === 'in_progress') {
        return this.decideContinueTask(context);
      } else if (currentTask.state === 'assigned') {
        return this.decideStartTask(context);
      }
    }

    // No task, seek new task
    return this.decideSeekTask(context);
  }

  /**
   * Decide to recharge
   */
  private decideRecharge(context: AIDecisionContext): AIDecision {
    const { robot, chargingStations } = context;

    // Find nearest charging station
    let nearestStation: ChargingStation | null = null;
    let nearestDistance = Infinity;

    for (const station of chargingStations) {
      const dx = station.position.x - robot.position.x;
      const dy = station.position.y - robot.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < nearestDistance && station.currentRobots < station.maxRobots) {
        nearestDistance = distance;
        nearestStation = station;
      }
    }

    if (nearestStation) {
      return {
        behaviorState: AIBehaviorState.RETURNING_TO_CHARGER,
        targetPosition: nearestStation.position,
        action: 'move_to_charger',
        parameters: { stationId: nearestStation.id },
      };
    }

    // No available charging station
    return {
      behaviorState: AIBehaviorState.EMERGENCY,
      action: 'emergency_stop',
      parameters: { reason: 'no_charging_station' },
    };
  }

  /**
   * Decide to go to maintenance
   */
  private decideMaintenance(context: AIDecisionContext): AIDecision {
    const { robot } = context;

    // Cancel current task if any
    if (robot.currentTaskId) {
      this.taskSystem.cancelTask(robot.currentTaskId);
    }

    return {
      behaviorState: AIBehaviorState.MAINTENANCE,
      action: 'go_to_maintenance',
      parameters: {},
    };
  }

  /**
   * Decide to continue current task
   */
  private decideContinueTask(context: AIDecisionContext): AIDecision {
    const { robot, currentTask, batteryLevel } = context;

    if (!currentTask) {
      return this.decideSeekTask(context);
    }

    // Check if battery is getting low
    if (batteryLevel <= this.config.lowBatteryThreshold) {
      // Complete task quickly or abort
      if (currentTask.progress > 0.8) {
        return {
          behaviorState: AIBehaviorState.EXECUTING_TASK,
          action: 'complete_task',
          parameters: { taskId: currentTask.id },
        };
      } else {
        // Abort and recharge
        this.taskSystem.cancelTask(currentTask.id);
        return this.decideRecharge(context);
      }
    }

    return {
      behaviorState: AIBehaviorState.EXECUTING_TASK,
      action: 'continue_task',
      parameters: { taskId: currentTask.id },
    };
  }

  /**
   * Decide to start assigned task
   */
  private decideStartTask(context: AIDecisionContext): AIDecision {
    const { robot, currentTask } = context;

    if (!currentTask) {
      return this.decideSeekTask(context);
    }

    if (!currentTask.targetPosition) {
      return {
        behaviorState: AIBehaviorState.EXECUTING_TASK,
        action: 'start_task',
        parameters: { taskId: currentTask.id },
      };
    }

    return {
      behaviorState: AIBehaviorState.MOVING_TO_TARGET,
      targetPosition: currentTask.targetPosition,
      action: 'move_to_target',
      parameters: { taskId: currentTask.id },
    };
  }

  /**
   * Decide to seek new task
   */
  private decideSeekTask(context: AIDecisionContext): AIDecision {
    const { taskQueue, robot } = context;

    if (taskQueue.length === 0) {
      return {
        behaviorState: AIBehaviorState.IDLE,
        action: 'idle',
        parameters: {},
      };
    }

    // Find highest priority task that robot can perform
    // This is simplified - scheduler handles actual assignment
    return {
      behaviorState: AIBehaviorState.SEEKING_TASK,
      action: 'seek_task',
      parameters: {},
    };
  }

  /**
   * Update all robots
   */
  updateAllRobots(): void {
    const robots = this.robotInstances.getAllRobots();

    for (const robot of robots) {
      if (robot.state === RobotState.OFFLINE) continue;

      const decision = this.makeDecision(robot.id);
      if (decision) {
        this.applyDecision(robot.id, decision);
      }
    }
  }

  /**
   * Apply AI decision to robot
   */
  private applyDecision(robotId: string, decision: AIDecision): void {
    const robot = this.robotInstances.getRobot(robotId);
    if (!robot) return;

    // Update behavior state
    switch (decision.behaviorState) {
      case AIBehaviorState.IDLE:
        this.robotInstances.updateRobotState(robotId, RobotState.IDLE);
        break;
      case AIBehaviorState.SEEKING_TASK:
        this.robotInstances.updateRobotState(robotId, RobotState.IDLE);
        break;
      case AIBehaviorState.MOVING_TO_TARGET:
        this.robotInstances.updateRobotState(robotId, RobotState.MOVING);
        if (decision.targetPosition) {
          // Move robot (simplified - pathfinding would be here)
          robot.position = { ...decision.targetPosition };
        }
        break;
      case AIBehaviorState.EXECUTING_TASK:
        this.robotInstances.updateRobotState(robotId, RobotState.WORKING);
        break;
      case AIBehaviorState.RETURNING_TO_CHARGER:
        this.robotInstances.updateRobotState(robotId, RobotState.MOVING);
        if (decision.targetPosition) {
          robot.position = { ...decision.targetPosition };
        }
        break;
      case AIBehaviorState.CHARGING:
        this.robotInstances.updateRobotState(robotId, RobotState.CHARGING);
        robot.isCharging = true;
        break;
      case AIBehaviorState.MAINTENANCE:
        this.robotInstances.updateRobotState(robotId, RobotState.MAINTENANCE);
        break;
      case AIBehaviorState.STUCK:
        this.robotInstances.updateRobotState(robotId, RobotState.STUCK);
        break;
      case AIBehaviorState.EMERGENCY:
        this.robotInstances.updateRobotState(robotId, RobotState.OFFLINE);
        break;
    }

    robot.updatedAt = Date.now();
  }

  /**
   * Start automatic updates
   */
  private startUpdates(): void {
    (this.updateInterval) = setInterval(() => {
      this.update();
    }, this.config.aiUpdateInterval);
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
   * Update AI state machine
   */
  private update(): void {
    this.updateAllRobots();
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<RobotSystemConfig>): void {
    this.config = { ...this.config, ...config };
    
    this.stopUpdates();
    this.startUpdates();
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
