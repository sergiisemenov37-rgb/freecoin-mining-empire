/**
 * Economy System
 * Manages currency, purchasing, pricing, and transactions
 * Integrates with empire system via events
 */

import type {
  PricingModel,
  Transaction,
  GameplayEvent,
  GameplayEventListener,
  GameplayConfig,
} from './types';
import {
  GameplayEventType,
  CurrencyType,
} from './types';
import { EmpireSystem } from './EmpireSystem';

/**
 * Economy system class
 */
export class EconomySystem {
  private pricingModels: Map<string, PricingModel>;
  private transactions: Map<string, Transaction>;
  private eventListeners: Map<GameplayEventType, Set<GameplayEventListener>>;
  private config: GameplayConfig;
  private empireSystem: EmpireSystem;

  constructor(
    empireSystem: EmpireSystem,
    config?: Partial<GameplayConfig>
  ) {
    this.pricingModels = new Map();
    this.transactions = new Map();
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

    this.initializeDefaultPricingModels();
  }

  /**
   * Initialize default pricing models
   */
  private initializeDefaultPricingModels(): void {
    // GPU pricing
    this.pricingModels.set('gpu_basic', {
      hardwareType: 'gpu_basic',
      basePrice: 50,
      currencyType: CurrencyType.FREECOIN,
      rarityMultipliers: {
        common: 1.0,
        uncommon: 1.5,
        rare: 2.5,
        epic: 5.0,
        legendary: 10.0,
        mythic: 25.0,
      },
      qualityMultipliers: {
        poor: 0.7,
        fair: 0.85,
        good: 1.0,
        excellent: 1.25,
        perfect: 1.5,
      },
      supplyDemandFactor: 1.0,
      discountPercent: 0,
    });

    this.pricingModels.set('gpu_standard', {
      hardwareType: 'gpu_standard',
      basePrice: 100,
      currencyType: CurrencyType.FREECOIN,
      rarityMultipliers: {
        common: 1.0,
        uncommon: 1.5,
        rare: 2.5,
        epic: 5.0,
        legendary: 10.0,
        mythic: 25.0,
      },
      qualityMultipliers: {
        poor: 0.7,
        fair: 0.85,
        good: 1.0,
        excellent: 1.25,
        perfect: 1.5,
      },
      supplyDemandFactor: 1.0,
      discountPercent: 0,
    });

    // ASIC pricing
    this.pricingModels.set('asic_basic', {
      hardwareType: 'asic_basic',
      basePrice: 75,
      currencyType: CurrencyType.FREECOIN,
      rarityMultipliers: {
        common: 1.0,
        uncommon: 1.5,
        rare: 2.5,
        epic: 5.0,
        legendary: 10.0,
        mythic: 25.0,
      },
      qualityMultipliers: {
        poor: 0.7,
        fair: 0.85,
        good: 1.0,
        excellent: 1.25,
        perfect: 1.5,
      },
      supplyDemandFactor: 1.0,
      discountPercent: 0,
    });

    // Battery pricing
    this.pricingModels.set('battery_small', {
      hardwareType: 'battery_small',
      basePrice: 30,
      currencyType: CurrencyType.FREECOIN,
      rarityMultipliers: {
        common: 1.0,
        uncommon: 1.5,
        rare: 2.5,
        epic: 5.0,
        legendary: 10.0,
        mythic: 25.0,
      },
      qualityMultipliers: {
        poor: 0.7,
        fair: 0.85,
        good: 1.0,
        excellent: 1.25,
        perfect: 1.5,
      },
      supplyDemandFactor: 1.0,
      discountPercent: 0,
    });

    // Solar panel pricing
    this.pricingModels.set('solar_basic', {
      hardwareType: 'solar_basic',
      basePrice: 40,
      currencyType: CurrencyType.FREECOIN,
      rarityMultipliers: {
        common: 1.0,
        uncommon: 1.5,
        rare: 2.5,
        epic: 5.0,
        legendary: 10.0,
        mythic: 25.0,
      },
      qualityMultipliers: {
        poor: 0.7,
        fair: 0.85,
        good: 1.0,
        excellent: 1.25,
        perfect: 1.5,
      },
      supplyDemandFactor: 1.0,
      discountPercent: 0,
    });

    // Cooling unit pricing
    this.pricingModels.set('cooling_fan', {
      hardwareType: 'cooling_fan',
      basePrice: 20,
      currencyType: CurrencyType.FREECOIN,
      rarityMultipliers: {
        common: 1.0,
        uncommon: 1.5,
        rare: 2.5,
        epic: 5.0,
        legendary: 10.0,
        mythic: 25.0,
      },
      qualityMultipliers: {
        poor: 0.7,
        fair: 0.85,
        good: 1.0,
        excellent: 1.25,
        perfect: 1.5,
      },
      supplyDemandFactor: 1.0,
      discountPercent: 0,
    });
  }

  /**
   * Register pricing model
   */
  registerPricingModel(pricingModel: PricingModel): void {
    this.pricingModels.set(pricingModel.hardwareType, pricingModel);
  }

  /**
   * Get pricing model
   */
  getPricingModel(hardwareType: string): PricingModel | undefined {
    return this.pricingModels.get(hardwareType);
  }

  /**
   * Calculate price
   */
  calculatePrice(
    hardwareType: string,
    rarity?: string,
    quality?: string
  ): number {
    const pricingModel = this.pricingModels.get(hardwareType);
    if (!pricingModel) return 0;

    let price = pricingModel.basePrice;

    // Apply rarity multiplier
    if (rarity && pricingModel.rarityMultipliers[rarity]) {
      price *= pricingModel.rarityMultipliers[rarity];
    }

    // Apply quality multiplier
    if (quality && pricingModel.qualityMultipliers[quality]) {
      price *= pricingModel.qualityMultipliers[quality];
    }

    // Apply supply/demand factor
    price *= pricingModel.supplyDemandFactor;

    // Apply discount
    price *= (1 - pricingModel.discountPercent / 100);

    return Math.floor(price);
  }

  /**
   * Purchase hardware
   */
  purchaseHardware(
    empireId: string,
    hardwareType: string,
    rarity?: string,
    quality?: string
  ): { success: boolean; transactionId?: string; price?: number } {
    const price = this.calculatePrice(hardwareType, rarity, quality);
    const pricingModel = this.pricingModels.get(hardwareType);
    
    if (!pricingModel) {
      return { success: false };
    }

    // Check if empire has enough currency
    const balance = this.empireSystem.getCurrencyBalance(empireId, pricingModel.currencyType);
    if (balance < price) {
      return { success: false };
    }

    // Spend currency
    const spent = this.empireSystem.spendCurrency(empireId, pricingModel.currencyType, price);
    if (!spent) {
      return { success: false };
    }

    // Add hardware to inventory
    this.empireSystem.addHardwareToInventory(empireId, hardwareType, 1);

    // Create transaction
    const transaction: Transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type: 'purchase',
      currencyType: pricingModel.currencyType,
      amount: -price,
      itemType: 'hardware',
      itemId: hardwareType,
      itemQuantity: 1,
      timestamp: Date.now(),
      empireId,
    };

    this.transactions.set(transaction.id, transaction);

    // Fire transaction completed event
    this.fireEvent({
      type: GameplayEventType.TRANSACTION_COMPLETED,
      timestamp: Date.now(),
      empireId,
      transactionId: transaction.id,
    } as any);

    return { success: true, transactionId: transaction.id, price };
  }

  /**
   * Get transaction
   */
  getTransaction(transactionId: string): Transaction | undefined {
    return this.transactions.get(transactionId);
  }

  /**
   * Get transactions for empire
   */
  getTransactionsForEmpire(empireId: string): Transaction[] {
    return Array.from(this.transactions.values()).filter(
      txn => txn.empireId === empireId
    );
  }

  /**
   * Update pricing model
   */
  updatePricingModel(hardwareType: string, updates: Partial<PricingModel>): boolean {
    const pricingModel = this.pricingModels.get(hardwareType);
    if (!pricingModel) return false;

    Object.assign(pricingModel, updates);
    return true;
  }

  /**
   * Set discount
   */
  setDiscount(hardwareType: string, discountPercent: number): boolean {
    const pricingModel = this.pricingModels.get(hardwareType);
    if (!pricingModel) return false;

    pricingModel.discountPercent = Math.max(0, Math.min(100, discountPercent));
    return true;
  }

  /**
   * Set supply/demand factor
   */
  setSupplyDemandFactor(hardwareType: string, factor: number): boolean {
    const pricingModel = this.pricingModels.get(hardwareType);
    if (!pricingModel) return false;

    pricingModel.supplyDemandFactor = Math.max(0.1, Math.min(10, factor));
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
