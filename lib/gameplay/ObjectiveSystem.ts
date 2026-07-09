/**
 * Objective/Quest System
 * Event-driven objective system with progress tracking and rewards
 * Integrates with all gameplay systems via events
 */

import type {
  Objective,
  ObjectiveCondition,
  ObjectiveReward,
  GameplayEvent,
  GameplayEventListener,
  GameplayConfig,
} from './types';
import {
  GameplayEventType,
  ObjectiveStatus,
  ObjectiveType,
} from './types';

/**
 * Objective system class
 */
export class ObjectiveSystem {
  private objectives: Map<string, Objective>;
  private activeObjectives: Set<string>;
  private eventListeners: Map<GameplayEventType, Set<GameplayEventListener>>;
  private config: GameplayConfig;
  private conditionCheckers: Map<string, (condition: ObjectiveCondition, event: GameplayEvent) => boolean>;
  private rewardGranters: Map<string, (reward: ObjectiveReward) => void>;

  constructor(config?: Partial<GameplayConfig>) {
    this.objectives = new Map();
    this.activeObjectives = new Set();
    this.eventListeners = new Map();
    this.conditionCheckers = new Map();
    this.rewardGranters = new Map();
    this.config = {
      enableTutorial: true,
      autoStartTutorial: null,
      enableObjectives: true,
      autoAcceptObjectives: true,
      startingCurrency: { freecoin: 100, premium: 0 },
      miningConfig: {
        baseRate: 0.1,
        rarityMultipliers: {},
        qualityMultipliers: {},
        networkEfficiencyBonus: 1.1,
        difficulty: 1.0,
        difficultyAdjustmentRate: 0.001,
      },
      startingRoomSize: { width: 10, height: 10 },
      maxRoomSize: { width: 50, height: 50 },
      enablePlacementIntegration: true,
      enableSimulationIntegration: true,
      enableNetworkIntegration: true,
      enableHardwareIntegration: true,
      ...config,
    };

    this.initializeConditionCheckers();
    this.initializeRewardGranters();
  }

  /**
   * Initialize condition checkers
   */
  private initializeConditionCheckers(): void {
    // Event-based condition checker
    this.conditionCheckers.set('event', (condition, event) => {
      if (condition.eventType && event.type === condition.eventType) {
        condition.currentProgress = (condition.currentProgress || 0) + 1;
        return condition.currentProgress >= (condition.targetProgress || 1);
      }
      return false;
    });

    // State-based condition checker
    this.conditionCheckers.set('state', (condition, event) => {
      // In a real implementation, this would check state
      return true;
    });

    // Custom condition checker
    this.conditionCheckers.set('custom', (condition, event) => {
      const checker = this.conditionCheckers.get(condition.customCheck || '');
      if (checker) {
        return checker(condition, event);
      }
      return true;
    });
  }

  /**
   * Initialize reward granters
   */
  private initializeRewardGranters(): void {
    // Currency reward granter
    this.rewardGranters.set('currency', (reward) => {
      if (reward.currencyType && reward.amount) {
        this.fireEvent({
          type: GameplayEventType.CURRENCY_EARNED,
          timestamp: Date.now(),
          currencyType: reward.currencyType as any,
          amount: reward.amount,
          source: 'reward',
        } as any);
      }
    });

    // Hardware reward granter
    this.rewardGranters.set('hardware', (reward) => {
      if (reward.hardwareType && reward.hardwareCount) {
        console.log(`[Objective System] Grant hardware: ${reward.hardwareType} x${reward.hardwareCount}`);
      }
    });

    // Unlock reward granter
    this.rewardGranters.set('unlock', (reward) => {
      if (reward.unlockId) {
        this.fireEvent({
          type: GameplayEventType.FEATURE_UNLOCKED,
          timestamp: Date.now(),
          unlockId: reward.unlockId,
        } as any);
      }
    });

    // Custom reward granter
    this.rewardGranters.set('custom', (reward) => {
      const granter = this.rewardGranters.get(reward.customData?.type as string || '');
      if (granter) {
        granter(reward);
      }
    });
  }

  /**
   * Register objective
   */
  registerObjective(objective: Objective): void {
    this.objectives.set(objective.id, objective);
  }

  /**
   * Get objective
   */
  getObjective(objectiveId: string): Objective | undefined {
    return this.objectives.get(objectiveId);
  }

  /**
   * Get all objectives
   */
  getAllObjectives(): Objective[] {
    return Array.from(this.objectives.values());
  }

  /**
   * Get active objectives
   */
  getActiveObjectives(): Objective[] {
    return Array.from(this.activeObjectives)
      .map(id => this.objectives.get(id))
      .filter((obj): obj is Objective => obj !== undefined);
  }

  /**
   * Unlock objective
   */
  unlockObjective(objectiveId: string): boolean {
    const objective = this.objectives.get(objectiveId);
    if (!objective) return false;

    // Check prerequisites
    if (objective.prerequisiteIds) {
      const prerequisitesMet = objective.prerequisiteIds.every(prereqId => {
        const prereq = this.objectives.get(prereqId);
        return prereq?.status === ObjectiveStatus.COMPLETED;
      });

      if (!prerequisitesMet) return false;
    }

    objective.status = ObjectiveStatus.AVAILABLE;

    // Fire objective unlocked event
    this.fireEvent({
      type: GameplayEventType.OBJECTIVE_UNLOCKED,
      timestamp: Date.now(),
      objectiveId,
    } as any);

    // Auto-accept if configured
    if (this.config.autoAcceptObjectives) {
      this.startObjective(objectiveId);
    }

    return true;
  }

  /**
   * Start objective
   */
  startObjective(objectiveId: string): boolean {
    const objective = this.objectives.get(objectiveId);
    if (!objective || objective.status !== ObjectiveStatus.AVAILABLE) return false;

    objective.status = ObjectiveStatus.IN_PROGRESS;
    objective.startedAt = Date.now();
    this.activeObjectives.add(objectiveId);

    // Initialize progress
    for (const condition of objective.completionConditions) {
      condition.currentProgress = 0;
    }

    // Fire objective started event
    this.fireEvent({
      type: GameplayEventType.OBJECTIVE_STARTED,
      timestamp: Date.now(),
      objectiveId,
    } as any);

    return true;
  }

  /**
   * Complete objective
   */
  completeObjective(objectiveId: string): boolean {
    const objective = this.objectives.get(objectiveId);
    if (!objective || objective.status !== ObjectiveStatus.IN_PROGRESS) return false;

    // Check all completion conditions
    const allConditionsMet = objective.completionConditions.every(
      condition => condition.currentProgress >= condition.targetProgress
    );

    if (!allConditionsMet) return false;

    objective.status = ObjectiveStatus.COMPLETED;
    objective.completedAt = Date.now();
    this.activeObjectives.delete(objectiveId);

    // Grant rewards
    for (const reward of objective.rewards) {
      const granter = this.rewardGranters.get(reward.type);
      if (granter) {
        granter(reward);
      }
    }

    // Fire objective completed event
    this.fireEvent({
      type: GameplayEventType.OBJECTIVE_COMPLETED,
      timestamp: Date.now(),
      objectiveId,
      rewardsCopy: objective.rewards,
    } as any);

    // Unlock dependent objectives
    this.unlockDependentObjectives(objectiveId);

    return true;
  }

  /**
   * Unlock dependent objectives
   */
  private unlockDependentObjectives(completedObjectiveId: string): void {
    for (const objective of this.objectives.values()) {
      if (objective.prerequisiteIds?.includes(completedObjectiveId)) {
        this.unlockObjective(objective.id);
      }
    }
  }

  /**
   * Fail objective
   */
  failObjective(objectiveId: string): boolean {
    const objective = this.objectives.get(objectiveId);
    if (!objective || objective.status !== ObjectiveStatus.IN_PROGRESS) return false;

    objective.status = ObjectiveStatus.FAILED;
    this.activeObjectives.delete(objectiveId);

    // Fire objective failed event
    this.fireEvent({
      type: GameplayEventType.OBJECTIVE_FAILED,
      timestamp: Date.now(),
      objectiveId,
    } as any);

    return true;
  }

  /**
   * Check condition
   */
  checkCondition(condition: ObjectiveCondition, event: GameplayEvent): boolean {
    const checker = this.conditionCheckers.get(condition.type);
    return checker ? checker(condition, event) : true;
  }

  /**
   * Handle event
   */
  handleEvent(event: GameplayEvent): void {
    for (const objectiveId of this.activeObjectives) {
      const objective = this.objectives.get(objectiveId);
      if (!objective) continue;

      for (const condition of objective.completionConditions) {
        if (this.checkCondition(condition, event)) {
          // Fire progress event
          this.fireEvent({
            type: GameplayEventType.OBJECTIVE_PROGRESS,
            timestamp: Date.now(),
            objectiveId,
            conditionId: condition.id,
            progress: condition.currentProgress,
            total: condition.targetProgress,
          } as any);

          // Check if objective is complete
          this.completeObjective(objectiveId);
          break;
        }
      }
    }
  }

  /**
   * Register event listener
   */
  on(eventType: GameplayEventType, listener: GameplayEventListener): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(listener);
  }

  /**
   * Unregister event listener
   */
  off(eventType: GameplayEventType, listener: GameplayEventListener): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Fire event to listeners
   */
  private fireEvent(event: GameplayEvent): void {
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
  updateConfig(config: Partial<GameplayConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get configuration
   */
  getConfig(): GameplayConfig {
    return { ...this.config };
  }
}
