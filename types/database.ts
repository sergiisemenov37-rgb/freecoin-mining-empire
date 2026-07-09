/**
 * Database Types
 * Auto-generated types matching the database schema
 * These types ensure type safety when working with Supabase
 */

// ============================================
// ENUMS
// ============================================

export type ResourceType = 'coins' | 'gems' | 'energy' | 'materials' | 'special';
export type BuildingStatus = 'building' | 'active' | 'upgrading' | 'destroyed';
export type EquipmentRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type EquipmentSlot = 'tool' | 'armor' | 'accessory' | 'special';
export type ResearchStatus = 'available' | 'in_progress' | 'completed' | 'locked';
export type QuestStatus = 'available' | 'in_progress' | 'completed' | 'failed';
export type QuestType = 'daily' | 'weekly' | 'story' | 'achievement' | 'special';
export type NotificationType = 'system' | 'quest' | 'social' | 'reward' | 'achievement' | 'alert';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type FriendshipStatus = 'pending' | 'accepted' | 'blocked';
export type LeaderboardType = 'total_coins' | 'daily_coins' | 'buildings' | 'research' | 'special';
export type TelemetryEventType = 'session_start' | 'session_end' | 'action' | 'error' | 'performance';

// ============================================
// PLAYERS
// ============================================

export interface Player {
  id: string;
  telegram_id: number;
  telegram_username: string | null;
  created_at: string;
  updated_at: string;
  last_active_at: string;
  is_active: boolean;
  is_banned: boolean;
  banned_at: string | null;
  ban_reason: string | null;
  deleted_at: string | null;
}

export interface PlayerInsert {
  telegram_id: number;
  telegram_username?: string;
  is_active?: boolean;
  is_banned?: boolean;
  banned_at?: string;
  ban_reason?: string;
  deleted_at?: string;
}

export interface PlayerUpdate {
  telegram_username?: string;
  last_active_at?: string;
  is_active?: boolean;
  is_banned?: boolean;
  banned_at?: string;
  ban_reason?: string;
  deleted_at?: string;
}

// ============================================
// PLAYER PROFILES
// ============================================

export interface PlayerProfile {
  id: string;
  player_id: string;
  display_name: string;
  avatar_url: string | null;
  level: number;
  experience: number;
  title: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlayerProfileInsert {
  player_id: string;
  display_name: string;
  avatar_url?: string;
  level?: number;
  experience?: number;
  title?: string;
  bio?: string;
}

export interface PlayerProfileUpdate {
  display_name?: string;
  avatar_url?: string;
  level?: number;
  experience?: number;
  title?: string;
  bio?: string;
}

// ============================================
// RESOURCES
// ============================================

export interface Resource {
  id: string;
  resource_key: string;
  resource_type: ResourceType;
  name: string;
  description: string | null;
  icon_url: string | null;
  is_tradable: boolean;
  max_stack: number | null;
  created_at: string;
  updated_at: string;
}

export interface ResourceInsert {
  resource_key: string;
  resource_type: ResourceType;
  name: string;
  description?: string;
  icon_url?: string;
  is_tradable?: boolean;
  max_stack?: number;
}

export interface ResourceUpdate {
  resource_key?: string;
  resource_type?: ResourceType;
  name?: string;
  description?: string;
  icon_url?: string;
  is_tradable?: boolean;
  max_stack?: number;
}

// ============================================
// RESOURCE BALANCES
// ============================================

export interface ResourceBalance {
  id: string;
  player_id: string;
  resource_id: string;
  amount: number;
  last_updated_at: string;
  created_at: string;
  updated_at: string;
}

export interface ResourceBalanceInsert {
  player_id: string;
  resource_id: string;
  amount?: number;
}

export interface ResourceBalanceUpdate {
  amount?: number;
  last_updated_at?: string;
}

// ============================================
// EMPIRE
// ============================================

export interface Empire {
  id: string;
  player_id: string;
  name: string;
  level: number;
  experience: number;
  grid_size: number;
  created_at: string;
  updated_at: string;
}

export interface EmpireInsert {
  player_id: string;
  name: string;
  level?: number;
  experience?: number;
  grid_size?: number;
}

export interface EmpireUpdate {
  name?: string;
  level?: number;
  experience?: number;
  grid_size?: number;
}

// ============================================
// BUILDINGS
// ============================================

export interface Building {
  id: string;
  building_key: string;
  name: string;
  description: string | null;
  category: string | null;
  base_cost_resource_id: string | null;
  base_cost_amount: number;
  build_time_seconds: number;
  max_level: number;
  produces_resource_id: string | null;
  production_amount_per_second: number;
  icon_url: string | null;
  is_unlocked: boolean;
  unlock_level: number;
  created_at: string;
  updated_at: string;
}

export interface BuildingInsert {
  building_key: string;
  name: string;
  description?: string;
  category?: string;
  base_cost_resource_id?: string;
  base_cost_amount?: number;
  build_time_seconds?: number;
  max_level?: number;
  produces_resource_id?: string;
  production_amount_per_second?: number;
  icon_url?: string;
  is_unlocked?: boolean;
  unlock_level?: number;
}

export interface BuildingUpdate {
  building_key?: string;
  name?: string;
  description?: string;
  category?: string;
  base_cost_resource_id?: string;
  base_cost_amount?: number;
  build_time_seconds?: number;
  max_level?: number;
  produces_resource_id?: string;
  production_amount_per_second?: number;
  icon_url?: string;
  is_unlocked?: boolean;
  unlock_level?: number;
}

// ============================================
// PLACED OBJECTS
// ============================================

export interface PlacedObject {
  id: string;
  player_id: string;
  building_id: string;
  grid_x: number;
  grid_y: number;
  level: number;
  status: BuildingStatus;
  build_started_at: string | null;
  build_completed_at: string | null;
  upgrade_started_at: string | null;
  upgrade_completed_at: string | null;
  last_collected_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlacedObjectInsert {
  player_id: string;
  building_id: string;
  grid_x: number;
  grid_y: number;
  level?: number;
  status?: BuildingStatus;
  build_started_at?: string;
  build_completed_at?: string;
  upgrade_started_at?: string;
  upgrade_completed_at?: string;
  last_collected_at?: string;
}

export interface PlacedObjectUpdate {
  building_id?: string;
  grid_x?: number;
  grid_y?: number;
  level?: number;
  status?: BuildingStatus;
  build_started_at?: string;
  build_completed_at?: string;
  upgrade_started_at?: string;
  upgrade_completed_at?: string;
  last_collected_at?: string;
}

// ============================================
// INVENTORY
// ============================================

export interface Inventory {
  id: string;
  player_id: string;
  max_slots: number;
  used_slots: number;
  created_at: string;
  updated_at: string;
}

export interface InventoryInsert {
  player_id: string;
  max_slots?: number;
  used_slots?: number;
}

export interface InventoryUpdate {
  max_slots?: number;
  used_slots?: number;
}

// ============================================
// INVENTORY ITEMS
// ============================================

export interface InventoryItem {
  id: string;
  inventory_id: string;
  item_key: string;
  name: string;
  description: string | null;
  category: string | null;
  quantity: number;
  max_stack: number;
  icon_url: string | null;
  is_consumable: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryItemInsert {
  inventory_id: string;
  item_key: string;
  name: string;
  description?: string;
  category?: string;
  quantity?: number;
  max_stack?: number;
  icon_url?: string;
  is_consumable?: boolean;
}

export interface InventoryItemUpdate {
  item_key?: string;
  name?: string;
  description?: string;
  category?: string;
  quantity?: number;
  max_stack?: number;
  icon_url?: string;
  is_consumable?: boolean;
}

// ============================================
// EQUIPMENT
// ============================================

export interface Equipment {
  id: string;
  equipment_key: string;
  name: string;
  description: string | null;
  rarity: EquipmentRarity;
  slot: EquipmentSlot;
  base_stats: Record<string, unknown>;
  icon_url: string | null;
  is_unlocked: boolean;
  unlock_level: number;
  created_at: string;
  updated_at: string;
}

export interface EquipmentInsert {
  equipment_key: string;
  name: string;
  description?: string;
  rarity?: EquipmentRarity;
  slot: EquipmentSlot;
  base_stats?: Record<string, unknown>;
  icon_url?: string;
  is_unlocked?: boolean;
  unlock_level?: number;
}

export interface EquipmentUpdate {
  equipment_key?: string;
  name?: string;
  description?: string;
  rarity?: EquipmentRarity;
  slot?: EquipmentSlot;
  base_stats?: Record<string, unknown>;
  icon_url?: string;
  is_unlocked?: boolean;
  unlock_level?: number;
}

// ============================================
// EQUIPMENT INSTANCES
// ============================================

export interface EquipmentInstance {
  id: string;
  player_id: string;
  equipment_id: string;
  level: number;
  is_equipped: boolean;
  stats: Record<string, unknown>;
  acquired_at: string;
  created_at: string;
  updated_at: string;
}

export interface EquipmentInstanceInsert {
  player_id: string;
  equipment_id: string;
  level?: number;
  is_equipped?: boolean;
  stats?: Record<string, unknown>;
  acquired_at?: string;
}

export interface EquipmentInstanceUpdate {
  equipment_id?: string;
  level?: number;
  is_equipped?: boolean;
  stats?: Record<string, unknown>;
}

// ============================================
// RESEARCH
// ============================================

export interface Research {
  id: string;
  research_key: string;
  name: string;
  description: string | null;
  category: string | null;
  prerequisite_research_id: string | null;
  cost_resource_id: string | null;
  cost_amount: number;
  research_time_seconds: number;
  unlock_level: number;
  effects: Record<string, unknown>;
  icon_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResearchInsert {
  research_key: string;
  name: string;
  description?: string;
  category?: string;
  prerequisite_research_id?: string;
  cost_resource_id?: string;
  cost_amount?: number;
  research_time_seconds?: number;
  unlock_level?: number;
  effects?: Record<string, unknown>;
  icon_url?: string;
}

export interface ResearchUpdate {
  research_key?: string;
  name?: string;
  description?: string;
  category?: string;
  prerequisite_research_id?: string;
  cost_resource_id?: string;
  cost_amount?: number;
  research_time_seconds?: number;
  unlock_level?: number;
  effects?: Record<string, unknown>;
  icon_url?: string;
}

// ============================================
// RESEARCH PROGRESS
// ============================================

export interface ResearchProgress {
  id: string;
  player_id: string;
  research_id: string;
  status: ResearchStatus;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResearchProgressInsert {
  player_id: string;
  research_id: string;
  status?: ResearchStatus;
  started_at?: string;
  completed_at?: string;
}

export interface ResearchProgressUpdate {
  status?: ResearchStatus;
  started_at?: string;
  completed_at?: string;
}

// ============================================
// QUESTS
// ============================================

export interface Quest {
  id: string;
  quest_key: string;
  name: string;
  description: string | null;
  quest_type: QuestType;
  requirements: Record<string, unknown>;
  rewards: Record<string, unknown>;
  start_date: string | null;
  end_date: string | null;
  is_repeatable: boolean;
  repeat_interval_days: number | null;
  prerequisite_quest_id: string | null;
  unlock_level: number;
  icon_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuestInsert {
  quest_key: string;
  name: string;
  description?: string;
  quest_type?: QuestType;
  requirements?: Record<string, unknown>;
  rewards?: Record<string, unknown>;
  start_date?: string;
  end_date?: string;
  is_repeatable?: boolean;
  repeat_interval_days?: number;
  prerequisite_quest_id?: string;
  unlock_level?: number;
  icon_url?: string;
}

export interface QuestUpdate {
  quest_key?: string;
  name?: string;
  description?: string;
  quest_type?: QuestType;
  requirements?: Record<string, unknown>;
  rewards?: Record<string, unknown>;
  start_date?: string;
  end_date?: string;
  is_repeatable?: boolean;
  repeat_interval_days?: number;
  prerequisite_quest_id?: string;
  unlock_level?: number;
  icon_url?: string;
}

// ============================================
// QUEST PROGRESS
// ============================================

export interface QuestProgress {
  id: string;
  player_id: string;
  quest_id: string;
  status: QuestStatus;
  progress_data: Record<string, unknown>;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuestProgressInsert {
  player_id: string;
  quest_id: string;
  status?: QuestStatus;
  progress_data?: Record<string, unknown>;
  started_at?: string;
  completed_at?: string;
}

export interface QuestProgressUpdate {
  status?: QuestStatus;
  progress_data?: Record<string, unknown>;
  started_at?: string;
  completed_at?: string;
}

// ============================================
// ACHIEVEMENTS
// ============================================

export interface Achievement {
  id: string;
  achievement_key: string;
  name: string;
  description: string | null;
  category: string | null;
  requirements: Record<string, unknown>;
  rewards: Record<string, unknown>;
  points: number;
  is_hidden: boolean;
  icon_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface AchievementInsert {
  achievement_key: string;
  name: string;
  description?: string;
  category?: string;
  requirements?: Record<string, unknown>;
  rewards?: Record<string, unknown>;
  points?: number;
  is_hidden?: boolean;
  icon_url?: string;
}

export interface AchievementUpdate {
  achievement_key?: string;
  name?: string;
  description?: string;
  category?: string;
  requirements?: Record<string, unknown>;
  rewards?: Record<string, unknown>;
  points?: number;
  is_hidden?: boolean;
  icon_url?: string;
}

// ============================================
// ACHIEVEMENT PROGRESS
// ============================================

export interface AchievementProgress {
  id: string;
  player_id: string;
  achievement_id: string;
  progress_data: Record<string, unknown>;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AchievementProgressInsert {
  player_id: string;
  achievement_id: string;
  progress_data?: Record<string, unknown>;
  is_completed?: boolean;
  completed_at?: string;
}

export interface AchievementProgressUpdate {
  progress_data?: Record<string, unknown>;
  is_completed?: boolean;
  completed_at?: string;
}

// ============================================
// NOTIFICATIONS
// ============================================

export interface Notification {
  id: string;
  player_id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  data: Record<string, unknown>;
  is_read: boolean;
  read_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface NotificationInsert {
  player_id: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  is_read?: boolean;
  read_at?: string;
  expires_at?: string;
}

export interface NotificationUpdate {
  type?: NotificationType;
  priority?: NotificationPriority;
  title?: string;
  message?: string;
  data?: Record<string, unknown>;
  is_read?: boolean;
  read_at?: string;
  expires_at?: string;
}

// ============================================
// DAILY REWARDS
// ============================================

export interface DailyReward {
  id: string;
  player_id: string;
  day_sequence: number;
  claimed_at: string;
  rewards_claimed: Record<string, unknown>;
  created_at: string;
}

export interface DailyRewardInsert {
  player_id: string;
  day_sequence: number;
  claimed_at?: string;
  rewards_claimed?: Record<string, unknown>;
}

export interface DailyRewardUpdate {
  day_sequence?: number;
  claimed_at?: string;
  rewards_claimed?: Record<string, unknown>;
}

// ============================================
// FRIENDS
// ============================================

export interface Friend {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: FriendshipStatus;
  requested_at: string;
  accepted_at: string | null;
  blocked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FriendInsert {
  requester_id: string;
  receiver_id: string;
  status?: FriendshipStatus;
  requested_at?: string;
  accepted_at?: string;
  blocked_at?: string;
}

export interface FriendUpdate {
  status?: FriendshipStatus;
  accepted_at?: string;
  blocked_at?: string;
}

// ============================================
// LEADERBOARDS
// ============================================

export interface Leaderboard {
  id: string;
  leaderboard_key: string;
  name: string;
  description: string | null;
  leaderboard_type: LeaderboardType;
  reset_period: string | null;
  last_reset_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardInsert {
  leaderboard_key: string;
  name: string;
  description?: string;
  leaderboard_type?: LeaderboardType;
  reset_period?: string;
  last_reset_at?: string;
  is_active?: boolean;
}

export interface LeaderboardUpdate {
  leaderboard_key?: string;
  name?: string;
  description?: string;
  leaderboard_type?: LeaderboardType;
  reset_period?: string;
  last_reset_at?: string;
  is_active?: boolean;
}

// ============================================
// LEADERBOARD ENTRIES
// ============================================

export interface LeaderboardEntry {
  id: string;
  leaderboard_id: string;
  player_id: string;
  score: number;
  rank: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardEntryInsert {
  leaderboard_id: string;
  player_id: string;
  score?: number;
  rank?: number;
  metadata?: Record<string, unknown>;
}

export interface LeaderboardEntryUpdate {
  score?: number;
  rank?: number;
  metadata?: Record<string, unknown>;
}

// ============================================
// TELEMETRY LOGS
// ============================================

export interface TelemetryLog {
  id: string;
  player_id: string | null;
  event_type: TelemetryEventType;
  event_name: string;
  event_data: Record<string, unknown>;
  session_id: string | null;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
}

export interface TelemetryLogInsert {
  player_id?: string;
  event_type: TelemetryEventType;
  event_name: string;
  event_data?: Record<string, unknown>;
  session_id?: string;
  user_agent?: string;
  ip_address?: string;
}

// ============================================
// SETTINGS
// ============================================

export interface Setting {
  id: string;
  player_id: string;
  setting_key: string;
  setting_value: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SettingInsert {
  player_id: string;
  setting_key: string;
  setting_value: Record<string, unknown>;
}

export interface SettingUpdate {
  setting_key?: string;
  setting_value: Record<string, unknown>;
}
