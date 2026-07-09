/**
 * Progression Engine Types
 * Core types for experience, levels, tiers, unlocks, milestones, rewards, goals, and notifications
 * Fully configurable and extensible for years of future expansion
 */

// ============================================
// EXPERIENCE SYSTEM
// ============================================

/**
 * Experience source types
 */
export enum ExperienceSource {
  MINING = 'mining',
  OBJECTIVES = 'objectives',
  ACHIEVEMENTS = 'achievements',
  DAILY_TASKS = 'daily_tasks',
  WEEKLY_TASKS = 'weekly_tasks',
  BATTLE_PASS = 'battle_pass',
  EVENTS = 'events',
  SOCIAL = 'social',
  TRADING = 'trading',
  CRAFTING = 'crafting',
  RESEARCH = 'research',
  SEASONAL = 'seasonal',
  CUSTOM = 'custom',
}

/**
 * Experience source configuration
 */
export interface ExperienceSourceConfig {
  source: ExperienceSource;
  baseMultiplier: number;
  levelMultiplier: number;
  tierMultiplier: number;
  seasonalMultiplier?: number;
  enabled: boolean;
}

/**
 * Experience formula type
 */
export enum ExperienceFormulaType {
  LINEAR = 'linear',
  EXPONENTIAL = 'exponential',
  LOGARITHMIC = 'logarithmic',
  CUSTOM = 'custom',
}

/**
 * Experience formula configuration
 */
export interface ExperienceFormulaConfig {
  type: ExperienceFormulaType;
  baseXP: number;
  growthRate: number;
  customFormula?: string; // Function name for custom formulas
}

/**
 * Experience state
 */
export interface ExperienceState {
  currentXP: number;
  totalXP: number;
  overflowXP: number;
  seasonalXP: number;
  sources: Map<ExperienceSource, number>;
  lastUpdated: number;
}

// ============================================
// PLAYER LEVELS
// ============================================

/**
 * Level configuration
 */
export interface LevelConfig {
  level: number;
  requiredXP: number;
  rewards: Reward[];
  unlocks: Unlock[];
  features: string[];
}

/**
 * Level progression state
 */
export interface LevelState {
  currentLevel: number;
  maxLevel: number;
  totalLevelsUnlocked: number;
  completedLevels: Set<number>;
  levelHistory: Array<{
    level: number;
    achievedAt: number;
    timeTaken: number;
  }>;
}

// ============================================
// EMPIRE TIERS
// ============================================

/**
 * Tier configuration
 */
export interface TierConfig {
  tier: number;
  name: string;
  description: string;
  requiredLevel: number;
  requiredEmpireValue: number;
  requiredHardwareCount: number;
  requiredPowerGeneration: number;
  unlocks: Unlock[];
  rewards: Reward[];
  features: string[];
  color?: string;
  icon?: string;
}

/**
 * Tier progression state
 */
export interface TierState {
  currentTier: number;
  maxTier: number;
  completedTiers: Set<number>;
  tierHistory: Array<{
    tier: number;
    achievedAt: number;
    empireValue: number;
  }>;
}

// ============================================
// UNLOCK ENGINE
// ============================================

/**
 * Unlock types
 */
export enum UnlockType {
  BUILDING = 'building',
  HARDWARE = 'hardware',
  RESEARCH = 'research',
  ROBOT = 'robot',
  DECORATION = 'decoration',
  DISTRICT = 'district',
  FEATURE = 'feature',
  UI = 'ui',
  GAMEPLAY = 'gameplay',
  SYSTEM = 'system',
  CUSTOM = 'custom',
}

/**
 * Unlock configuration
 */
export interface Unlock {
  id: string;
  type: UnlockType;
  name: string;
  description: string;
  itemId?: string;
  category?: string;
  prerequisites: string[]; // Unlock IDs
  requiredLevel?: number;
  requiredTier?: number;
  requiredMilestone?: string;
  autoUnlock: boolean;
  visible: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Unlock tree node
 */
export interface UnlockTreeNode {
  unlock: Unlock;
  children: UnlockTreeNode[];
  depth: number;
}

/**
 * Unlock state
 */
export interface UnlockState {
  unlockedIds: Set<string>;
  visibleIds: Set<string>;
  unlockHistory: Array<{
    unlockId: string;
    unlockedAt: number;
    source: string;
  }>;
}

// ============================================
// MILESTONES
// ============================================

/**
 * Milestone types
 */
export enum MilestoneType {
  HARDWARE_COUNT = 'hardware_count',
  EMPIRE_VALUE = 'empire_value',
  POWER_GENERATION = 'power_generation',
  MINING_OUTPUT = 'mining_output',
  RESEARCH_COUNT = 'research_count',
  BUILDING_COUNT = 'building_count',
  ROBOT_COUNT = 'robot_count',
  DISTRICT_COUNT = 'district_count',
  DECORATION_COUNT = 'decoration_count',
  SOCIAL_CONNECTIONS = 'social_connections',
  TRADE_VOLUME = 'trade_volume',
  CRAFTING_COUNT = 'crafting_count',
  CUSTOM = 'custom',
}

/**
 * Milestone configuration
 */
export interface Milestone {
  id: string;
  type: MilestoneType;
  name: string;
  description: string;
  targetValue: number;
  currentValue: number;
  category?: string;
  rewards: Reward[];
  unlocks: Unlock[];
  repeatable: boolean;
  maxCompletions?: number;
  completionCount: number;
  completedAt?: number;
}

/**
 * Milestone state
 */
export interface MilestoneState {
  milestones: Map<string, Milestone>;
  completedIds: Set<string>;
  totalCompletions: number;
}

// ============================================
// REWARD ENGINE
// ============================================

/**
 * Reward types
 */
export enum RewardType {
  CURRENCY = 'currency',
  EXPERIENCE = 'experience',
  ITEM = 'item',
  HARDWARE = 'hardware',
  DECORATION = 'decoration',
  BLUEPRINT = 'blueprint',
  TITLE = 'title',
  REPUTATION = 'reputation',
  UNLOCK = 'unlock',
  FEATURE = 'feature',
  CUSTOM = 'custom',
}

/**
 * Reward configuration
 */
export interface Reward {
  id: string;
  type: RewardType;
  amount?: number;
  currencyType?: string;
  itemType?: string;
  itemId?: string;
  itemQuantity?: number;
  unlockId?: string;
  featureId?: string;
  titleId?: string;
  reputationFaction?: string;
  reputationAmount?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Reward state
 */
export interface RewardState {
  claimedRewards: Set<string>;
  pendingRewards: Reward[];
  rewardHistory: Array<{
    rewardId: string;
    claimedAt: number;
    source: string;
  }>;
}

// ============================================
// GOAL ENGINE
// ============================================

/**
 * Goal priority
 */
export enum GoalPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Goal configuration
 */
export interface Goal {
  id: string;
  title: string;
  description: string;
  priority: GoalPriority;
  type: string;
  targetValue: number;
  currentValue: number;
  progress: number;
  estimatedTime?: number;
  rewards: Reward[];
  unlocks: Unlock[];
  dynamic: boolean;
  autoUpdate: boolean;
  completed: boolean;
  completedAt?: number;
}

/**
 * Goal state
 */
export interface GoalState {
  activeGoals: Goal[];
  completedGoals: Set<string>;
  currentGoal: Goal | null;
  goalHistory: Array<{
    goalId: string;
    completedAt: number;
    timeTaken: number;
  }>;
}

// ============================================
// NOTIFICATIONS
// ============================================

/**
 * Notification types
 */
export enum NotificationType {
  LEVEL_UP = 'level_up',
  TIER_UP = 'tier_up',
  UNLOCK = 'unlock',
  MILESTONE = 'milestone',
  REWARD = 'reward',
  GOAL = 'goal',
  ACHIEVEMENT = 'achievement',
  SYSTEM = 'system',
  CUSTOM = 'custom',
}

/**
 * Notification configuration
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  priority: NotificationPriority;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Notification priority
 */
export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

/**
 * Notification state
 */
export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  lastReadAt: number;
}

// ============================================
// PROGRESSION STATE
// ============================================

/**
 * Complete progression state
 */
export interface ProgressionState {
  playerId: string;
  empireId: string;
  
  // Experience
  experience: ExperienceState;
  
  // Levels
  levels: LevelState;
  
  // Tiers
  tiers: TierState;
  
  // Unlocks
  unlocks: UnlockState;
  
  // Milestones
  milestones: MilestoneState;
  
  // Rewards
  rewards: RewardState;
  
  // Goals
  goals: GoalState;
  
  // Notifications
  notifications: NotificationState;
  
  // Metadata
  version: number;
  createdAt: number;
  updatedAt: number;
}

// ============================================
// EVENTS
// ============================================

/**
 * Progression event types
 */
export enum ProgressionEventType {
  EXPERIENCE_GAINED = 'experience_gained',
  LEVEL_UP = 'level_up',
  TIER_UP = 'tier_up',
  UNLOCK_ACHIEVED = 'unlock_achieved',
  MILESTONE_COMPLETED = 'milestone_completed',
  REWARD_GRANTED = 'reward_granted',
  GOAL_COMPLETED = 'goal_completed',
  GOAL_UPDATED = 'goal_updated',
  NOTIFICATION_SENT = 'notification_sent',
}

/**
 * Base progression event
 */
export interface ProgressionEvent {
  type: ProgressionEventType;
  timestamp: number;
  playerId: string;
  empireId: string;
}

/**
 * Experience gained event
 */
export interface ExperienceGainedEvent extends ProgressionEvent {
  type: ProgressionEventType.EXPERIENCE_GAINED;
  source: ExperienceSource;
  amount: number;
  totalXP: number;
}

/**
 * Level up event
 */
export interface LevelUpEvent extends ProgressionEvent {
  type: ProgressionEventType.LEVEL_UP;
  oldLevel: number;
  newLevel: number;
  rewards: Reward[];
  unlocks: Unlock[];
}

/**
 * Tier up event
 */
export interface TierUpEvent extends ProgressionEvent {
  type: ProgressionEventType.TIER_UP;
  oldTier: number;
  newTier: number;
  rewards: Reward[];
  unlocks: Unlock[];
}

/**
 * Unlock achieved event
 */
export interface UnlockAchievedEvent extends ProgressionEvent {
  type: ProgressionEventType.UNLOCK_ACHIEVED;
  unlockId: string;
  unlock: Unlock;
}

/**
 * Milestone completed event
 */
export interface MilestoneCompletedEvent extends ProgressionEvent {
  type: ProgressionEventType.MILESTONE_COMPLETED;
  milestoneId: string;
  milestone: Milestone;
}

/**
 * Reward granted event
 */
export interface RewardGrantedEvent extends ProgressionEvent {
  type: ProgressionEventType.REWARD_GRANTED;
  rewardId: string;
  reward: Reward;
  source: string;
}

/**
 * Goal completed event
 */
export interface GoalCompletedEvent extends ProgressionEvent {
  type: ProgressionEventType.GOAL_COMPLETED;
  goalId: string;
  goal: Goal;
}

/**
 * Goal updated event
 */
export interface GoalUpdatedEvent extends ProgressionEvent {
  type: ProgressionEventType.GOAL_UPDATED;
  goalId: string;
  goal: Goal;
}

/**
 * Event listener type
 */
export type ProgressionEventListener = (event: ProgressionEvent) => void;

// ============================================
// CONFIGURATION
// ============================================

/**
 * Progression configuration
 */
export interface ProgressionConfig {
  // Experience
  experienceSources: Map<ExperienceSource, ExperienceSourceConfig>;
  experienceFormula: ExperienceFormulaConfig;
  maxLevel: number;
  maxTier: number;
  
  // Unlocks
  autoUnlock: boolean;
  showHiddenUnlocks: boolean;
  
  // Milestones
  milestoneRefreshInterval: number;
  
  // Goals
  goalUpdateInterval: number;
  maxActiveGoals: number;
  
  // Notifications
  notificationExpiry: number;
  maxNotifications: number;
  
  // Persistence
  autoSave: boolean;
  autoSaveInterval: number;
  version: number;
}

/**
 * Default progression configuration
 */
export const DEFAULT_PROGRESSION_CONFIG: ProgressionConfig = {
  experienceSources: new Map([
    [ExperienceSource.MINING, { source: ExperienceSource.MINING, baseMultiplier: 1.0, levelMultiplier: 1.0, tierMultiplier: 1.0, enabled: true }],
    [ExperienceSource.OBJECTIVES, { source: ExperienceSource.OBJECTIVES, baseMultiplier: 1.5, levelMultiplier: 1.0, tierMultiplier: 1.0, enabled: true }],
    [ExperienceSource.ACHIEVEMENTS, { source: ExperienceSource.ACHIEVEMENTS, baseMultiplier: 2.0, levelMultiplier: 1.0, tierMultiplier: 1.0, enabled: true }],
    [ExperienceSource.DAILY_TASKS, { source: ExperienceSource.DAILY_TASKS, baseMultiplier: 1.0, levelMultiplier: 1.0, tierMultiplier: 1.0, enabled: true }],
    [ExperienceSource.WEEKLY_TASKS, { source: ExperienceSource.WEEKLY_TASKS, baseMultiplier: 2.0, levelMultiplier: 1.0, tierMultiplier: 1.0, enabled: true }],
    [ExperienceSource.BATTLE_PASS, { source: ExperienceSource.BATTLE_PASS, baseMultiplier: 1.0, levelMultiplier: 1.0, tierMultiplier: 1.0, enabled: false }],
    [ExperienceSource.EVENTS, { source: ExperienceSource.EVENTS, baseMultiplier: 1.5, levelMultiplier: 1.0, tierMultiplier: 1.0, enabled: false }],
    [ExperienceSource.SOCIAL, { source: ExperienceSource.SOCIAL, baseMultiplier: 1.0, levelMultiplier: 1.0, tierMultiplier: 1.0, enabled: false }],
    [ExperienceSource.TRADING, { source: ExperienceSource.TRADING, baseMultiplier: 1.0, levelMultiplier: 1.0, tierMultiplier: 1.0, enabled: false }],
    [ExperienceSource.CRAFTING, { source: ExperienceSource.CRAFTING, baseMultiplier: 1.0, levelMultiplier: 1.0, tierMultiplier: 1.0, enabled: false }],
    [ExperienceSource.RESEARCH, { source: ExperienceSource.RESEARCH, baseMultiplier: 1.0, levelMultiplier: 1.0, tierMultiplier: 1.0, enabled: false }],
    [ExperienceSource.SEASONAL, { source: ExperienceSource.SEASONAL, baseMultiplier: 1.0, levelMultiplier: 1.0, tierMultiplier: 1.0, enabled: false }],
    [ExperienceSource.CUSTOM, { source: ExperienceSource.CUSTOM, baseMultiplier: 1.0, levelMultiplier: 1.0, tierMultiplier: 1.0, enabled: true }],
  ]),
  
  experienceFormula: {
    type: ExperienceFormulaType.EXPONENTIAL,
    baseXP: 100,
    growthRate: 1.5,
  },
  
  maxLevel: 100,
  maxTier: 10,
  
  autoUnlock: true,
  showHiddenUnlocks: false,
  
  milestoneRefreshInterval: 60000, // 1 minute
  
  goalUpdateInterval: 30000, // 30 seconds
  maxActiveGoals: 5,
  
  notificationExpiry: 86400000, // 24 hours
  maxNotifications: 50,
  
  autoSave: true,
  autoSaveInterval: 60000, // 1 minute
  version: 1,
};
