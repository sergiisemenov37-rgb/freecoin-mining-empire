/**
 * Research Points System
 * Manages research points as a resource with earning and spending
 */

import type {
  ResearchPoints,
  ResearchPointsSource,
  ResearchEvent,
  ResearchEventListener,
  ResearchSystemConfig,
} from './types';
import {
  ResearchEventType,
  DEFAULT_RESEARCH_CONFIG,
} from './types';

/**
 * Research points system class
 */
export class ResearchPointsSystem {
  private points: ResearchPoints;
  private config: ResearchSystemConfig;
  private eventListeners: Map<ResearchEventType, Set<ResearchEventListener>>;
  private earnInterval: NodeJS.Timeout | null;

  constructor(config?: Partial<ResearchSystemConfig>) {
    this.config = {
      ...DEFAULT_RESEARCH_CONFIG,
      ...config,
    };

    this.points = {
      total: 0,
      available: 0,
      spent: 0,
      earned: 0,
      lastEarnTime: Date.now(),
    };

    this.eventListeners = new Map();
    this.earnInterval = null;

    this.startEarning();
  }

  /**
   * Earn research points
   */
  earnPoints(
    amount: number,
    source: ResearchPointsSource,
    sourceId?: string
  ): void {
    const actualAmount = amount * this.config.pointsMultiplier;
    
    this.points.total += actualAmount;
    this.points.available += actualAmount;
    this.points.earned += actualAmount;
    this.points.lastEarnTime = Date.now();

    // Fire event
    this.fireEvent({
      type: ResearchEventType.POINTS_EARNED,
      timestamp: Date.now(),
      sourceId,
    } as any);
  }

  /**
   * Spend research points
   */
  spendPoints(amount: number): boolean {
    if (this.points.available < amount) {
      return false;
    }

    this.points.available -= amount;
    this.points.spent += amount;

    // Fire event
    this.fireEvent({
      type: ResearchEventType.POINTS_SPENT,
      timestamp: Date.now(),
    } as any);

    return true;
  }

  /**
   * Check if can spend points
   */
  canSpendPoints(amount: number): boolean {
    return this.points.available >= amount;
  }

  /**
   * Get research points
   */
  getPoints(): ResearchPoints {
    return { ...this.points };
  }

  /**
   * Get available points
   */
  getAvailablePoints(): number {
    return this.points.available;
  }

  /**
   * Get total points
   */
  getTotalPoints(): number {
    return this.points.total;
  }

  /**
   * Get spent points
   */
  getSpentPoints(): number {
    return this.points.spent;
  }

  /**
   * Get earned points
   */
  getEarnedPoints(): number {
    return this.points.earned;
  }

  /**
   * Start automatic earning
   */
  private startEarning(): void {
    if (this.earnInterval) {
      clearInterval(this.earnInterval);
    }

    this.earnInterval = setInterval(() => {
      this.earnPoints(
        this.config.basePointsPerTick,
        'laboratory' as any
      );
    }, 1000); // Earn every second
  }

  /**
   * Stop automatic earning
   */
  private stopEarning(): void {
    if (this.earnInterval) {
      clearInterval(this.earnInterval);
      this.earnInterval = null;
    }
  }

  /**
   * Get state
   */
  getState(): ResearchPoints {
    return { ...this.points };
  }

  /**
   * Set state
   */
  setState(state: ResearchPoints): void {
    this.points = { ...state };
  }

  /**
   * Reset research points
   */
  reset(): void {
    this.points = {
      total: 0,
      available: 0,
      spent: 0,
      earned: 0,
      lastEarnTime: Date.now(),
    };
  }

  /**
   * Register event listener
   */
  on(eventType: ResearchEventType, listener: ResearchEventListener): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(listener);
  }

  /**
   * Unregister event listener
   */
  off(eventType: ResearchEventType, listener: ResearchEventListener): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Fire event to listeners
   */
  private fireEvent(event: ResearchEvent): void {
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
  updateConfig(config: Partial<ResearchSystemConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get configuration
   */
  getConfig(): ResearchSystemConfig {
    return { ...this.config };
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stopEarning();
  }
}
