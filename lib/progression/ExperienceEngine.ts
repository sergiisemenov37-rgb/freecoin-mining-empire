/**
 * Experience Engine
 * Manages experience gain from multiple sources with configurable formulas
 * Supports level calculation, overflow XP, and seasonal XP
 */

import type {
  ExperienceState,
  ExperienceSourceConfig,
  ExperienceFormulaConfig,
  ProgressionEvent,
  ProgressionEventListener,
  ProgressionConfig,
} from './types';
import {
  ExperienceSource,
  ExperienceFormulaType,
  ProgressionEventType,
  DEFAULT_PROGRESSION_CONFIG,
} from './types';

/**
 * Experience engine class
 */
export class ExperienceEngine {
  private state: ExperienceState;
  private config: ProgressionConfig;
  private eventListeners: Map<ProgressionEventType, Set<ProgressionEventListener>>;
  private formulaCalculators: Map<ExperienceFormulaType, (level: number, config: ExperienceFormulaConfig) => number>;

  constructor(config?: Partial<ProgressionConfig>) {
    this.config = {
      ...DEFAULT_PROGRESSION_CONFIG,
      ...config,
    };

    this.state = {
      currentXP: 0,
      totalXP: 0,
      overflowXP: 0,
      seasonalXP: 0,
      sources: new Map(),
      lastUpdated: Date.now(),
    };

    this.eventListeners = new Map();
    this.formulaCalculators = new Map();

    this.initializeFormulaCalculators();
    this.initializeSources();
  }

  /**
   * Initialize formula calculators
   */
  private initializeFormulaCalculators(): void {
    // Linear formula: baseXP + (level * growthRate)
    this.formulaCalculators.set(ExperienceFormulaType.LINEAR, (level, config) => {
      return config.baseXP + (level * config.growthRate);
    });

    // Exponential formula: baseXP * (growthRate ^ level)
    this.formulaCalculators.set(ExperienceFormulaType.EXPONENTIAL, (level, config) => {
      return Math.floor(config.baseXP * Math.pow(config.growthRate, level));
    });

    // Logarithmic formula: baseXP * log(level + 1) * growthRate
    this.formulaCalculators.set(ExperienceFormulaType.LOGARITHMIC, (level, config) => {
      return Math.floor(config.baseXP * Math.log(level + 1) * config.growthRate);
    });

    // Custom formula placeholder
    this.formulaCalculators.set(ExperienceFormulaType.CUSTOM, (level, config) => {
      // In a real implementation, this would call a custom function
      return config.baseXP;
    });
  }

  /**
   * Initialize experience sources
   */
  private initializeSources(): void {
    for (const [source, config] of this.config.experienceSources) {
      if (config.enabled) {
        this.state.sources.set(source, 0);
      }
    }
  }

  /**
   * Add experience
   */
  addExperience(
    amount: number,
    source: ExperienceSource,
    seasonal: boolean = false
  ): { success: boolean; totalXP: number; overflowXP: number } {
    const sourceConfig = this.config.experienceSources.get(source);
    if (!sourceConfig || !sourceConfig.enabled) {
      return { success: false, totalXP: this.state.totalXP, overflowXP: this.state.overflowXP };
    }

    // Apply multipliers
    let finalAmount = amount * sourceConfig.baseMultiplier;
    finalAmount *= sourceConfig.levelMultiplier;
    finalAmount *= sourceConfig.tierMultiplier;

    if (seasonal && sourceConfig.seasonalMultiplier) {
      finalAmount *= sourceConfig.seasonalMultiplier;
    }

    // Add to source total
    const sourceTotal = this.state.sources.get(source) || 0;
    this.state.sources.set(source, sourceTotal + finalAmount);

    // Add to total XP
    this.state.totalXP += finalAmount;

    // Add to seasonal XP if applicable
    if (seasonal) {
      this.state.seasonalXP += finalAmount;
    }

    this.state.lastUpdated = Date.now();

    // Fire event
    this.fireEvent({
      type: ProgressionEventType.EXPERIENCE_GAINED,
      timestamp: Date.now(),
      playerId: '',
      empireId: '',
      source,
      amount: finalAmount,
      totalXP: this.state.totalXP,
    } as any);

    return { success: true, totalXP: this.state.totalXP, overflowXP: this.state.overflowXP };
  }

  /**
   * Set current XP (for level calculation)
   */
  setCurrentXP(xp: number): void {
    this.state.currentXP = xp;
    this.state.lastUpdated = Date.now();
  }

  /**
   * Calculate required XP for level
   */
  calculateRequiredXP(level: number): number {
    const calculator = this.formulaCalculators.get(this.config.experienceFormula.type);
    return calculator ? calculator(level, this.config.experienceFormula) : 0;
  }

  /**
   * Calculate level from total XP
   */
  calculateLevel(totalXP: number): number {
    let level = 1;
    let accumulatedXP = 0;

    while (level < this.config.maxLevel) {
      const requiredXP = this.calculateRequiredXP(level);
      if (accumulatedXP + requiredXP > totalXP) {
        break;
      }
      accumulatedXP += requiredXP;
      level++;
    }

    return level;
  }

  /**
   * Calculate current level
   */
  getCurrentLevel(): number {
    return this.calculateLevel(this.state.totalXP);
  }

  /**
   * Calculate XP progress to next level
   */
  calculateXPProgress(): { current: number; required: number; percentage: number } {
    const currentLevel = this.getCurrentLevel();
    const requiredXP = this.calculateRequiredXP(currentLevel);
    
    // Calculate XP accumulated for current level
    let accumulatedXP = 0;
    for (let i = 1; i < currentLevel; i++) {
      accumulatedXP += this.calculateRequiredXP(i);
    }
    
    const currentLevelXP = this.state.totalXP - accumulatedXP;
    const percentage = (currentLevelXP / requiredXP) * 100;

    return {
      current: currentLevelXP,
      required: requiredXP,
      percentage: Math.min(100, Math.max(0, percentage)),
    };
  }

  /**
   * Add overflow XP
   */
  addOverflowXP(amount: number): void {
    this.state.overflowXP += amount;
    this.state.lastUpdated = Date.now();
  }

  /**
   * Get experience from source
   */
  getExperienceFromSource(source: ExperienceSource): number {
    return this.state.sources.get(source) || 0;
  }

  /**
   * Get all experience sources
   */
  getAllSources(): Map<ExperienceSource, number> {
    return new Map(this.state.sources);
  }

  /**
   * Get state
   */
  getState(): ExperienceState {
    return { ...this.state, sources: new Map(this.state.sources) };
  }

  /**
   * Set state
   */
  setState(state: ExperienceState): void {
    this.state = {
      ...state,
      sources: new Map(state.sources),
    };
  }

  /**
   * Reset experience
   */
  reset(): void {
    this.state = {
      currentXP: 0,
      totalXP: 0,
      overflowXP: 0,
      seasonalXP: 0,
      sources: new Map(),
      lastUpdated: Date.now(),
    };
    this.initializeSources();
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
