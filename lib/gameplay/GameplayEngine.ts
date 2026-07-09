/**
 * Gameplay Engine
 * Central coordinator for all gameplay systems
 * Integrates with Placement, Simulation, Network, and Hardware engines via events
 */

import { TutorialSystem } from './TutorialSystem';
import { ObjectiveSystem } from './ObjectiveSystem';
import { EmpireSystem } from './EmpireSystem';
import { EconomySystem } from './EconomySystem';
import { MiningSystem } from './MiningSystem';
import { RoomSystem } from './RoomSystem';
import { HardwareManager } from '@/lib/hardware/HardwareManager';
import { VERTICAL_SLICE_TUTORIAL, VERTICAL_SLICE_OBJECTIVES } from './tutorialContent';
import type { GameplayConfig, GameplayEvent } from './types';
import { GameplayEventType } from './types';

/**
 * Gameplay engine class
 */
export class GameplayEngine {
  private tutorialSystem: TutorialSystem;
  private objectiveSystem: ObjectiveSystem;
  private empireSystem: EmpireSystem;
  private economySystem: EconomySystem;
  private miningSystem: MiningSystem;
  private roomSystem: RoomSystem;
  private hardwareManager: HardwareManager;
  private config: GameplayConfig;
  private currentEmpireId: string | null = null;
  private currentRoomId: string | null = null;
  private isSimulationRunning: boolean = false;

  constructor(
    hardwareManager: HardwareManager,
    config?: Partial<GameplayConfig>
  ) {
    this.hardwareManager = hardwareManager;
    this.config = {
      enableTutorial: true,
      autoStartTutorial: 'tutorial_vertical_slice',
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

    // Initialize systems
    this.empireSystem = new EmpireSystem(this.config);
    this.roomSystem = new RoomSystem(this.empireSystem, this.config);
    this.economySystem = new EconomySystem(this.empireSystem, this.config);
    this.miningSystem = new MiningSystem(this.empireSystem, this.hardwareManager, this.config);
    this.objectiveSystem = new ObjectiveSystem(this.config);
    this.tutorialSystem = new TutorialSystem(this.config);

    // Register tutorial and objectives
    this.tutorialSystem.registerTutorial(VERTICAL_SLICE_TUTORIAL);
    for (const objective of VERTICAL_SLICE_OBJECTIVES) {
      this.objectiveSystem.registerObjective(objective);
    }

    // Setup event integration
    this.setupEventIntegration();
  }

  /**
   * Setup event integration between systems
   */
  private setupEventIntegration(): void {
    // Tutorial -> Objective integration
    this.tutorialSystem.on(GameplayEventType.TUTORIAL_COMPLETED, (event) => {
      const tutorialEvent = event as any;
      this.empireSystem.completeTutorial(this.currentEmpireId || '', tutorialEvent.tutorialId);
    });

    // Objective -> Empire integration
    this.objectiveSystem.on(GameplayEventType.OBJECTIVE_COMPLETED, (event) => {
      const objectiveEvent = event as any;
      this.empireSystem.completeObjective(this.currentEmpireId || '', objectiveEvent.objectiveId);
      this.empireSystem.addExperience(this.currentEmpireId || '', 50);
    });

    // Economy -> Empire integration (handled by EconomySystem)

    // Mining -> Empire integration (handled by MiningSystem)

    // Room -> Empire integration (handled by RoomSystem)

    // Forward events to all systems
    this.forwardEvents();
  }

  /**
   * Forward events to all systems
   */
  private forwardEvents(): void {
    // Tutorial system handles its own events
    // Objective system handles its own events
    // Empire system fires events that other systems listen to
    // Economy system fires events that other systems listen to
    // Mining system fires events that other systems listen to
    // Room system fires events that other systems listen to
  }

  /**
   * Start new game
   */
  startNewGame(ownerId: string, empireName: string): string {
    // Create empire
    const empire = this.empireSystem.createEmpire(ownerId, empireName);
    this.currentEmpireId = empire.id;

    // Create starting room
    const room = this.roomSystem.createRoom(empire.id, 'Main Room');
    this.currentRoomId = room.id;

    // Give starter hardware
    this.giveStarterHardware(empire.id);

    // Register first objective
    this.objectiveSystem.unlockObjective('obj_place_solar');

    // Start tutorial if enabled
    if (this.config.enableTutorial && this.config.autoStartTutorial) {
      this.tutorialSystem.startTutorial(this.config.autoStartTutorial);
    }

    // Fire empire created event (already fired by EmpireSystem)
    // Fire room created event (already fired by RoomSystem)

    return empire.id;
  }

  /**
   * Give starter hardware
   */
  private giveStarterHardware(empireId: string): void {
    this.empireSystem.addHardwareToInventory(empireId, 'solar_basic', 1);
    this.empireSystem.addHardwareToInventory(empireId, 'battery_small', 1);
    this.empireSystem.addHardwareToInventory(empireId, 'cooling_fan', 1);

    // Fire event for tutorial
    this.tutorialSystem.handleEvent({
      type: 'starter_hardware_received' as any,
      timestamp: Date.now(),
    } as GameplayEvent);
  }

  /**
   * Place hardware
   */
  placeHardware(hardwareType: string, position: { x: number; y: number }): boolean {
    if (!this.currentEmpireId || !this.currentRoomId) return false;

    // Check if player has hardware in inventory
    const count = this.empireSystem.getHardwareCount(this.currentEmpireId, hardwareType);
    if (count <= 0) return false;

    // Remove from inventory
    this.empireSystem.removeHardwareFromInventory(this.currentEmpireId, hardwareType, 1);

    // Create hardware instance
    const instance = this.hardwareManager.createInstance(hardwareType, this.currentEmpireId, {});

    // Install at position
    this.hardwareManager.installInstance(instance.id, position);

    // Add to room
    this.empireSystem.addHardwareToRoom(this.currentRoomId, instance.id);

    // Fire event for tutorial/objectives
    if (hardwareType === 'solar_basic') {
      this.tutorialSystem.handleEvent({
        type: 'hardware_placed' as any,
        timestamp: Date.now(),
      } as GameplayEvent);
    }

    if (hardwareType === 'gpu_basic' || hardwareType === 'gpu_standard') {
      this.tutorialSystem.handleEvent({
        type: 'gpu_placed' as any,
        timestamp: Date.now(),
      } as GameplayEvent);
    }

    // Check if power network is complete
    this.checkPowerNetworkComplete();

    return true;
  }

  /**
   * Check if power network is complete
   */
  private checkPowerNetworkComplete(): void {
    if (!this.currentRoomId) return;

    const room = this.roomSystem.getRoom(this.currentRoomId);
    if (!room) return;

    // Check if room has solar, battery, and cooling
    const hasSolar = room.hardwareIds.some(id => {
      const hw = this.hardwareManager.getInstance(id);
      return hw?.category === 'solar_panel';
    });

    const hasBattery = room.hardwareIds.some(id => {
      const hw = this.hardwareManager.getInstance(id);
      return hw?.category === 'battery';
    });

    const hasCooling = room.hardwareIds.some(id => {
      const hw = this.hardwareManager.getInstance(id);
      return hw?.category === 'cooling_unit';
    });

    if (hasSolar && hasBattery && hasCooling) {
      this.tutorialSystem.handleEvent({
        type: 'power_network_complete' as any,
        timestamp: Date.now(),
      } as GameplayEvent);
    }
  }

  /**
   * Purchase hardware
   */
  purchaseHardware(hardwareType: string): boolean {
    if (!this.currentEmpireId) return false;

    const result = this.economySystem.purchaseHardware(this.currentEmpireId, hardwareType);

    if (result.success && (hardwareType === 'gpu_basic' || hardwareType === 'gpu_standard')) {
      // Fire event for tutorial/objectives
      this.tutorialSystem.handleEvent({
        type: 'gpu_purchased' as any,
        timestamp: Date.now(),
      } as GameplayEvent);
    }

    return result.success;
  }

  /**
   * Expand room
   */
  expandRoom(expansion: { width: number; height: number }): boolean {
    if (!this.currentRoomId) return false;

    const cost = this.roomSystem.calculateExpansionCost(this.currentRoomId, expansion);
    if (!this.currentEmpireId) return false;
    const balance = this.empireSystem.getCurrencyBalance(this.currentEmpireId, 'freecoin' as any);

    if (balance < cost) return false;

    // Spend currency
    this.empireSystem.spendCurrency(this.currentEmpireId, 'freecoin' as any, cost);

    // Expand room
    const success = this.roomSystem.expandRoom(this.currentRoomId, expansion);

    if (success) {
      // Fire event for tutorial/objectives
      this.tutorialSystem.handleEvent({
        type: 'room_expanded' as any,
        timestamp: Date.now(),
      } as GameplayEvent);
    }

    return success;
  }

  /**
   * Start simulation
   */
  startSimulation(): boolean {
    if (!this.currentEmpireId || !this.currentRoomId) return false;

    const room = this.roomSystem.getRoom(this.currentRoomId);
    if (!room) return false;

    // Get GPU hardware IDs
    const gpuIds = room.hardwareIds.filter(id => {
      const hw = this.hardwareManager.getInstance(id);
      return hw?.category === 'gpu' || hw?.category === 'asic';
    });

    if (gpuIds.length === 0) return false;

    // Start mining session
    const result = this.miningSystem.startMiningSession(this.currentEmpireId, this.currentRoomId, gpuIds);

    if (result.success) {
      this.isSimulationRunning = true;

      // Fire event for tutorial/objectives
      this.tutorialSystem.handleEvent({
        type: 'simulation_started' as any,
        timestamp: Date.now(),
      } as GameplayEvent);

      // Track first coin
      let firstCoinMined = false;
      const checkFirstCoin = () => {
        if (firstCoinMined) return;
        const session = this.miningSystem.getActiveMiningSession();
        if (session && session.totalMined >= 1) {
          firstCoinMined = true;
          this.tutorialSystem.handleEvent({
            type: 'first_coin_mined' as any,
            timestamp: Date.now(),
          } as GameplayEvent);
        }
      };

      // Check periodically
      const checkInterval = setInterval(() => {
        if (!this.isSimulationRunning) {
          clearInterval(checkInterval);
          return;
        }
        checkFirstCoin();
      }, 1000);
    }

    return result.success;
  }

  /**
   * Stop simulation
   */
  stopSimulation(): boolean {
    const session = this.miningSystem.getActiveMiningSession();
    if (!session) return false;

    const success = this.miningSystem.stopMiningSession(session.id);
    this.isSimulationRunning = false;

    return success;
  }

  /**
   * Get current empire
   */
  getCurrentEmpire() {
    if (!this.currentEmpireId) return null;
    return this.empireSystem.getEmpire(this.currentEmpireId);
  }

  /**
   * Get current room
   */
  getCurrentRoom() {
    if (!this.currentRoomId) return null;
    return this.roomSystem.getRoom(this.currentRoomId);
  }

  /**
   * Get tutorial system
   */
  getTutorialSystem(): TutorialSystem {
    return this.tutorialSystem;
  }

  /**
   * Get objective system
   */
  getObjectiveSystem(): ObjectiveSystem {
    return this.objectiveSystem;
  }

  /**
   * Get economy system
   */
  getEconomySystem(): EconomySystem {
    return this.economySystem;
  }

  /**
   * Get mining system
   */
  getMiningSystem(): MiningSystem {
    return this.miningSystem;
  }

  /**
   * Get room system
   */
  getRoomSystem(): RoomSystem {
    return this.roomSystem;
  }

  /**
   * Get empire system
   */
  getEmpireSystem(): EmpireSystem {
    return this.empireSystem;
  }

  /**
   * Get hardware manager
   */
  getHardwareManager(): HardwareManager {
    return this.hardwareManager;
  }

  /**
   * Is simulation running
   */
  isSimulationActive(): boolean {
    return this.isSimulationRunning;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<GameplayConfig>): void {
    this.config = { ...this.config, ...config };
    this.tutorialSystem.updateConfig(config);
    this.objectiveSystem.updateConfig(config);
    this.empireSystem.updateConfig(config);
    this.economySystem.updateConfig(config);
    this.miningSystem.updateConfig(config);
    this.roomSystem.updateConfig(config);
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
    this.miningSystem.destroy();
    this.currentEmpireId = null;
    this.currentRoomId = null;
    this.isSimulationRunning = false;
  }
}
