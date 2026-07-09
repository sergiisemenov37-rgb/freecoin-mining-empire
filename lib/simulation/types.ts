/**
 * Simulation Engine Types
 * Core types for simulation entities, state machine, and events
 * Completely independent from rendering
 */

// ============================================
// SIMULATION ENTITY
// ============================================

/**
 * Simulation entity ID
 */
export type EntityId = string;

/**
 * Entity type (maps to grid object types)
 */
export enum EntityType {
  GPU = 'gpu',
  BATTERY = 'battery',
  SOLAR_PANEL = 'solar_panel',
  COOLING = 'cooling',
  WORKSHOP = 'workshop',
  DECORATION = 'decoration',
  ROBOT_STATION = 'robot_station',
}

/**
 * Entity state
 */
export enum EntityState {
  IDLE = 'idle',
  RUNNING = 'running',
  OVERLOADED = 'overloaded',
  OVERHEATED = 'overheated',
  BROKEN = 'broken',
  REPAIRING = 'repairing',
  DISABLED = 'disabled',
}

/**
 * Entity status flags
 */
export interface EntityStatus {
  running: boolean;
  disabled: boolean;
  needsRepair: boolean;
  needsPower: boolean;
  needsCooling: boolean;
}

/**
 * Simulation entity
 * Every placed object becomes a simulation entity
 */
export interface SimulationEntity {
  id: EntityId;
  type: EntityType;
  state: EntityState;
  status: EntityStatus;
  
  // Physical properties
  temperature: number;
  powerUsage: number;
  powerGeneration: number;
  efficiency: number;
  durability: number;
  health: number;
  
  // Dependencies
  dependencies: EntityDependency[];
  
  // Custom properties (extensible)
  customProperties: Record<string, unknown>;
  
  // Metadata
  lastUpdated: number;
  version: number;
}

/**
 * Entity dependency
 * Objects can depend on others (e.g., GPU needs Power, Cooling)
 */
export interface EntityDependency {
  type: DependencyType;
  required: boolean;
  entityId?: EntityId;
  satisfied: boolean;
}

/**
 * Dependency types
 */
export enum DependencyType {
  POWER = 'power',
  COOLING = 'cooling',
  NETWORK = 'network',
  MAINTENANCE = 'maintenance',
  CUSTOM = 'custom',
}

// ============================================
// SIMULATION CONFIGURATION
// ============================================

/**
 * Tick rate options
 */
export enum TickRate {
  ONE_SECOND = 1000,
  FIVE_SECONDS = 5000,
  TEN_SECONDS = 10000,
}

/**
 * Simulation configuration
 * Everything configurable, no hardcoded values
 */
export interface SimulationConfig {
  tickRate: TickRate;
  
  // Temperature thresholds
  temperature: {
    normal: number;
    warning: number;
    critical: number;
    max: number;
    coolingRate: number;
    heatingRate: number;
  };
  
  // Power thresholds
  power: {
    normal: number;
    warning: number;
    critical: number;
    max: number;
  };
  
  // Durability thresholds
  durability: {
    max: number;
    decayRate: number;
    repairRate: number;
  };
  
  // Efficiency multipliers
  efficiency: {
    normal: number;
    degraded: number;
    critical: number;
  };
  
  // State transitions
  stateTransitions: {
    idleToRunning: number;
    runningToOverloaded: number;
    overloadedToOverheated: number;
    overheatedToBroken: number;
    brokenToRepairing: number;
    repairingToIdle: number;
  };
}

/**
 * Default simulation configuration
 */
export const DEFAULT_SIMULATION_CONFIG: SimulationConfig = {
  tickRate: TickRate.ONE_SECOND,
  
  temperature: {
    normal: 50,
    warning: 70,
    critical: 85,
    max: 100,
    coolingRate: 5,
    heatingRate: 3,
  },
  
  power: {
    normal: 100,
    warning: 150,
    critical: 200,
    max: 250,
  },
  
  durability: {
    max: 100,
    decayRate: 0.1,
    repairRate: 1,
  },
  
  efficiency: {
    normal: 1.0,
    degraded: 0.7,
    critical: 0.4,
  },
  
  stateTransitions: {
    idleToRunning: 0,
    runningToOverloaded: 0.8,
    overloadedToOverheated: 0.9,
    overheatedToBroken: 0.95,
    brokenToRepairing: 0,
    repairingToIdle: 100,
  },
};

// ============================================
// SIMULATION PIPELINE
// ============================================

/**
 * Pipeline stage
 */
export enum PipelineStage {
  POWER = 'power',
  HEAT = 'heat',
  EFFICIENCY = 'efficiency',
  DURABILITY = 'durability',
  STATUS = 'status',
  EVENTS = 'events',
}

/**
 * Pipeline stage result
 */
export interface PipelineResult {
  stage: PipelineStage;
  entityId: EntityId;
  success: boolean;
  changes: Record<string, unknown>;
  timestamp: number;
}

/**
 * Pipeline context
 * Passed between stages
 */
export interface PipelineContext {
  entity: SimulationEntity;
  deltaTime: number;
  config: SimulationConfig;
  results: PipelineResult[];
}

// ============================================
// SIMULATION EVENTS
// ============================================

/**
 * Simulation event types
 */
export enum SimulationEventType {
  TEMPERATURE_CHANGED = 'temperature_changed',
  POWER_CHANGED = 'power_changed',
  STATE_CHANGED = 'state_changed',
  OBJECT_FAILED = 'object_failed',
  OBJECT_RECOVERED = 'object_recovered',
  SIMULATION_TICK = 'simulation_tick',
  DEPENDENCY_CHANGED = 'dependency_changed',
  EFFICIENCY_CHANGED = 'efficiency_changed',
}

/**
 * Base simulation event
 */
export interface SimulationEvent {
  type: SimulationEventType;
  entityId: EntityId;
  timestamp: number;
}

/**
 * Temperature changed event
 */
export interface TemperatureChangedEvent extends SimulationEvent {
  type: SimulationEventType.TEMPERATURE_CHANGED;
  oldTemperature: number;
  newTemperature: number;
}

/**
 * Power changed event
 */
export interface PowerChangedEvent extends SimulationEvent {
  type: SimulationEventType.POWER_CHANGED;
  oldPowerUsage: number;
  newPowerUsage: number;
  oldPowerGeneration: number;
  newPowerGeneration: number;
}

/**
 * State changed event
 */
export interface StateChangedEvent extends SimulationEvent {
  type: SimulationEventType.STATE_CHANGED;
  oldState: EntityState;
  newState: EntityState;
}

/**
 * Object failed event
 */
export interface ObjectFailedEvent extends SimulationEvent {
  type: SimulationEventType.OBJECT_FAILED;
  failureReason: string;
  previousState: EntityState;
}

/**
 * Object recovered event
 */
export interface ObjectRecoveredEvent extends SimulationEvent {
  type: SimulationEventType.OBJECT_RECOVERED;
  recoveryReason: string;
  previousState: EntityState;
  newState: EntityState;
}

/**
 * Simulation tick event
 */
export interface SimulationTickEvent {
  type: SimulationEventType.SIMULATION_TICK;
  timestamp: number;
  tickNumber: number;
  deltaTime: number;
  activeEntities: number;
  changedEntities: number;
}

/**
 * Dependency changed event
 */
export interface DependencyChangedEvent extends SimulationEvent {
  type: SimulationEventType.DEPENDENCY_CHANGED;
  dependencyType: DependencyType;
  satisfied: boolean;
}

/**
 * Efficiency changed event
 */
export interface EfficiencyChangedEvent extends SimulationEvent {
  type: SimulationEventType.EFFICIENCY_CHANGED;
  oldEfficiency: number;
  newEfficiency: number;
}

/**
 * Event listener type
 */
export type SimulationEventListener = (event: SimulationEvent) => void;

// ============================================
// SIMULATION STATE
// ============================================

/**
 * Complete simulation state
 */
export interface SimulationState {
  entities: Map<EntityId, SimulationEntity>;
  config: SimulationConfig;
  tickNumber: number;
  lastTickTime: number;
  isRunning: boolean;
}

/**
 * Entity snapshot for persistence
 */
export interface EntitySnapshot {
  id: EntityId;
  type: EntityType;
  state: EntityState;
  status: EntityStatus;
  temperature: number;
  powerUsage: number;
  powerGeneration: number;
  efficiency: number;
  durability: number;
  health: number;
  dependencies: EntityDependency[];
  customProperties: Record<string, unknown>;
  lastUpdated: number;
  version: number;
}

// ============================================
// PERFORMANCE METRICS
// ============================================

/**
 * Simulation performance metrics
 */
export interface SimulationMetrics {
  fps: number;
  tickRate: number;
  activeEntities: number;
  changedEntities: number;
  updateTime: number;
  totalTime: number;
  memoryUsage: number;
}

/**
 * Stage timing metrics
 */
export interface StageTiming {
  stage: PipelineStage;
  duration: number;
  entityCount: number;
}

// ============================================
// UTILITIES
// ============================================

/**
 * Check if entity is in valid state
 */
export function isEntityValid(entity: SimulationEntity): boolean {
  return entity.health > 0 && entity.durability > 0;
}

/**
 * Check if entity is operational
 */
export function isEntityOperational(entity: SimulationEntity): boolean {
  return (
    entity.status.running &&
    !entity.status.disabled &&
    !entity.status.needsRepair &&
    entity.state !== EntityState.BROKEN
  );
}

/**
 * Check if entity needs cooling
 */
export function needsCooling(entity: SimulationEntity, config: SimulationConfig): boolean {
  return entity.temperature > config.temperature.warning;
}

/**
 * Check if entity needs power
 */
export function needsPower(entity: SimulationEntity, config: SimulationConfig): boolean {
  return entity.powerUsage > entity.powerGeneration;
}

/**
 * Calculate efficiency based on state
 */
export function calculateEfficiency(
  entity: SimulationEntity,
  config: SimulationConfig
): number {
  switch (entity.state) {
    case EntityState.RUNNING:
      return config.efficiency.normal;
    case EntityState.OVERLOADED:
      return config.efficiency.degraded;
    case EntityState.OVERHEATED:
      return config.efficiency.critical;
    default:
      return 0;
  }
}

/**
 * Normalize temperature to 0-100 range
 */
export function normalizeTemperature(temperature: number): number {
  return Math.max(0, Math.min(100, temperature));
}

/**
 * Normalize durability to 0-100 range
 */
export function normalizeDurability(durability: number): number {
  return Math.max(0, Math.min(100, durability));
}
