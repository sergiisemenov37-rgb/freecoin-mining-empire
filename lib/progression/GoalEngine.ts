/**
 * Goal Engine
 * Always calculates the next recommended objective
 * Supports dynamic goals with auto-update
 */

import type {
  Goal,
  GoalState,
  Reward,
  Unlock,
  ProgressionEvent,
  ProgressionEventListener,
  ProgressionConfig,
} from './types';
import {
  GoalPriority,
  ProgressionEventType,
  DEFAULT_PROGRESSION_CONFIG,
} from './types';
import { LevelSystem } from './LevelSystem';
import { TierSystem } from './TierSystem';
import { MilestoneSystem } from './MilestoneSystem';

/**
 * Goal engine class
 */
export class GoalEngine {
  private state: GoalState;
  private config: ProgressionConfig;
  private eventListeners: Map<ProgressionEventType, Set<ProgressionEventListener>>;
  private levelSystem: LevelSystem;
  private tierSystem: TierSystem;
  private milestoneSystem: MilestoneSystem;
  private updateInterval: NodeJS.Timeout | null;

  constructor(
    levelSystem: LevelSystem,
    tierSystem: TierSystem,
    milestoneSystem: MilestoneSystem,
    config?: Partial<ProgressionConfig>
  ) {
    this.levelSystem = levelSystem;
    this.tierSystem = tierSystem;
    this.milestoneSystem = milestoneSystem;
    this.config = {
      ...DEFAULT_PROGRESSION_CONFIG,
      ...config,
    };

    this.state = {
      activeGoals: [],
      completedGoals: new Set(),
      currentGoal: null,
      goalHistory: [],
    };

    this.eventListeners = new Map();
    this.updateInterval = null;

    this.setupListeners();
    this.startUpdateInterval();
  }

  /**
   * Setup listeners
   */
  private setupListeners(): void {
    this.levelSystem.on(ProgressionEventType.LEVEL_UP as any, () => {
      this.updateGoals();
    });

    this.tierSystem.on(ProgressionEventType.TIER_UP as any, () => {
      this.updateGoals();
    });

    this.milestoneSystem.on(ProgressionEventType.MILESTONE_COMPLETED as any, () => {
      this.updateGoals();
    });
  }

  /**
   * Start update interval
   */
  private startUpdateInterval(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(() => {
      this.updateGoals();
    }, this.config.goalUpdateInterval);
  }

  /**
   * Stop update interval
   */
  private stopUpdateInterval(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Update goals
   */
  private updateGoals(): void {
    // Update dynamic goals
    for (const goal of this.state.activeGoals) {
      if (goal.dynamic && goal.autoUpdate) {
        this.updateGoalProgress(goal);
      }
    }

    // Check for goal completion
    for (const goal of this.state.activeGoals) {
      if (!goal.completed && goal.progress >= 100) {
        this.completeGoal(goal.id);
      }
    }

    // Calculate next recommended goal
    this.calculateNextGoal();
  }

  /**
   * Update goal progress
   */
  private updateGoalProgress(goal: Goal): void {
    const newValue = this.calculateGoalValue(goal);
    goal.currentValue = newValue;
    goal.progress = (goal.currentValue / goal.targetValue) * 100;
  }

  /**
   * Calculate goal value
   */
  private calculateGoalValue(goal: Goal): number {
    switch (goal.type) {
      case 'level':
        return this.levelSystem.getCurrentLevel();
      case 'tier':
        return this.tierSystem.getCurrentTier();
      case 'hardware_count':
        // In a real implementation, this would fetch from hardware system
        return 0;
      case 'empire_value':
        // In a real implementation, this would fetch from empire system
        return 0;
      case 'mining_output':
        // In a real implementation, this would fetch from mining system
        return 0;
      default:
        return goal.currentValue;
    }
  }

  /**
   * Calculate next recommended goal
   */
  private calculateNextGoal(): void {
    const currentLevel = this.levelSystem.getCurrentLevel();
    const currentTier = this.tierSystem.getCurrentTier();

    // Generate potential goals
    const potentialGoals = this.generatePotentialGoals(currentLevel, currentTier);

    // Filter out completed goals
    const availableGoals = potentialGoals.filter(g => !this.state.completedGoals.has(g.id));

    // Sort by priority
    availableGoals.sort((a, b) => {
      const priorityOrder = {
        [GoalPriority.CRITICAL]: 0,
        [GoalPriority.HIGH]: 1,
        [GoalPriority.MEDIUM]: 2,
        [GoalPriority.LOW]: 3,
      };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Set current goal
    if (availableGoals.length > 0) {
      this.state.currentGoal = availableGoals[0];
    } else {
      this.state.currentGoal = null;
    }
  }

  /**
   * Generate potential goals
   */
  private generatePotentialGoals(currentLevel: number, currentTier: number): Goal[] {
    const goals: Goal[] = [];

    // Level goals
    const nextLevel = currentLevel + 1;
    goals.push({
      id: `goal_level_${nextLevel}`,
      title: `Reach Level ${nextLevel}`,
      description: `Gain enough experience to reach level ${nextLevel}`,
      priority: GoalPriority.HIGH,
      type: 'level',
      targetValue: nextLevel,
      currentValue: currentLevel,
      progress: (currentLevel / nextLevel) * 100,
      rewards: [
        {
          id: `goal_level_${nextLevel}_reward`,
          type: 'experience' as any,
          amount: nextLevel * 50,
        },
      ],
      unlocks: [],
      dynamic: true,
      autoUpdate: true,
      completed: false,
    });

    // Tier goals
    const nextTier = currentTier + 1;
    if (nextTier <= this.tierSystem.getMaxTier()) {
      goals.push({
        id: `goal_tier_${nextTier}`,
        title: `Reach Tier ${nextTier}`,
        description: `Meet requirements to reach tier ${nextTier}`,
        priority: GoalPriority.HIGH,
        type: 'tier',
        targetValue: nextTier,
        currentValue: currentTier,
        progress: (currentTier / nextTier) * 100,
        rewards: [
          {
            id: `goal_tier_${nextTier}_reward`,
            type: 'currency' as any,
            currencyType: 'freecoin',
            amount: nextTier * 1000,
          },
        ],
        unlocks: [],
        dynamic: true,
        autoUpdate: true,
        completed: false,
      });
    }

    // Hardware count goals
    goals.push({
      id: 'goal_hardware_5',
      title: 'Collect 5 Hardware',
      description: 'Own 5 pieces of hardware',
      priority: GoalPriority.MEDIUM,
      type: 'hardware_count',
      targetValue: 5,
      currentValue: 0,
      progress: 0,
      rewards: [
        {
          id: 'goal_hardware_5_reward',
          type: 'currency' as any,
          currencyType: 'freecoin',
          amount: 200,
        },
      ],
      unlocks: [],
      dynamic: true,
      autoUpdate: true,
      completed: false,
    });

    // Mining output goals
    goals.push({
      id: 'goal_mining_50',
      title: 'Mine 50 FreeCoin',
      description: 'Mine 50 FreeCoin total',
      priority: GoalPriority.MEDIUM,
      type: 'mining_output',
      targetValue: 50,
      currentValue: 0,
      progress: 0,
      rewards: [
        {
          id: 'goal_mining_50_reward',
          type: 'currency' as any,
          currencyType: 'freecoin',
          amount: 100,
        },
      ],
      unlocks: [],
      dynamic: true,
      autoUpdate: true,
      completed: false,
    });

    return goals;
  }

  /**
   * Add goal
   */
  addGoal(goal: Goal): void {
    if (this.state.activeGoals.length >= this.config.maxActiveGoals) {
      return;
    }

    this.state.activeGoals.push(goal);
    this.updateGoals();
  }

  /**
   * Remove goal
   */
  removeGoal(goalId: string): void {
    const index = this.state.activeGoals.findIndex(g => g.id === goalId);
    if (index !== -1) {
      this.state.activeGoals.splice(index, 1);
      this.updateGoals();
    }
  }

  /**
   * Complete goal
   */
  private completeGoal(goalId: string): void {
    const goal = this.state.activeGoals.find(g => g.id === goalId);
    if (!goal || goal.completed) return;

    goal.completed = true;
    goal.completedAt = Date.now();

    this.state.completedGoals.add(goalId);

    const now = Date.now();
    const goalHistoryEntry = this.state.activeGoals.find(g => g.id === goalId);
    const timeTaken = goalHistoryEntry?.completedAt ? 
      now - (goalHistoryEntry.completedAt - 1000) : 0;

    this.state.goalHistory.push({
      goalId,
      completedAt: now,
      timeTaken,
    });

    // Remove from active goals
    const index = this.state.activeGoals.findIndex(g => g.id === goalId);
    if (index !== -1) {
      this.state.activeGoals.splice(index, 1);
    }

    // Fire event
    this.fireEvent({
      type: ProgressionEventType.GOAL_COMPLETED,
      timestamp: now,
      playerId: '',
      empireId: '',
      goalId,
      goal,
    } as any);

    this.updateGoals();
  }

  /**
   * Get current goal
   */
  getCurrentGoal(): Goal | null {
    return this.state.currentGoal;
  }

  /**
   * Get active goals
   */
  getActiveGoals(): Goal[] {
    return [...this.state.activeGoals];
  }

  /**
   * Get goal
   */
  getGoal(goalId: string): Goal | undefined {
    return this.state.activeGoals.find(g => g.id === goalId);
  }

  /**
   * Check if goal is completed
   */
  isCompleted(goalId: string): boolean {
    return this.state.completedGoals.has(goalId);
  }

  /**
   * Get goal history
   */
  getGoalHistory(): Array<{ goalId: string; completedAt: number; timeTaken: number }> {
    return [...this.state.goalHistory];
  }

  /**
   * Get state
   */
  getState(): GoalState {
    return {
      activeGoals: [...this.state.activeGoals],
      completedGoals: new Set(this.state.completedGoals),
      currentGoal: this.state.currentGoal,
      goalHistory: [...this.state.goalHistory],
    };
  }

  /**
   * Set state
   */
  setState(state: GoalState): void {
    this.state = {
      activeGoals: [...state.activeGoals],
      completedGoals: new Set(state.completedGoals),
      currentGoal: state.currentGoal,
      goalHistory: [...state.goalHistory],
    };
  }

  /**
   * Reset goals
   */
  reset(): void {
    this.state = {
      activeGoals: [],
      completedGoals: new Set(),
      currentGoal: null,
      goalHistory: [],
    };
    this.updateGoals();
  }

  /**
   * Register event listener
   */
  on(eventType: ProgressionEventType, listener: ProgressionEventListener): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(listener);
  }

  /**
   * Unregister event listener
   */
  off(eventType: ProgressionEventType, listener: ProgressionEventListener): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Fire event to listeners
   */
  private fireEvent(event: ProgressionEvent): void {
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
  updateConfig(config: Partial<ProgressionConfig>): void {
    this.config = { ...this.config, ...config };
    this.stopUpdateInterval();
    this.startUpdateInterval();
  }

  /**
   * Get configuration
   */
  getConfig(): ProgressionConfig {
    return { ...this.config };
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stopUpdateInterval();
  }
}
