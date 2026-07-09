/**
 * Unlock Engine
 * Manages unlocks for buildings, hardware, research, robots, decorations, districts, features, UI, and future content
 * Supports unlock tree visualization and prerequisite chains
 */

import type {
  Unlock,
  UnlockTreeNode,
  UnlockState,
  ProgressionEvent,
  ProgressionEventListener,
  ProgressionConfig,
} from './types';
import {
  UnlockType,
  ProgressionEventType,
  DEFAULT_PROGRESSION_CONFIG,
} from './types';
import { LevelSystem } from './LevelSystem';
import { TierSystem } from './TierSystem';

/**
 * Unlock engine class
 */
export class UnlockEngine {
  private state: UnlockState;
  private config: ProgressionConfig;
  private unlocks: Map<string, Unlock>;
  private unlockTree: UnlockTreeNode | null;
  private eventListeners: Map<ProgressionEventType, Set<ProgressionEventListener>>;
  private levelSystem: LevelSystem;
  private tierSystem: TierSystem;

  constructor(
    levelSystem: LevelSystem,
    tierSystem: TierSystem,
    config?: Partial<ProgressionConfig>
  ) {
    this.levelSystem = levelSystem;
    this.tierSystem = tierSystem;
    this.config = {
      ...DEFAULT_PROGRESSION_CONFIG,
      ...config,
    };

    this.state = {
      unlockedIds: new Set(),
      visibleIds: new Set(),
      unlockHistory: [],
    };

    this.unlocks = new Map();
    this.unlockTree = null;
    this.eventListeners = new Map();

    this.initializeUnlocks();
    this.buildUnlockTree();
    this.setupListeners();
  }

  /**
   * Initialize unlocks
   */
  private initializeUnlocks(): void {
    // Hardware unlocks
    this.registerUnlock({
      id: 'unlock_gpu_basic',
      type: UnlockType.HARDWARE,
      name: 'Basic GPU',
      description: 'Unlock basic GPU hardware',
      itemId: 'gpu_basic',
      category: 'hardware',
      prerequisites: [],
      autoUnlock: true,
      visible: true,
    });

    this.registerUnlock({
      id: 'unlock_gpu_advanced',
      type: UnlockType.HARDWARE,
      name: 'Advanced GPU',
      description: 'Unlock advanced GPU hardware',
      itemId: 'gpu_advanced',
      category: 'hardware',
      prerequisites: ['unlock_gpu_basic'],
      requiredLevel: 5,
      autoUnlock: true,
      visible: true,
    });

    this.registerUnlock({
      id: 'unlock_asic_basic',
      type: UnlockType.HARDWARE,
      name: 'Basic ASIC',
      description: 'Unlock basic ASIC hardware',
      itemId: 'asic_basic',
      category: 'hardware',
      prerequisites: ['unlock_gpu_basic'],
      requiredLevel: 10,
      autoUnlock: true,
      visible: true,
    });

    // Building unlocks
    this.registerUnlock({
      id: 'unlock_building_basic',
      type: UnlockType.BUILDING,
      name: 'Basic Buildings',
      description: 'Unlock basic building types',
      category: 'building',
      prerequisites: [],
      autoUnlock: true,
      visible: true,
    });

    this.registerUnlock({
      id: 'unlock_building_advanced',
      type: UnlockType.BUILDING,
      name: 'Advanced Buildings',
      description: 'Unlock advanced building types',
      category: 'building',
      prerequisites: ['unlock_building_basic'],
      requiredTier: 2,
      autoUnlock: true,
      visible: true,
    });

    // Feature unlocks
    this.registerUnlock({
      id: 'unlock_shop',
      type: UnlockType.FEATURE,
      name: 'Shop',
      description: 'Unlock the shop feature',
      category: 'feature',
      prerequisites: [],
      autoUnlock: true,
      visible: true,
    });

    this.registerUnlock({
      id: 'unlock_crafting',
      type: UnlockType.FEATURE,
      name: 'Crafting',
      description: 'Unlock the crafting feature',
      category: 'feature',
      prerequisites: ['unlock_shop'],
      requiredLevel: 5,
      autoUnlock: true,
      visible: true,
    });

    this.registerUnlock({
      id: 'unlock_trading',
      type: UnlockType.FEATURE,
      name: 'Trading',
      description: 'Unlock the trading feature',
      category: 'feature',
      prerequisites: ['unlock_shop'],
      requiredLevel: 10,
      autoUnlock: true,
      visible: true,
    });

    // UI unlocks
    this.registerUnlock({
      id: 'unlock_ui_advanced',
      type: UnlockType.UI,
      name: 'Advanced UI',
      description: 'Unlock advanced UI elements',
      category: 'ui',
      prerequisites: [],
      requiredLevel: 2,
      autoUnlock: true,
      visible: true,
    });

    // Decoration unlocks
    this.registerUnlock({
      id: 'unlock_decoration_basic',
      type: UnlockType.DECORATION,
      name: 'Basic Decorations',
      description: 'Unlock basic decorations',
      category: 'decoration',
      prerequisites: [],
      requiredLevel: 3,
      autoUnlock: true,
      visible: true,
    });

    // District unlocks
    this.registerUnlock({
      id: 'unlock_district_basic',
      type: UnlockType.DISTRICT,
      name: 'Basic Districts',
      description: 'Unlock basic district types',
      category: 'district',
      prerequisites: [],
      requiredTier: 5,
      autoUnlock: true,
      visible: true,
    });
  }

  /**
   * Register unlock
   */
  registerUnlock(unlock: Unlock): void {
    this.unlocks.set(unlock.id, unlock);
    this.buildUnlockTree();
  }

  /**
   * Build unlock tree
   */
  private buildUnlockTree(): void {
    const rootNodes: UnlockTreeNode[] = [];
    const processedIds = new Set<string>();

    // Find root nodes (no prerequisites)
    for (const unlock of this.unlocks.values()) {
      if (unlock.prerequisites.length === 0) {
        rootNodes.push(this.buildTreeNode(unlock, processedIds));
      }
    }

    // Create a virtual root
    this.unlockTree = {
      unlock: {
        id: 'root',
        type: UnlockType.CUSTOM,
        name: 'Root',
        description: 'Root of unlock tree',
        prerequisites: [],
        autoUnlock: true,
        visible: false,
      },
      children: rootNodes,
      depth: 0,
    };
  }

  /**
   * Build tree node recursively
   */
  private buildTreeNode(unlock: Unlock, processedIds: Set<string>): UnlockTreeNode {
    if (processedIds.has(unlock.id)) {
      return {
        unlock,
        children: [],
        depth: 0,
      };
    }

    processedIds.add(unlock.id);

    const children: UnlockTreeNode[] = [];
    for (const [id, childUnlock] of this.unlocks) {
      if (childUnlock.prerequisites.includes(unlock.id)) {
        children.push(this.buildTreeNode(childUnlock, processedIds));
      }
    }

    return {
      unlock,
      children,
      depth: 0,
    };
  }

  /**
   * Setup listeners
   */
  private setupListeners(): void {
    this.levelSystem.on(ProgressionEventType.LEVEL_UP as any, (event) => {
      this.checkAutoUnlocks();
    });

    this.tierSystem.on(ProgressionEventType.TIER_UP as any, (event) => {
      this.checkAutoUnlocks();
    });
  }

  /**
   * Check auto unlocks
   */
  private checkAutoUnlocks(): void {
    const currentLevel = this.levelSystem.getCurrentLevel();
    const currentTier = this.tierSystem.getCurrentTier();

    for (const unlock of this.unlocks.values()) {
      if (unlock.autoUnlock && !this.state.unlockedIds.has(unlock.id)) {
        if (this.canUnlock(unlock, currentLevel, currentTier)) {
          this.unlock(unlock.id, 'auto');
        }
      }
    }

    this.updateVisibility();
  }

  /**
   * Check if unlock can be unlocked
   */
  private canUnlock(unlock: Unlock, currentLevel: number, currentTier: number): boolean {
    // Check prerequisites
    for (const prereqId of unlock.prerequisites) {
      if (!this.state.unlockedIds.has(prereqId)) {
        return false;
      }
    }

    // Check level requirement
    if (unlock.requiredLevel && currentLevel < unlock.requiredLevel) {
      return false;
    }

    // Check tier requirement
    if (unlock.requiredTier && currentTier < unlock.requiredTier) {
      return false;
    }

    return true;
  }

  /**
   * Unlock
   */
  unlock(unlockId: string, source: string = 'manual'): boolean {
    const unlock = this.unlocks.get(unlockId);
    if (!unlock) return false;

    if (this.state.unlockedIds.has(unlockId)) return false;

    const currentLevel = this.levelSystem.getCurrentLevel();
    const currentTier = this.tierSystem.getCurrentTier();

    if (!this.canUnlock(unlock, currentLevel, currentTier)) {
      return false;
    }

    this.state.unlockedIds.add(unlockId);
    this.state.unlockHistory.push({
      unlockId,
      unlockedAt: Date.now(),
      source,
    });

    // Fire event
    this.fireEvent({
      type: ProgressionEventType.UNLOCK_ACHIEVED,
      timestamp: Date.now(),
      playerId: '',
      empireId: '',
      unlockId,
      unlock,
    } as any);

    this.updateVisibility();

    return true;
  }

  /**
   * Update visibility
   */
  private updateVisibility(): void {
    const currentLevel = this.levelSystem.getCurrentLevel();
    const currentTier = this.tierSystem.getCurrentTier();

    for (const unlock of this.unlocks.values()) {
      if (this.state.unlockedIds.has(unlock.id)) {
        this.state.visibleIds.add(unlock.id);
        continue;
      }

      if (unlock.visible || this.config.showHiddenUnlocks) {
        // Check if prerequisites are met
        const prereqsMet = unlock.prerequisites.every(prereqId => 
          this.state.unlockedIds.has(prereqId)
        );

        if (prereqsMet) {
          this.state.visibleIds.add(unlock.id);
        }
      }
    }
  }

  /**
   * Get unlock
   */
  getUnlock(unlockId: string): Unlock | undefined {
    return this.unlocks.get(unlockId);
  }

  /**
   * Get all unlocks
   */
  getAllUnlocks(): Unlock[] {
    return Array.from(this.unlocks.values());
  }

  /**
   * Get unlocks by type
   */
  getUnlocksByType(type: UnlockType): Unlock[] {
    return Array.from(this.unlocks.values()).filter(u => u.type === type);
  }

  /**
   * Get unlocks by category
   */
  getUnlocksByCategory(category: string): Unlock[] {
    return Array.from(this.unlocks.values()).filter(u => u.category === category);
  }

  /**
   * Check if unlocked
   */
  isUnlocked(unlockId: string): boolean {
    return this.state.unlockedIds.has(unlockId);
  }

  /**
   * Check if visible
   */
  isVisible(unlockId: string): boolean {
    return this.state.visibleIds.has(unlockId);
  }

  /**
   * Get unlock tree
   */
  getUnlockTree(): UnlockTreeNode | null {
    return this.unlockTree;
  }

  /**
   * Get unlock prerequisites
   */
  getPrerequisites(unlockId: string): Unlock[] {
    const unlock = this.unlocks.get(unlockId);
    if (!unlock) return [];

    return unlock.prerequisites
      .map(prereqId => this.unlocks.get(prereqId))
      .filter((u): u is Unlock => u !== undefined);
  }

  /**
   * Get unlock dependents (unlocks that depend on this)
   */
  getDependents(unlockId: string): Unlock[] {
    return Array.from(this.unlocks.values()).filter(u => 
      u.prerequisites.includes(unlockId)
    );
  }

  /**
   * Get state
   */
  getState(): UnlockState {
    return {
      unlockedIds: new Set(this.state.unlockedIds),
      visibleIds: new Set(this.state.visibleIds),
      unlockHistory: [...this.state.unlockHistory],
    };
  }

  /**
   * Set state
   */
  setState(state: UnlockState): void {
    this.state = {
      unlockedIds: new Set(state.unlockedIds),
      visibleIds: new Set(state.visibleIds),
      unlockHistory: [...state.unlockHistory],
    };
    this.updateVisibility();
  }

  /**
   * Reset unlocks
   */
  reset(): void {
    this.state = {
      unlockedIds: new Set(),
      visibleIds: new Set(),
      unlockHistory: [],
    };
    this.checkAutoUnlocks();
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
    this.updateVisibility();
  }

  /**
   * Get configuration
   */
  getConfig(): ProgressionConfig {
    return { ...this.config };
  }
}
