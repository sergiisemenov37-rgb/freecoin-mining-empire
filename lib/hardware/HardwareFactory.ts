/**
 * Hardware Factory
 * Creates unique hardware instances from definitions
 * Supports rarity, manufacturer, firmware, and quality systems
 */

import type {
  HardwareInstance,
  HardwareType,
  Rarity,
  Quality,
  Manufacturer,
  FirmwareVersion,
  HardwareConfig,
} from './types';
import {
  generateHardwareId,
  generateSerialNumber,
  calculateMaintenanceStatus,
  Rarity as RarityEnum,
  Quality as QualityEnum,
  MaintenanceStatus as MaintenanceStatusEnum,
  DEFAULT_HARDWARE_CONFIG,
  HardwareCategory,
} from './types';
import { getHardwareDefinition } from './definitions';

/**
 * Factory options
 */
export interface FactoryOptions {
  type: HardwareType;
  manufacturer?: string;
  rarity?: Rarity;
  quality?: Quality;
  firmwareVersion?: FirmwareVersion;
  ownerId: string;
  configuration?: Record<string, unknown>;
}

/**
 * Hardware factory class
 */
export class HardwareFactory {
  private config: HardwareConfig;
  private manufacturers: Map<string, Manufacturer>;

  constructor(config?: Partial<HardwareConfig>) {
    this.config = { ...DEFAULT_HARDWARE_CONFIG, ...config };
    this.manufacturers = new Map();
    this.initializeManufacturers();
  }

  /**
   * Initialize default manufacturers
   */
  private initializeManufacturers(): void {
    const defaultManufacturers: Manufacturer[] = [
      {
        id: 'mfg_generic',
        name: 'Generic',
        country: 'Unknown',
        reputation: 50,
        supportedCategories: [HardwareCategory.GPU, HardwareCategory.ASIC, HardwareCategory.CPU_CLUSTER, HardwareCategory.BATTERY, HardwareCategory.GENERATOR, HardwareCategory.SOLAR_PANEL, HardwareCategory.COOLING_UNIT, HardwareCategory.NETWORK_DEVICE, HardwareCategory.ROBOT_STATION],
        qualityModifier: 1.0,
        efficiencyModifier: 1.0,
        durabilityModifier: 1.0,
        createdAt: Date.now(),
      },
      {
        id: 'mfg_nvidia',
        name: 'Nvidia',
        country: 'USA',
        reputation: 90,
        supportedCategories: [HardwareCategory.GPU, HardwareCategory.CPU_CLUSTER, HardwareCategory.NETWORK_DEVICE],
        qualityModifier: 1.1,
        efficiencyModifier: 1.15,
        durabilityModifier: 1.1,
        createdAt: Date.now(),
      },
      {
        id: 'mfg_amd',
        name: 'AMD',
        country: 'USA',
        reputation: 85,
        supportedCategories: [HardwareCategory.GPU, HardwareCategory.CPU_CLUSTER],
        qualityModifier: 1.05,
        efficiencyModifier: 1.1,
        durabilityModifier: 1.05,
        createdAt: Date.now(),
      },
      {
        id: 'mfg_intel',
        name: 'Intel',
        country: 'USA',
        reputation: 88,
        supportedCategories: [HardwareCategory.CPU_CLUSTER, HardwareCategory.NETWORK_DEVICE],
        qualityModifier: 1.08,
        efficiencyModifier: 1.12,
        durabilityModifier: 1.08,
        createdAt: Date.now(),
      },
      {
        id: 'mfg_tesla',
        name: 'Tesla',
        country: 'USA',
        reputation: 95,
        supportedCategories: [HardwareCategory.BATTERY, HardwareCategory.SOLAR_PANEL],
        qualityModifier: 1.15,
        efficiencyModifier: 1.2,
        durabilityModifier: 1.15,
        createdAt: Date.now(),
      },
      {
        id: 'mfg_bitmain',
        name: 'Bitmain',
        country: 'China',
        reputation: 80,
        supportedCategories: [HardwareCategory.ASIC],
        qualityModifier: 1.0,
        efficiencyModifier: 1.1,
        durabilityModifier: 0.95,
        createdAt: Date.now(),
      },
      {
        id: 'mfg_caterpillar',
        name: 'Caterpillar',
        country: 'USA',
        reputation: 85,
        supportedCategories: [HardwareCategory.GENERATOR],
        qualityModifier: 1.1,
        efficiencyModifier: 1.0,
        durabilityModifier: 1.2,
        createdAt: Date.now(),
      },
      {
        id: 'mfg_sunpower',
        name: 'SunPower',
        country: 'USA',
        reputation: 90,
        supportedCategories: [HardwareCategory.SOLAR_PANEL],
        qualityModifier: 1.12,
        efficiencyModifier: 1.15,
        durabilityModifier: 1.1,
        createdAt: Date.now(),
      },
      {
        id: 'mfg_noctua',
        name: 'Noctua',
        country: 'Austria',
        reputation: 92,
        supportedCategories: [HardwareCategory.COOLING_UNIT],
        qualityModifier: 1.15,
        efficiencyModifier: 1.1,
        durabilityModifier: 1.15,
        createdAt: Date.now(),
      },
      {
        id: 'mfg_cisco',
        name: 'Cisco',
        country: 'USA',
        reputation: 90,
        supportedCategories: [HardwareCategory.NETWORK_DEVICE],
        qualityModifier: 1.1,
        efficiencyModifier: 1.05,
        durabilityModifier: 1.1,
        createdAt: Date.now(),
      },
      {
        id: 'mfg_boston_dynamics',
        name: 'Boston Dynamics',
        country: 'USA',
        reputation: 95,
        supportedCategories: [HardwareCategory.ROBOT_STATION],
        qualityModifier: 1.2,
        efficiencyModifier: 1.15,
        durabilityModifier: 1.2,
        createdAt: Date.now(),
      },
    ];

    for (const mfg of defaultManufacturers) {
      this.manufacturers.set(mfg.id, mfg);
    }
  }

  /**
   * Create hardware instance
   */
  createInstance(options: FactoryOptions): HardwareInstance {
    const definition = getHardwareDefinition(options.type);
    if (!definition) {
      throw new Error(`Hardware definition not found for type: ${options.type}`);
    }

    // Determine rarity
    const rarity = options.rarity || this.rollRarity();

    // Determine quality
    const quality = options.quality || this.rollQuality();

    // Determine manufacturer
    const manufacturer = options.manufacturer || this.selectManufacturer(definition);

    // Get manufacturer data
    const manufacturerData = this.manufacturers.get(manufacturer) || this.manufacturers.get('mfg_generic')!;

    // Determine firmware version
    const firmwareVersion = options.firmwareVersion || { ...this.config.defaultFirmwareVersion };

    // Get rarity multipliers
    const rarityMultipliers = definition.rarityMultipliers[rarity];

    // Calculate stats with multipliers
    const efficiencyMultiplier = rarityMultipliers.efficiency * manufacturerData.efficiencyModifier;
    const durabilityMultiplier = rarityMultipliers.durability * manufacturerData.durabilityModifier;
    const powerConsumptionMultiplier = rarityMultipliers.powerConsumption;
    const powerGenerationMultiplier = rarityMultipliers.powerGeneration;

    // Apply quality modifier
    const qualityModifier = this.getQualityModifier(quality);

    const efficiency = definition.baseEfficiency * efficiencyMultiplier * qualityModifier;
    const durability = definition.baseDurability * durabilityMultiplier * qualityModifier;
    const powerConsumption = definition.basePowerConsumption * powerConsumptionMultiplier;
    const powerGeneration = definition.basePowerGeneration * powerGenerationMultiplier;
    const heatGeneration = definition.baseHeatGeneration;
    const coolingCapacity = definition.baseCoolingCapacity;

    // Calculate maintenance status
    const health = durability;
    const maintenanceStatus = calculateMaintenanceStatus(health, durability, this.config.maintenanceThresholds);

    // Create instance
    const instance: HardwareInstance = {
      id: generateHardwareId(this.config.idPrefix),
      serialNumber: generateSerialNumber(definition.category, manufacturer, this.config.serialNumberFormat),
      
      category: definition.category,
      type: options.type,
      
      manufacturer,
      model: definition.name,
      
      rarity,
      quality,
      
      firmware: firmwareVersion,
      
      health,
      durability,
      efficiency,
      
      powerConsumption,
      powerGeneration,
      heatGeneration,
      coolingCapacity,
      
      maintenanceStatus,
      lastMaintenanceDate: Date.now(),
      
      installationDate: Date.now(),
      installedPosition: undefined,
      
      ownerId: options.ownerId,
      
      configuration: options.configuration || {},
      
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
    };

    return instance;
  }

  /**
   * Roll rarity based on probabilities
   */
  private rollRarity(): Rarity {
    const random = Math.random();
    let cumulative = 0;

    for (const [rarity, probability] of Object.entries(this.config.rarityProbabilities)) {
      cumulative += probability;
      if (random <= cumulative) {
        return rarity as Rarity;
      }
    }

    return RarityEnum.COMMON;
  }

  /**
   * Roll quality based on probabilities
   */
  private rollQuality(): Quality {
    const random = Math.random();
    let cumulative = 0;

    for (const [quality, probability] of Object.entries(this.config.qualityProbabilities)) {
      cumulative += probability;
      if (random <= cumulative) {
        return quality as Quality;
      }
    }

    return QualityEnum.GOOD;
  }

  /**
   * Select manufacturer for hardware type
   */
  private selectManufacturer(definition: any): string {
    const supportedManufacturers = definition.supportedManufacturers;
    
    // Filter manufacturers that support this category
    const compatibleManufacturers: string[] = [];
    for (const [id, mfg] of this.manufacturers) {
      if (supportedManufacturers.includes(mfg.name)) {
        compatibleManufacturers.push(id);
      }
    }

    // If no compatible manufacturers, use generic
    if (compatibleManufacturers.length === 0) {
      return 'Generic';
    }

    // Select random compatible manufacturer
    const randomIndex = Math.floor(Math.random() * compatibleManufacturers.length);
    return this.manufacturers.get(compatibleManufacturers[randomIndex])!.name;
  }

  /**
   * Get quality modifier
   */
  private getQualityModifier(quality: Quality): number {
    switch (quality) {
      case QualityEnum.POOR:
        return 0.8;
      case QualityEnum.FAIR:
        return 0.9;
      case QualityEnum.GOOD:
        return 1.0;
      case QualityEnum.EXCELLENT:
        return 1.1;
      case QualityEnum.PERFECT:
        return 1.2;
      default:
        return 1.0;
    }
  }

  /**
   * Add custom manufacturer
   */
  addManufacturer(manufacturer: Manufacturer): void {
    this.manufacturers.set(manufacturer.id, manufacturer);
  }

  /**
   * Get manufacturer
   */
  getManufacturer(id: string): Manufacturer | undefined {
    return this.manufacturers.get(id);
  }

  /**
   * Get all manufacturers
   */
  getAllManufacturers(): Manufacturer[] {
    return Array.from(this.manufacturers.values());
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<HardwareConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get configuration
   */
  getConfig(): HardwareConfig {
    return { ...this.config };
  }
}
