/**
 * Task Scheduler
 * Priority-based task scheduling with multiple assignment strategies
 */

import type {
  Task,
  TaskType,
  RobotInstance,
  RobotSystemConfig,
} from './types';
import { TaskPriority, DEFAULT_ROBOT_CONFIG } from './types';
import { RobotDefinitions } from './RobotDefinitions';
import { TaskSystem } from './TaskSystem';
import { RobotInstances } from './RobotInstances';

/**
 * Task scheduler class
 */
export class TaskScheduler {
  private taskSystem: TaskSystem;
  private robotInstances: RobotInstances;
  private config: RobotSystemConfig;
  private updateInterval: NodeJS.Timeout | null;

  constructor(
    taskSystem: TaskSystem,
    robotInstances: RobotInstances,
    config?: Partial<RobotSystemConfig>
  ) {
    this.taskSystem = taskSystem;
    this.robotInstances = robotInstances;
    this.config = {
      ...DEFAULT_ROBOT_CONFIG,
      ...config,
    };

    this.updateInterval = null;
    this.startUpdates();
  }

  /**
   * Schedule tasks to robots
   */
  scheduleTasks(): void {
    const pendingTasks = this.taskSystem.getPendingTasks();
    const availableRobots = this.robotInstances.getAvailableRobots();

    if (pendingTasks.length === 0 || availableRobots.length === 0) {
      return;
    }

    for (const task of pendingTasks) {
      if (availableRobots.length === 0) break;

      const robot = this.selectRobot(task, availableRobots);
      if (robot) {
        this.assignTask(task, robot);
        // Remove robot from available list
        const index = availableRobots.indexOf(robot);
        if (index > -1) {
          availableRobots.splice(index, 1);
        }
      }
    }
  }

  /**
   * Select robot for task based on strategy
   */
  private selectRobot(task: Task, availableRobots: RobotInstance[]): RobotInstance | null {
    const strategy = this.config.taskAssignmentStrategy;

    // Filter robots that can perform the task
    const capableRobots = availableRobots.filter(robot =>
      RobotDefinitions.canPerformTask(robot.type, task.type)
    );

    if (capableRobots.length === 0) return null;

    switch (strategy) {
      case 'priority':
        return this.selectByPriority(task, capableRobots);
      case 'nearest':
        return this.selectByNearest(task, capableRobots);
      case 'balanced':
        return this.selectByBalanced(task, capableRobots);
      default:
        return capableRobots[0];
    }
  }

  /**
   * Select robot by priority (highest level robot for high priority tasks)
   */
  private selectByPriority(task: Task, robots: RobotInstance[]): RobotInstance | null {
    // Sort robots by level (highest first)
    const sortedRobots = [...robots].sort((a, b) => b.level - a.level);
    return sortedRobots[0];
  }

  /**
   * Select robot by nearest distance
   */
  private selectByNearest(task: Task, robots: RobotInstance[]): RobotInstance | null {
    if (!task.targetPosition) {
      return robots[0];
    }

    // Calculate distances
    const robotDistances = robots.map(robot => {
      const dx = robot.position.x - task.targetPosition!.x;
      const dy = robot.position.y - task.targetPosition!.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return { robot, distance };
    });

    // Sort by distance (nearest first)
    robotDistances.sort((a, b) => a.distance - b.distance);

    return robotDistances[0].robot;
  }

  /**
   * Select robot by balanced approach (consider level, battery, and distance)
   */
  private selectByBalanced(task: Task, robots: RobotInstance[]): RobotInstance | null {
    const robotScores = robots.map(robot => {
      let score = 0;

      // Level score (higher is better)
      score += robot.level * 10;

      // Battery score (higher is better)
      const batteryLevel = robot.currentBattery / robot.batteryCapacity;
      score += batteryLevel * 5;

      // Distance score (closer is better)
      if (task.targetPosition) {
        const dx = robot.position.x - task.targetPosition.x;
        const dy = robot.position.y - task.targetPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        score -= distance * 0.1;
      }

      return { robot, score };
    });

    // Sort by score (highest first)
    robotScores.sort((a, b) => b.score - a.score);

    return robotScores[0].robot;
  }

  /**
   * Assign task to robot
   */
  private assignTask(task: Task, robot: RobotInstance): void {
    this.taskSystem.assignTask(task.id, robot.id);
    this.robotInstances.updateRobotState(robot.id, 'working' as any);
    robot.currentTaskId = task.id;
  }

  /**
   * Reassign task to different robot
   */
  reassignTask(taskId: string, newRobotId: string): boolean {
    const task = this.taskSystem.getTask(taskId);
    if (!task) return false;

    const robot = this.robotInstances.getRobot(newRobotId);
    if (!robot) return false;

    // Check if robot can perform task
    if (!RobotDefinitions.canPerformTask(robot.type, task.type)) {
      return false;
    }

    // Unassign from current robot
    if (task.robotId) {
      const currentRobot = this.robotInstances.getRobot(task.robotId);
      if (currentRobot) {
        currentRobot.currentTaskId = undefined;
        this.robotInstances.updateRobotState(currentRobot.id, 'idle' as any);
      }
    }

    // Assign to new robot
    this.taskSystem.assignTask(taskId, newRobotId);
    this.robotInstances.updateRobotState(newRobotId, 'working' as any);
    robot.currentTaskId = taskId;

    return true;
  }

  /**
   * Get task statistics
   */
  getTaskStatistics(): {
    total: number;
    pending: number;
    assigned: number;
    inProgress: number;
    completed: number;
    failed: number;
    cancelled: number;
    byPriority: Record<TaskPriority, number>;
    byType: Record<TaskType, number>;
  } {
    const tasks = this.taskSystem.getAllTasks();

    const byPriority: Record<TaskPriority, number> = {
      [TaskPriority.CRITICAL]: 0,
      [TaskPriority.HIGH]: 0,
      [TaskPriority.MEDIUM]: 0,
      [TaskPriority.LOW]: 0,
      [TaskPriority.BACKGROUND]: 0,
    };

    const byType: Record<TaskType, number> = {
      build: 0,
      upgrade: 0,
      repair: 0,
      transport: 0,
      recharge: 0,
      clean: 0,
      optimize: 0,
      patrol: 0,
      idle: 0,
      custom: 0,
    };

    for (const task of tasks) {
      byPriority[task.priority]++;
      byType[task.type]++;
    }

    return {
      total: tasks.length,
      pending: this.taskSystem.getTasksByState('pending' as any).length,
      assigned: this.taskSystem.getTasksByState('assigned' as any).length,
      inProgress: this.taskSystem.getTasksByState('in_progress' as any).length,
      completed: this.taskSystem.getTasksByState('completed' as any).length,
      failed: this.taskSystem.getTasksByState('failed' as any).length,
      cancelled: this.taskSystem.getTasksByState('cancelled' as any).length,
      byPriority,
      byType,
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
   * Update task scheduler
   */
  private update(): void {
    this.scheduleTasks();
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
