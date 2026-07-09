/**
 * Robot System Types
 * Core types for robot definitions, instances, tasks, AI states, and events
 * Designed for thousands of robots with configurable behavior
 */

// ============================================
// ROBOT TYPES
// ============================================

/**
 * Robot type enumeration
 */
export enum RobotType {
  BUILDER = 'builder',
  WORKER = 'worker',
  MAINTENANCE = 'maintenance',
  LOGISTICS = 'logistics',
  ENERGY = 'energy',
  COOLING = 'cooling',
  SECURITY = 'security',
  INSPECTOR = 'inspector',
  AI_SUPERVISOR = 'ai_supervisor',
  CUSTOM = 'custom',
}

// ============================================
// ROBOT DEFINITION
// ============================================

/**
 * Robot definition interface
 */
export interface RobotDefinition {
  type: RobotType;
  name: string;
  description: string;
  
  // Base stats
  baseSpeed: number; // Movement speed
  baseBatteryCapacity: number; // Battery capacity (mAh)
  baseEfficiency: number; // Task efficiency (0-1)
  baseCarryCapacity: number; // Carry capacity (kg)
  basePowerConsumption: number; // Power consumption (W)
  
  // Capabilities
  canBuild: boolean;
  canRepair: boolean;
  canTransport: boolean;
  canRecharge: boolean;
  canClean: boolean;
  canPatrol: boolean;
  canOptimize: boolean;
  
  // Upgrade limits
  maxLevel: number;
  maxModules: number;
  
  // Cost
  buildCost: {
    credits: number;
    resources?: Record<string, number>;
  };
  
  // Metadata
  icon?: string;
  color?: string;
  metadata?: Record<string, unknown>;
}

// ============================================
// ROBOT INSTANCE
// ============================================

/**
 * Robot state enumeration
 */
export enum RobotState {
  IDLE = 'idle',
  MOVING = 'moving',
  WORKING = 'working',
  CHARGING = 'charging',
  MAINTENANCE = 'maintenance',
  STUCK = 'stuck',
  OFFLINE = 'offline',
}

/**
 * Robot instance interface
 */
export interface RobotInstance {
  id: string;
  definitionId: string;
  name: string;
  type: RobotType;
  
  // Stats
  level: number;
  experience: number;
  efficiency: number;
  speed: number;
  batteryCapacity: number;
  currentBattery: number;
  carryCapacity: number;
  powerConsumption: number;
  
  // State
  state: RobotState;
  currentTaskId?: string;
  currentTargetId?: string;
  
  // Position
  position: { x: number; y: number; z?: number };
  
  // Modules
  modules: RobotModule[];
  
  // Charging
  chargingStationId?: string;
  isCharging: boolean;
  
  // Maintenance
  lastMaintenanceTime: number;
  maintenanceInterval: number;
  needsMaintenance: boolean;
  
  // Performance
  tasksCompleted: number;
  tasksFailed: number;
  totalDistance: number;
  totalWorkTime: number;
  
  // Metadata
  metadata?: Record<string, unknown>;
  
  // Timestamps
  createdAt: number;
  updatedAt: number;
  lastActiveTime: number;
}

// ============================================
// ROBOT MODULE
// ============================================

/**
 * Robot module type enumeration
 */
export enum RobotModuleType {
  SPEED_BOOST = 'speed_boost',
  EFFICIENCY_BOOST = 'efficiency_boost',
  BATTERY_BOOST = 'battery_boost',
  CARRY_BOOST = 'carry_boost',
  SENSOR = 'sensor',
  COMMUNICATION = 'communication',
  NAVIGATION = 'navigation',
  CUSTOM = 'custom',
}

/**
 * Robot module interface
 */
export interface RobotModule {
  id: string;
  type: RobotModuleType;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  
  // Effects
  effects: {
    speed?: number;
    efficiency?: number;
    batteryCapacity?: number;
    carryCapacity?: number;
  };
  
  // Metadata
  metadata?: Record<string, unknown>;
}

// ============================================
// TASK SYSTEM
// ============================================

/**
 * Task type enumeration
 */
export enum TaskType {
  BUILD = 'build',
  UPGRADE = 'upgrade',
  REPAIR = 'repair',
  TRANSPORT = 'transport',
  RECHARGE = 'recharge',
  CLEAN = 'clean',
  OPTIMIZE = 'optimize',
  PATROL = 'patrol',
  IDLE = 'idle',
  CUSTOM = 'custom',
}

/**
 * Task priority enumeration
 */
export enum TaskPriority {
  CRITICAL = 0,
  HIGH = 1,
  MEDIUM = 2,
  LOW = 3,
  BACKGROUND = 4,
}

/**
 * Task state enumeration
 */
export enum TaskState {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

/**
 * Task interface
 */
export interface Task {
  id: string;
  type: TaskType;
  priority: TaskPriority;
  state: TaskState;
  
  // Assignment
  robotId?: string;
  assignedAt?: number;
  
  // Target
  targetId?: string;
  targetPosition?: { x: number; y: number; z?: number };
  
  // Parameters
  parameters: Record<string, unknown>;
  
  // Progress
  progress: number; // 0-1
  startTime?: number;
  estimatedCompletionTime?: number;
  actualCompletionTime?: number;
  
  // Result
  result?: Record<string, unknown>;
  errorMessage?: string;
  
  // Metadata
  metadata?: Record<string, unknown>;
  
  // Timestamps
  createdAt: number;
  updatedAt: number;
}

// ============================================
// CHARGING STATION
// ============================================

/**
 * Charging station interface
 */
export interface ChargingStation {
  id: string;
  name: string;
  position: { x: number; y: number; z?: number };
  
  // Capacity
  maxRobots: number;
  currentRobots: number;
  
  // Charging
  chargingSpeed: number; // mAh per tick
  chargingEfficiency: number; // 0-1
  
  // Power
  powerConsumption: number; // W
  
  // Building
  buildingId?: string;
  
  // Metadata
  metadata?: Record<string, unknown>;
  
  // Timestamps
  createdAt: number;
  updatedAt: number;
}

// ============================================
// AI STATE MACHINE
// ============================================

/**
 * AI behavior state enumeration
 */
export enum AIBehaviorState {
  IDLE = 'idle',
  SEEKING_TASK = 'seeking_task',
  MOVING_TO_TARGET = 'moving_to_target',
  EXECUTING_TASK = 'executing_task',
  RETURNING_TO_CHARGER = 'returning_to_charger',
  CHARGING = 'charging',
  MAINTENANCE = 'maintenance',
  STUCK = 'stuck',
  EMERGENCY = 'emergency',
}

/**
 * AI decision context
 */
export interface AIDecisionContext {
  robot: RobotInstance;
  currentTask?: Task;
  batteryLevel: number; // 0-1
  taskQueue: Task[];
  chargingStations: ChargingStation[];
  nearbyRobots: RobotInstance[];
  environment: Record<string, unknown>;
}

/**
 * AI decision result
 */
export interface AIDecision {
  behaviorState: AIBehaviorState;
  targetTaskId?: string;
  targetPosition?: { x: number; y: number; z?: number };
  action: string;
  parameters?: Record<string, unknown>;
}

// ============================================
// EVENTS
// ============================================

/**
 * Robot event type enumeration
 */
export enum RobotEventType {
  ROBOT_CREATED = 'robot_created',
  ROBOT_DESTROYED = 'robot_destroyed',
  ROBOT_UPGRADED = 'robot_upgraded',
  ROBOT_MODULE_ADDED = 'robot_module_added',
  ROBOT_MODULE_REMOVED = 'robot_module_removed',
  ROBOT_CHARGING_STARTED = 'robot_charging_started',
  ROBOT_CHARGING_COMPLETED = 'robot_charging_completed',
  ROBOT_MAINTENANCE_REQUIRED = 'robot_maintenance_required',
  ROBOT_MAINTENANCE_COMPLETED = 'robot_maintenance_completed',
  ROBOT_STATE_CHANGED = 'robot_state_changed',
  TASK_CREATED = 'task_created',
  TASK_ASSIGNED = 'task_assigned',
  TASK_STARTED = 'task_started',
  TASK_COMPLETED = 'task_completed',
  TASK_FAILED = 'task_failed',
  TASK_CANCELLED = 'task_cancelLED',
  CHARGING_STATION_BUILT = 'charging_station_built',
  CHARGING_STATION_DESTROYED = 'charging_station_destroyed',
  CUSTOM = 'custom',
}

/**
 * Base robot event interface
 */
export interface RobotEvent {
  type: RobotEventType;
  timestamp: number;
  robotId?: string;
  taskId?: string;
  stationId?: string;
}

/**
 * Robot created event
 */
export interface RobotCreatedEvent extends RobotEvent {
  type: RobotEventType.ROBOT_CREATED;
  robotId: string;
  definitionId: string;
}

/**
 * Task started event
 */
export interface TaskStartedEvent extends RobotEvent {
  type: RobotEventType.TASK_STARTED;
  robotId: string;
  taskId: string;
  taskType: TaskType;
}

/**
 * Task completed event
 */
export interface TaskCompletedEvent extends RobotEvent {
  type: RobotEventType.TASK_COMPLETED;
  robotId: string;
  taskId: string;
  duration: number;
  result?: Record<string, unknown>;
}

/**
 * Event listener type
 */
export type RobotEventListener = (event: RobotEvent) => void;

// ============================================
// CONFIGURATION
// ============================================

/**
 * Robot system configuration
 */
export interface RobotSystemConfig {
  // Task Scheduling
  maxTasksPerRobot: number;
  taskAssignmentStrategy: 'priority' | 'nearest' | 'balanced';
  taskTimeout: number;
  
  // Battery
  lowBatteryThreshold: number; // 0-1
  criticalBatteryThreshold: number; // 0-1
  autoRecharge: boolean;
  
  // Maintenance
  maintenanceInterval: number;
  autoMaintenance: boolean;
  
  // AI
  aiUpdateInterval: number;
  pathfindingTimeout: number;
  
  // Performance
  maxRobots: number;
  maxTasks: number;
  incrementalUpdate: boolean;
  updateBatchSize: number;
  
  // Persistence
  autoSave: boolean;
  autoSaveInterval: number;
  version: number;
}

/**
 * Default robot system configuration
 */
export const DEFAULT_ROBOT_CONFIG: RobotSystemConfig = {
  maxTasksPerRobot: 1,
  taskAssignmentStrategy: 'priority',
  taskTimeout: 300000, // 5 minutes
  
  lowBatteryThreshold: 0.3,
  criticalBatteryThreshold: 0.1,
  autoRecharge: true,
  
  maintenanceInterval: 3600000, // 1 hour
  autoMaintenance: true,
  
  aiUpdateInterval: 1000,
  pathfindingTimeout: 5000,
  
  maxRobots: 10000,
  maxTasks: 100000,
  incrementalUpdate: true,
  updateBatchSize: 100,
  
  autoSave: true,
  autoSaveInterval: 60000,
  version: 1,
};
