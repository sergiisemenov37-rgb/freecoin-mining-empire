/**
 * Research Laboratories
 * Manages research laboratories with speed modifiers and parallel research support
 */

import type {
  ResearchLaboratory,
  ResearchCategory,
  ResearchEvent,
  ResearchEventListener,
  ResearchSystemConfig,
} from './types';
import {
  ResearchEventType,
  DEFAULT_RESEARCH_CONFIG,
} from './types';

/**
 * Research laboratories system class
 */
export class ResearchLaboratories {
  private laboratories: Map<string, ResearchLaboratory>;
  private config: ResearchSystemConfig;
  private eventListeners: Map<ResearchEventType, Set<ResearchEventListener>>;

  constructor(config?: Partial<ResearchSystemConfig>) {
    this.config = {
      ...DEFAULT_RESEARCH_CONFIG,
      ...config,
    };

    this.laboratories = new Map();
    this.eventListeners = new Map();
  }

  /**
   * Add laboratory
   */
  addLaboratory(laboratory: ResearchLaboratory): void {
    this.laboratories.set(laboratory.id, laboratory);

    // Fire event
    this.fireEvent({
      type: ResearchEventType.LABORATORY_BUILT,
      timestamp: Date.now(),
      laboratoryId: laboratory.id,
    } as any);
  }

  /**
   * Remove laboratory
   */
  removeLaboratory(laboratoryId: string): void {
    const laboratory = this.laboratories.get(laboratoryId);
    if (!laboratory) return;

    this.laboratories.delete(laboratoryId);

    // Fire event
    this.fireEvent({
      type: ResearchEventType.LABORATORY_DESTROYED,
      timestamp: Date.now(),
      laboratoryId,
    } as any);
  }

  /**
   * Upgrade laboratory
   */
  upgradeLaboratory(laboratoryId: string): boolean {
    const laboratory = this.laboratories.get(laboratoryId);
    if (!laboratory) return false;

    if (laboratory.level >= laboratory.maxLevel) return false;

    laboratory.level++;
    laboratory.currentSpeedMultiplier = laboratory.baseSpeedMultiplier + (laboratory.level * this.config.laboratorySpeedBonus);
    laboratory.updatedAt = Date.now();

    // Fire event
    this.fireEvent({
      type: ResearchEventType.LABORATORY_UPGRADED,
      timestamp: Date.now(),
      laboratoryId,
    } as any);

    return true;
  }

  /**
   * Get laboratory
   */
  getLaboratory(laboratoryId: string): ResearchLaboratory | undefined {
    return this.laboratories.get(laboratoryId);
  }

  /**
   * Get all laboratories
   */
  getAllLaboratories(): ResearchLaboratory[] {
    return Array.from(this.laboratories.values());
  }

  /**
   * Get laboratory by building
   */
  getLaboratoryByBuilding(buildingId: string): ResearchLaboratory | undefined {
    return Array.from(this.laboratories.values()).find(
      lab => lab.buildingId === buildingId
    );
  }

  /**
  * Calculate total speed multiplier
   */
  getTotalSpeedMultiplier(): number {
    let totalMultiplier = 1.0;

    for (const laboratory of this.laboratories.values()) {
      totalMultiplier += laboratory.currentSpeedMultiplier - 1;
    }

    return totalMultiplier;
  }

  /**
   * Calculate total parallel research capacity
   */
  getTotalParallelResearch(): number {
    let totalParallel = this.config.maxParallelResearch;

    for (const laboratory of this.laboratories.values()) {
      totalParallel += laboratory.maxParallelResearch - 1;
      totalParallel += this.config.laboratoryParallelBonus;
    }

    return totalParallel;
  }

  /**
   * Get category bonus
   */
  getCategoryBonus(category: ResearchCategory): number {
    let bonus = 0;

    for (const laboratory of this.laboratories.values()) {
      bonus += laboratory.categoryBonus[category] || 0;
    }

    return bonus;
  }

  /**
   * Get state
   */
  getState(): Map<string, ResearchLaboratory> {
    return new Map(this.laboratories);
  }

  /**
   * Set state
   */
  setState(state: Map<string, ResearchLaboratory>): void {
    this.laboratories = new Map(state);
  }

  /**
   * Reset laboratories
   */
  reset(): void {
    this.laboratories.clear();
  }

  /**
   * Get laboratory count
   */
  getLaboratoryCount(): number {
    return this.laboratories.size;
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
}
