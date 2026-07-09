/**
 * Research System Types
 * Core types for research nodes, categories, dependencies, costs, and events
 * Designed for tree-based research graph with unlimited categories and 1000+ technologies
 */

// ============================================
// RESEARCH CATEGORIES
// ============================================

/**
 * Research category enumeration
 */
export enum ResearchCategory {
  HARDWARE = 'hardware',
  MINING = 'mining',
  ENERGY = 'energy',
  NETWORK = 'network',
  AUTOMATION = 'automation',
  AI = 'ai',
  MATERIALS = 'materials',
  CONSTRUCTION = 'construction',
  DEFENSE = 'defense',
  EXPLORATION = 'exploration',
  CUSTOM = 'custom',
}

// ============================================
// RESEARCH NODE
// ============================================

/**
 * Research node state enumeration
 */
export enum ResearchNodeState {
  LOCKED = 'locked',
  AVAILABLE = 'available',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

/**
 * Research node interface
 */
export interface ResearchNode {
  id: string;
  name: string;
  description: string;
  category: ResearchCategory;
  
  // Dependencies
  dependencies: string[]; // IDs of prerequisite nodes
  requiredLevel?: number; // Required player level
  requiredTier?: number; // Required empire tier
  
  // Cost
  cost: ResearchCost;
  
  // Time
  baseResearchTime: number; // milliseconds
  researchTime: number; // milliseconds (with modifiers)
  
  // State
  state: ResearchNodeState;
  progress: number; // 0-1
  startTime?: number;
  completionTime?: number;
  
  // Effects
  unlocks: string[]; // Unlock IDs
  rewards: ResearchReward[];
  
  // Metadata
  icon?: string;
  color?: string;
  position?: { x: number; y: number }; // For tree visualization
  metadata?: Record<string, unknown>;
  
  // Timestamps
  createdAt: number;
  updatedAt: number;
}

/**
 * Research cost interface
 */
export interface ResearchCost {
  researchPoints: number;
  credits?: number;
  resources?: Record<string, number>;
}

/**
 * Research reward interface
 */
export interface ResearchReward {
  id: string;
  type: 'unlock' | 'bonus' | 'ability' | 'custom';
  value: string | number;
  description: string;
}

// ============================================
// RESEARCH LABORATORY
// ============================================

/**
 * Research laboratory interface
 */
export interface ResearchLaboratory {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  
  // Speed modifiers
  baseSpeedMultiplier: number;
  currentSpeedMultiplier: number;
  
  // Capacity
  maxParallelResearch: number;
  currentParallelResearch: number;
  
  // Specialization
  categoryBonus: Partial<Record<ResearchCategory, number>>;
  
  // Position
  buildingId?: string;
  
  // Metadata
  metadata?: Record<string, unknown>;
  
  // Timestamps
  createdAt: number;
  updatedAt: number;
}

// ============================================
// RESEARCH QUEUE
// ============================================

/**
 * Research queue item interface
 */
export interface ResearchQueueItem {
  queueId: string;
  nodeId: string;
  startTime: number;
  estimatedCompletionTime: number;
  laboratoryId?: string;
  isPaused: boolean;
  priority: number;
}

// ============================================
// RESEARCH POINTS
// ============================================

/**
 * Research points interface
 */
export interface ResearchPoints {
  total: number;
  available: number;
  spent: number;
  earned: number;
  lastEarnTime: number;
}

/**
 * Research points source enumeration
 */
export enum ResearchPointsSource {
  MINING = 'mining',
  BUILDING = 'building',
  ACHIEVEMENT = 'achievement',
  QUEST = 'quest',
  EVENT = 'event',
  LABORATORY = 'laboratory',
  CUSTOM = 'custom',
}

// ============================================
// EVENTS
// ============================================

/**
 * Research event type enumeration
 */
export enum ResearchEventType {
  RESEARCH_STARTED = 'research_started',
  RESEARCH_FINISHED = 'research_finished',
  RESEARCH_CANCELLED = 'research_cancelLED',
  RESEARCH_PAUSED = 'research_paused',
  RESEARCH_RESUMED = 'research_resumed',
  POINTS_EARNED = 'points_earned',
  POINTS_SPENT = 'points_spent',
  LABORATORY_BUILT = 'laboratory_built',
  LABORATORY_UPGRADED = 'laboratory_upgraded',
  LABORATORY_DESTROYED = 'laboratory_destroyed',
  UNLOCK_GRANTED = 'unlock_granted',
  CATEGORY_UNLOCKED = 'category_unlocked',
  CUSTOM = 'custom',
}

/**
 * Base research event interface
 */
export interface ResearchEvent {
  type: ResearchEventType;
  timestamp: number;
  nodeId?: string;
  laboratoryId?: string;
}

/**
 * Research started event
 */
export interface ResearchStartedEvent extends ResearchEvent {
  type: ResearchEventType.RESEARCH_STARTED;
  nodeId: string;
  estimatedCompletionTime: number;
  laboratoryId?: string;
}

/**
 * Research finished event
 */
export interface ResearchFinishedEvent extends ResearchEvent {
  type: ResearchEventType.RESEARCH_FINISHED;
  nodeId: string;
  actualDuration: number;
  rewards: ResearchReward[];
}

/**
 * Research cancelled event
 */
export interface ResearchCancelledEvent extends ResearchEvent {
  type: ResearchEventType.RESEARCH_CANCELLED;
  nodeId: string;
  reason: string;
  progress: number;
}

/**
 * Points earned event
 */
export interface PointsEarnedEvent extends ResearchEvent {
  type: ResearchEventType.POINTS_EARNED;
  amount: number;
  source: ResearchPointsSource;
  sourceId?: string;
}

/**
 * Unlock granted event
 */
export interface UnlockGrantedEvent extends ResearchEvent {
  type: ResearchEventType.UNLOCK_GRANTED;
  nodeId: string;
  unlockId: string;
}

/**
 * Event listener type
 */
export type ResearchEventListener = (event: ResearchEvent) => void;

// ============================================
// CONFIGURATION
// ============================================

/**
 * Research system configuration
 */
export interface ResearchSystemConfig {
  // Research Points
  basePointsPerTick: number;
  pointsMultiplier: number;
  
  // Research Time
  baseResearchSpeed: number;
  researchSpeedMultiplier: number;
  
  // Queue
  maxQueueSize: number;
  maxParallelResearch: number;
  
  // Laboratories
  laboratorySpeedBonus: number;
  laboratoryParallelBonus: number;
  
  // Performance
  maxNodes: number;
  maxLaboratories: number;
  incrementalUpdate: boolean;
  updateBatchSize: number;
  
  // Persistence
  autoSave: boolean;
  autoSaveInterval: number;
  version: number;
}

/**
 * Default research system configuration
 */
export const DEFAULT_RESEARCH_CONFIG: ResearchSystemConfig = {
  basePointsPerTick: 1,
  pointsMultiplier: 1.0,
  
  baseResearchSpeed: 1.0,
  researchSpeedMultiplier: 1.0,
  
  maxQueueSize: 10,
  maxParallelResearch: 1,
  
  laboratorySpeedBonus: 0.2,
  laboratoryParallelBonus: 1,
  
  maxNodes: 1000,
  maxLaboratories: 100,
  incrementalUpdate: true,
  updateBatchSize: 50,
  
  autoSave: true,
  autoSaveInterval: 60000,
  version: 1,
};
