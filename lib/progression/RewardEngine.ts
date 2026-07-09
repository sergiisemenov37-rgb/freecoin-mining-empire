/**
 * Reward Engine
 * Manages reward distribution for currency, experience, items, hardware, decorations, blueprints, titles, reputation, and future reward types
 */

import type {
  Reward,
  RewardState,
  ProgressionEvent,
  ProgressionEventListener,
  ProgressionConfig,
} from './types';
import {
  RewardType,
  ProgressionEventType,
  DEFAULT_PROGRESSION_CONFIG,
} from './types';
import { ExperienceEngine } from './ExperienceEngine';
import { UnlockEngine } from './UnlockEngine';

/**
 * Reward engine class
 */
export class RewardEngine {
  private state: RewardState;
  private config: ProgressionConfig;
  private eventListeners: Map<ProgressionEventType, Set<ProgressionEventListener>>;
  private experienceEngine: ExperienceEngine;
  private unlockEngine: UnlockEngine;

  constructor(
    experienceEngine: ExperienceEngine,
    unlockEngine: UnlockEngine,
    config?: Partial<ProgressionConfig>
  ) {
    this.experienceEngine = experienceEngine;
    this.unlockEngine = unlockEngine;
    this.config = {
      ...DEFAULT_PROGRESSION_CONFIG,
      ...config,
    };

    this.state = {
      claimedRewards: new Set(),
      pendingRewards: [],
      rewardHistory: [],
    };

    this.eventListeners = new Map();
  }

  /**
   * Grant reward
   */
  grantReward(reward: Reward, source: string): boolean {
    const success = this.processReward(reward);

    if (success) {
      this.state.rewardHistory.push({
        rewardId: reward.id,
        claimedAt: Date.now(),
        source,
      });

      // Fire event
      this.fireEvent({
        type: ProgressionEventType.REWARD_GRANTED,
        timestamp: Date.now(),
        playerId: '',
        empireId: '',
        rewardId: reward.id,
        reward,
        source,
      } as any);
    }

    return success;
  }

  /**
   * Grant multiple rewards
   */
  grantRewards(rewards: Reward[], source: string): boolean[] {
    return rewards.map(reward => this.grantReward(reward, source));
  }

  /**
   * Process reward
   */
  private processReward(reward: Reward): boolean {
    switch (reward.type) {
      case RewardType.CURRENCY:
        return this.processCurrencyReward(reward);
      case RewardType.EXPERIENCE:
        return this.processExperienceReward(reward);
      case RewardType.ITEM:
        return this.processItemReward(reward);
      case RewardType.HARDWARE:
        return this.processHardwareReward(reward);
      case RewardType.DECORATION:
        return this.processDecorationReward(reward);
      case RewardType.BLUEPRINT:
        return this.processBlueprintReward(reward);
      case RewardType.TITLE:
        return this.processTitleReward(reward);
      case RewardType.REPUTATION:
        return this.processReputationReward(reward);
      case RewardType.UNLOCK:
        return this.processUnlockReward(reward);
      case RewardType.FEATURE:
        return this.processFeatureReward(reward);
      case RewardType.CUSTOM:
        return this.processCustomReward(reward);
      default:
        return false;
    }
  }

  /**
   * Process currency reward
   */
  private processCurrencyReward(reward: Reward): boolean {
    if (!reward.currencyType || reward.amount === undefined) {
      return false;
    }

    // In a real implementation, this would add currency to the empire
    // For now, we just mark it as processed
    this.state.claimedRewards.add(reward.id);
    return true;
  }

  /**
   * Process experience reward
   */
  private processExperienceReward(reward: Reward): boolean {
    if (reward.amount === undefined) {
      return false;
    }

    this.experienceEngine.addExperience(reward.amount, 'custom' as any);
    this.state.claimedRewards.add(reward.id);
    return true;
  }

  /**
   * Process item reward
   */
  private processItemReward(reward: Reward): boolean {
    if (!reward.itemType || reward.itemQuantity === undefined) {
      return false;
    }

    // In a real implementation, this would add items to inventory
    this.state.claimedRewards.add(reward.id);
    return true;
  }

  /**
   * Process hardware reward
   */
  private processHardwareReward(reward: Reward): boolean {
    if (!reward.itemId || reward.itemQuantity === undefined) {
      return false;
    }

    // In a real implementation, this would add hardware to inventory
    this.state.claimedRewards.add(reward.id);
    return true;
  }

  /**
   * Process decoration reward
   */
  private processDecorationReward(reward: Reward): boolean {
    if (!reward.itemId) {
      return false;
    }

    // In a real implementation, this would add decorations to inventory
    this.state.claimedRewards.add(reward.id);
    return true;
  }

  /**
   * Process blueprint reward
   */
  private processBlueprintReward(reward: Reward): boolean {
    if (!reward.itemId) {
      return false;
    }

    // In a real implementation, this would add blueprints to inventory
    this.state.claimedRewards.add(reward.id);
    return true;
  }

  /**
   * Process title reward
   */
  private processTitleReward(reward: Reward): boolean {
    if (!reward.titleId) {
      return false;
    }

    // In a real implementation, this would unlock titles
    this.state.claimedRewards.add(reward.id);
    return true;
  }

  /**
   * Process reputation reward
   */
  private processReputationReward(reward: Reward): boolean {
    if (!reward.reputationFaction || reward.reputationAmount === undefined) {
      return false;
    }

    // In a real implementation, this would add reputation to faction
    this.state.claimedRewards.add(reward.id);
    return true;
  }

  /**
   * Process unlock reward
   */
  private processUnlockReward(reward: Reward): boolean {
    if (!reward.unlockId) {
      return false;
    }

    const success = this.unlockEngine.unlock(reward.unlockId, 'reward');
    if (success) {
      this.state.claimedRewards.add(reward.id);
    }
    return success;
  }

  /**
   * Process feature reward
   */
  private processFeatureReward(reward: Reward): boolean {
    if (!reward.featureId) {
      return false;
    }

    // In a real implementation, this would unlock features
    this.state.claimedRewards.add(reward.id);
    return true;
  }

  /**
   * Process custom reward
   */
  private processCustomReward(reward: Reward): boolean {
    // In a real implementation, this would call a custom handler
    this.state.claimedRewards.add(reward.id);
    return true;
  }

  /**
   * Add pending reward
   */
  addPendingReward(reward: Reward): void {
    this.state.pendingRewards.push(reward);
  }

  /**
   * Claim pending reward
   */
  claimPendingReward(rewardId: string): boolean {
    const index = this.state.pendingRewards.findIndex(r => r.id === rewardId);
    if (index === -1) return false;

    const reward = this.state.pendingRewards[index];
    this.state.pendingRewards.splice(index, 1);

    return this.grantReward(reward, 'pending');
  }

  /**
   * Claim all pending rewards
   */
  claimAllPendingRewards(): boolean[] {
    const rewards = [...this.state.pendingRewards];
    this.state.pendingRewards = [];
    return rewards.map(reward => this.grantReward(reward, 'pending'));
  }

  /**
   * Check if reward is claimed
   */
  isClaimed(rewardId: string): boolean {
    return this.state.claimedRewards.has(rewardId);
  }

  /**
   * Get pending rewards
   */
  getPendingRewards(): Reward[] {
    return [...this.state.pendingRewards];
  }

  /**
   * Get reward history
   */
  getRewardHistory(): Array<{ rewardId: string; claimedAt: number; source: string }> {
    return [...this.state.rewardHistory];
  }

  /**
   * Get state
   */
  getState(): RewardState {
    return {
      claimedRewards: new Set(this.state.claimedRewards),
      pendingRewards: [...this.state.pendingRewards],
      rewardHistory: [...this.state.rewardHistory],
    };
  }

  /**
   * Set state
   */
  setState(state: RewardState): void {
    this.state = {
      claimedRewards: new Set(state.claimedRewards),
      pendingRewards: [...state.pendingRewards],
      rewardHistory: [...state.rewardHistory],
    };
  }

  /**
   * Reset rewards
   */
  reset(): void {
    this.state = {
      claimedRewards: new Set(),
      pendingRewards: [],
      rewardHistory: [],
    };
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
  }

  /**
   * Get configuration
   */
  getConfig(): ProgressionConfig {
    return { ...this.config };
  }
}
