/**
 * Progression Engine
 * Central coordinator for all progression systems
 * Integrates experience, levels, tiers, unlocks, milestones, rewards, goals, and notifications
 */

import { ExperienceEngine } from './ExperienceEngine';
import { LevelSystem } from './LevelSystem';
import { TierSystem } from './TierSystem';
import { UnlockEngine } from './UnlockEngine';
import { MilestoneSystem } from './MilestoneSystem';
import { RewardEngine } from './RewardEngine';
import { GoalEngine } from './GoalEngine';
import { NotificationSystem } from './NotificationSystem';
import { ProgressionPersistence, LocalStorageStorage } from './ProgressionPersistence';
import type {
  ProgressionState,
  ProgressionConfig,
  ProgressionEvent,
  ProgressionEventListener,
} from './types';
import {
  ProgressionEventType,
  DEFAULT_PROGRESSION_CONFIG,
} from './types';

/**
 * Progression engine class
 */
export class ProgressionEngine {
  private experienceEngine: ExperienceEngine;
  private levelSystem: LevelSystem;
  private tierSystem: TierSystem;
  private unlockEngine: UnlockEngine;
  private milestoneSystem: MilestoneSystem;
  private rewardEngine: RewardEngine;
  private goalEngine: GoalEngine;
  private notificationSystem: NotificationSystem;
  private persistence: ProgressionPersistence;
  private config: ProgressionConfig;
  private playerId: string;
  private empireId: string;
  private eventListeners: Map<ProgressionEventType, Set<ProgressionEventListener>>;

  constructor(
    playerId: string,
    empireId: string,
    config?: Partial<ProgressionConfig>
  ) {
    this.playerId = playerId;
    this.empireId = empireId;
    this.config = {
      ...DEFAULT_PROGRESSION_CONFIG,
      ...config,
    };

    this.eventListeners = new Map();

    // Initialize systems
    this.experienceEngine = new ExperienceEngine(this.config);
    this.levelSystem = new LevelSystem(this.experienceEngine, this.config);
    this.tierSystem = new TierSystem(this.levelSystem, this.config);
    this.unlockEngine = new UnlockEngine(this.levelSystem, this.tierSystem, this.config);
    this.milestoneSystem = new MilestoneSystem(this.config);
    this.rewardEngine = new RewardEngine(this.experienceEngine, this.unlockEngine, this.config);
    this.goalEngine = new GoalEngine(this.levelSystem, this.tierSystem, this.milestoneSystem, this.config);
    this.notificationSystem = new NotificationSystem(this.config);
    this.persistence = new ProgressionPersistence(
      new LocalStorageStorage(),
      playerId,
      empireId,
      this.config
    );

    // Setup event integration
    this.setupEventIntegration();
  }

  /**
   * Setup event integration between systems
   */
  private setupEventIntegration(): void {
    // Level up -> Notification
    this.levelSystem.on(ProgressionEventType.LEVEL_UP as any, (event) => {
      const levelUpEvent = event as any;
      this.notificationSystem.createLevelUpNotification(levelUpEvent.oldLevel, levelUpEvent.newLevel);
      this.rewardEngine.grantRewards(levelUpEvent.rewards, 'level_up');
    });

    // Tier up -> Notification
    this.tierSystem.on(ProgressionEventType.TIER_UP as any, (event) => {
      const tierUpEvent = event as any;
      this.notificationSystem.createTierUpNotification(tierUpEvent.oldTier, tierUpEvent.newTier);
      this.rewardEngine.grantRewards(tierUpEvent.rewards, 'tier_up');
    });

    // Unlock -> Notification
    this.unlockEngine.on(ProgressionEventType.UNLOCK_ACHIEVED as any, (event) => {
      const unlockEvent = event as any;
      this.notificationSystem.createUnlockNotification(unlockEvent.unlock.name);
    });

    // Milestone -> Notification
    this.milestoneSystem.on(ProgressionEventType.MILESTONE_COMPLETED as any, (event) => {
      const milestoneEvent = event as any;
      this.notificationSystem.createMilestoneNotification(milestoneEvent.milestone.name);
      this.rewardEngine.grantRewards(milestoneEvent.milestone.rewards, 'milestone');
    });

    // Goal -> Notification
    this.goalEngine.on(ProgressionEventType.GOAL_COMPLETED as any, (event) => {
      const goalEvent = event as any;
      this.notificationSystem.createGoalNotification(goalEvent.goal.title);
      this.rewardEngine.grantRewards(goalEvent.goal.rewards, 'goal');
    });

    // Reward -> Notification
    this.rewardEngine.on(ProgressionEventType.REWARD_GRANTED as any, (event) => {
      const rewardEvent = event as any;
      const reward = rewardEvent.reward;
      let message = '';
      if (reward.type === 'currency') {
        message = `${reward.currencyType}`;
      } else if (reward.type === 'experience') {
        message = 'experience';
      } else {
        message = reward.type;
      }
      this.notificationSystem.createRewardNotification(message, reward.amount);
    });
  }

  /**
   * Add experience
   */
  addExperience(amount: number, source: string): void {
    this.experienceEngine.addExperience(amount, source as any);
  }

  /**
   * Update empire stats for tier calculation
   */
  updateEmpireStats(empireValue: number, hardwareCount: number, powerGeneration: number): void {
    this.tierSystem.updateEmpireStats(empireValue, hardwareCount, powerGeneration);
  }

  /**
   * Update milestone value
   */
  updateMilestoneValue(type: string, value: number): void {
    this.milestoneSystem.updateMilestoneValue(type as any, value);
  }

  /**
   * Get current level
   */
  getCurrentLevel(): number {
    return this.levelSystem.getCurrentLevel();
  }

  /**
   * Get current tier
   */
  getCurrentTier(): number {
    return this.tierSystem.getCurrentTier();
  }

  /**
   * Get current goal
   */
  getCurrentGoal() {
    return this.goalEngine.getCurrentGoal();
  }

  /**
   * Get unlock tree
   */
  getUnlockTree() {
    return this.unlockEngine.getUnlockTree();
  }

  /**
   * Get notifications
   */
  getNotifications() {
    return this.notificationSystem.getAllNotifications();
  }

  /**
   * Get unread notifications
   */
  getUnreadNotifications() {
    return this.notificationSystem.getUnreadNotifications();
  }

  /**
   * Mark notification as read
   */
  markNotificationAsRead(notificationId: string): boolean {
    return this.notificationSystem.markAsRead(notificationId);
  }

  /**
   * Get complete state
   */
  getState(): ProgressionState {
    return {
      playerId: this.playerId,
      empireId: this.empireId,
      experience: this.experienceEngine.getState(),
      levels: this.levelSystem.getState(),
      tiers: this.tierSystem.getState(),
      unlocks: this.unlockEngine.getState(),
      milestones: this.milestoneSystem.getState(),
      rewards: this.rewardEngine.getState(),
      goals: this.goalEngine.getState(),
      notifications: this.notificationSystem.getState(),
      version: this.config.version,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  /**
   * Set complete state
   */
  async setState(state: ProgressionState): Promise<void> {
    this.experienceEngine.setState(state.experience);
    this.levelSystem.setState(state.levels);
    this.tierSystem.setState(state.tiers);
    this.unlockEngine.setState(state.unlocks);
    this.milestoneSystem.setState(state.milestones);
    this.rewardEngine.setState(state.rewards);
    this.goalEngine.setState(state.goals);
    this.notificationSystem.setState(state.notifications);
  }

  /**
   * Save state
   */
  async save(): Promise<boolean> {
    const state = this.getState();
    return await this.persistence.save(state);
  }

  /**
   * Load state
   */
  async load(): Promise<boolean> {
    const state = await this.persistence.load();
    if (!state) return false;

    await this.setState(state);
    return true;
  }

  /**
   * Delete state
   */
  async delete(): Promise<boolean> {
    return await this.persistence.delete();
  }

  /**
   * Get experience engine
   */
  getExperienceEngine(): ExperienceEngine {
    return this.experienceEngine;
  }

  /**
   * Get level system
   */
  getLevelSystem(): LevelSystem {
    return this.levelSystem;
  }

  /**
   * Get tier system
   */
  getTierSystem(): TierSystem {
    return this.tierSystem;
  }

  /**
   * Get unlock engine
   */
  getUnlockEngine(): UnlockEngine {
    return this.unlockEngine;
  }

  /**
   * Get milestone system
   */
  getMilestoneSystem(): MilestoneSystem {
    return this.milestoneSystem;
  }

  /**
   * Get reward engine
   */
  getRewardEngine(): RewardEngine {
    return this.rewardEngine;
  }

  /**
   * Get goal engine
   */
  getGoalEngine(): GoalEngine {
    return this.goalEngine;
  }

  /**
   * Get notification system
   */
  getNotificationSystem(): NotificationSystem {
    return this.notificationSystem;
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
   * Update configuration
   */
  updateConfig(config: Partial<ProgressionConfig>): void {
    this.config = { ...this.config, ...config };
    this.experienceEngine.updateConfig(config);
    this.levelSystem.updateConfig(config);
    this.tierSystem.updateConfig(config);
    this.unlockEngine.updateConfig(config);
    this.milestoneSystem.updateConfig(config);
    this.rewardEngine.updateConfig(config);
    this.goalEngine.updateConfig(config);
    this.notificationSystem.updateConfig(config);
    this.persistence.updateConfig(config);
  }

  /**
   * Get configuration
   */
  getConfig(): ProgressionConfig {
    return { ...this.config };
  }

  /**
   * Reset all systems
   */
  reset(): void {
    this.experienceEngine.reset();
    this.levelSystem.reset();
    this.tierSystem.reset();
    this.unlockEngine.reset();
    this.milestoneSystem.reset();
    this.rewardEngine.reset();
    this.goalEngine.reset();
    this.notificationSystem.reset();
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.milestoneSystem.destroy();
    this.goalEngine.destroy();
    this.notificationSystem.destroy();
    this.persistence.destroy();
  }
}
