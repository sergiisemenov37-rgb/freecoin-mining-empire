/**
 * Mining/Reward System
 * Manages mining sessions, FreeCoin generation, and rewards
 * Integrates with hardware, simulation, and empire systems via events
 */

import type {
  MiningConfig,
  MiningSession,
  GameplayEvent,
  GameplayEventListener,
  GameplayConfig,
} from './types';
import {
  GameplayEventType,
  CurrencyType,
} from './types';
import { EmpireSystem } from './EmpireSystem';
import { HardwareManager } from '@/lib/hardware/HardwareManager';

/**
 * Mining system class
 */
export class MiningSystem {
  private miningSessions: Map<string, MiningSession>;
  private activeSessionId: string | null = null;
  private miningInterval: NodeJS.Timeout | null = null;
  private eventListeners: Map<GameplayEventType, Set<GameplayEventListener>>;
  private config: GameplayConfig;
  private empireSystem: EmpireSystem;
  private hardwareManager: HardwareManager;

  constructor(
    empireSystem: EmpireSystem,
    hardwareManager: HardwareManager,
    config?: Partial<GameplayConfig>
  ) {
    this.miningSessions = new Map();
    this.eventListeners = new Map();
    this.empireSystem = empireSystem;
    this.hardwareManager = hardwareManager;
    this.config = {
      enableTutorial: true,
      autoStartTutorial: null,
      enableObjectives: true,
      autoAcceptObjectives: true,
      startingCurrency: { freecoin: 100, premium: 0 },
      miningConfig: {
        baseRate: 0.1,
        rarityMultipliers: {
          common: 1.0,
          uncommon: 1.1,
          rare: 1.25,
          epic: 1.5,
          legendary: 1.75,
          mythic: 2.0,
        },
        qualityMultipliers: {
          poor: 0.8,
          fair: 0.9,
          good: 1.0,
          excellent: 1.1,
          perfect: 1.2,
        },
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
   * Start mining session
   */
  startMiningSession(
    empireId: string,
    roomId: string,
    hardwareIds: string[]
  ): { success: boolean; sessionId?: string } {
    // Check if there's already an active session
    if (this.activeSessionId) {
      return { success: false };
    }

    // Validate hardware exists
    for (const hardwareId of hardwareIds) {
      const hardware = this.hardwareManager.getInstance(hardwareId);
      if (!hardware) {
        return { success: false };
      }
    }

    // Create mining session
    const session: MiningSession = {
      id: `mining_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      empireId,
      roomId,
      hardwareIds,
      startTime: Date.now(),
      totalMined: 0,
      averageRate: 0,
      active: true,
    };

    this.miningSessions.set(session.id, session);
    this.activeSessionId = session.id;

    // Fire mining started event
    this.fireEvent({
      type: GameplayEventType.MINING_STARTED,
      timestamp: Date.now(),
      sessionId: session.id,
      roomId,
      hardwareIds,
    } as any);

    // Start mining interval
    this.startMiningInterval(session);

    return { success: true, sessionId: session.id };
  }

  /**
   * Stop mining session
   */
  stopMiningSession(sessionId: string): boolean {
    const session = this.miningSessions.get(sessionId);
    if (!session || !session.active) return false;

    session.active = false;
    session.endTime = Date.now();

    if (this.activeSessionId === sessionId) {
      this.activeSessionId = null;
    }

    // Stop mining interval
    if (this.miningInterval) {
      clearInterval(this.miningInterval);
      this.miningInterval = null;
    }

    // Fire mining stopped event
    this.fireEvent({
      type: GameplayEventType.MINING_STOPPED,
      timestamp: Date.now(),
      sessionId,
    } as any);

    return true;
  }

  /**
   * Start mining interval
   */
  private startMiningInterval(session: MiningSession): void {
    this.miningInterval = setInterval(() => {
      this.processMiningTick(session);
    }, 1000); // Process every second
  }

  /**
   * Process mining tick
   */
  private processMiningTick(session: MiningSession): void {
    if (!session.active) return;

    // Calculate mining rate
    const rate = this.calculateMiningRate(session.hardwareIds);
    
    // Apply difficulty
    const adjustedRate = rate / this.config.miningConfig.difficulty;

    // Mine FreeCoin
    const mined = adjustedRate;
    session.totalMined += mined;
    session.averageRate = session.totalMined / ((Date.now() - session.startTime) / 1000);

    // Add currency to empire
    this.empireSystem.addCurrency(session.empireId, CurrencyType.FREECOIN, mined);

    // Fire mining reward event
    this.fireEvent({
      type: GameplayEventType.MINING_REWARD,
      timestamp: Date.now(),
      sessionId: session.id,
      amount: mined,
      rate,
    } as any);

    // Adjust difficulty
    this.adjustDifficulty();
  }

  /**
   * Calculate mining rate
   */
  private calculateMiningRate(hardwareIds: string[]): number {
    let totalRate = 0;

    for (const hardwareId of hardwareIds) {
      const hardware = this.hardwareManager.getInstance(hardwareId);
      if (!hardware) continue;

      // Only GPUs and ASICs mine
      if (hardware.category !== 'gpu' && hardware.category !== 'asic') continue;

      // Base rate
      let rate = this.config.miningConfig.baseRate;

      // Apply rarity multiplier
      const rarityMultiplier = this.config.miningConfig.rarityMultipliers[hardware.rarity] || 1.0;
      rate *= rarityMultiplier;

      // Apply quality multiplier
      const qualityMultiplier = this.config.miningConfig.qualityMultipliers[hardware.quality] || 1.0;
      rate *= qualityMultiplier;

      // Apply efficiency
      rate *= hardware.efficiency;

      // Apply network efficiency bonus
      rate *= this.config.miningConfig.networkEfficiencyBonus;

      totalRate += rate;
    }

    return totalRate;
  }

  /**
   * Adjust difficulty
   */
  private adjustDifficulty(): void {
    // Gradually increase difficulty over time
    this.config.miningConfig.difficulty += this.config.miningConfig.difficultyAdjustmentRate;
  }

  /**
   * Get mining session
   */
  getMiningSession(sessionId: string): MiningSession | undefined {
    return this.miningSessions.get(sessionId);
  }

  /**
   * Get active mining session
   */
  getActiveMiningSession(): MiningSession | undefined {
    if (!this.activeSessionId) return undefined;
    return this.miningSessions.get(this.activeSessionId);
  }

  /**
   * Get mining sessions for empire
   */
  getMiningSessionsForEmpire(empireId: string): MiningSession[] {
    return Array.from(this.miningSessions.values()).filter(
      session => session.empireId === empireId
    );
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

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.miningInterval) {
      clearInterval(this.miningInterval);
      this.miningInterval = null;
    }
    this.miningSessions.clear();
    this.activeSessionId = null;
  }
}
