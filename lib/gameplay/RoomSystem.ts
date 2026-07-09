/**
 * Room Management System
 * Manages room creation, expansion, and grid integration
 * Integrates with Placement engine via events
 */

import type {
  RoomState,
  GameplayEvent,
  GameplayEventListener,
  GameplayConfig,
} from './types';
import {
  GameplayEventType,
} from './types';
import { EmpireSystem } from './EmpireSystem';

/**
 * Room system class
 */
export class RoomSystem {
  private eventListeners: Map<GameplayEventType, Set<GameplayEventListener>>;
  private config: GameplayConfig;
  private empireSystem: EmpireSystem;

  constructor(
    empireSystem: EmpireSystem,
    config?: Partial<GameplayConfig>
  ) {
    this.eventListeners = new Map();
    this.empireSystem = empireSystem;
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
   * Create room
   */
  createRoom(empireId: string, name: string): RoomState {
    const room = this.empireSystem.createRoom(empireId, name);

    // In a real implementation, this would:
    // 1. Create a grid in the Placement engine
    // 2. Initialize the grid with the room size
    // 3. Register with the Placement engine
    // 4. Subscribe to placement events

    console.log(`[Room System] Created room ${room.id} with grid size ${room.gridSize.width}x${room.gridSize.height}`);

    return room;
  }

  /**
   * Expand room
   */
  expandRoom(roomId: string, expansion: { width: number; height: number }): boolean {
    const room = this.empireSystem.getRoom(roomId);
    if (!room) return false;

    const success = this.empireSystem.expandRoom(roomId, expansion);

    if (success) {
      // In a real implementation, this would:
      // 1. Update the grid in the Placement engine
      // 2. Expand the grid with the new size
      // 3. Notify the Placement engine of the change

      console.log(`[Room System] Expanded room ${roomId} to ${room.gridSize.width}x${room.gridSize.height}`);
    }

    return success;
  }

  /**
   * Get room
   */
  getRoom(roomId: string): RoomState | undefined {
    return this.empireSystem.getRoom(roomId);
  }

  /**
   * Get rooms for empire
   */
  getRoomsForEmpire(empireId: string): RoomState[] {
    return this.empireSystem.getRoomsForEmpire(empireId);
  }

  /**
   * Set current room
   */
  setCurrentRoom(empireId: string, roomId: string): boolean {
    return this.empireSystem.setCurrentRoom(empireId, roomId);
  }

  /**
   * Get current room for empire
   */
  getCurrentRoom(empireId: string): RoomState | undefined {
    const empire = this.empireSystem.getEmpire(empireId);
    if (!empire || !empire.currentRoomId) return undefined;
    return this.empireSystem.getRoom(empire.currentRoomId);
  }

  /**
   * Calculate expansion cost
   */
  calculateExpansionCost(roomId: string, expansion: { width: number; height: number }): number {
    const room = this.empireSystem.getRoom(roomId);
    if (!room) return 0;

    // Cost formula: 10 FreeCoin per tile
    const tileCount = expansion.width * expansion.height;
    const baseCost = tileCount * 10;

    // Expansion multiplier (more expensive as you expand)
    const expansionMultiplier = 1 + (room.config.currentExpansions * 0.1);

    return Math.floor(baseCost * expansionMultiplier);
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
