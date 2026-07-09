/**
 * Milestone System
 * Generic milestone system for tracking achievements across various game metrics
 * Supports hardware count, empire value, power generation, mining output, research count, and custom milestones
 */

import type {
  Milestone,
  MilestoneState,
  Reward,
  Unlock,
  ProgressionEvent,
  ProgressionEventListener,
  ProgressionConfig,
} from './types';
import {
  MilestoneType,
  ProgressionEventType,
  DEFAULT_PROGRESSION_CONFIG,
} from './types';

/**
 * Milestone system class
 */
export class MilestoneSystem {
  private state: MilestoneState;
  private config: ProgressionConfig;
  private milestones: Map<string, Milestone>;
  private eventListeners: Map<ProgressionEventType, Set<ProgressionEventListener>>;
  private refreshInterval: NodeJS.Timeout | null;

  constructor(config?: Partial<ProgressionConfig>) {
    this.config = {
      ...DEFAULT_PROGRESSION_CONFIG,
      ...config,
    };

    this.state = {
      milestones: new Map(),
      completedIds: new Set(),
      totalCompletions: 0,
    };

    this.milestones = new Map();
    this.eventListeners = new Map();
    this.refreshInterval = null;

    this.initializeMilestones();
    this.startRefreshInterval();
  }

  /**
   * Initialize milestones
   */
  private initializeMilestones(): void {
    // Hardware count milestones
    this.registerMilestone({
      id: 'milestone_hardware_10',
      type: MilestoneType.HARDWARE_COUNT,
      name: 'Hardware Collector I',
      description: 'Own 10 pieces of hardware',
      targetValue: 10,
      currentValue: 0,
      category: 'hardware',
      rewards: [
        {
          id: 'milestone_hardware_10_currency',
          type: 'currency' as any,
          currencyType: 'freecoin',
          amount: 500,
        },
      ],
      unlocks: [],
      repeatable: false,
      completionCount: 0,
    });

    this.registerMilestone({
      id: 'milestone_hardware_50',
      type: MilestoneType.HARDWARE_COUNT,
      name: 'Hardware Collector II',
      description: 'Own 50 pieces of hardware',
      targetValue: 50,
      currentValue: 0,
      category: 'hardware',
      rewards: [
        {
          id: 'milestone_hardware_50_currency',
          type: 'currency' as any,
          currencyType: 'freecoin',
          amount: 2000,
        },
      ],
      unlocks: [],
      repeatable: false,
      completionCount: 0,
    });

    this.registerMilestone({
      id: 'milestone_hardware_100',
      type: MilestoneType.HARDWARE_COUNT,
      name: 'Hardware Collector III',
      description: 'Own 100 pieces of hardware',
      targetValue: 100,
      currentValue: 0,
      category: 'hardware',
      rewards: [
        {
          id: 'milestone_hardware_100_currency',
          type: 'currency' as any,
          currencyType: 'freecoin',
          amount: 5000,
        },
      ],
      unlocks: [],
      repeatable: false,
      completionCount: 0,
    });

    // Empire value milestones
    this.registerMilestone({
      id: 'milestone_empire_1000',
      type: MilestoneType.EMPIRE_VALUE,
      name: 'Empire Builder I',
      description: 'Reach 1,000 empire value',
      targetValue: 1000,
      currentValue: 0,
      category: 'empire',
      rewards: [
        {
          id: 'milestone_empire_1000_currency',
          type: 'currency' as any,
          currencyType: 'freecoin',
          amount: 1000,
        },
      ],
      unlocks: [],
      repeatable: false,
      completionCount: 0,
    });

    this.registerMilestone({
      id: 'milestone_empire_10000',
      type: MilestoneType.EMPIRE_VALUE,
      name: 'Empire Builder II',
      description: 'Reach 10,000 empire value',
      targetValue: 10000,
      currentValue: 0,
      category: 'empire',
      rewards: [
        {
          id: 'milestone_empire_10000_currency',
          type: 'currency' as any,
          currencyType: 'freecoin',
          amount: 5000,
        },
      ],
      unlocks: [],
      repeatable: false,
      completionCount: 0,
    });

    // Power generation milestones
    this.registerMilestone({
      id: 'milestone_power_100',
      type: MilestoneType.POWER_GENERATION,
      name: 'Power Producer I',
      description: 'Generate 100 power',
      targetValue: 100,
      currentValue: 0,
      category: 'power',
      rewards: [
        {
          id: 'milestone_power_100_currency',
          type: 'currency' as any,
          currencyType: 'freecoin',
          amount: 300,
        },
      ],
      unlocks: [],
      repeatable: false,
      completionCount: 0,
    });

    this.registerMilestone({
      id: 'milestone_power_1000',
      type: MilestoneType.POWER_GENERATION,
      name: 'Power Producer II',
      description: 'Generate 1,000 power',
      targetValue: 1000,
      currentValue: 0,
      category: 'power',
      rewards: [
        {
          id: 'milestone_power_1000_currency',
          type: 'currency' as any,
          currencyType: 'freecoin',
          amount: 2000,
        },
      ],
      unlocks: [],
      repeatable: false,
      completionCount: 0,
    });

    // Mining output milestones
    this.registerMilestone({
      id: 'milestone_mining_100',
      type: MilestoneType.MINING_OUTPUT,
      name: 'Miner I',
      description: 'Mine 100 FreeCoin total',
      targetValue: 100,
      currentValue: 0,
      category: 'mining',
      rewards: [
        {
          id: 'milestone_mining_100_currency',
          type: 'currency' as any,
          currencyType: 'freecoin',
          amount: 500,
        },
      ],
      unlocks: [],
      repeatable: false,
      completionCount: 0,
    });

    this.registerMilestone({
      id: 'milestone_mining_1000',
      type: MilestoneType.MINING_OUTPUT,
      name: 'Miner II',
      description: 'Mine 1,000 FreeCoin total',
      targetValue: 1000,
      currentValue: 0,
      category: 'mining',
      rewards: [
        {
          id: 'milestone_mining_1000_currency',
          type: 'currency' as any,
          currencyType: 'freecoin',
          amount: 3000,
        },
      ],
      unlocks: [],
      repeatable: false,
      completionCount: 0,
    });

    // Research count milestones
    this.registerMilestone({
      id: 'milestone_research_5',
      type: MilestoneType.RESEARCH_COUNT,
      name: 'Researcher I',
      description: 'Complete 5 research projects',
      targetValue: 5,
      currentValue: 0,
      category: 'research',
      rewards: [
        {
          id: 'milestone_research_5_currency',
          type: 'currency' as any,
          currencyType: 'freecoin',
          amount: 1000,
        },
      ],
      unlocks: [],
      repeatable: false,
      completionCount: 0,
    });

    this.registerMilestone({
      id: 'milestone_research_20',
      type: MilestoneType.RESEARCH_COUNT,
      name: 'Researcher II',
      description: 'Complete 20 research projects',
      targetValue: 20,
      currentValue: 0,
      category: 'research',
      rewards: [
        {
          id: 'milestone_research_20_currency',
          type: 'currency' as any,
          currencyType: 'freecoin',
          amount: 5000,
        },
      ],
      unlocks: [],
      repeatable: false,
      completionCount: 0,
    });
  }

  /**
   * Register milestone
   */
  registerMilestone(milestone: Milestone): void {
    this.milestones.set(milestone.id, milestone);
    this.state.milestones.set(milestone.id, milestone);
  }

  /**
   * Update milestone value
   */
  updateMilestoneValue(type: MilestoneType, value: number): void {
    for (const milestone of this.milestones.values()) {
      if (milestone.type === type) {
        milestone.currentValue = value;
        this.state.milestones.set(milestone.id, milestone);
        this.checkCompletion(milestone);
      }
    }
  }

  /**
   * Check milestone completion
   */
  private checkCompletion(milestone: Milestone): void {
    if (this.state.completedIds.has(milestone.id)) {
      if (!milestone.repeatable) return;
      if (milestone.maxCompletions && milestone.completionCount >= milestone.maxCompletions) return;
    }

    if (milestone.currentValue >= milestone.targetValue) {
      this.completeMilestone(milestone.id);
    }
  }

  /**
   * Complete milestone
   */
  private completeMilestone(milestoneId: string): void {
    const milestone = this.milestones.get(milestoneId);
    if (!milestone) return;

    if (!milestone.repeatable && this.state.completedIds.has(milestoneId)) {
      return;
    }

    milestone.completionCount++;
    milestone.completedAt = Date.now();

    if (!milestone.repeatable) {
      this.state.completedIds.add(milestoneId);
    }

    this.state.totalCompletions++;

    // Fire event
    this.fireEvent({
      type: ProgressionEventType.MILESTONE_COMPLETED,
      timestamp: Date.now(),
      playerId: '',
      empireId: '',
      milestoneId,
      milestone,
    } as any);
  }

  /**
   * Get milestone
   */
  getMilestone(milestoneId: string): Milestone | undefined {
    return this.milestones.get(milestoneId);
  }

  /**
   * Get all milestones
   */
  getAllMilestones(): Milestone[] {
    return Array.from(this.milestones.values());
  }

  /**
   * Get milestones by type
   */
  getMilestonesByType(type: MilestoneType): Milestone[] {
    return Array.from(this.milestones.values()).filter(m => m.type === type);
  }

  /**
   * Get milestones by category
   */
  getMilestonesByCategory(category: string): Milestone[] {
    return Array.from(this.milestones.values()).filter(m => m.category === category);
  }

  /**
   * Get completed milestones
   */
  getCompletedMilestones(): Milestone[] {
    return Array.from(this.milestones.values()).filter(m => 
      this.state.completedIds.has(m.id)
    );
  }

  /**
   * Get active milestones
   */
  getActiveMilestones(): Milestone[] {
    return Array.from(this.milestones.values()).filter(m => 
      !this.state.completedIds.has(m.id) || m.repeatable
    );
  }

  /**
   * Check if milestone is completed
   */
  isCompleted(milestoneId: string): boolean {
    return this.state.completedIds.has(milestoneId);
  }

  /**
   * Get state
   */
  getState(): MilestoneState {
    return {
      milestones: new Map(this.state.milestones),
      completedIds: new Set(this.state.completedIds),
      totalCompletions: this.state.totalCompletions,
    };
  }

  /**
   * Set state
   */
  setState(state: MilestoneState): void {
    this.state = {
      milestones: new Map(state.milestones),
      completedIds: new Set(state.completedIds),
      totalCompletions: state.totalCompletions,
    };
  }

  /**
   * Start refresh interval
   */
  private startRefreshInterval(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    this.refreshInterval = setInterval(() => {
      this.refresh();
    }, this.config.milestoneRefreshInterval);
  }

  /**
   * Stop refresh interval
   */
  private stopRefreshInterval(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * Refresh milestones
   */
  private refresh(): void {
    // In a real implementation, this would fetch current values from game systems
    // For now, this is a placeholder for future integration
  }

  /**
   * Reset milestones
   */
  reset(): void {
    this.state = {
      milestones: new Map(this.milestones),
      completedIds: new Set(),
      totalCompletions: 0,
    };

    // Reset milestone completion states
    for (const milestone of this.milestones.values()) {
      milestone.completionCount = 0;
      milestone.completedAt = undefined;
    }
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
    this.stopRefreshInterval();
    this.startRefreshInterval();
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
    this.stopRefreshInterval();
  }
}
