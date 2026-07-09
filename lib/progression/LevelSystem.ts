/**
 * Level System
 * Manages player level progression with rewards and unlocks
 */

import type {
  LevelConfig,
  LevelState,
  Reward,
  Unlock,
  ProgressionEvent,
  ProgressionEventListener,
  ProgressionConfig,
} from './types';
import {
  ProgressionEventType,
  DEFAULT_PROGRESSION_CONFIG,
} from './types';
import { ExperienceEngine } from './ExperienceEngine';

/**
 * Level system class
 */
export class LevelSystem {
  private state: LevelState;
  private config: ProgressionConfig;
  private levelConfigs: Map<number, LevelConfig>;
  private eventListeners: Map<ProgressionEventType, Set<ProgressionEventListener>>;
  private experienceEngine: ExperienceEngine;

  constructor(
    experienceEngine: ExperienceEngine,
    config?: Partial<ProgressionConfig>
  ) {
    this.experienceEngine = experienceEngine;
    this.config = {
      ...DEFAULT_PROGRESSION_CONFIG,
      ...config,
    };

    this.state = {
      currentLevel: 1,
      maxLevel: this.config.maxLevel,
      totalLevelsUnlocked: 1,
      completedLevels: new Set([1]),
      levelHistory: [
        {
          level: 1,
          achievedAt: Date.now(),
          timeTaken: 0,
        },
      ],
    };

    this.levelConfigs = new Map();
    this.eventListeners = new Map();

    this.initializeLevelConfigs();
    this.setupExperienceListener();
  }

  /**
   * Initialize level configurations
   */
  private initializeLevelConfigs(): void {
    for (let level = 1; level <= this.config.maxLevel; level++) {
      this.levelConfigs.set(level, this.generateLevelConfig(level));
    }
  }

  /**
   * Generate level configuration
   */
  private generateLevelConfig(level: number): LevelConfig {
    return {
      level,
      requiredXP: this.experienceEngine.calculateRequiredXP(level),
      rewards: this.generateLevelRewards(level),
      unlocks: this.generateLevelUnlocks(level),
      features: this.generateLevelFeatures(level),
    };
  }

  /**
   * Generate level rewards
   */
  private generateLevelRewards(level: number): Reward[] {
    const rewards: Reward[] = [];

    // Currency reward
    rewards.push({
      id: `level_${level}_currency`,
      type: 'currency' as any,
      currencyType: 'freecoin',
      amount: level * 100,
    });

    // Experience reward (every 5 levels)
    if (level % 5 === 0) {
      rewards.push({
        id: `level_${level}_xp`,
        type: 'experience' as any,
        amount: level * 50,
      });
    }

    return rewards;
  }

  /**
   * Generate level unlocks
   */
  private generateLevelUnlocks(level: number): Unlock[] {
    const unlocks: Unlock[] = [];

    // Hardware unlocks
    if (level === 5) {
      unlocks.push({
        id: 'unlock_gpu_advanced',
        type: 'hardware' as any,
        name: 'Advanced GPU',
        description: 'Unlock advanced GPU hardware',
        itemId: 'gpu_advanced',
        prerequisites: [],
        autoUnlock: true,
        visible: true,
      });
    }

    if (level === 10) {
      unlocks.push({
        id: 'unlock_asic_standard',
        type: 'hardware' as any,
        name: 'Standard ASIC',
        description: 'Unlock standard ASIC hardware',
        itemId: 'asic_standard',
        prerequisites: [],
        autoUnlock: true,
        visible: true,
      });
    }

    return unlocks;
  }

  /**
   * Generate level features
   */
  private generateLevelFeatures(level: number): string[] {
    const features: string[] = [];

    if (level === 2) features.push('shop_advanced');
    if (level === 5) features.push('hardware_crafting');
    if (level === 10) features.push('trading');
    if (level === 20) features.push('districts');
    if (level === 30) features.push('robots');

    return features;
  }

  /**
   * Setup experience listener
   */
  private setupExperienceListener(): void {
    this.experienceEngine.on(ProgressionEventType.EXPERIENCE_GAINED as any, (event) => {
      this.checkLevelUp();
    });
  }

  /**
   * Check for level up
   */
  private checkLevelUp(): void {
    const newLevel = this.experienceEngine.getCurrentLevel();
    const oldLevel = this.state.currentLevel;

    if (newLevel > oldLevel && newLevel <= this.config.maxLevel) {
      this.levelUp(newLevel, oldLevel);
    }
  }

  /**
   * Level up
   */
  private levelUp(newLevel: number, oldLevel: number): void {
    const levelConfig = this.levelConfigs.get(newLevel);
    if (!levelConfig) return;

    this.state.currentLevel = newLevel;
    this.state.completedLevels.add(newLevel);
    this.state.totalLevelsUnlocked = newLevel;

    const now = Date.now();
    const lastLevelUp = this.state.levelHistory[this.state.levelHistory.length - 1];
    const timeTaken = now - lastLevelUp.achievedAt;

    this.state.levelHistory.push({
      level: newLevel,
      achievedAt: now,
      timeTaken,
    });

    // Fire level up event
    this.fireEvent({
      type: ProgressionEventType.LEVEL_UP,
      timestamp: now,
      playerId: '',
      empireId: '',
      oldLevel,
      newLevel,
      rewards: levelConfig.rewards,
      unlocks: levelConfig.unlocks,
    } as any);
  }

  /**
   * Get level configuration
   */
  getLevelConfig(level: number): LevelConfig | undefined {
    return this.levelConfigs.get(level);
  }

  /**
   * Get current level
   */
  getCurrentLevel(): number {
    return this.state.currentLevel;
  }

  /**
   * Get max level
   */
  getMaxLevel(): number {
    return this.state.maxLevel;
  }

  /**
   * Check if level is completed
   */
  isLevelCompleted(level: number): boolean {
    return this.state.completedLevels.has(level);
  }

  /**
   * Get level history
   */
  getLevelHistory(): Array<{ level: number; achievedAt: number; timeTaken: number }> {
    return [...this.state.levelHistory];
  }

  /**
   * Get state
   */
  getState(): LevelState {
    return {
      ...this.state,
      completedLevels: new Set(this.state.completedLevels),
      levelHistory: [...this.state.levelHistory],
    };
  }

  /**
   * Set state
   */
  setState(state: LevelState): void {
    this.state = {
      ...state,
      completedLevels: new Set(state.completedLevels),
      levelHistory: [...state.levelHistory],
    };
  }

  /**
   * Reset levels
   */
  reset(): void {
    this.state = {
      currentLevel: 1,
      maxLevel: this.config.maxLevel,
      totalLevelsUnlocked: 1,
      completedLevels: new Set([1]),
      levelHistory: [
        {
          level: 1,
          achievedAt: Date.now(),
          timeTaken: 0,
        },
      ],
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
    this.state.maxLevel = this.config.maxLevel;
  }

  /**
   * Get configuration
   */
  getConfig(): ProgressionConfig {
    return { ...this.config };
  }
}
