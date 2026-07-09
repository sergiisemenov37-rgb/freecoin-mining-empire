/**
 * Research Queue
 * Manages research queue with time calculation and parallel research support
 */

import type {
  ResearchQueueItem,
  ResearchNode,
  ResearchEvent,
  ResearchEventListener,
  ResearchSystemConfig,
} from './types';
import {
  ResearchEventType,
  ResearchNodeState,
  DEFAULT_RESEARCH_CONFIG,
} from './types';

/**
 * Research queue class
 */
export class ResearchQueue {
  private queue: ResearchQueueItem[];
  private config: ResearchSystemConfig;
  private eventListeners: Map<ResearchEventType, Set<ResearchEventListener>>;
  private updateInterval: NodeJS.Timeout | null;
  private speedMultiplier: number;

  constructor(config?: Partial<ResearchSystemConfig>) {
    this.config = {
      ...DEFAULT_RESEARCH_CONFIG,
      ...config,
    };

    this.queue = [];
    this.eventListeners = new Map();
    this.updateInterval = null;
    this.speedMultiplier = 1.0;

    this.startUpdates();
  }

  /**
   * Add research to queue
   */
  addResearch(
    nodeId: string,
    researchTime: number,
    laboratoryId?: string
  ): boolean {
    // Check queue size limit
    if (this.queue.length >= this.config.maxQueueSize) {
      return false;
    }

    // Check if already in queue
    if (this.queue.some(item => item.nodeId === nodeId)) {
      return false;
    }

    // Calculate actual research time with speed multiplier
    const actualTime = researchTime / (this.config.baseResearchSpeed * this.config.researchSpeedMultiplier * this.speedMultiplier);

    const queueItem: ResearchQueueItem = {
      queueId: `queue_${nodeId}_${Date.now()}`,
      nodeId,
      startTime: Date.now(),
      estimatedCompletionTime: Date.now() + actualTime,
      laboratoryId,
      isPaused: false,
      priority: this.queue.length,
    };

    this.queue.push(queueItem);

    // Fire event
    this.fireEvent({
      type: ResearchEventType.RESEARCH_STARTED,
      timestamp: Date.now(),
      nodeId,
      laboratoryId,
    } as any);

    return true;
  }

  /**
   * Remove research from queue
   */
  removeResearch(queueId: string): boolean {
    const index = this.queue.findIndex(item => item.queueId === queueId);
    if (index === -1) return false;

    const item = this.queue[index];
    this.queue.splice(index, 1);

    // Fire event
    this.fireEvent({
      type: ResearchEventType.RESEARCH_CANCELLED,
      timestamp: Date.now(),
      nodeId: item.nodeId,
    } as any);

    return true;
  }

  /**
   * Pause research
   */
  pauseResearch(queueId: string): boolean {
    const item = this.queue.find(item => item.queueId === queueId);
    if (!item || item.isPaused) return false;

    item.isPaused = true;

    // Recalculate estimated completion time
    const elapsed = Date.now() - item.startTime;
    const remaining = item.estimatedCompletionTime - item.startTime - elapsed;
    item.startTime = Date.now();
    item.estimatedCompletionTime = Date.now() + remaining;

    // Fire event
    this.fireEvent({
      type: ResearchEventType.RESEARCH_PAUSED,
      timestamp: Date.now(),
      nodeId: item.nodeId,
    } as any);

    return true;
  }

  /**
   * Resume research
   */
  resumeResearch(queueId: string): boolean {
    const item = this.queue.find(item => item.queueId === queueId);
    if (!item || !item.isPaused) return false;

    item.isPaused = false;
    item.startTime = Date.now();
    item.estimatedCompletionTime = Date.now() + (item.estimatedCompletionTime - item.startTime);

    // Fire event
    this.fireEvent({
      type: ResearchEventType.RESEARCH_RESUMED,
      timestamp: Date.now(),
      nodeId: item.nodeId,
    } as any);

    return true;
  }

  /**
   * Update research progress
   */
  private updateResearchProgress(): void {
    const now = Date.now();
    const completedItems: string[] = [];

    for (const item of this.queue) {
      if (item.isPaused) continue;

      if (now >= item.estimatedCompletionTime) {
        completedItems.push(item.queueId);
      }
    }

    // Process completed items
    for (const queueId of completedItems) {
      const item = this.queue.find(i => i.queueId === queueId);
      if (item) {
        this.completeResearch(item);
      }
    }
  }

  /**
   * Complete research
   */
  private completeResearch(item: ResearchQueueItem): void {
    const duration = Date.now() - item.startTime;

    // Remove from queue
    this.queue = this.queue.filter(i => i.queueId !== item.queueId);

    // Fire event
    this.fireEvent({
      type: ResearchEventType.RESEARCH_FINISHED,
      timestamp: Date.now(),
      nodeId: item.nodeId,
      laboratoryId: item.laboratoryId,
    } as any);
  }

  /**
   * Get queue
   */
  getQueue(): ResearchQueueItem[] {
    return [...this.queue];
  }

  /**
   * Get queue item
   */
  getQueueItem(queueId: string): ResearchQueueItem | undefined {
    return this.queue.find(item => item.queueId === queueId);
  }

  /**
   * Get queue item by node ID
   */
  getQueueItemByNodeId(nodeId: string): ResearchQueueItem | undefined {
    return this.queue.find(item => item.nodeId === nodeId);
  }

  /**
   * Get active research count
   */
  getActiveResearchCount(): number {
    return this.queue.filter(item => !item.isPaused).length;
  }

  /**
   * Set speed multiplier
   */
  setSpeedMultiplier(multiplier: number): void {
    this.speedMultiplier = multiplier;
  }

  /**
   * Get speed multiplier
   */
  getSpeedMultiplier(): number {
    return this.speedMultiplier;
  }

  /**
   * Start automatic updates
   */
  private startUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(() => {
      this.update();
    }, 100);
  }

  /**
   * Stop automatic updates
   */
  private stopUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Update research queue
   */
  private update(): void {
    this.updateResearchProgress();
  }

  /**
   * Get state
   */
  getState(): ResearchQueueItem[] {
    return [...this.queue];
  }

  /**
   * Set state
   */
  setState(state: ResearchQueueItem[]): void {
    this.queue = [...state];
  }

  /**
   * Reset research queue
   */
  reset(): void {
    this.queue = [];
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
    this.stopUpdates();
  }
}
