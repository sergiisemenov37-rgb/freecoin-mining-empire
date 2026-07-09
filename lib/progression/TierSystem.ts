/**
 * Tier System
 * Manages empire tier progression with configurable tiers and content unlocks
 */

import type {
  TierConfig,
  TierState,
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
import { LevelSystem } from './LevelSystem';

/**
 * Tier system class
 */
export class TierSystem {
  private state: TierState;
  private config: ProgressionConfig;
  private tierConfigs: Map<number, TierConfig>;
  private eventListeners: Map<ProgressionEventType, Set<ProgressionEventListener>>;
  private levelSystem: LevelSystem;
  private empireValue: number;
  private hardwareCount: number;
  private powerGeneration: number;

  constructor(
    levelSystem: LevelSystem,
    config?: Partial<ProgressionConfig>
  ) {
    this.levelSystem = levelSystem;
    this.config = {
      ...DEFAULT_PROGRESSION_CONFIG,
      ...config,
    };

    this.state = {
      currentTier: 1,
      maxTier: this.config.maxTier,
      completedTiers: new Set([1]),
      tierHistory: [
        {
          tier: 1,
          achievedAt: Date.now(),
          empireValue: 0,
        },
      ],
    };

    this.tierConfigs = new Map();
    this.eventListeners = new Map();
    this.empireValue = 0;
    this.hardwareCount = 0;
    this.powerGeneration = 0;

    this.initializeTierConfigs();
    this.setupLevelListener();
  }

  /**
   * Initialize tier configurations
   */
  private initializeTierConfigs(): void {
    for (let tier = 1; tier <= this.config.maxTier; tier++) {
      this.tierConfigs.set(tier, this.generateTierConfig(tier));
    }
  }

  /**
   * Generate tier configuration
   */
  private generateTierConfig(tier: number): TierConfig {
    return {
      tier,
      name: this.getTierName(tier),
      description: this.getTierDescription(tier),
      requiredLevel: tier * 10,
      requiredEmpireValue: tier * 10000,
      requiredHardwareCount: tier * 10,
      requiredPowerGeneration: tier * 1000,
      rewards: this.generateTierRewards(tier),
      unlocks: this.generateTierUnlocks(tier),
      features: this.generateTierFeatures(tier),
      color: this.getTierColor(tier),
      icon: this.getTierIcon(tier),
    };
  }

  /**
   * Get tier name
   */
  private getTierName(tier: number): string {
    const names = [
      'Starter',
      'Beginner',
      'Apprentice',
      'Journeyman',
      'Expert',
      'Master',
      'Grandmaster',
      'Legend',
      'Mythic',
      'Transcendent',
    ];
    return names[tier - 1] || `Tier ${tier}`;
  }

  /**
   * Get tier description
   */
  private getTierDescription(tier: number): string {
    return `The ${this.getTierName(tier)} tier of empire progression`;
  }

  /**
   * Get tier color
   */
  private getTierColor(tier: number): string {
    const colors = [
      '#808080',
      '#00ff00',
      '#00ffff',
      '#0000ff',
      '#ff00ff',
      '#ff0000',
      '#ffff00',
      '#ffa500',
      '#ffffff',
      '#ffd700',
    ];
    return colors[tier - 1] || '#808080';
  }

  /**
   * Get tier icon
   */
  private getTierIcon(tier: number): string {
    return `tier_${tier}`;
  }

  /**
   * Generate tier rewards
   */
  private generateTierRewards(tier: number): Reward[] {
    const rewards: Reward[] = [];

    // Currency reward
    rewards.push({
      id: `tier_${tier}_currency`,
      type: 'currency' as any,
      currencyType: 'freecoin',
      amount: tier * 1000,
    });

    // Experience reward
    rewards.push({
      id: `tier_${tier}_xp`,
      type: 'experience' as any,
      amount: tier * 500,
    });

    return rewards;
  }

  /**
   * Generate tier unlocks
   */
  private generateTierUnlocks(tier: number): Unlock[] {
    const unlocks: Unlock[] = [];

    // Building unlocks
    if (tier === 2) {
      unlocks.push({
        id: 'unlock_building_advanced',
        type: 'building' as any,
        name: 'Advanced Buildings',
        description: 'Unlock advanced building types',
        category: 'building',
        prerequisites: [],
        autoUnlock: true,
        visible: true,
      });
    }

    // Hardware unlocks
    if (tier === 3) {
      unlocks.push({
        id: 'unlock_hardware_premium',
        type: 'hardware' as any,
        name: 'Premium Hardware',
        description: 'Unlock premium hardware tiers',
        category: 'hardware',
        prerequisites: [],
        autoUnlock: true,
        visible: true,
      });
    }

    // District unlocks
    if (tier === 5) {
      unlocks.push({
        id: 'unlock_districts',
        type: 'district' as any,
        name: 'Districts',
        description: 'Unlock district management',
        category: 'district',
        prerequisites: [],
        autoUnlock: true,
        visible: true,
      });
    }

    return unlocks;
  }

  /**
   * Generate tier features
   */
  private generateTierFeatures(tier: number): string[] {
    const features: string[] = [];

    if (tier === 2) features.push('advanced_trading');
    if (tier === 3) features.push('premium_shop');
    if (tier === 4) features.push('alliance_system');
    if (tier === 5) features.push('district_management');
    if (tier === 6) features.push('empire_wars');
    if (tier === 7) features.push('global_market');
    if (tier === 8) features.push('prestige_system');
    if (tier === 9) features.push('legendary_content');
    if (tier === 10) features.push('transcendent_content');

    return features;
  }

  /**
   * Setup level listener
   */
  private setupLevelListener(): void {
    this.levelSystem.on(ProgressionEventType.LEVEL_UP as any, (event) => {
      this.checkTierUp();
    });
  }

  /**
   * Check for tier up
   */
  private checkTierUp(): void {
    const currentLevel = this.levelSystem.getCurrentLevel();
    const newTier = this.calculateTier(currentLevel);

    if (newTier > this.state.currentTier && newTier <= this.config.maxTier) {
      const tierConfig = this.tierConfigs.get(newTier);
      if (!tierConfig) return;

      // Check requirements
      const meetsRequirements = this.checkTierRequirements(tierConfig);
      if (meetsRequirements) {
        this.tierUp(newTier, this.state.currentTier);
      }
    }
  }

  /**
   * Calculate tier from level
   */
  private calculateTier(level: number): number {
    return Math.floor(level / 10) + 1;
  }

  /**
   * Check tier requirements
   */
  private checkTierRequirements(tierConfig: TierConfig): boolean {
    const currentLevel = this.levelSystem.getCurrentLevel();
    return (
      currentLevel >= tierConfig.requiredLevel &&
      this.empireValue >= tierConfig.requiredEmpireValue &&
      this.hardwareCount >= tierConfig.requiredHardwareCount &&
      this.powerGeneration >= tierConfig.requiredPowerGeneration
    );
  }

  /**
   * Tier up
   */
  private tierUp(newTier: number, oldTier: number): void {
    const tierConfig = this.tierConfigs.get(newTier);
    if (!tierConfig) return;

    this.state.currentTier = newTier;
    this.state.completedTiers.add(newTier);

    const now = Date.now();

    this.state.tierHistory.push({
      tier: newTier,
      achievedAt: now,
      empireValue: this.empireValue,
    });

    // Fire tier up event
    this.fireEvent({
      type: ProgressionEventType.TIER_UP,
      timestamp: now,
      playerId: '',
      empireId: '',
      oldTier,
      newTier,
      rewards: tierConfig.rewards,
      unlocks: tierConfig.unlocks,
    } as any);
  }

  /**
   * Update empire stats
   */
  updateEmpireStats(empireValue: number, hardwareCount: number, powerGeneration: number): void {
    this.empireValue = empireValue;
    this.hardwareCount = hardwareCount;
    this.powerGeneration = powerGeneration;
    this.checkTierUp();
  }

  /**
   * Get tier configuration
   */
  getTierConfig(tier: number): TierConfig | undefined {
    return this.tierConfigs.get(tier);
  }

  /**
   * Get current tier
   */
  getCurrentTier(): number {
    return this.state.currentTier;
  }

  /**
   * Get max tier
   */
  getMaxTier(): number {
    return this.state.maxTier;
  }

  /**
   * Check if tier is completed
   */
  isTierCompleted(tier: number): boolean {
    return this.state.completedTiers.has(tier);
  }

  /**
   * Get tier history
   */
  getTierHistory(): Array<{ tier: number; achievedAt: number; empireValue: number }> {
    return [...this.state.tierHistory];
  }

  /**
   * Get state
   */
  getState(): TierState {
    return {
      ...this.state,
      completedTiers: new Set(this.state.completedTiers),
      tierHistory: [...this.state.tierHistory],
    };
  }

  /**
   * Set state
   */
  setState(state: TierState): void {
    this.state = {
      ...state,
      completedTiers: new Set(state.completedTiers),
      tierHistory: [...state.tierHistory],
    };
  }

  /**
   * Reset tiers
   */
  reset(): void {
    this.state = {
      currentTier: 1,
      maxTier: this.config.maxTier,
      completedTiers: new Set([1]),
      tierHistory: [
        {
          tier: 1,
          achievedAt: Date.now(),
          empireValue: 0,
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
    this.state.maxTier = this.config.maxTier;
  }

  /**
   * Get configuration
   */
  getConfig(): ProgressionConfig {
    return { ...this.config };
  }
}
