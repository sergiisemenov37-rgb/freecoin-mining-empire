/**
 * Hardware Definitions
 * Template definitions for all hardware categories
 * Everything configurable
 */

import type {
  HardwareDefinition,
  HardwareType,
  HardwareCategory,
  Rarity,
  FirmwareVersion,
} from './types';
import {
  HardwareCategory as CategoryEnum,
  HardwareType as TypeEnum,
  Rarity as RarityEnum,
} from './types';

/**
 * Default rarity multipliers
 */
const DEFAULT_RARITY_MULTIPLIERS: Record<Rarity, {
  efficiency: number;
  durability: number;
  powerConsumption: number;
  powerGeneration: number;
}> = {
  [RarityEnum.COMMON]: {
    efficiency: 1.0,
    durability: 1.0,
    powerConsumption: 1.0,
    powerGeneration: 1.0,
  },
  [RarityEnum.UNCOMMON]: {
    efficiency: 1.1,
    durability: 1.15,
    powerConsumption: 0.95,
    powerGeneration: 1.1,
  },
  [RarityEnum.RARE]: {
    efficiency: 1.25,
    durability: 1.3,
    powerConsumption: 0.9,
    powerGeneration: 1.25,
  },
  [RarityEnum.EPIC]: {
    efficiency: 1.5,
    durability: 1.5,
    powerConsumption: 0.85,
    powerGeneration: 1.5,
  },
  [RarityEnum.LEGENDARY]: {
    efficiency: 1.75,
    durability: 1.75,
    powerConsumption: 0.8,
    powerGeneration: 1.75,
  },
  [RarityEnum.MYTHIC]: {
    efficiency: 2.0,
    durability: 2.0,
    powerConsumption: 0.75,
    powerGeneration: 2.0,
  },
};

/**
 * Minimum firmware version
 */
const MIN_FIRMWARE_VERSION: FirmwareVersion = {
  major: 1,
  minor: 0,
  patch: 0,
  build: 0,
};

/**
 * Hardware definitions registry
 */
export const HARDWARE_DEFINITIONS: Map<HardwareType, HardwareDefinition> = new Map([
  // ============================================
  // GPUs
  // ============================================
  [
    TypeEnum.GPU_BASIC,
    {
      type: TypeEnum.GPU_BASIC,
      category: CategoryEnum.GPU,
      name: 'Basic GPU',
      description: 'Entry-level graphics processing unit for basic mining operations',
      
      basePowerConsumption: 150,
      basePowerGeneration: 0,
      baseHeatGeneration: 75,
      baseCoolingCapacity: 0,
      baseEfficiency: 0.8,
      baseDurability: 80,
      
      rarityMultipliers: DEFAULT_RARITY_MULTIPLIERS,
      supportedManufacturers: ['Generic', 'Nvidia', 'AMD'],
      minFirmwareVersion: MIN_FIRMWARE_VERSION,
      
      gridSize: { width: 1, height: 1 },
      networkCapacity: 100,
      powerCapacity: 200,
      coolingCapacity: 100,
      
      customProperties: {},
    },
  ],
  [
    TypeEnum.GPU_STANDARD,
    {
      type: TypeEnum.GPU_STANDARD,
      category: CategoryEnum.GPU,
      name: 'Standard GPU',
      description: 'Mid-range graphics processing unit for efficient mining',
      
      basePowerConsumption: 250,
      basePowerGeneration: 0,
      baseHeatGeneration: 125,
      baseCoolingCapacity: 0,
      baseEfficiency: 1.0,
      baseDurability: 90,
      
      rarityMultipliers: DEFAULT_RARITY_MULTIPLIERS,
      supportedManufacturers: ['Nvidia', 'AMD', 'Intel'],
      minFirmwareVersion: MIN_FIRMWARE_VERSION,
      
      gridSize: { width: 1, height: 1 },
      networkCapacity: 200,
      powerCapacity: 300,
      coolingCapacity: 150,
      
      customProperties: {},
    },
  ],
  [
    TypeEnum.GPU_ADVANCED,
    {
      type: TypeEnum.GPU_ADVANCED,
      category: CategoryEnum.GPU,
      name: 'Advanced GPU',
      description: 'High-performance graphics processing unit for serious mining operations',
      
      basePowerConsumption: 350,
      basePowerGeneration: 0,
      baseHeatGeneration: 175,
      baseCoolingCapacity: 0,
      baseEfficiency: 1.25,
      baseDurability: 95,
      
      rarityMultipliers: DEFAULT_RARITY_MULTIPLIERS,
      supportedManufacturers: ['Nvidia', 'AMD'],
      minFirmwareVersion: MIN_FIRMWARE_VERSION,
      
      gridSize: { width: 2, height: 1 },
      networkCapacity: 500,
      powerCapacity: 500,
      coolingCapacity: 300,
      
      customProperties: {},
    },
  ],
  [
    TypeEnum.GPU_PREMIUM,
    {
      type: TypeEnum.GPU_PREMIUM,
      category: CategoryEnum.GPU,
      name: 'Premium GPU',
      description: 'Top-tier graphics processing unit for maximum mining efficiency',
      
      basePowerConsumption: 500,
      basePowerGeneration: 0,
      baseHeatGeneration: 250,
      baseCoolingCapacity: 0,
      baseEfficiency: 1.5,
      baseDurability: 100,
      
      rarityMultipliers: DEFAULT_RARITY_MULTIPLIERS,
      supportedManufacturers: ['Nvidia'],
      minFirmwareVersion: MIN_FIRMWARE_VERSION,
      
      gridSize: { width: 2, height: 2 },
      networkCapacity: 1000,
      powerCapacity: 750,
      coolingCapacity: 500,
      
      customProperties: {},
    },
  ],
  
  // ============================================
  // ASICs
  // ============================================
  [
    TypeEnum.ASIC_BASIC,
    {
      type: TypeEnum.ASIC_BASIC,
      category: CategoryEnum.ASIC,
      name: 'Basic ASIC',
      description: 'Entry-level application-specific integrated circuit for mining',
      
      basePowerConsumption: 200,
      basePowerGeneration: 0,
      baseHeatGeneration: 100,
      baseCoolingCapacity: 0,
      baseEfficiency: 1.2,
      baseDurability: 85,
      
      rarityMultipliers: DEFAULT_RARITY_MULTIPLIERS,
      supportedManufacturers: ['Generic', 'Bitmain'],
      minFirmwareVersion: MIN_FIRMWARE_VERSION,
      
      gridSize: { width: 1, height: 1 },
      networkCapacity: 50,
      powerCapacity: 300,
      coolingCapacity: 150,
      
      customProperties: {},
    },
  ],
  [
    TypeEnum.ASIC_STANDARD,
    {
      type: TypeEnum.ASIC_STANDARD,
      category: CategoryEnum.ASIC,
      name: 'Standard ASIC',
      description: 'Mid-range ASIC for efficient mining operations',
      
      basePowerConsumption: 350,
      basePowerGeneration: 0,
      baseHeatGeneration: 175,
      baseCoolingCapacity: 0,
      baseEfficiency: 1.5,
      baseDurability: 90,
      
      rarityMultipliers: DEFAULT_RARITY_MULTIPLIERS,
      supportedManufacturers: ['Bitmain', 'MicroBT'],
      minFirmwareVersion: MIN_FIRMWARE_VERSION,
      
      gridSize: { width: 2, height: 1 },
      networkCapacity: 100,
      powerCapacity: 500,
      coolingCapacity: 250,
      
      customProperties: {},
    },
  ],
  [
    TypeEnum.ASIC_ADVANCED,
    {
      type: TypeEnum.ASIC_ADVANCED,
      category: CategoryEnum.ASIC,
      name: 'Advanced ASIC',
      description: 'High-performance ASIC for serious mining',
      
      basePowerConsumption: 500,
      basePowerGeneration: 0,
      baseHeatGeneration: 250,
      baseCoolingCapacity: 0,
      baseEfficiency: 1.8,
      baseDurability: 95,
      
      rarityMultipliers: DEFAULT_RARITY_MULTIPLIERS,
      supportedManufacturers: ['Bitmain', 'MicroBT', 'Canaan'],
      minFirmwareVersion: MIN_FIRMWARE_VERSION,
      
      gridSize: { width: 2, height: 2 },
      networkCapacity: 200,
      powerCapacity: 750,
      coolingCapacity: 400,
      
      customProperties: {},
    },
  ],
  [
    TypeEnum.ASIC_PREMIUM,
    {
      type: TypeEnum.ASIC_PREMIUM,
      category: CategoryEnum.ASIC,
      name: 'Premium ASIC',
      description: 'Top-tier ASIC for maximum mining efficiency',
      
      basePowerConsumption: 750,
      basePowerGeneration: 0,
      baseHeatGeneration: 375,
      baseCoolingCapacity: 0,
      baseEfficiency: 2.2,
      baseDurability: 100,
      
      rarityMultipliers: DEFAULT_RARITY_MULTIPLIERS,
      supportedManufacturers: ['Bitmain'],
      minFirmwareVersion: MIN_FIRMWARE_VERSION,
      
      gridSize: { width: 3, height: 2 },
      networkCapacity: 500,
      powerCapacity: 1000,
      coolingCapacity: 600,
      
      customProperties: {},
    },
  ],
  
  // ============================================
  // CPU Clusters
  // ============================================
  [
    TypeEnum.CPU_SMALL,
    {
      type: TypeEnum.CPU_SMALL,
      category: CategoryEnum.CPU_CLUSTER,
      name: 'Small CPU Cluster',
      description: 'Compact CPU cluster for general computing',
      
      basePowerConsumption: 100,
      basePowerGeneration: 0,
      baseHeatGeneration: 50,
      baseCoolingCapacity: 0,
      baseEfficiency: 0.9,
      baseDurability: 85,
      
      rarityMultipliers: DEFAULT_RARITY_MULTIPLIERS,
      supportedManufacturers: ['Generic', 'Intel', 'AMD'],
      minFirmwareVersion: MIN_FIRMWARE_VERSION,
      
      gridSize: { width: 1, height: 1 },
      networkCapacity: 500,
      powerCapacity: 150,
      coolingCapacity: 75,
      
      customProperties: {},
    },
  ],
  [
    TypeEnum.CPU_MEDIUM,
    {
      type: TypeEnum.CPU_MEDIUM,
      category: CategoryEnum.CPU_CLUSTER,
      name: 'Medium CPU Cluster',
      description: 'Mid-sized CPU cluster for enhanced computing',
      
      basePowerConsumption: 200,
      basePowerGeneration: 0,
      baseHeatGeneration: 100,
      baseCoolingCapacity: 0,
      baseEfficiency: 1.0,
      baseDurability: 90,
      
      rarityMultipliers: DEFAULT_RARITY_MULTIPLIERS,
      supportedManufacturers: ['Intel', 'AMD'],
      minFirmwareVersion: MIN_FIRMWARE_VERSION,
      
      gridSize: { width: 2, height: 1 },
      networkCapacity: 1000,
      powerCapacity: 300,
      coolingCapacity: 150,
      
      customProperties: {},
    },
  ],
  [
    TypeEnum.CPU_LARGE,
    {
      type: TypeEnum.CPU_LARGE,
      category: CategoryEnum.CPU_CLUSTER,
      name: 'Large CPU Cluster',
      description: 'Large CPU cluster for heavy computing',
      
      basePowerConsumption: 400,
      basePowerGeneration: 0,
      baseHeatGeneration: 200,
      baseCoolingCapacity: 0,
      baseEfficiency: 1.1,
      baseDurability: 95,
      
      rarityMultipliers: DEFAULT_RARITY_MULTIPLIERS,
      supportedManufacturers: ['Intel', 'AMD'],
      minFirmwareVersion: MIN_FIRMWARE_VERSION,
      
      gridSize: { width: 3, height: 2 },
      networkCapacity: 2000,
      powerCapacity: 600,
      coolingCapacity: 300,
      
      customProperties: {},
    },
  ],
  [
    TypeEnum.CPU_HUGE,
    {
      type: TypeEnum.CPU_HUGE,
      category: CategoryEnum.CPU_CLUSTER,
      name: 'Huge CPU Cluster',
      description: 'Massive CPU cluster for maximum computing power',
      
      basePowerConsumption: 800,
      basePowerGeneration: 0,
      baseHeatGeneration: 400,
      baseCoolingCapacity: 0,
      baseEfficiency: 1.2,
      baseDurability: 100,
      
      rarityMultipliers: DEFAULT_RARITY_MULTIPLIERS,
      supportedManufacturers: ['Intel'],
      minFirmwareVersion: MIN_FIRMWARE_VERSION,
      
      gridSize: { width: 4, height: 3 },
      networkCapacity: 5000,
      powerCapacity: 1200,
      coolingCapacity: 600,
      
      customProperties: {},
    },
  ],
  
  // ============================================
  // Batteries
  // ============================================
  [
    TypeEnum.BATTERY_SMALL,
    {
      type: TypeEnum.BATTERY_SMALL,
      category: CategoryEnum.BATTERY,
      name: 'Small Battery',
      description: 'Compact battery for energy storage',
      
      basePowerConsumption: 5,
      basePowerGeneration: 100,
      baseHeatGeneration: 2,
      baseCoolingCapacity: 0,
      baseEfficiency: 0.9,
      baseDurability: 80,
      
      rarityMultipliers: DEFAULT_RARITY_MULTIPLIERS,
      supportedManufacturers: ['Generic', 'Tesla', 'LG'],
      minFirmwareVersion: MIN_FIRMWARE_VERSION,
      
      gridSize: { width: 1, height: 1 },
      networkCapacity: 50,
      powerCapacity: 150,
      coolingCapacity: 10,
      
      customProperties: {},
    },
  ],
  [
    TypeEnum.BATTERY_MEDIUM,
    {
      type: TypeEnum.BATTERY_MEDIUM,
      category: CategoryEnum.BATTERY,
      name: 'Medium Battery',
      description: 'Mid-sized battery for energy storage',
      
      basePowerConsumption: 10,
      basePowerGeneration: 250,
      baseHeatGeneration: 5,
      baseCoolingCapacity: 0,
      baseEfficiency: 0.95,
      baseDurability: 85,
      
      rarityMultipliers: DEFAULT_RARITY_MULTIPLIERS,
      supportedManufacturers: ['Tesla', 'LG', 'Panasonic'],
      minFirmwareVersion: MIN_FIRMWARE_VERSION,
      
      gridSize: { width: 2, height: 1 },
      networkCapacity: 100,
      powerCapacity: 300,
      coolingCapacity: 20,
      
      customProperties: {},
    },
  ],
  [
    TypeEnum.BATTERY_LARGE,
    {
      type: TypeEnum.BATTERY_LARGE,
      category: CategoryEnum.BATTERY,
      name: 'Large Battery',
      description: 'Large battery for significant energy storage',
      
      basePowerConsumption: 20,
      basePowerGeneration: 500,
      baseHeatGeneration: 10,
      baseCoolingCapacity: 0,
      baseEfficiency: 1.0,
      baseDurability: 90,
      
      rarityMultipliers: DEFAULT_RARITY_MULTIPLIERS,
      supportedManufacturers: ['Tesla', 'LG'],
      minFirmwareVersion: MIN_FIRMWARE_VERSION,
      
      gridSize: { width: 3, height: 2 },
      networkCapacity: 200,
      powerCapacity: 600,
      coolingCapacity: 40,
      
      customProperties: {},
    },
  ],
  [
    TypeEnum.BATTERY_HUGE,
    {
      type: TypeEnum.BATTERY_HUGE,
      category: CategoryEnum.BATTERY,
      name: 'Huge Battery',
      description: 'Massive battery for maximum energy storage',
      
      basePowerConsumption: 40,
      basePowerGeneration: 1000,
      baseHeatGeneration: 20,
      baseCoolingCapacity: 0,
      baseEfficiency: 1.05,
      baseDurability: 95,
      
      rarityMultipliers: DEFAULT_RARITY_MULTIPLIERS,
      supportedManufacturers: ['Tesla'],
      minFirmwareVersion: MIN_FIRMWARE_VERSION,
      
      gridSize: { width: 4, height: 3 },
      networkCapacity: 500,
      powerCapacity: 1200,
      coolingCapacity: 80,
      
      customProperties: {},
    },
  ],
  
  // ============================================
  // Generators
  // ============================================
  [
    TypeEnum.GENERATOR_DIESEL,
    {
      type: TypeEnum.GENERATOR_DIESEL,
      category: CategoryEnum.GENERATOR,
      name: 'Diesel Generator',
      description: 'Diesel-powered generator for backup power',
      
      basePowerConsumption: 0,
      basePowerGeneration: 500,
      baseHeatGeneration: 200,
      baseCoolingCapacity: 0,
      baseEfficiency: 0.7,
      baseDurability: 75,
      
      rarityMultipliers: DEFAULT_RARITY_MULTIPLIERS,
      supportedManufacturers: ['Generic', 'Caterpillar', 'Cummins'],
      minFirmwareVersion: MIN_FIRMWARE_VERSION,
      
      gridSize: { width: 2, height: 2 },
      networkCapacity: 100,
      powerCapacity: 600,
      coolingCapacity: 250,
      
      customProperties: {},
    },
  ],
  [
    TypeEnum.GENERATOR_GAS,
    {
      type: TypeEnum.GENERATOR_GAS,
      category: CategoryEnum.GENERATOR,
      name: 'Gas Generator',
      description: 'Natural gas-powered generator for backup power',
      
      basePowerConsumption: 0,
      basePowerGeneration: 750,
      baseHeatGeneration: 300,
      baseCoolingCapacity: 0,
      baseEfficiency: 0.8,
      baseDurability: 80,
      
      rarityMultipliers: DEFAULT_RARITY_MULTIPLIERS,
      supportedManufacturers: ['Caterpillar', 'Cummins', 'Generac'],
      minFirmwareVersion: MIN_FIRMWARE_VERSION,
      
      gridSize: { width: 3, height: 2 },
      networkCapacity: 150,
      powerCapacity: 900,
      coolingCapacity: 350,
      
      customProperties: {},
    },
  ],
  [
    TypeEnum.GENERATOR_NUCLEAR,
    {
      type: TypeEnum.GENERATOR_NUCLEAR,
      category: CategoryEnum.GENERATOR,
      name: 'Nuclear Generator',
      description: 'Nuclear-powered generator for massive power generation',
      
      basePowerConsumption: 0,
      basePowerGeneration: 5000,
      baseHeatGeneration: 2000,
      baseCoolingCapacity: 0,
      baseEfficiency: 0.9,
      baseDurability: 95,
      
      rarityMultipliers: DEFAULT_RARITY_MULTIPLIERS,
      supportedManufacturers: ['Generic'],
      minFirmwareVersion: MIN_FIRMWARE_VERSION,
      
      gridSize: { width: 5, height: 4 },
      networkCapacity: 500,
      powerCapacity: 6000,
      coolingCapacity: 2500,
      
      customProperties: {},
    },
  ],
  
  // ============================================
  // Solar Panels
  // ============================================
  [
    TypeEnum.SOLAR_BASIC,
    {
      type: TypeEnum.SOLAR_BASIC,
      category: CategoryEnum.SOLAR_PANEL,
      name: 'Basic Solar Panel',
      description: 'Entry-level solar panel for renewable energy',
      
      basePowerConsumption: 0,
      basePowerGeneration: 100,
      baseHeatGeneration: 5,
      baseCoolingCapacity: 0,
      baseEfficiency: 0.8,
      baseDurability: 85,
      
      rarityMultipliers: DEFAULT_RARITY_MULTIPLIERS,
      supportedManufacturers: ['Generic', 'SunPower', 'LG'],
      minFirmwareVersion: MIN_FIRMWARE_VERSION,
      
      gridSize: { width: 2, height: 1 },
      networkCapacity: 50,
      powerCapacity: 150,
      coolingCapacity: 10,
      
      customProperties: {},
    },
  ],
  [
    TypeEnum.SOLAR_STANDARD,
    {
      type: TypeEnum.SOLAR_STANDARD,
      category: CategoryEnum.SOLAR_PANEL,
      name: 'Standard Solar Panel',
      description: 'Mid-range solar panel for efficient renewable energy',
      
      basePowerConsumption: 0,
      basePowerGeneration: 200,
      baseHeatGeneration: 10,
      baseCoolingCapacity: 0,
      baseEfficiency: 0.9,
      baseDurability: 90,
      
      rarityMultipliers: DEFAULT_RARITY_MULTIPLIERS,
      supportedManufacturers: ['SunPower', 'LG', 'Panasonic'],
      minFirmwareVersion: MIN_FIRMWARE_VERSION,
      
      gridSize: { width: 2, height: 2 },
      networkCapacity: 100,
      powerCapacity: 300,
      coolingCapacity: 20,
      
      customProperties: {},
    },
  ],
  [
    TypeEnum.SOLAR_ADVANCED,
    {
      type: TypeEnum.SOLAR_ADVANCED,
      category: CategoryEnum.SOLAR_PANEL,
      name: 'Advanced Solar Panel',
      description: 'High-efficiency solar panel for maximum renewable energy',
      
      basePowerConsumption: 0,
      basePowerGeneration: 350,
      baseHeatGeneration: 15,
      baseCoolingCapacity: 0,
      baseEfficiency: 0.95,
      baseDurability: 95,
      
      rarityMultipliers: DEFAULT_RARITY_MULTIPLIERS,
      supportedManufacturers: ['SunPower', 'LG'],
      minFirmwareVersion: MIN_FIRMWARE_VERSION,
      
      gridSize: { width: 3, height: 2 },
      networkCapacity: 200,
      powerCapacity: 500,
      coolingCapacity: 30,
      
      customProperties: {},
    },
  ],
  
  // ============================================
  // Cooling Units
  // ============================================
  [
    TypeEnum.COOLING_FAN,
    {
      type: TypeEnum.COOLING_FAN,
      category: CategoryEnum.COOLING_UNIT,
      name: 'Cooling Fan',
      description: 'Basic cooling fan for heat dissipation',
      
      basePowerConsumption: 50,
      basePowerGeneration: 0,
      baseHeatGeneration: 5,
      baseCoolingCapacity: 500,
      baseEfficiency: 0.7,
      baseDurability: 80,
      
      rarityMultipliers: DEFAULT_RARITY_MULTIPLIERS,
      supportedManufacturers: ['Generic', 'Noctua', 'Cooler Master'],
      minFirmwareVersion: MIN_FIRMWARE_VERSION,
      
      gridSize: { width: 1, height: 1 },
      networkCapacity: 50,
      powerCapacity: 75,
      coolingCapacity: 600,
      
      customProperties: {},
    },
  ],
  [
    TypeEnum.COOLING_LIQUID,
    {
      type: TypeEnum.COOLING_LIQUID,
      category: CategoryEnum.COOLING_UNIT,
      name: 'Liquid Cooling',
      description: 'Liquid cooling system for efficient heat dissipation',
      
      basePowerConsumption: 100,
      basePowerGeneration: 0,
      baseHeatGeneration: 10,
      baseCoolingCapacity: 2000,
      baseEfficiency: 0.85,
      baseDurability: 85,
      
      rarityMultipliers: DEFAULT_RARITY_MULTIPLIERS,
      supportedManufacturers: ['Noctua', 'Cooler Master', 'Corsair'],
      minFirmwareVersion: MIN_FIRMWARE_VERSION,
      
      gridSize: { width: 2, height: 1 },
      networkCapacity: 100,
      powerCapacity: 150,
      coolingCapacity: 2500,
      
      customProperties: {},
    },
  ],
  [
    TypeEnum.COOLING_PHASE_CHANGE,
    {
      type: TypeEnum.COOLING_PHASE_CHANGE,
      category: CategoryEnum.COOLING_UNIT,
      name: 'Phase Change Cooling',
      description: 'Advanced phase change cooling for maximum heat dissipation',
      
      basePowerConsumption: 200,
      basePowerGeneration: 0,
      baseHeatGeneration: 20,
      baseCoolingCapacity: 5000,
      baseEfficiency: 0.95,
      baseDurability: 90,
      
      rarityMultipliers: DEFAULT_RARITY_MULTIPLIERS,
      supportedManufacturers: ['Noctua', 'Corsair'],
      minFirmwareVersion: MIN_FIRMWARE_VERSION,
      
      gridSize: { width: 3, height: 2 },
      networkCapacity: 200,
      powerCapacity: 300,
      coolingCapacity: 6000,
      
      customProperties: {},
    },
  ],
  
  // ============================================
  // Network Devices
  // ============================================
  [
    TypeEnum.NETWORK_ROUTER,
    {
      type: TypeEnum.NETWORK_ROUTER,
      category: CategoryEnum.NETWORK_DEVICE,
      name: 'Network Router',
      description: 'Router for network traffic management',
      
      basePowerConsumption: 30,
      basePowerGeneration: 0,
      baseHeatGeneration: 15,
      baseCoolingCapacity: 0,
      baseEfficiency: 0.9,
      baseDurability: 85,
      
      rarityMultipliers: DEFAULT_RARITY_MULTIPLIERS,
      supportedManufacturers: ['Generic', 'Cisco', 'Ubiquiti'],
      minFirmwareVersion: MIN_FIRMWARE_VERSION,
      
      gridSize: { width: 1, height: 1 },
      networkCapacity: 1000,
      powerCapacity: 50,
      coolingCapacity: 30,
      
      customProperties: {},
    },
  ],
  [
    TypeEnum.NETWORK_SWITCH,
    {
      type: TypeEnum.NETWORK_SWITCH,
      category: CategoryEnum.NETWORK_DEVICE,
      name: 'Network Switch',
      description: 'Switch for network traffic distribution',
      
      basePowerConsumption: 50,
      basePowerGeneration: 0,
      baseHeatGeneration: 25,
      baseCoolingCapacity: 0,
      baseEfficiency: 0.95,
      baseDurability: 90,
      
      rarityMultipliers: DEFAULT_RARITY_MULTIPLIERS,
      supportedManufacturers: ['Cisco', 'Ubiquiti', 'Juniper'],
      minFirmwareVersion: MIN_FIRMWARE_VERSION,
      
      gridSize: { width: 2, height: 1 },
      networkCapacity: 5000,
      powerCapacity: 75,
      coolingCapacity: 50,
      
      customProperties: {},
    },
  ],
  [
    TypeEnum.NETWORK_FIREWALL,
    {
      type: TypeEnum.NETWORK_FIREWALL,
      category: CategoryEnum.NETWORK_DEVICE,
      name: 'Network Firewall',
      description: 'Firewall for network security',
      
      basePowerConsumption: 75,
      basePowerGeneration: 0,
      baseHeatGeneration: 35,
      baseCoolingCapacity: 0,
      baseEfficiency: 0.9,
      baseDurability: 85,
      
      rarityMultipliers: DEFAULT_RARITY_MULTIPLIERS,
      supportedManufacturers: ['Cisco', 'Palo Alto', 'Fortinet'],
      minFirmwareVersion: MIN_FIRMWARE_VERSION,
      
      gridSize: { width: 1, height: 1 },
      networkCapacity: 2000,
      powerCapacity: 100,
      coolingCapacity: 40,
      
      customProperties: {},
    },
  ],
  
  // ============================================
  // Robot Stations
  // ============================================
  [
    TypeEnum.ROBOT_BASIC,
    {
      type: TypeEnum.ROBOT_BASIC,
      category: CategoryEnum.ROBOT_STATION,
      name: 'Basic Robot Station',
      description: 'Basic robot station for automated maintenance',
      
      basePowerConsumption: 100,
      basePowerGeneration: 0,
      baseHeatGeneration: 50,
      baseCoolingCapacity: 0,
      baseEfficiency: 0.8,
      baseDurability: 85,
      
      rarityMultipliers: DEFAULT_RARITY_MULTIPLIERS,
      supportedManufacturers: ['Generic', 'Boston Dynamics'],
      minFirmwareVersion: MIN_FIRMWARE_VERSION,
      
      gridSize: { width: 2, height: 2 },
      networkCapacity: 500,
      powerCapacity: 150,
      coolingCapacity: 75,
      
      customProperties: {},
    },
  ],
  [
    TypeEnum.ROBOT_STANDARD,
    {
      type: TypeEnum.ROBOT_STANDARD,
      category: CategoryEnum.ROBOT_STATION,
      name: 'Standard Robot Station',
      description: 'Standard robot station for efficient automation',
      
      basePowerConsumption: 200,
      basePowerGeneration: 0,
      baseHeatGeneration: 100,
      baseCoolingCapacity: 0,
      baseEfficiency: 0.9,
      baseDurability: 90,
      
      rarityMultipliers: DEFAULT_RARITY_MULTIPLIERS,
      supportedManufacturers: ['Boston Dynamics', 'Fanuc'],
      minFirmwareVersion: MIN_FIRMWARE_VERSION,
      
      gridSize: { width: 3, height: 2 },
      networkCapacity: 1000,
      powerCapacity: 300,
      coolingCapacity: 150,
      
      customProperties: {},
    },
  ],
  [
    TypeEnum.ROBOT_ADVANCED,
    {
      type: TypeEnum.ROBOT_ADVANCED,
      category: CategoryEnum.ROBOT_STATION,
      name: 'Advanced Robot Station',
      description: 'Advanced robot station for maximum automation',
      
      basePowerConsumption: 400,
      basePowerGeneration: 0,
      baseHeatGeneration: 200,
      baseCoolingCapacity: 0,
      baseEfficiency: 0.95,
      baseDurability: 95,
      
      rarityMultipliers: DEFAULT_RARITY_MULTIPLIERS,
      supportedManufacturers: ['Boston Dynamics'],
      minFirmwareVersion: MIN_FIRMWARE_VERSION,
      
      gridSize: { width: 4, height: 3 },
      networkCapacity: 2000,
      powerCapacity: 600,
      coolingCapacity: 300,
      
      customProperties: {},
    },
  ],
]);

/**
 * Get hardware definition by type
 */
export function getHardwareDefinition(type: HardwareType): HardwareDefinition | undefined {
  return HARDWARE_DEFINITIONS.get(type);
}

/**
 * Get all hardware definitions
 */
export function getAllHardwareDefinitions(): HardwareDefinition[] {
  return Array.from(HARDWARE_DEFINITIONS.values());
}

/**
 * Get hardware definitions by category
 */
export function getHardwareDefinitionsByCategory(category: HardwareCategory): HardwareDefinition[] {
  return Array.from(HARDWARE_DEFINITIONS.values()).filter(
    def => def.category === category
  );
}
