/**
 * Gameplay System Types
 * Core types for tutorial, objectives, economy, mining, and empire management
 * Integrates with existing engines via events
 */

// ============================================
// TUTORIAL SYSTEM
// ============================================

/**
 * Tutorial step status
 */
export enum TutorialStepStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
}

/**
 * Tutorial step type
 */
export enum TutorialStepType {
  INFORMATION = 'information',
  ACTION = 'action',
  CONDITION = 'condition',
  CHOICE = 'choice',
}

/**
 * Tutorial step
 */
export interface TutorialStep {
  id: string;
  tutorialId: string;
  order: number;
  type: TutorialStepType;
  title: string;
  description: string;
  
  // Conditions to start this step
  startConditions?: TutorialCondition[];
  
  // Conditions to complete this step
  completionConditions: TutorialCondition[];
  
  // Optional actions to trigger on completion
  completionActions?: TutorialAction[];
  
  // UI configuration
  uiConfig?: {
    highlightElement?: string;
    position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
    showOverlay?: boolean;
    allowSkip?: boolean;
  };
  
  // Metadata
  status: TutorialStepStatus;
  startedAt?: number;
  completedAt?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Tutorial condition
 */
export interface TutorialCondition {
  type: 'event' | 'state' | 'custom';
  eventType?: string;
  statePath?: string;
  stateValue?: unknown;
  customCheck?: string; // Function name to call
  timeout?: number;
}

/**
 * Tutorial action
 */
export interface TutorialAction {
  type: 'event' | 'state' | 'custom';
  eventType?: string;
  eventData?: unknown;
  statePath?: string;
  stateValue?: unknown;
  customAction?: string; // Function name to call
}

/**
 * Tutorial
 */
export interface Tutorial {
  id: string;
  name: string;
  description: string;
  version: number;
  
  steps: TutorialStep[];
  
  // Tutorial configuration
  config: {
    allowSkip: boolean;
    autoAdvance: boolean;
    showProgress: boolean;
  };
  
  // Metadata
  status: TutorialStepStatus;
  startedAt?: number;
  completedAt?: number;
  currentStepId?: string;
  metadata?: Record<string, unknown>;
}

// ============================================
// OBJECTIVE/QUEST SYSTEM
// ============================================

/**
 * Objective status
 */
export enum ObjectiveStatus {
  LOCKED = 'locked',
  AVAILABLE = 'available',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * Objective type
 */
export enum ObjectiveType {
  SINGLE = 'single',
  CHAIN = 'chain',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  ACHIEVEMENT = 'achievement',
}

/**
 * Objective
 */
export interface Objective {
  id: string;
  type: ObjectiveType;
  title: string;
  description: string;
  
  // Prerequisites
  prerequisiteIds?: string[];
  
  // Conditions to complete
  completionConditions: ObjectiveCondition[];
  
  // Rewards
  rewards: ObjectiveReward[];
  
  // Configuration
  config: {
    timeLimit?: number;
    autoComplete?: boolean;
    repeatable?: boolean;
  };
  
  // Metadata
  status: ObjectiveStatus;
  startedAt?: number;
  completedAt?: number;
  progress: Record<string, number>;
  metadata?: Record<string, unknown>;
}

/**
 * Objective condition
 */
export interface ObjectiveCondition {
  id: string;
  type: 'event' | 'state' | 'custom';
  description: string;
  eventType?: string;
  eventCount?: number;
  statePath?: string;
  stateValue?: unknown;
  customCheck?: string;
  currentProgress: number;
  targetProgress: number;
}

/**
 * Objective reward
 */
export interface ObjectiveReward {
  type: 'currency' | 'hardware' | 'unlock' | 'custom';
  currencyType?: string;
  amount?: number;
  hardwareType?: string;
  hardwareCount?: number;
  unlockId?: string;
  customData?: Record<string, unknown>;
}

// ============================================
// EMPIRE/PLAYER STATE SYSTEM
// ============================================

/**
 * Empire state
 */
export interface EmpireState {
  id: string;
  ownerId: string;
  name: string;
  
  // Player progress
  level: number;
  experience: number;
  experienceToNextLevel: number;
  
  // Rooms
  roomIds: string[];
  currentRoomId?: string;
  
  // Hardware inventory
  hardwareInventory: Map<string, number>; // hardware type -> count
  
  // Currency
  currency: Map<string, number>; // currency type -> amount
  
  // Unlocked features
  unlockedFeatures: Set<string>;
  
  // Completed tutorials
  completedTutorialIds: Set<string>;
  
  // Completed objectives
  completedObjectiveIds: Set<string>;
  
  // Metadata
  createdAt: number;
  updatedAt: number;
  version: number;
}

/**
 * Room state
 */
export interface RoomState {
  id: string;
  empireId: string;
  name: string;
  
  // Grid configuration
  gridSize: { width: number; height: number };
  
  // Grid state (reference to placement engine)
  gridId?: string;
  
  // Hardware in room
  hardwareIds: string[];
  
  // Network state (reference to network engine)
  networkId?: string;
  
  // Room configuration
  config: {
    expandable: boolean;
    maxExpansions: number;
    currentExpansions: number;
  };
  
  // Metadata
  createdAt: number;
  updatedAt: number;
  version: number;
}

// ============================================
// ECONOMY SYSTEM
// ============================================

/**
 * Currency type
 */
export enum CurrencyType {
  FREECOIN = 'freecoin',
  PREMIUM = 'premium',
}

/**
 * Pricing model
 */
export interface PricingModel {
  hardwareType: string;
  basePrice: number;
  currencyType: CurrencyType;
  
  // Price modifiers
  rarityMultipliers: Record<string, number>;
  qualityMultipliers: Record<string, number>;
  
  // Dynamic pricing
  supplyDemandFactor: number;
  discountPercent: number;
}

/**
 * Transaction
 */
export interface Transaction {
  id: string;
  type: 'purchase' | 'sale' | 'reward';
  currencyType: CurrencyType;
  amount: number;
  
  // Item information
  itemType?: 'hardware';
  itemId?: string;
  itemQuantity?: number;
  
  // Metadata
  timestamp: number;
  empireId: string;
  metadata?: Record<string, unknown>;
}

// ============================================
// MINING/REWARD SYSTEM
// ============================================

/**
 * Mining configuration
 */
export interface MiningConfig {
  // Base mining rate
  baseRate: number; // FreeCoin per second per GPU
  
  // Efficiency multipliers
  rarityMultipliers: Record<string, number>;
  qualityMultipliers: Record<string, number>;
  
  // Network bonuses
  networkEfficiencyBonus: number;
  
  // Difficulty
  difficulty: number;
  difficultyAdjustmentRate: number;
}

/**
 * Mining session
 */
export interface MiningSession {
  id: string;
  empireId: string;
  roomId: string;
  hardwareIds: string[];
  
  // Session stats
  startTime: number;
  endTime?: number;
  totalMined: number;
  averageRate: number;
  
  // Metadata
  active: boolean;
  metadata?: Record<string, unknown>;
}

// ============================================
// EVENTS
// ============================================

/**
 * Gameplay event types
 */
export enum GameplayEventType {
  // Tutorial events
  TUTORIAL_STARTED = 'tutorial_started',
  TUTORIAL_STEP_STARTED = 'tutorial_step_started',
  TUTORIAL_STEP_COMPLETED = 'tutorial_step_completed',
  TUTORIAL_COMPLETED = 'tutorial_completed',
  TUTORIAL_SKIPPED = 'tutorial_skipped',
  
  // Objective events
  OBJECTIVE_UNLOCKED = 'objective_unlocked',
  OBJECTIVE_STARTED = 'objective_started',
  OBJECTIVE_PROGRESS = 'objective_progress',
  OBJECTIVE_COMPLETED = 'objective_completed',
  OBJECTIVE_FAILED = 'objective_failed',
  
  // Empire events
  EMPIRE_CREATED = 'empire_created',
  EMPIRE_LEVEL_UP = 'empire_level_up',
  ROOM_CREATED = 'room_created',
  ROOM_EXPANDED = 'room_expanded',
  FEATURE_UNLOCKED = 'feature_unlocked',
  
  // Economy events
  CURRENCY_EARNED = 'currency_earned',
  CURRENCY_SPENT = 'currency_spent',
  TRANSACTION_COMPLETED = 'transaction_completed',
  
  // Mining events
  MINING_STARTED = 'mining_started',
  MINING_STOPPED = 'mining_stopped',
  MINING_REWARD = 'mining_reward',
}

/**
 * Base gameplay event
 */
export interface GameplayEvent {
  type: GameplayEventType;
  timestamp: number;
  empireId?: string;
}

/**
 * Tutorial started event
 */
export interface TutorialStartedEvent extends GameplayEvent {
  type: GameplayEventType.TUTORIAL_STARTED;
  tutorialId: string;
}

/**
 * Tutorial step started event
 */
export interface TutorialStepStartedEvent extends GameplayEvent {
  type: GameplayEventType.TUTORIAL_STEP_STARTED;
  tutorialId: string;
  stepId: string;
}

/**
 * Tutorial step completed event
 */
export interface TutorialStepCompletedEvent extends GameplayEvent {
  type: GameplayEventType.TUTORIAL_STEP_COMPLETED;
  tutorialId: string;
  stepId: string;
}

/**
 * Tutorial completed event
 */
export interface TutorialCompletedEvent extends GameplayEvent {
  type: GameplayEventType.TUTORIAL_COMPLETED;
  tutorialId: string;
}

/**
 * Objective unlocked event
 */
export interface ObjectiveUnlockedEvent extends GameplayEvent {
  type: GameplayEventType.OBJECTIVE_UNLOCKED;
  objectiveId: string;
}

/**
 * Objective started event
 */
export interface ObjectiveStartedEvent extends GameplayEvent {
  type: GameplayEventType.OBJECTIVE_STARTED;
  objectiveId: string;
}

/**
 * Objective progress event
 */
export interface ObjectiveProgressEvent extends GameplayEvent {
  type: GameplayEventType.OBJECTIVE_PROGRESS;
  objectiveId: string;
  conditionId: string;
  progress: number;
  total: number;
}

/**
 * Objective completed event
 */
export interface ObjectiveCompletedEvent extends GameplayEvent {
  type: GameplayEventType.OBJECTIVE_COMPLETED;
  objectiveId: string;
  rewards: ObjectiveReward[];
}

/**
 * Empire created event
 */
export interface EmpireCreatedEvent extends GameplayEvent {
  type: GameplayEventType.EMPIRE_CREATED;
  empireId: string;
}

/**
 * Empire level up event
 */
export interface EmpireLevelUpEvent extends GameplayEvent {
  type: GameplayEventType.EMPIRE_LEVEL_UP;
  empireId: string;
  oldLevel: number;
  newLevel: number;
}

/**
 * Room created event
 */
export interface RoomCreatedEvent extends GameplayEvent {
  type: GameplayEventType.ROOM_CREATED;
  empireId: string;
  roomId: string;
}

/**
 * Room expanded event
 */
export interface RoomExpandedEvent extends GameplayEvent {
  type: GameplayEventType.ROOM_EXPANDED;
  empireId: string;
  roomId: string;
  oldSize: { width: number; height: number };
  newSize: { width: number; height: number };
}

/**
 * Currency earned event
 */
export interface CurrencyEarnedEvent extends GameplayEvent {
  type: GameplayEventType.CURRENCY_EARNED;
  currencyType: CurrencyType;
  amount: number;
  source: 'mining' | 'reward' | 'sale';
}

/**
 * Currency spent event
 */
export interface CurrencySpentEvent extends GameplayEvent {
  type: GameplayEventType.CURRENCY_SPENT;
  currencyType: CurrencyType;
  amount: number;
  source: 'purchase';
}

/**
 * Mining started event
 */
export interface MiningStartedEvent extends GameplayEvent {
  type: GameplayEventType.MINING_STARTED;
  sessionId: string;
  roomId: string;
  hardwareIds: string[];
}

/**
 * Mining reward event
 */
export interface MiningRewardEvent extends GameplayEvent {
  type: GameplayEventType.MINING_REWARD;
  sessionId: string;
  amount: number;
  rate: number;
}

/**
 * Event listener type
 */
export type GameplayEventListener = (event: GameplayEvent) => void;

// ============================================
// CONFIGURATION
// ============================================

/**
 * Gameplay system configuration
 */
export interface GameplayConfig {
  // Tutorial configuration
  enableTutorial: boolean;
  autoStartTutorial: string | null;
  
  // Objective configuration
  enableObjectives: boolean;
  autoAcceptObjectives: boolean;
  
  // Economy configuration
  startingCurrency: Record<CurrencyType, number>;
  
  // Mining configuration
  miningConfig: MiningConfig;
  
  // Room configuration
  startingRoomSize: { width: number; height: number };
  maxRoomSize: { width: number; height: number };
  
  // Integration flags
  enablePlacementIntegration: boolean;
  enableSimulationIntegration: boolean;
  enableNetworkIntegration: boolean;
  enableHardwareIntegration: boolean;
}

/**
 * Default gameplay configuration
 */
export const DEFAULT_GAMEPLAY_CONFIG: GameplayConfig = {
  enableTutorial: true,
  autoStartTutorial: 'tutorial_vertical_slice',
  
  enableObjectives: true,
  autoAcceptObjectives: true,
  
  startingCurrency: {
    [CurrencyType.FREECOIN]: 100,
    [CurrencyType.PREMIUM]: 0,
  },
  
  miningConfig: {
    baseRate: 0.1, // 0.1 FreeCoin per second per GPU
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
};
