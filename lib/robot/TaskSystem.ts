/**
 * Task System
 * Manages tasks with job types, priority, and state tracking
 */

import type {
  Task,
  TaskType,
  TaskPriority,
  TaskState,
  RobotEvent,
  RobotEventListener,
  RobotSystemConfig,
} from './types';
import {
  TaskState as TaskStateEnum,
  TaskPriority as TaskPriorityEnum,
  RobotEventType,
  DEFAULT_ROBOT_CONFIG,
} from './types';

/**
 * Task system class
 */
export class TaskSystem {
  private tasks: Map<string, Task>;
  private config: RobotSystemConfig;
  private eventListeners: Map<RobotEventType, Set<RobotEventListener>>;
  private updateInterval: NodeJS.Timeout | null;

  constructor(config?: Partial<RobotSystemConfig>) {
    this.config = {
      ...DEFAULT_ROBOT_CONFIG,
      ...config,
    };

    this.tasks = new Map();
    this.eventListeners = new Map();
    this.updateInterval = null;

    this.startUpdates();
  }

  /**
   * Create task
   */
  createTask(
    type: TaskType,
    priority: TaskPriority,
    parameters: Record<string, unknown>,
    targetId?: string,
    targetPosition?: { x: number; y: number; z?: number }
  ): Task | null {
    const task: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      priority,
      state: TaskStateEnum.PENDING,
      targetId,
      targetPosition,
      parameters,
      progress: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.tasks.set(task.id, task);

    // Fire event
    this.fireEvent({
      type: RobotEventType.TASK_CREATED,
      timestamp: Date.now(),
      taskId: task.id,
    } as any);

    return task;
  }

  /**
   * Remove task
   */
  removeTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;

    this.tasks.delete(taskId);

    return true;
  }

  /**
   * Get task
   */
  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get all tasks
   */
  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Get tasks by state
   */
  getTasksByState(state: TaskState): Task[] {
    return Array.from(this.tasks.values()).filter(task => task.state === state);
  }

  /**
   * Get tasks by priority
   */
  getTasksByPriority(priority: TaskPriority): Task[] {
    return Array.from(this.tasks.values()).filter(task => task.priority === priority);
  }

  /**
   * Get tasks by type
   */
  getTasksByType(type: TaskType): Task[] {
    return Array.from(this.tasks.values()).filter(task => task.type === type);
  }

  /**
   * Get pending tasks sorted by priority
   */
  getPendingTasks(): Task[] {
    return Array.from(this.tasks.values())
      .filter(task => task.state === TaskStateEnum.PENDING)
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * Assign task to robot
   */
  assignTask(taskId: string, robotId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;

    if (task.state !== TaskStateEnum.PENDING) return false;

    task.robotId = robotId;
    task.state = TaskStateEnum.ASSIGNED;
    task.assignedAt = Date.now();
    task.updatedAt = Date.now();

    // Fire event
    this.fireEvent({
      type: RobotEventType.TASK_ASSIGNED,
      timestamp: Date.now(),
      taskId,
      robotId,
    } as any);

    return true;
  }

  /**
   * Start task
   */
  startTask(taskId: string, estimatedDuration: number): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;

    if (task.state !== TaskStateEnum.ASSIGNED) return false;

    task.state = TaskStateEnum.IN_PROGRESS;
    task.startTime = Date.now();
    task.estimatedCompletionTime = Date.now() + estimatedDuration;
    task.updatedAt = Date.now();

    // Fire event
    this.fireEvent({
      type: RobotEventType.TASK_STARTED,
      timestamp: Date.now(),
      taskId,
      robotId: task.robotId,
    } as any);

    return true;
  }

  /**
   * Update task progress
   */
  updateTaskProgress(taskId: string, progress: number): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.progress = Math.max(0, Math.min(1, progress));
    task.updatedAt = Date.now();

    // Check if completed
    if (task.progress >= 1) {
      this.completeTask(taskId);
    }
  }

  /**
   * Complete task
   */
  completeTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;

    task.state = TaskStateEnum.COMPLETED;
    task.progress = 1;
    task.actualCompletionTime = Date.now();
    task.updatedAt = Date.now();

    // Fire event
    this.fireEvent({
      type: RobotEventType.TASK_COMPLETED,
      timestamp: Date.now(),
      taskId,
      robotId: task.robotId,
    } as any);

    return true;
  }

  /**
   * Fail task
   */
  failTask(taskId: string, errorMessage: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;

    task.state = TaskStateEnum.FAILED;
    task.errorMessage = errorMessage;
    task.updatedAt = Date.now();

    // Fire event
    this.fireEvent({
      type: RobotEventType.TASK_FAILED,
      timestamp: Date.now(),
      taskId,
      robotId: task.robotId,
    } as any);

    return true;
  }

  /**
   * Cancel task
   */
  cancelTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;

    task.state = TaskStateEnum.CANCELLED;
    task.updatedAt = Date.now();

    // Fire event
    this.fireEvent({
      type: RobotEventType.TASK_CANCELLED,
      timestamp: Date.now(),
      taskId,
      robotId: task.robotId,
    } as any);

    return true;
  }

  /**
   * Check task timeout
   */
  private checkTaskTimeouts(): void {
    const now = Date.now();

    for (const task of this.tasks.values()) {
      if (task.state === TaskStateEnum.IN_PROGRESS && task.estimatedCompletionTime) {
        if (now > task.estimatedCompletionTime + this.config.taskTimeout) {
          this.failTask(task.id, 'Task timeout');
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
   * Update task system
   */
  private update(): void {
    this.checkTaskTimeouts();
  }

  /**
   * Get state
   */
  getState(): Map<string, Task> {
    return new Map(this.tasks);
  }

  /**
   * Set state
   */
  setState(state: Map<string, Task>): void {
    this.tasks = new Map(state);
  }

  /**
   * Reset task system
   */
  reset(): void {
    this.tasks.clear();
  }

  /**
   * Get task count
   */
  getTaskCount(): number {
    return this.tasks.size;
  }

  /**
   * Get pending task count
   */
  getPendingTaskCount(): number {
    return this.getTasksByState(TaskStateEnum.PENDING).length;
  }

  /**
   * Get active task count
   */
  getActiveTaskCount(): number {
    return this.getTasksByState(TaskStateEnum.IN_PROGRESS).length;
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
