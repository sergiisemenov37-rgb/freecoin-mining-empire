/**
 * Hardware System Types
 * Core types for hardware instances and definitions
 * Integrates with Placement, Simulation, and Network engines via events
 */

// ============================================
// HARDWARE TYPES
// ============================================

/**
 * Hardware category
 */
export enum HardwareCategory {
  GPU = 'gpu',
  ASIC = 'asic',
  CPU_CLUSTER = 'cpu_cluster',
  BATTERY = 'battery',
  GENERATOR = 'generator',
  SOLAR_PANEL = 'solar_panel',
  COOLING_UNIT = 'cooling_unit',
  NETWORK_DEVICE = 'network_device',
  ROBOT_STATION = 'robot_station',
}

/**
 * Hardware type (specific model within category)
 */
export enum HardwareType {
  // GPUs
  GPU_BASIC = 'gpu_basic',
  GPU_STANDARD = 'gpu_standard',
  GPU_ADVANCED = 'gpu_advanced',
  GPU_PREMIUM = 'gpu_premium',
  
  // ASICs
  ASIC_BASIC = 'asic_basic',
  ASIC_STANDARD = 'asic_standard',
  ASIC_ADVANCED = 'asic_advanced',
  ASIC_PREMIUM = 'asic_premium',
  
  // CPU Clusters
  CPU_SMALL = 'cpu_small',
  CPU_MEDIUM = 'cpu_medium',
  CPU_LARGE = 'cpu_large',
  CPU_HUGE = 'cpu_huge',
  
  // Batteries
  BATTERY_SMALL = 'battery_small',
  BATTERY_MEDIUM = 'battery_medium',
  BATTERY_LARGE = 'battery_large',
  BATTERY_HUGE = 'battery_huge',
  
  // Generators
  GENERATOR_DIESEL = 'generator_diesel',
  GENERATOR_GAS = 'generator_gas',
  GENERATOR_NUCLEAR = 'generator_nuclear',
  
  // Solar Panels
  SOLAR_BASIC = 'solar_basic',
  SOLAR_STANDARD = 'solar_standard',
  SOLAR_ADVANCED = 'solar_advanced',
  
  // Cooling Units
  COOLING_FAN = 'cooling_fan',
  COOLING_LIQUID = 'cooling_liquid',
  COOLING_PHASE_CHANGE = 'cooling_phase_change',
  
  // Network Devices
  NETWORK_ROUTER = 'network_router',
  NETWORK_SWITCH = 'network_switch',
  NETWORK_FIREWALL = 'network_firewall',
  
  // Robot Stations
  ROBOT_BASIC = 'robot_basic',
  ROBOT_STANDARD = 'robot_standard',
  ROBOT_ADVANCED = 'robot_advanced',
}

/**
 * Rarity levels
 */
export enum Rarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
  MYTHIC = 'mythic',
}

/**
 * Quality levels
 */
export enum Quality {
  POOR = 'poor',
  FAIR = 'fair',
  GOOD = 'good',
  EXCELLENT = 'excellent',
  PERFECT = 'perfect',
}

/**
 * Maintenance status
 */
export enum MaintenanceStatus {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  NEEDS_MAINTENANCE = 'needs_maintenance',
  CRITICAL = 'critical',
  BROKEN = 'broken',
}

/**
 * Firmware version
 */
export interface FirmwareVersion {
  major: number;
  minor: number;
  patch: number;
  build: number;
}

/**
 * Hardware instance
 * Every hardware object is unique
 */
export interface HardwareInstance {
  // Identification
  id: string;
  serialNumber: string;
  
  // Hardware type
  category: HardwareCategory;
  type: HardwareType;
  
  // Manufacturer
  manufacturer: string;
  model: string;
  
  // Rarity and quality
  rarity: Rarity;
  quality: Quality;
  
  // Firmware
  firmware: FirmwareVersion;
  
  // Physical properties
  health: number;
  durability: number;
  efficiency: number;
  
  // Performance
  powerConsumption: number;
  powerGeneration: number;
  heatGeneration: number;
  coolingCapacity: number;
  
  // Maintenance
  maintenanceStatus: MaintenanceStatus;
  lastMaintenanceDate: number;
  
  // Installation
  installationDate: number;
  installedPosition?: { x: number; y: number };
  
  // Ownership
  ownerId: string;
  
  // Configuration (extensible)
  configuration: Record<string, unknown>;
  
  // Metadata
  createdAt: number;
  updatedAt: number;
  version: number;
}

/**
 * Hardware definition (template for creating instances)
 */
export interface HardwareDefinition {
  type: HardwareType;
  category: HardwareCategory;
  name: string;
  description: string;
  
  // Base stats
  basePowerConsumption: number;
  basePowerGeneration: number;
  baseHeatGeneration: number;
  baseCoolingCapacity: number;
  baseEfficiency: number;
  baseDurability: number;
  
  // Rarity multipliers
  rarityMultipliers: Record<Rarity, {
    efficiency: number;
    durability: number;
    powerConsumption: number;
    powerGeneration: number;
  }>;
  
  // Manufacturer support
  supportedManufacturers: string[];
  
  // Firmware requirements
  minFirmwareVersion: FirmwareVersion;
  
  // Placement requirements
  gridSize: { width: number; height: number };
  
  // Network requirements
  networkCapacity: number;
  powerCapacity: number;
  coolingCapacity: number;
  
  // Metadata
  customProperties: Record<string, unknown>;
}

/**
 * Manufacturer
 */
export interface Manufacturer {
  id: string;
  name: string;
  country: string;
  reputation: number;
  
  // Hardware types they produce
  supportedCategories: HardwareCategory[];
  
  // Quality modifiers
  qualityModifier: number;
  efficiencyModifier: number;
  durabilityModifier: number;
  
  // Metadata
  createdAt: number;
}

// ============================================
// EVENTS
// ============================================

/**
 * Hardware event types
 */
export enum HardwareEventType {
  INSTANCE_CREATED = 'instance_created',
  INSTANCE_DESTROYED = 'instance_destroyed',
  INSTANCE_UPDATED = 'instance_updated',
  INSTANCE_INSTALLED = 'instance_installed',
  INSTANCE_REMOVED = 'instance_removed',
  MAINTENANCE_PERFORMED = 'maintenance_performed',
  FIRMWARE_UPDATED = 'firmware_updated',
  HEALTH_CHANGED = 'health_changed',
  DURABILITY_CHANGED = 'durability_changed',
  EFFICIENCY_CHANGED = 'efficiency_changed',
}

/**
 * Base hardware event
 */
export interface HardwareEvent {
  type: HardwareEventType;
  instanceId: string;
  timestamp: number;
}

/**
 * Instance created event
 */
export interface InstanceCreatedEvent extends HardwareEvent {
  type: HardwareEventType.INSTANCE_CREATED;
  instance: HardwareInstance;
}

/**
 * Instance destroyed event
 */
export interface InstanceDestroyedEvent extends HardwareEvent {
  type: HardwareEventType.INSTANCE_DESTROYED;
  instance: HardwareInstance;
}

/**
 * Instance updated event
 */
export interface InstanceUpdatedEvent extends HardwareEvent {
  type: HardwareEventType.INSTANCE_UPDATED;
  changes: Record<string, unknown>;
}

/**
 * Instance installed event
 */
export interface InstanceInstalledEvent extends HardwareEvent {
  type: HardwareEventType.INSTANCE_INSTALLED;
  position: { x: number; y: number };
}

/**
 * Instance removed event
 */
export interface InstanceRemovedEvent extends HardwareEvent {
  type: HardwareEventType.INSTANCE_REMOVED;
  position: { x: number; y: number };
}

/**
 * Maintenance performed event
 */
export interface MaintenancePerformedEvent extends HardwareEvent {
  type: HardwareEventType.MAINTENANCE_PERFORMED;
  oldStatus: MaintenanceStatus;
  newStatus: MaintenanceStatus;
}

/**
 * Firmware updated event
 */
export interface FirmwareUpdatedEvent extends HardwareEvent {
  type: HardwareEventType.FIRMWARE_UPDATED;
  oldVersion: FirmwareVersion;
  newVersion: FirmwareVersion;
}

/**
 * Health changed event
 */
export interface HealthChangedEvent extends HardwareEvent {
  type: HardwareEventType.HEALTH_CHANGED;
  oldHealth: number;
  newHealth: number;
}

/**
 * Durability changed event
 */
export interface DurabilityChangedEvent extends HardwareEvent {
  type: HardwareEventType.DURABILITY_CHANGED;
  oldDurability: number;
  newDurability: number;
}

/**
 * Efficiency changed event
 */
export interface EfficiencyChangedEvent extends HardwareEvent {
  type: HardwareEventType.EFFICIENCY_CHANGED;
  oldEfficiency: number;
  newEfficiency: number;
}

/**
 * Event listener type
 */
export type HardwareEventListener = (event: HardwareEvent) => void;

// ============================================
// CONFIGURATION
// ============================================

/**
 * Hardware system configuration
 */
export interface HardwareConfig {
  // ID generation
  idPrefix: string;
  
  // Serial number format
  serialNumberFormat: string;
  
  // Default manufacturer
  defaultManufacturer: string;
  
  // Rarity probabilities
  rarityProbabilities: Record<Rarity, number>;
  
  // Quality probabilities
  qualityProbabilities: Record<Quality, number>;
  
  // Maintenance thresholds
  maintenanceThresholds: {
    excellent: number;
    good: number;
    needsMaintenance: number;
    critical: number;
  };
  
  // Firmware settings
  defaultFirmwareVersion: FirmwareVersion;
  
  // Event integration
  enableSimulationIntegration: boolean;
  enableNetworkIntegration: boolean;
  enablePlacementIntegration: boolean;
}

/**
 * Default hardware configuration
 */
export const DEFAULT_HARDWARE_CONFIG: HardwareConfig = {
  idPrefix: 'HW',
  serialNumberFormat: 'SN-{category}-{manufacturer}-{random}',
  defaultManufacturer: 'Generic',
  
  rarityProbabilities: {
    [Rarity.COMMON]: 0.6,
    [Rarity.UNCOMMON]: 0.25,
    [Rarity.RARE]: 0.1,
    [Rarity.EPIC]: 0.04,
    [Rarity.LEGENDARY]: 0.009,
    [Rarity.MYTHIC]: 0.001,
  },
  
  qualityProbabilities: {
    [Quality.POOR]: 0.1,
    [Quality.FAIR]: 0.2,
    [Quality.GOOD]: 0.4,
    [Quality.EXCELLENT]: 0.25,
    [Quality.PERFECT]: 0.05,
  },
  
  maintenanceThresholds: {
    excellent: 90,
    good: 70,
    needsMaintenance: 50,
    critical: 20,
  },
  
  defaultFirmwareVersion: {
    major: 1,
    minor: 0,
    patch: 0,
    build: 0,
  },
  
  enableSimulationIntegration: true,
  enableNetworkIntegration: true,
  enablePlacementIntegration: true,
};

// ============================================
// UTILITIES
// ============================================

/**
 * Generate unique hardware ID
 */
export function generateHardwareId(prefix: string = 'HW'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Generate serial number
 */
export function generateSerialNumber(
  category: HardwareCategory,
  manufacturer: string,
  format: string = 'SN-{category}-{manufacturer}-{random}'
): string {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return format
    .replace('{category}', category.toUpperCase())
    .replace('{manufacturer}', manufacturer.toUpperCase())
    .replace('{random}', random);
}

/**
 * Format firmware version
 */
export function formatFirmwareVersion(version: FirmwareVersion): string {
  return `${version.major}.${version.minor}.${version.patch}.${version.build}`;
}

/**
 * Parse firmware version
 */
export function parseFirmwareVersion(versionString: string): FirmwareVersion {
  const parts = versionString.split('.').map(Number);
  return {
    major: parts[0] || 0,
    minor: parts[1] || 0,
    patch: parts[2] || 0,
    build: parts[3] || 0,
  };
}

/**
 * Compare firmware versions
 */
export function compareFirmwareVersions(
  a: FirmwareVersion,
  b: FirmwareVersion
): number {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  if (a.patch !== b.patch) return a.patch - b.patch;
  return a.build - b.build;
}

/**
 * Calculate maintenance status from health/durability
 */
export function calculateMaintenanceStatus(
  health: number,
  durability: number,
  thresholds: HardwareConfig['maintenanceThresholds']
): MaintenanceStatus {
  const average = (health + durability) / 2;
  
  if (average >= thresholds.excellent) return MaintenanceStatus.EXCELLENT;
  if (average >= thresholds.good) return MaintenanceStatus.GOOD;
  if (average >= thresholds.needsMaintenance) return MaintenanceStatus.NEEDS_MAINTENANCE;
  if (average >= thresholds.critical) return MaintenanceStatus.CRITICAL;
  return MaintenanceStatus.BROKEN;
}

/**
 * Get rarity color
 */
export function getRarityColor(rarity: Rarity): string {
  switch (rarity) {
    case Rarity.COMMON: return '#9ca3af';
    case Rarity.UNCOMMON: return '#22c55e';
    case Rarity.RARE: return '#3b82f6';
    case Rarity.EPIC: return '#a855f7';
    case Rarity.LEGENDARY: return '#f59e0b';
    case Rarity.MYTHIC: return '#ef4444';
    default: return '#9ca3af';
  }
}

/**
 * Get quality color
 */
export function getQualityColor(quality: Quality): string {
  switch (quality) {
    case Quality.POOR: return '#ef4444';
    case Quality.FAIR: return '#f97316';
    case Quality.GOOD: return '#22c55e';
    case Quality.EXCELLENT: return '#3b82f6';
    case Quality.PERFECT: return '#a855f7';
    default: return '#9ca3af';
  }
}
