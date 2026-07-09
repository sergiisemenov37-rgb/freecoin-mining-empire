/**
 * Building System Types
 * Core types for building definitions, construction, expansion, capacity, and events
 * Designed to integrate with Placement, Simulation, Energy, and Progression systems
 */

// ============================================
// BUILDING TYPES
// ============================================

/**
 * Building type enumeration
 */
export enum BuildingType {
  STARTER_ROOM = 'starter_room',
  GARAGE = 'garage',
  WAREHOUSE = 'warehouse',
  WORKSHOP = 'workshop',
  FACTORY = 'factory',
  DATA_CENTER = 'data_center',
  MEGA_DATA_CENTER = 'mega_data_center',
  RESEARCH_CAMPUS = 'research_campus',
  ORBITAL_FACILITY = 'orbital_facility',
  SKYSCRAPER = 'skyscraper', // Future
  DISTRICT_HUB = 'district_hub', // Future
  SPACE_STATION = 'space_station', // Future
  CUSTOM = 'custom',
}

/**
 * Visual theme enumeration
 */
export enum BuildingTheme {
  INDUSTRIAL = 'industrial',
  MODERN = 'modern',
  FUTURISTIC = 'futuristic',
  CYBERPUNK = 'cyberpunk',
  MINIMALIST = 'minimalist',
  CUSTOM = 'custom',
}

/**
 * Construction state enumeration
 */
export enum ConstructionState {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// ============================================
// BUILDING PROPERTIES
// ============================================

/**
 * Building properties interface
 */
export interface BuildingProperties {
  id: string;
  type: BuildingType;
  level: number;
  name: string;
  description: string;
  
  // Construction
  constructionTime: number; // milliseconds
  upgradeTime: number; // milliseconds
  constructionState: ConstructionState;
  constructionStartTime?: number;
  constructionProgress: number; // 0-1
  
  // Dimensions
  width: number; // meters
  height: number; // meters
  floors: number;
  maxFloors: number;
  
  // Capacity
  powerCapacity: number; // watts
  coolingCapacity: number; // watts
  networkCapacity: number; // Mbps
  maxHardware: number;
  maxRobots: number;
  maxDecorations: number;
  maxExpansion: number; // maximum expansion level
  
  // Current usage
  currentHardware: number;
  currentRobots: number;
  currentDecorations: number;
  currentExpansion: number;
  
  // Maintenance
  maintenanceCost: number; // per tick
  lastMaintenanceTime: number;
  
  // Visual
  theme: BuildingTheme;
  visualVariant?: string;
  
  // Position
  position: {
    x: number;
    y: number;
    z?: number;
  };
  
  // District
  districtId?: string;
  
  // Metadata
  metadata?: Record<string, unknown>;
  
  // Timestamps
  createdAt: number;
  updatedAt: number;
}

/**
 * Building definition interface
 */
export interface BuildingDefinition {
  type: BuildingType;
  name: string;
  description: string;
  
  // Base properties
  baseConstructionTime: number;
  baseUpgradeTime: number;
  baseWidth: number;
  baseHeight: number;
  baseFloors: number;
  baseMaxFloors: number;
  basePowerCapacity: number;
  baseCoolingCapacity: number;
  baseNetworkCapacity: number;
  baseMaxHardware: number;
  baseMaxRobots: number;
  baseMaxDecorations: number;
  baseMaxExpansion: number;
  baseMaintenanceCost: number;
  
  // Level multipliers
  levelMultiplier: {
    powerCapacity: number;
    coolingCapacity: number;
    networkCapacity: number;
    maxHardware: number;
    maxRobots: number;
    maxDecorations: number;
    maintenanceCost: number;
  };
  
  // Upgrade requirements
  upgradeRequirements: {
    level: number;
    resources: Record<string, number>;
    buildings: string[];
  };
  
  // Visual
  defaultTheme: BuildingTheme;
  availableThemes: BuildingTheme[];
  
  // Unlock requirements
  unlockLevel?: number;
  unlockTier?: number;
  unlockBuildings?: string[];
  
  // Metadata
  metadata?: Record<string, unknown>;
}

// ============================================
// EXPANSION
// ============================================

/**
 * Expansion type enumeration
 */
export enum ExpansionType {
  WIDTH = 'width',
  HEIGHT = 'height',
  FLOOR = 'floor',
  ROOM = 'room',
  DISTRICT_CONNECTION = 'district_connection',
  CUSTOM = 'custom',
}

/**
 * Expansion definition interface
 */
export interface ExpansionDefinition {
  type: ExpansionType;
  name: string;
  description: string;
  
  // Cost
  cost: {
    resources: Record<string, number>;
    time: number;
  };
  
  // Effect
  effect: {
    width?: number;
    height?: number;
    floors?: number;
    powerCapacity?: number;
    coolingCapacity?: number;
    networkCapacity?: number;
    maxHardware?: number;
    maxRobots?: number;
    maxDecorations?: number;
  };
  
  // Requirements
  requirements: {
    buildingLevel: number;
    buildingType?: BuildingType;
    currentExpansion?: number;
  };
  
  // Metadata
  metadata?: Record<string, unknown>;
}

/**
 * Expansion state interface
 */
export interface ExpansionState {
  expansionId: string;
  buildingId: string;
  type: ExpansionType;
  level: number;
  maxLevel: number;
  isCompleted: boolean;
  startTime?: number;
  completionTime?: number;
  metadata?: Record<string, unknown>;
}

// ============================================
// CONSTRUCTION QUEUE
// ============================================

/**
 * Construction queue item interface
 */
export interface ConstructionQueueItem {
  queueId: string;
  buildingId: string;
  type: 'construction' | 'upgrade' | 'expansion';
  targetLevel?: number;
  expansionType?: ExpansionType;
  startTime: number;
  estimatedCompletionTime: number;
  isPaused: boolean;
  isInstant: boolean;
  metadata?: Record<string, unknown>;
}

// ============================================
// CAPACITY
// ============================================

/**
 * Capacity interface
 */
export interface Capacity {
  power: {
    capacity: number;
    used: number;
    available: number;
  };
  cooling: {
    capacity: number;
    used: number;
    available: number;
  };
  network: {
    capacity: number;
    used: number;
    available: number;
  };
  hardware: {
    capacity: number;
    used: number;
    available: number;
  };
  robots: {
    capacity: number;
    used: number;
    available: number;
  };
  decorations: {
    capacity: number;
    used: number;
    available: number;
  };
}

// ============================================
// EVENTS
// ============================================

/**
 * Building event type enumeration
 */
export enum BuildingEventType {
  CONSTRUCTION_STARTED = 'construction_started',
  CONSTRUCTION_FINISHED = 'construction_finished',
  CONSTRUCTION_CANCELLED = 'construction_cancelLED',
  CONSTRUCTION_PAUSED = 'construction_paused',
  CONSTRUCTION_RESUMED = 'construction_resumed',
  UPGRADE_STARTED = 'upgrade_started',
  UPGRADE_FINISHED = 'upgrade_finished',
  UPGRADE_CANCELLED = 'upgrade_cancelLED',
  BUILDING_EXPANDED = 'building_expanded',
  CAPACITY_CHANGED = 'capacity_changed',
  MAINTENANCE_REQUIRED = 'maintenance_required',
  MAINTENANCE_COMPLETED = 'maintenance_completed',
  BUILDING_DESTROYED = 'building_destroyed',
  BUILDING_MOVED = 'building_moved',
  CUSTOM = 'custom',
}

/**
 * Base building event interface
 */
export interface BuildingEvent {
  type: BuildingEventType;
  timestamp: number;
  buildingId: string;
}

/**
 * Construction started event
 */
export interface ConstructionStartedEvent extends BuildingEvent {
  type: BuildingEventType.CONSTRUCTION_STARTED;
  buildingType: BuildingType;
  estimatedCompletionTime: number;
}

/**
 * Construction finished event
 */
export interface ConstructionFinishedEvent extends BuildingEvent {
  type: BuildingEventType.CONSTRUCTION_FINISHED;
  buildingType: BuildingType;
  actualDuration: number;
}

/**
 * Construction cancelled event
 */
export interface ConstructionCancelledEvent extends BuildingEvent {
  type: BuildingEventType.CONSTRUCTION_CANCELLED;
  reason: string;
  progress: number;
}

/**
 * Upgrade started event
 */
export interface UpgradeStartedEvent extends BuildingEvent {
  type: BuildingEventType.UPGRADE_STARTED;
  fromLevel: number;
  toLevel: number;
  estimatedCompletionTime: number;
}

/**
 * Upgrade finished event
 */
export interface UpgradeFinishedEvent extends BuildingEvent {
  type: BuildingEventType.UPGRADE_FINISHED;
  fromLevel: number;
  toLevel: number;
  actualDuration: number;
}

/**
 * Building expanded event
 */
export interface BuildingExpandedEvent extends BuildingEvent {
  type: BuildingEventType.BUILDING_EXPANDED;
  expansionType: ExpansionType;
  fromValue: number;
  toValue: number;
}

/**
 * Capacity changed event
 */
export interface CapacityChangedEvent extends BuildingEvent {
  type: BuildingEventType.CAPACITY_CHANGED;
  capacityType: 'power' | 'cooling' | 'network' | 'hardware' | 'robots' | 'decorations';
  oldValue: number;
  newValue: number;
}

/**
 * Event listener type
 */
export type BuildingEventListener = (event: BuildingEvent) => void;

// ============================================
// CONFIGURATION
// ============================================

/**
 * Building system configuration
 */
export interface BuildingSystemConfig {
  // Construction
  maxConcurrentConstruction: number;
  constructionSpeedMultiplier: number;
  allowInstantCompletion: boolean;
  instantCompletionCostMultiplier: number;
  
  // Expansion
  maxExpansionLevel: number;
  expansionSpeedMultiplier: number;
  
  // Maintenance
  maintenanceInterval: number;
  maintenanceCostMultiplier: number;
  
  // Capacity
  capacityUpdateInterval: number;
  
  // Performance
  maxBuildings: number;
  incrementalUpdate: boolean;
  updateBatchSize: number;
  
  // Persistence
  autoSave: boolean;
  autoSaveInterval: number;
  version: number;
}

/**
 * Default building system configuration
 */
export const DEFAULT_BUILDING_CONFIG: BuildingSystemConfig = {
  maxConcurrentConstruction: 3,
  constructionSpeedMultiplier: 1.0,
  allowInstantCompletion: true,
  instantCompletionCostMultiplier: 2.0,
  
  maxExpansionLevel: 10,
  expansionSpeedMultiplier: 1.0,
  
  maintenanceInterval: 3600000, // 1 hour
  maintenanceCostMultiplier: 1.0,
  
  capacityUpdateInterval: 1000,
  
  maxBuildings: 1000,
  incrementalUpdate: true,
  updateBatchSize: 50,
  
  autoSave: true,
  autoSaveInterval: 60000,
  version: 1,
};
