/**
 * Progression Persistence
 * Manages saving and restoring progression state with version support
 */

import type {
  ProgressionState,
  ProgressionConfig,
} from './types';
import { DEFAULT_PROGRESSION_CONFIG } from './types';

/**
 * Persistence storage interface
 */
export interface ProgressionStorage {
  save(key: string, data: string): Promise<void>;
  load(key: string): Promise<string | null>;
  delete(key: string): Promise<void>;
}

/**
 * Local storage implementation
 */
export class LocalStorageStorage implements ProgressionStorage {
  async save(key: string, data: string): Promise<void> {
    localStorage.setItem(key, data);
  }

  async load(key: string): Promise<string | null> {
    return localStorage.getItem(key);
  }

  async delete(key: string): Promise<void> {
    localStorage.removeItem(key);
  }
}

/**
 * Progression persistence class
 */
export class ProgressionPersistence {
  private storage: ProgressionStorage;
  private config: ProgressionConfig;
  private autoSaveInterval: NodeJS.Timeout | null;
  private saveKey: string;

  constructor(
    storage: ProgressionStorage,
    playerId: string,
    empireId: string,
    config?: Partial<ProgressionConfig>
  ) {
    this.storage = storage;
    this.config = {
      ...DEFAULT_PROGRESSION_CONFIG,
      ...config,
    };

    this.saveKey = `progression_${playerId}_${empireId}`;
    this.autoSaveInterval = null;

    if (this.config.autoSave) {
      this.startAutoSave();
    }
  }

  /**
   * Save progression state
   */
  async save(state: ProgressionState): Promise<boolean> {
    try {
      const data = JSON.stringify({
        version: this.config.version,
        timestamp: Date.now(),
        state: this.serializeState(state),
      });

      await this.storage.save(this.saveKey, data);
      return true;
    } catch (error) {
      console.error('Failed to save progression state:', error);
      return false;
    }
  }

  /**
   * Load progression state
   */
  async load(): Promise<ProgressionState | null> {
    try {
      const data = await this.storage.load(this.saveKey);
      if (!data) return null;

      const parsed = JSON.parse(data);
      
      // Version migration
      const migratedState = this.migrateState(parsed.version, parsed.state);
      
      return this.deserializeState(migratedState);
    } catch (error) {
      console.error('Failed to load progression state:', error);
      return null;
    }
  }

  /**
   * Delete progression state
   */
  async delete(): Promise<boolean> {
    try {
      await this.storage.delete(this.saveKey);
      return true;
    } catch (error) {
      console.error('Failed to delete progression state:', error);
      return false;
    }
  }

  /**
   * Serialize state
   */
  private serializeState(state: ProgressionState): unknown {
    return {
      playerId: state.playerId,
      empireId: state.empireId,
      experience: {
        currentXP: state.experience.currentXP,
        totalXP: state.experience.totalXP,
        overflowXP: state.experience.overflowXP,
        seasonalXP: state.experience.seasonalXP,
        sources: Array.from(state.experience.sources.entries()),
        lastUpdated: state.experience.lastUpdated,
      },
      levels: {
        currentLevel: state.levels.currentLevel,
        maxLevel: state.levels.maxLevel,
        totalLevelsUnlocked: state.levels.totalLevelsUnlocked,
        completedLevels: Array.from(state.levels.completedLevels),
        levelHistory: state.levels.levelHistory,
      },
      tiers: {
        currentTier: state.tiers.currentTier,
        maxTier: state.tiers.maxTier,
        completedTiers: Array.from(state.tiers.completedTiers),
        tierHistory: state.tiers.tierHistory,
      },
      unlocks: {
        unlockedIds: Array.from(state.unlocks.unlockedIds),
        visibleIds: Array.from(state.unlocks.visibleIds),
        unlockHistory: state.unlocks.unlockHistory,
      },
      milestones: {
        milestones: Array.from(state.milestones.milestones.entries()),
        completedIds: Array.from(state.milestones.completedIds),
        totalCompletions: state.milestones.totalCompletions,
      },
      rewards: {
        claimedRewards: Array.from(state.rewards.claimedRewards),
        pendingRewards: state.rewards.pendingRewards,
        rewardHistory: state.rewards.rewardHistory,
      },
      goals: {
        activeGoals: state.goals.activeGoals,
        completedGoals: Array.from(state.goals.completedGoals),
        currentGoal: state.goals.currentGoal,
        goalHistory: state.goals.goalHistory,
      },
      notifications: {
        notifications: state.notifications.notifications,
        unreadCount: state.notifications.unreadCount,
        lastReadAt: state.notifications.lastReadAt,
      },
      version: state.version,
      createdAt: state.createdAt,
      updatedAt: state.updatedAt,
    };
  }

  /**
   * Deserialize state
   */
  private deserializeState(data: unknown): ProgressionState {
    const parsed = data as any;

    return {
      playerId: parsed.playerId,
      empireId: parsed.empireId,
      experience: {
        currentXP: parsed.experience.currentXP,
        totalXP: parsed.experience.totalXP,
        overflowXP: parsed.experience.overflowXP,
        seasonalXP: parsed.experience.seasonalXP,
        sources: new Map(parsed.experience.sources),
        lastUpdated: parsed.experience.lastUpdated,
      },
      levels: {
        currentLevel: parsed.levels.currentLevel,
        maxLevel: parsed.levels.maxLevel,
        totalLevelsUnlocked: parsed.levels.totalLevelsUnlocked,
        completedLevels: new Set(parsed.levels.completedLevels),
        levelHistory: parsed.levels.levelHistory,
      },
      tiers: {
        currentTier: parsed.tiers.currentTier,
        maxTier: parsed.tiers.maxTier,
        completedTiers: new Set(parsed.tiers.completedTiers),
        tierHistory: parsed.tiers.tierHistory,
      },
      unlocks: {
        unlockedIds: new Set(parsed.unlocks.unlockedIds),
        visibleIds: new Set(parsed.unlocks.visibleIds),
        unlockHistory: parsed.unlocks.unlockHistory,
      },
      milestones: {
        milestones: new Map(parsed.milestones.milestones),
        completedIds: new Set(parsed.milestones.completedIds),
        totalCompletions: parsed.milestones.totalCompletions,
      },
      rewards: {
        claimedRewards: new Set(parsed.rewards.claimedRewards),
        pendingRewards: parsed.rewards.pendingRewards,
        rewardHistory: parsed.rewards.rewardHistory,
      },
      goals: {
        activeGoals: parsed.goals.activeGoals,
        completedGoals: new Set(parsed.goals.completedGoals),
        currentGoal: parsed.goals.currentGoal,
        goalHistory: parsed.goals.goalHistory,
      },
      notifications: {
        notifications: parsed.notifications.notifications,
        unreadCount: parsed.notifications.unreadCount,
        lastReadAt: parsed.notifications.lastReadAt,
      },
      version: parsed.version,
      createdAt: parsed.createdAt,
      updatedAt: parsed.updatedAt,
    };
  }

  /**
   * Migrate state from old version
   */
  private migrateState(version: number, state: unknown): unknown {
    // In a real implementation, this would handle version migrations
    // For now, we just return the state as-is
    return state;
  }

  /**
   * Start auto save
   */
  private startAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }

    this.autoSaveInterval = setInterval(() => {
      // In a real implementation, this would trigger a save
      // For now, this is a placeholder
    }, this.config.autoSaveInterval);
  }

  /**
   * Stop auto save
   */
  private stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ProgressionConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (this.config.autoSave) {
      this.startAutoSave();
    } else {
      this.stopAutoSave();
    }
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
    this.stopAutoSave();
  }
}
