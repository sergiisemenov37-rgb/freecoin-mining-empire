/**
 * Energy & Cooling System Types
 * Core types for power generation, storage, consumption, heat management, and cooling
 * Designed for high performance with 10000+ hardware objects
 */

// ============================================
// POWER SYSTEM
// ============================================

/**
 * Power priority levels for consumption
 */
export enum PowerPriority {
  CRITICAL = 'critical',    // Essential systems (never cut)
  HIGH = 'high',            // Important systems
  MEDIUM = 'medium',        // Normal operations
  LOW = 'low',              // Non-essential
  RESERVE = 'reserve',      // Only when surplus
}

/**
 * Power source types
 */
export enum PowerSourceType {
  GRID = 'grid',            // External grid connection
  SOLAR = 'solar',          // Solar panels (future)
  WIND = 'wind',            // Wind turbines (future)
  NUCLEAR = 'nuclear',      // Nuclear reactor (future)
  GEOTHERMAL = 'geothermal',// Geothermal (future)
  HYDRO = 'hydro',          // Hydroelectric (future)
  BATTERY = 'battery',      // Battery discharge
  GENERATOR = 'generator',  // Backup generator
  CUSTOM = 'custom',
}

/**
 * Power source configuration
 */
export interface PowerSourceConfig {
  id: string;
  type: PowerSourceType;
  name: string;
  maxOutput: number;        // Maximum power output (W)
  currentOutput: number;    // Current power output (W)
  efficiency: number;       // Efficiency (0-1)
  isOnline: boolean;
  isReserve: boolean;       // Used as reserve power
  metadata?: Record<string, unknown>;
}

/**
 * Power consumer configuration
 */
export interface PowerConsumerConfig {
  id: string;
  hardwareId: string;
  name: string;
  baseConsumption: number;  // Base power consumption (W)
  currentConsumption: number; // Current consumption (W)
  priority: PowerPriority;
  isPowered: boolean;
  efficiency: number;       // Power efficiency (0-1)
  metadata?: Record<string, unknown>;
}

/**
 * Battery configuration
 */
export interface BatteryConfig {
  id: string;
  name: string;
  capacity: number;         // Total capacity (Wh)
  currentCharge: number;    // Current charge (Wh)
  maxChargeRate: number;    // Max charge rate (W)
  maxDischargeRate: number; // Max discharge rate (W)
  efficiency: number;       // Charge/discharge efficiency (0-1)
  isReserve: boolean;       // Reserve battery (only for emergencies)
  isCharging: boolean;
  isDischarging: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Power grid state
 */
export interface PowerGridState {
  totalGeneration: number;  // Total power generated (W)
  totalConsumption: number; // Total power consumed (W)
  totalStorage: number;     // Total battery capacity (Wh)
  totalStored: number;      // Total energy stored (Wh)
  surplus: number;          // Power surplus (W)
  deficit: number;          // Power deficit (W)
  isBalanced: boolean;      // Grid is balanced
  isInOutage: boolean;      // Power outage active
  outageStartTime?: number; // When outage started
  lastUpdated: number;
}

// ============================================
// HEAT SYSTEM
// ============================================

/**
 * Heat source types
 */
export enum HeatSourceType {
  COMPUTATION = 'computation', // Heat from computation
  POWER = 'power',            // Heat from power conversion
  ENVIRONMENT = 'environment', // Ambient heat
  EQUIPMENT = 'equipment',    // Equipment heat
  CUSTOM = 'custom',
}

/**
 * Heat transfer types
 */
export enum HeatTransferType {
  CONDUCTION = 'conduction',
  CONVECTION = 'convection',
  RADIATION = 'radiation',
  LIQUID = 'liquid',         // Future liquid cooling
  CUSTOM = 'custom',
}

/**
 * Heat source configuration
 */
export interface HeatSourceConfig {
  id: string;
  hardwareId: string;
  type: HeatSourceType;
  name: string;
  baseGeneration: number;     // Base heat generation (W)
  currentGeneration: number;  // Current heat generation (W)
  temperature: number;        // Current temperature (°C)
  maxTemperature: number;     // Maximum safe temperature (°C)
  isOverheated: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Cooling system types
 */
export enum CoolingType {
  PASSIVE = 'passive',       // Passive cooling (heatsinks)
  ACTIVE_AIR = 'active_air', // Active air cooling (fans)
  LIQUID = 'liquid',         // Liquid cooling (future)
  PHASE_CHANGE = 'phase_change', // Phase change cooling (future)
  CUSTOM = 'custom',
}

/**
 * Cooling configuration
 */
export interface CoolingConfig {
  id: string;
  hardwareId: string;
  type: CoolingType;
  name: string;
  baseCapacity: number;      // Base cooling capacity (W)
  currentCapacity: number;   // Current cooling capacity (W)
  efficiency: number;        // Cooling efficiency (0-1)
  coverage: number;          // Coverage radius (m)
  isActive: boolean;
  isEmergency: boolean;      // Emergency cooling
  metadata?: Record<string, unknown>;
}

/**
 * Thermal state
 */
export interface ThermalState {
  ambientTemperature: number; // Ambient temperature (°C)
  totalHeatGeneration: number; // Total heat generated (W)
  totalCoolingCapacity: number; // Total cooling capacity (W)
  heatSurplus: number;       // Heat surplus (W)
  isBalanced: boolean;       // Thermal balance
  emergencyCoolingActive: boolean;
  emergencyShutdownActive: boolean;
  lastUpdated: number;
}

// ============================================
// HARDWARE ENERGY STATE
// ============================================

/**
 * Hardware energy requirements
 */
export interface HardwareEnergyRequirements {
  powerRequired: number;     // Power required (W)
  coolingRequired: number;   // Cooling required (W)
  simulationRequired: number; // Simulation required (%)
  networkRequired: number;   // Network required (%)
}

/**
 * Hardware energy state
 */
export interface HardwareEnergyState {
  hardwareId: string;
  powerReceived: number;     // Power received (W)
  powerEfficiency: number;   // Power efficiency (0-1)
  coolingReceived: number;   // Cooling received (W)
  coolingEfficiency: number; // Cooling efficiency (0-1)
  simulationEfficiency: number; // Simulation efficiency (0-1)
  networkEfficiency: number; // Network efficiency (0-1)
  overallEfficiency: number; // Overall efficiency (0-1)
  temperature: number;       // Current temperature (°C)
  isOverheated: boolean;
  isEmergencyShutdown: boolean;
  lastUpdated: number;
}

// ============================================
// EVENTS
// ============================================

/**
 * Energy event types
 */
export enum EnergyEventType {
  POWER_LOST = 'power_lost',
  POWER_RESTORED = 'power_restored',
  OVERHEATED = 'overheated',
  COOLED_DOWN = 'cooled_down',
  BATTERY_CHARGED = 'battery_charged',
  BATTERY_EMPTY = 'battery_empty',
  GENERATOR_STARTED = 'generator_started',
  GENERATOR_STOPPED = 'generator_stopped',
  EMERGENCY_SHUTDOWN = 'emergency_shutdown',
  EMERGENCY_COOLING = 'emergency_cooling',
  POWER_PRIORITY_CHANGED = 'power_priority_changed',
  BATTERY_STATUS_CHANGED = 'battery_status_changed',
}

/**
 * Base energy event
 */
export interface EnergyEvent {
  type: EnergyEventType;
  timestamp: number;
  hardwareId?: string;
  sourceId?: string;
}

/**
 * Power lost event
 */
export interface PowerLostEvent extends EnergyEvent {
  type: EnergyEventType.POWER_LOST;
  hardwareId: string;
  reason: string;
  duration?: number;
}

/**
 * Power restored event
 */
export interface PowerRestoredEvent extends EnergyEvent {
  type: EnergyEventType.POWER_RESTORED;
  hardwareId: string;
  outageDuration: number;
}

/**
 * Overheated event
 */
export interface OverheatedEvent extends EnergyEvent {
  type: EnergyEventType.OVERHEATED;
  hardwareId: string;
  temperature: number;
  maxTemperature: number;
}

/**
 * Cooled down event
 */
export interface CooledDownEvent extends EnergyEvent {
  type: EnergyEventType.COOLED_DOWN;
  hardwareId: string;
  temperature: number;
  overheatingDuration: number;
}

/**
 * Battery charged event
 */
export interface BatteryChargedEvent extends EnergyEvent {
  type: EnergyEventType.BATTERY_CHARGED;
  sourceId: string;
  chargeLevel: number;
  capacity: number;
}

/**
 * Battery empty event
 */
export interface BatteryEmptyEvent extends EnergyEvent {
  type: EnergyEventType.BATTERY_EMPTY;
  sourceId: string;
  wasReserve: boolean;
}

/**
 * Generator started event
 */
export interface GeneratorStartedEvent extends EnergyEvent {
  type: EnergyEventType.GENERATOR_STARTED;
  sourceId: string;
  reason: string;
}

/**
 * Generator stopped event
 */
export interface GeneratorStoppedEvent extends EnergyEvent {
  type: EnergyEventType.GENERATOR_STOPPED;
  sourceId: string;
  reason: string;
  runtime: number;
}

/**
 * Emergency shutdown event
 */
export interface EmergencyShutdownEvent extends EnergyEvent {
  type: EnergyEventType.EMERGENCY_SHUTDOWN;
  hardwareId: string;
  reason: string;
  temperature: number;
}

/**
 * Emergency cooling event
 */
export interface EmergencyCoolingEvent extends EnergyEvent {
  type: EnergyEventType.EMERGENCY_COOLING;
  sourceId: string;
  reason: string;
}

/**
 * Event listener type
 */
export type EnergyEventListener = (event: EnergyEvent) => void;

// ============================================
// CONFIGURATION
// ============================================

/**
 * Energy system configuration
 */
export interface EnergySystemConfig {
  // Power
  maxPowerDeficit: number;       // Max deficit before outage (W)
  outageThreshold: number;       // Time in deficit before outage (ms)
  reserveBatteryThreshold: number; // Battery level to trigger reserve (0-1)
  autoBalance: boolean;          // Auto-balance power
  balanceInterval: number;       // Balance check interval (ms)

  // Thermal
  maxTemperature: number;        // Max safe temperature (°C)
  overheatingThreshold: number; // Temp to trigger emergency (°C)
  emergencyCoolingThreshold: number; // Temp to trigger emergency cooling (°C)
  thermalRecoveryRate: number;   // Recovery rate (°C/s)
  emergencyShutdownThreshold: number; // Temp to trigger shutdown (°C)

  // Cooling
  coolingEfficiencyBase: number; // Base cooling efficiency (0-1)
  passiveCoolingMultiplier: number; // Passive cooling multiplier
  activeCoolingMultiplier: number;  // Active cooling multiplier

  // Performance
  maxHardwareObjects: number;   // Max hardware objects supported
  incrementalUpdate: boolean;    // Use incremental updates
  updateBatchSize: number;      // Batch size for updates

  // Persistence
  autoSave: boolean;
  autoSaveInterval: number;
  version: number;
}

/**
 * Default energy system configuration
 */
export const DEFAULT_ENERGY_CONFIG: EnergySystemConfig = {
  maxPowerDeficit: 1000,
  outageThreshold: 5000,
  reserveBatteryThreshold: 0.2,
  autoBalance: true,
  balanceInterval: 100,

  maxTemperature: 85,
  overheatingThreshold: 75,
  emergencyCoolingThreshold: 80,
  thermalRecoveryRate: 0.5,
  emergencyShutdownThreshold: 90,

  coolingEfficiencyBase: 0.8,
  passiveCoolingMultiplier: 1.0,
  activeCoolingMultiplier: 1.5,

  maxHardwareObjects: 10000,
  incrementalUpdate: true,
  updateBatchSize: 100,

  autoSave: true,
  autoSaveInterval: 60000,
  version: 1,
};
