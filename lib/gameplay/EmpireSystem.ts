/**
 * Empire/Player State System
 * Manages empire state, rooms, progression, and inventory
 * Integrates with all gameplay systems via events
 */

import type {
  EmpireState,
  RoomState,
  GameplayEvent,
  GameplayEventListener,
  GameplayConfig,
} from './types';
import {
  GameplayEventType,
  CurrencyType,
} from './types';

/**
 * Empire system class
 */
export class EmpireSystem {
  private empires: Map<string, EmpireState>;
  private rooms: Map<string, RoomState>;
  private eventListeners: Map<GameplayEventType, Set<GameplayEventListener>>;
  private config: GameplayConfig;

  constructor(config?: Partial<GameplayConfig>) {
    this.empires = new Map();
    this.rooms = new Map();
    this.eventListeners = new Map();
    this.config = {
      enableTutorial: true,
      autoStartTutorial: null,
      enableObjectives: true,
      autoAcceptObjectives: true,
      startingCurrency: { freecoin: 100, premium: 0 },
      miningConfig: {
        baseRate: 0.1,
        rarityMultipliers: {},
        qualityMultipliers: {},
        networkEfficiencyBonus: 1.1,
        difficulty: 1.0,
        difficultyAdjustmentRate: 0.001,
      },
      startingRoomSize: { width: 10, height: 10 },
      maxRoomSize: { width: 50, height: 50 },
      enablePlacementIntegration: true,
      enableSimulationIntegration: true,
      enableNetworkIntegration: true,
      enableHardwareIntegration: true,
      ...config,
    };
  }

  /**
   * Create empire
   */
  createEmpire(ownerId: string, name: string): EmpireState {
    const empire: EmpireState = {
      id: `empire_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      ownerId,
      name,
      
      level: 1,
      experience: 0,
      experienceToNextLevel: 100,
      
      roomIds: [],
      
      hardwareInventory: new Map(),
      
      currency: new Map([
        [CurrencyType.FREECOIN, this.config.startingCurrency[CurrencyType.FREECOIN]],
        [CurrencyType.PREMIUM, this.config.startingCurrency[CurrencyType.PREMIUM]],
      ]),
      
      unlockedFeatures: new Set(),
      
      completedTutorialIds: new Set(),
      completedObjectiveIds: new Set(),
      
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
    };

    this.empires.set(empire.id, empire);

    // Fire empire created event
    this.fireEvent({
      type: GameplayEventType.EMPIRE_CREATED,
      timestamp: Date.now(),
      empireId: empire.id,
    } as any);

    return empire;
  }

  /**
   * Get empire
   */
  getEmpire(empireId: string): EmpireState | undefined {
    return this.empires.get(empireId);
  }

  /**
   * Get empire by owner
   */
  getEmpireByOwner(ownerId: string): EmpireState | undefined {
    for (const empire of this.empires.values()) {
      if (empire.ownerId === ownerId) {
        return empire;
      }
    }
    return undefined;
  }

  /**
   * Add experience
   */
  addExperience(empireId: string, amount: number): boolean {
    const empire = this.empires.get(empireId);
    if (!empire) return false;

    const oldLevel = empire.level;
    empire.experience += amount;

    // Check for level up
    while (empire.experience >= empire.experienceToNextLevel) {
      empire.experience -= empire.experienceToNextLevel;
      empire.level++;
      empire.experienceToNextLevel = Math.floor(empire.experienceToNextLevel * 1.5);
    }

    empire.updatedAt = Date.now();
    empire.version++;

    // Fire level up event if leveled
    if (empire.level > oldLevel) {
      this.fireEvent({
        type: GameplayEventType.EMPIRE_LEVEL_UP,
        timestamp: Date.now(),
        empireId: empire.id,
        oldLevel,
        newLevel: empire.level,
      } as any);
    }

    return true;
  }

  /**
   * Add currency
   */
  addCurrency(empireId: string, currencyType: CurrencyType, amount: number): boolean {
    const empire = this.empires.get(empireId);
    if (!empire) return false;

    const current = empire.currency.get(currencyType) || 0;
    empire.currency.set(currencyType, current + amount);
    empire.updatedAt = Date.now();
    empire.version++;

    // Fire currency earned event
    this.fireEvent({
      type: GameplayEventType.CURRENCY_EARNED,
      timestamp: Date.now(),
      empireId: empire.id,
      currencyType,
      amount,
      source: 'reward',
    } as any);

    return true;
  }

  /**
   * Spend currency
   */
  spendCurrency(empireId: string, currencyType: CurrencyType, amount: number): boolean {
    const empire = this.empires.get(empireId);
    if (!empire) return false;

    const current = empire.currency.get(currencyType) || 0;
    if (current < amount) return false;

    empire.currency.set(currencyType, current - amount);
    empire.updatedAt = Date.now();
    empire.version++;

    // Fire currency spent event
    this.fireEvent({
      type: GameplayEventType.CURRENCY_SPENT,
      timestamp: Date.now(),
      empireId: empire.id,
      currencyType,
      amount,
      source: 'purchase',
    } as any);

    return true;
  }

  /**
   * Get currency balance
   */
  getCurrencyBalance(empireId: string, currencyType: CurrencyType): number {
    const empire = this.empires.get(empireId);
    return empire?.currency.get(currencyType) || 0;
  }

  /**
   * Add hardware to inventory
   */
  addHardwareToInventory(empireId: string, hardwareType: string, count: number): boolean {
    const empire = this.empires.get(empireId);
    if (!empire) return false;

    const current = empire.hardwareInventory.get(hardwareType) || 0;
    empire.hardwareInventory.set(hardwareType, current + count);
    empire.updatedAt = Date.now();
    empire.version++;

    return true;
  }

  /**
   * Remove hardware from inventory
   */
  removeHardwareFromInventory(empireId: string, hardwareType: string, count: number): boolean {
    const empire = this.empires.get(empireId);
    if (!empire) return false;

    const current = empire.hardwareInventory.get(hardwareType) || 0;
    if (current < count) return false;

    empire.hardwareInventory.set(hardwareType, current - count);
    empire.updatedAt = Date.now();
    empire.version++;

    return true;
  }

  /**
   * Get hardware count in inventory
   */
  getHardwareCount(empireId: string, hardwareType: string): number {
    const empire = this.empires.get(empireId);
    return empire?.hardwareInventory.get(hardwareType) || 0;
  }

  /**
   * Unlock feature
   */
  unlockFeature(empireId: string, featureId: string): boolean {
    const empire = this.empires.get(empireId);
    if (!empire) return false;

    if (empire.unlockedFeatures.has(featureId)) return false;

    empire.unlockedFeatures.add(featureId);
    empire.updatedAt = Date.now();
    empire.version++;

    // Fire feature unlocked event
    this.fireEvent({
      type: GameplayEventType.FEATURE_UNLOCKED,
      timestamp: Date.now(),
      empireId: empire.id,
      unlockId: featureId,
    } as any);

    return true;
  }

  /**
   * Check if feature is unlocked
   */
  isFeatureUnlocked(empireId: string, featureId: string): boolean {
    const empire = this.empires.get(empireId);
    return empire?.unlockedFeatures.has(featureId) || false;
  }

  /**
   * Complete tutorial
   */
  completeTutorial(empireId: string, tutorialId: string): boolean {
    const empire = this.empires.get(empireId);
    if (!empire) return false;

    empire.completedTutorialIds.add(tutorialId);
    empire.updatedAt = Date.now();
    empire.version++;

    return true;
  }

  /**
   * Complete objective
   */
  completeObjective(empireId: string, objectiveId: string): boolean {
    const empire = this.empires.get(empireId);
    if (!empire) return false;

    empire.completedObjectiveIds.add(objectiveId);
    empire.updatedAt = Date.now();
    empire.version++;

    return true;
  }

  /**
   * Create room
   */
  createRoom(empireId: string, name: string): RoomState {
    const room: RoomState = {
      id: `room_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      empireId,
      name,
      
      gridSize: { ...this.config.startingRoomSize },
      
      hardwareIds: [],
      
      config: {
        expandable: true,
        maxExpansions: 10,
        currentExpansions: 0,
      },
      
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
    };

    this.rooms.set(room.id, room);

    // Add to empire
    const empire = this.empires.get(empireId);
    if (empire) {
      empire.roomIds.push(room.id);
      if (!empire.currentRoomId) {
        empire.currentRoomId = room.id;
      }
      empire.updatedAt = Date.now();
      empire.version++;
    }

    // Fire room created event
    this.fireEvent({
      type: GameplayEventType.ROOM_CREATED,
      timestamp: Date.now(),
      empireId,
      roomId: room.id,
    } as any);

    return room;
  }

  /**
   * Get room
   */
  getRoom(roomId: string): RoomState | undefined {
    return this.rooms.get(roomId);
  }

  /**
   * Get rooms for empire
   */
  getRoomsForEmpire(empireId: string): RoomState[] {
    const empire = this.empires.get(empireId);
    if (!empire) return [];

    return empire.roomIds
      .map(id => this.rooms.get(id))
      .filter((room): room is RoomState => room !== undefined);
  }

  /**
   * Expand room
   */
  expandRoom(roomId: string, expansion: { width: number; height: number }): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const oldSize = { ...room.gridSize };

    // Check max size
    const newWidth = room.gridSize.width + expansion.width;
    const newHeight = room.gridSize.height + expansion.height;

    if (newWidth > this.config.maxRoomSize.width || newHeight > this.config.maxRoomSize.height) {
      return false;
    }

    // Check expansion limit
    if (room.config.currentExpansions >= room.config.maxExpansions) {
      return false;
    }

    room.gridSize.width = newWidth;
    room.gridSize.height = newHeight;
    room.config.currentExpansions++;
    room.updatedAt = Date.now();
    room.version++;

    // Update empire
    const empire = this.empires.get(room.empireId);
    if (empire) {
      empire.updatedAt = Date.now();
      empire.version++;
    }

    // Fire room expanded event
    this.fireEvent({
      type: GameplayEventType.ROOM_EXPANDED,
      timestamp: Date.now(),
      empireId: room.empireId,
      roomId: room.id,
      oldSize,
      newSize: { ...room.gridSize },
    } as any);

    return true;
  }

  /**
   * Set current room
   */
  setCurrentRoom(empireId: string, roomId: string): boolean {
    const empire = this.empires.get(empireId);
    if (!empire) return false;

    if (!empire.roomIds.includes(roomId)) return false;

    empire.currentRoomId = roomId;
    empire.updatedAt = Date.now();
    empire.version++;

    return true;
  }

  /**
   * Add hardware to room
   */
  addHardwareToRoom(roomId: string, hardwareId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    room.hardwareIds.push(hardwareId);
    room.updatedAt = Date.now();
    room.version++;

    return true;
  }

  /**
   * Remove hardware from room
   */
  removeHardwareFromRoom(roomId: string, hardwareId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const index = room.hardwareIds.indexOf(hardwareId);
    if (index === -1) return false;

    room.hardwareIds.splice(index, 1);
    room.updatedAt = Date.now();
    room.version++;

    return true;
  }

  /**
   * Register event listener
   */
  on(eventType: GameplayEventType, listener: GameplayEventListener): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(listener);
  }

  /**
   * Unregister event listener
   */
  off(eventType: GameplayEventType, listener: GameplayEventListener): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Fire event to listeners
   */
  private fireEvent(event: GameplayEvent): void {
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
  updateConfig(config: Partial<GameplayConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get configuration
   */
  getConfig(): GameplayConfig {
    return { ...this.config };
  }
}
