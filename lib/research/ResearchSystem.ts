/**
 * Research System
 * Central coordinator integrating Research Graph, Points, Queue, and Laboratories
 * Integrates with Progression Engine for unlocks
 */

import { ResearchGraph } from './ResearchGraph';
import { ResearchPointsSystem } from './ResearchPoints';
import { ResearchQueue } from './ResearchQueue';
import { ResearchLaboratories } from './ResearchLaboratories';
import type {
  ResearchNode,
  ResearchLaboratory,
  ResearchEvent,
  ResearchEventListener,
  ResearchSystemConfig,
  ResearchCategory,
} from './types';
import {
  ResearchEventType,
  ResearchNodeState,
  DEFAULT_RESEARCH_CONFIG,
} from './types';

/**
 * Research system class
 */
export class ResearchSystem {
  private researchGraph: ResearchGraph;
  private pointsSystem: ResearchPointsSystem;
  private queueSystem: ResearchQueue;
  private laboratoriesSystem: ResearchLaboratories;
  private config: ResearchSystemConfig;
  private eventListeners: Map<ResearchEventType, Set<ResearchEventListener>>;

  constructor(config?: Partial<ResearchSystemConfig>) {
    this.config = {
      ...DEFAULT_RESEARCH_CONFIG,
      ...config,
    };

    this.researchGraph = new ResearchGraph();
    this.pointsSystem = new ResearchPointsSystem(this.config);
    this.queueSystem = new ResearchQueue(this.config);
    this.laboratoriesSystem = new ResearchLaboratories(this.config);
    this.eventListeners = new Map();

    this.setupEventIntegration();
    this.updateQueueSpeedMultiplier();
  }

  /**
   * Setup event integration between subsystems
   */
  private setupEventIntegration(): void {
    // Forward points system events
    this.pointsSystem.on(ResearchEventType.POINTS_EARNED, (event) => {
      this.handlePointsEvent(event);
    });

    this.pointsSystem.on(ResearchEventType.POINTS_SPENT, (event) => {
      this.handlePointsEvent(event);
    });

    // Forward queue system events
    const queueEvents: ResearchEventType[] = [
      ResearchEventType.RESEARCH_STARTED,
      ResearchEventType.RESEARCH_FINISHED,
      ResearchEventType.RESEARCH_CANCELLED,
      ResearchEventType.RESEARCH_PAUSED,
      ResearchEventType.RESEARCH_RESUMED,
    ];

    for (const eventType of queueEvents) {
      this.queueSystem.on(eventType, (event) => {
        this.handleQueueEvent(event);
      });
    }

    // Forward laboratory events
    const labEvents: ResearchEventType[] = [
      ResearchEventType.LABORATORY_BUILT,
      ResearchEventType.LABORATORY_UPGRADED,
      ResearchEventType.LABORATORY_DESTROYED,
    ];

    for (const eventType of labEvents) {
      this.laboratoriesSystem.on(eventType, (event) => {
        this.handleLaboratoryEvent(event);
      });
    }
  }

  /**
   * Handle points system events
   */
  private handlePointsEvent(event: ResearchEvent): void {
    this.fireEvent(event);
  }

  /**
   * Handle queue system events
   */
  private handleQueueEvent(event: ResearchEvent): void {
    this.fireEvent(event);

    // Update graph state when research finishes
    if (event.type === ResearchEventType.RESEARCH_FINISHED && event.nodeId) {
      this.researchGraph.updateNodeState(event.nodeId, ResearchNodeState.COMPLETED);
      
      // Grant unlocks
      const node = this.researchGraph.getNode(event.nodeId);
      if (node) {
        this.grantUnlocks(node);
      }
    }

    // Update graph state when research starts
    if (event.type === ResearchEventType.RESEARCH_STARTED && event.nodeId) {
      this.researchGraph.updateNodeState(event.nodeId, ResearchNodeState.IN_PROGRESS);
    }

    // Update graph state when research is cancelled
    if (event.type === ResearchEventType.RESEARCH_CANCELLED && event.nodeId) {
      this.researchGraph.updateNodeState(event.nodeId, ResearchNodeState.AVAILABLE);
    }
  }

  /**
   * Handle laboratory events
   */
  private handleLaboratoryEvent(event: ResearchEvent): void {
    this.fireEvent(event);

    // Update queue speed multiplier when laboratory changes
    if (event.type === ResearchEventType.LABORATORY_BUILT ||
        event.type === ResearchEventType.LABORATORY_UPGRADED ||
        event.type === ResearchEventType.LABORATORY_DESTROYED) {
      this.updateQueueSpeedMultiplier();
    }
  }

  /**
   * Update queue speed multiplier based on laboratories
   */
  private updateQueueSpeedMultiplier(): void {
    const totalMultiplier = this.laboratoriesSystem.getTotalSpeedMultiplier();
    this.queueSystem.setSpeedMultiplier(totalMultiplier);
  }

  /**
   * Grant unlocks from completed research
   */
  private grantUnlocks(node: ResearchNode): void {
    for (const unlockId of node.unlocks) {
      this.fireEvent({
        type: ResearchEventType.UNLOCK_GRANTED,
        timestamp: Date.now(),
        nodeId: node.id,
        unlockId,
      } as any);
    }
  }

  // ============================================
  // RESEARCH GRAPH API
  // ============================================

  /**
   * Add research node
   */
  addNode(node: ResearchNode): void {
    this.researchGraph.addNode(node);
  }

  /**
   * Remove research node
   */
  removeNode(nodeId: string): void {
    this.researchGraph.removeNode(nodeId);
  }

  /**
   * Get research node
   */
  getNode(nodeId: string): ResearchNode | undefined {
    return this.researchGraph.getNode(nodeId);
  }

  /**
   * Get all research nodes
   */
  getAllNodes(): ResearchNode[] {
    return this.researchGraph.getAllNodes();
  }

  /**
   * Get nodes by category
   */
  getNodesByCategory(category: ResearchCategory): ResearchNode[] {
    return this.researchGraph.getNodesByCategory(category);
  }

  /**
   * Get available nodes
   */
  getAvailableNodes(): ResearchNode[] {
    return this.researchGraph.getAvailableNodes();
  }

  /**
   * Get research tree
   */
  getResearchTree() {
    return this.researchGraph.getResearchTree();
  }

  // ============================================
  // RESEARCH POINTS API
  // ============================================

  /**
   * Earn research points
   */
  earnPoints(amount: number, source: string, sourceId?: string): void {
    this.pointsSystem.earnPoints(amount, source as any, sourceId);
  }

  /**
   * Spend research points
   */
  spendPoints(amount: number): boolean {
    return this.pointsSystem.spendPoints(amount);
  }

  /**
   * Can spend points
   */
  canSpendPoints(amount: number): boolean {
    return this.pointsSystem.canSpendPoints(amount);
  }

  /**
   * Get research points
   */
  getPoints() {
    return this.pointsSystem.getPoints();
  }

  // ============================================
  // RESEARCH QUEUE API
  // ============================================

  /**
   * Start research
   */
  startResearch(nodeId: string): boolean {
    const node = this.researchGraph.getNode(nodeId);
    if (!node) return false;

    if (node.state !== ResearchNodeState.AVAILABLE) return false;

    // Check points
    if (!this.pointsSystem.canSpendPoints(node.cost.researchPoints)) {
      return false;
    }

    // Spend points
    this.pointsSystem.spendPoints(node.cost.researchPoints);

    // Add to queue
    return this.queueSystem.addResearch(nodeId, node.researchTime);
  }

  /**
   * Cancel research
   */
  cancelResearch(nodeId: string): boolean {
    const queueItem = this.queueSystem.getQueueItemByNodeId(nodeId);
    if (!queueItem) return false;

    // Refund points
    const node = this.researchGraph.getNode(nodeId);
    if (node) {
      this.pointsSystem.earnPoints(node.cost.researchPoints, 'refund' as any);
    }

    return this.queueSystem.removeResearch(queueItem.queueId);
  }

  /**
   * Pause research
   */
  pauseResearch(nodeId: string): boolean {
    const queueItem = this.queueSystem.getQueueItemByNodeId(nodeId);
    if (!queueItem) return false;

    return this.queueSystem.pauseResearch(queueItem.queueId);
  }

  /**
   * Resume research
   */
  resumeResearch(nodeId: string): boolean {
    const queueItem = this.queueSystem.getQueueItemByNodeId(nodeId);
    if (!queueItem) return false;

    return this.queueSystem.resumeResearch(queueItem.queueId);
  }

  /**
   * Get research queue
   */
  getResearchQueue() {
    return this.queueSystem.getQueue();
  }

  // ============================================
  // LABORATORIES API
  // ============================================

  /**
   * Add laboratory
   */
  addLaboratory(laboratory: ResearchLaboratory): void {
    this.laboratoriesSystem.addLaboratory(laboratory);
    this.updateQueueSpeedMultiplier();
  }

  /**
   * Remove laboratory
   */
  removeLaboratory(laboratoryId: string): void {
    this.laboratoriesSystem.removeLaboratory(laboratoryId);
    this.updateQueueSpeedMultiplier();
  }

  /**
   * Upgrade laboratory
   */
  upgradeLaboratory(laboratoryId: string): boolean {
    const result = this.laboratoriesSystem.upgradeLaboratory(laboratoryId);
    this.updateQueueSpeedMultiplier();
    return result;
  }

  /**
   * Get laboratory
   */
  getLaboratory(laboratoryId: string): ResearchLaboratory | undefined {
    return this.laboratoriesSystem.getLaboratory(laboratoryId);
  }

  /**
   * Get all laboratories
   */
  getAllLaboratories(): ResearchLaboratory[] {
    return this.laboratoriesSystem.getAllLaboratories();
  }

  /**
   * Get total speed multiplier
   */
  getTotalSpeedMultiplier(): number {
    return this.laboratoriesSystem.getTotalSpeedMultiplier();
  }

  /**
   * Get total parallel research
   */
  getTotalParallelResearch(): number {
    return this.laboratoriesSystem.getTotalParallelResearch();
  }

  // ============================================
  // STATE MANAGEMENT
  // ============================================

  /**
   * Get state
   */
  getState() {
    return {
      graph: this.researchGraph.getState(),
      points: this.pointsSystem.getState(),
      queue: this.queueSystem.getState(),
      laboratories: this.laboratoriesSystem.getState(),
    };
  }

  /**
   * Set state
   */
  setState(state: {
    graph: ReturnType<ResearchGraph['getState']>;
    points: ReturnType<ResearchPointsSystem['getState']>;
    queue: ReturnType<ResearchQueue['getState']>;
    laboratories: ReturnType<ResearchLaboratories['getState']>;
  }): void {
    this.researchGraph.setState(state.graph);
    this.pointsSystem.setState(state.points);
    this.queueSystem.setState(state.queue);
    this.laboratoriesSystem.setState(state.laboratories);
    this.updateQueueSpeedMultiplier();
  }

  /**
   * Reset research system
   */
  reset(): void {
    this.researchGraph.reset();
    this.pointsSystem.reset();
    this.queueSystem.reset();
    this.laboratoriesSystem.reset();
    this.updateQueueSpeedMultiplier();
  }

  // ============================================
  // EVENT MANAGEMENT
  // ============================================

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

  // ============================================
  // CONFIGURATION
  // ============================================

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ResearchSystemConfig>): void {
    this.config = { ...this.config, ...config };
    this.pointsSystem.updateConfig(config);
    this.queueSystem.updateConfig(config);
    this.laboratoriesSystem.updateConfig(config);
  }

  /**
   * Get configuration
   */
  getConfig(): ResearchSystemConfig {
    return { ...this.config };
  }

  // ============================================
  // SUBSYSTEM ACCESS
  // ============================================

  /**
   * Get research graph
   */
  getResearchGraph(): ResearchGraph {
    return this.researchGraph;
  }

  /**
   * Get points system
   */
  getPointsSystem(): ResearchPointsSystem {
    return this.pointsSystem;
  }

  /**
   * Get queue system
   */
  getQueueSystem(): ResearchQueue {
    return this.queueSystem;
  }

  /**
   * Get laboratories system
   */
  getLaboratoriesSystem(): ResearchLaboratories {
    return this.laboratoriesSystem;
  }

  // ============================================
  // CLEANUP
  // ============================================

  /**
   * Cleanup
   */
  destroy(): void {
    this.pointsSystem.destroy();
    this.queueSystem.destroy();
  }
}
