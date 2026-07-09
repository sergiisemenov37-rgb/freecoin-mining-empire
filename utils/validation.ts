import { z } from 'zod';
import type {
  ResourceType,
  BuildingStatus,
  EquipmentRarity,
  EquipmentSlot,
  ResearchStatus,
  QuestStatus,
  QuestType,
  NotificationType,
  NotificationPriority,
  FriendshipStatus,
  LeaderboardType,
  TelemetryEventType,
} from '@/types/database';

// ============================================
// ENUM SCHEMAS
// ============================================

export const resourceTypeEnum = z.enum(['coins', 'gems', 'energy', 'materials', 'special']);
export const buildingStatusEnum = z.enum(['building', 'active', 'upgrading', 'destroyed']);
export const equipmentRarityEnum = z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']);
export const equipmentSlotEnum = z.enum(['tool', 'armor', 'accessory', 'special']);
export const researchStatusEnum = z.enum(['available', 'in_progress', 'completed', 'locked']);
export const questStatusEnum = z.enum(['available', 'in_progress', 'completed', 'failed']);
export const questTypeEnum = z.enum(['daily', 'weekly', 'story', 'achievement', 'special']);
export const notificationTypeEnum = z.enum(['system', 'quest', 'social', 'reward', 'achievement', 'alert']);
export const notificationPriorityEnum = z.enum(['low', 'normal', 'high', 'urgent']);
export const friendshipStatusEnum = z.enum(['pending', 'accepted', 'blocked']);
export const leaderboardTypeEnum = z.enum(['total_coins', 'daily_coins', 'buildings', 'research', 'special']);
export const telemetryEventTypeEnum = z.enum(['session_start', 'session_end', 'action', 'error', 'performance']);

// ============================================
// PLAYER SCHEMAS
// ============================================

export const playerInsertSchema = z.object({
  telegram_id: z.number().int().positive(),
  telegram_username: z.string().max(255).nullable().optional(),
  is_active: z.boolean().default(true),
  is_banned: z.boolean().default(false),
  banned_at: z.string().datetime().nullable().optional(),
  ban_reason: z.string().nullable().optional(),
  deleted_at: z.string().datetime().nullable().optional(),
});

export const playerUpdateSchema = z.object({
  telegram_username: z.string().max(255).nullable().optional(),
  last_active_at: z.string().datetime().optional(),
  is_active: z.boolean().optional(),
  is_banned: z.boolean().optional(),
  banned_at: z.string().datetime().nullable().optional(),
  ban_reason: z.string().nullable().optional(),
  deleted_at: z.string().datetime().nullable().optional(),
});

export const playerProfileInsertSchema = z.object({
  player_id: z.string().uuid(),
  display_name: z.string().min(1).max(50),
  avatar_url: z.string().url().nullable().optional(),
  level: z.number().int().min(1).default(1),
  experience: z.number().int().min(0).default(0),
  title: z.string().max(100).nullable().optional(),
  bio: z.string().nullable().optional(),
});

export const playerProfileUpdateSchema = z.object({
  display_name: z.string().min(1).max(50).optional(),
  avatar_url: z.string().url().nullable().optional(),
  level: z.number().int().min(1).optional(),
  experience: z.number().int().min(0).optional(),
  title: z.string().max(100).nullable().optional(),
  bio: z.string().nullable().optional(),
});

// ============================================
// RESOURCE SCHEMAS
// ============================================

export const resourceInsertSchema = z.object({
  resource_key: z.string().min(1).max(50),
  resource_type: resourceTypeEnum,
  name: z.string().min(1).max(100),
  description: z.string().nullable().optional(),
  icon_url: z.string().url().nullable().optional(),
  is_tradable: z.boolean().default(false),
  max_stack: z.number().int().positive().nullable().optional(),
});

export const resourceUpdateSchema = z.object({
  resource_key: z.string().min(1).max(50).optional(),
  resource_type: resourceTypeEnum.optional(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().nullable().optional(),
  icon_url: z.string().url().nullable().optional(),
  is_tradable: z.boolean().optional(),
  max_stack: z.number().int().positive().nullable().optional(),
});

export const resourceBalanceInsertSchema = z.object({
  player_id: z.string().uuid(),
  resource_id: z.string().uuid(),
  amount: z.number().int().min(0).default(0),
});

export const resourceBalanceUpdateSchema = z.object({
  amount: z.number().int().min(0).optional(),
  last_updated_at: z.string().datetime().optional(),
});

// ============================================
// EMPIRE SCHEMAS
// ============================================

export const empireInsertSchema = z.object({
  player_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  level: z.number().int().min(1).default(1),
  experience: z.number().int().min(0).default(0),
  grid_size: z.number().int().positive().default(10),
});

export const empireUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  level: z.number().int().min(1).optional(),
  experience: z.number().int().min(0).optional(),
  grid_size: z.number().int().positive().optional(),
});

export const buildingInsertSchema = z.object({
  building_key: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  description: z.string().nullable().optional(),
  category: z.string().max(50).nullable().optional(),
  base_cost_resource_id: z.string().uuid().nullable().optional(),
  base_cost_amount: z.number().int().min(0).default(0),
  build_time_seconds: z.number().int().min(0).default(0),
  max_level: z.number().int().min(1).default(10),
  produces_resource_id: z.string().uuid().nullable().optional(),
  production_amount_per_second: z.number().min(0).default(0),
  icon_url: z.string().url().nullable().optional(),
  is_unlocked: z.boolean().default(false),
  unlock_level: z.number().int().min(1).default(1),
});

export const buildingUpdateSchema = z.object({
  building_key: z.string().min(1).max(50).optional(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().nullable().optional(),
  category: z.string().max(50).nullable().optional(),
  base_cost_resource_id: z.string().uuid().nullable().optional(),
  base_cost_amount: z.number().int().min(0).optional(),
  build_time_seconds: z.number().int().min(0).optional(),
  max_level: z.number().int().min(1).optional(),
  produces_resource_id: z.string().uuid().nullable().optional(),
  production_amount_per_second: z.number().min(0).optional(),
  icon_url: z.string().url().nullable().optional(),
  is_unlocked: z.boolean().optional(),
  unlock_level: z.number().int().min(1).optional(),
});

export const placedObjectInsertSchema = z.object({
  player_id: z.string().uuid(),
  building_id: z.string().uuid(),
  grid_x: z.number().int().min(0),
  grid_y: z.number().int().min(0),
  level: z.number().int().min(1).default(1),
  status: buildingStatusEnum.default('building'),
  build_started_at: z.string().datetime().nullable().optional(),
  build_completed_at: z.string().datetime().nullable().optional(),
  upgrade_started_at: z.string().datetime().nullable().optional(),
  upgrade_completed_at: z.string().datetime().nullable().optional(),
  last_collected_at: z.string().datetime().nullable().optional(),
});

export const placedObjectUpdateSchema = z.object({
  building_id: z.string().uuid().optional(),
  grid_x: z.number().int().min(0).optional(),
  grid_y: z.number().int().min(0).optional(),
  level: z.number().int().min(1).optional(),
  status: buildingStatusEnum.optional(),
  build_started_at: z.string().datetime().nullable().optional(),
  build_completed_at: z.string().datetime().nullable().optional(),
  upgrade_started_at: z.string().datetime().nullable().optional(),
  upgrade_completed_at: z.string().datetime().nullable().optional(),
  last_collected_at: z.string().datetime().nullable().optional(),
});

// ============================================
// INVENTORY SCHEMAS
// ============================================

export const inventoryInsertSchema = z.object({
  player_id: z.string().uuid(),
  max_slots: z.number().int().positive().default(50),
  used_slots: z.number().int().min(0).default(0),
});

export const inventoryUpdateSchema = z.object({
  max_slots: z.number().int().positive().optional(),
  used_slots: z.number().int().min(0).optional(),
});

export const inventoryItemInsertSchema = z.object({
  inventory_id: z.string().uuid(),
  item_key: z.string().min(1),
  name: z.string().min(1).max(100),
  description: z.string().nullable().optional(),
  category: z.string().max(50).nullable().optional(),
  quantity: z.number().int().positive().default(1),
  max_stack: z.number().int().positive().default(99),
  icon_url: z.string().url().nullable().optional(),
  is_consumable: z.boolean().default(false),
});

export const inventoryItemUpdateSchema = z.object({
  item_key: z.string().min(1).optional(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().nullable().optional(),
  category: z.string().max(50).nullable().optional(),
  quantity: z.number().int().positive().optional(),
  max_stack: z.number().int().positive().optional(),
  icon_url: z.string().url().nullable().optional(),
  is_consumable: z.boolean().optional(),
});

// ============================================
// EQUIPMENT SCHEMAS
// ============================================

export const equipmentInsertSchema = z.object({
  equipment_key: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  description: z.string().nullable().optional(),
  rarity: equipmentRarityEnum.default('common'),
  slot: equipmentSlotEnum,
  base_stats: z.record(z.string(), z.unknown()).default({}),
  icon_url: z.string().url().nullable().optional(),
  is_unlocked: z.boolean().default(false),
  unlock_level: z.number().int().min(1).default(1),
});

export const equipmentUpdateSchema = z.object({
  equipment_key: z.string().min(1).max(50).optional(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().nullable().optional(),
  rarity: equipmentRarityEnum.optional(),
  slot: equipmentSlotEnum.optional(),
  base_stats: z.record(z.string(), z.unknown()).optional(),
  icon_url: z.string().url().nullable().optional(),
  is_unlocked: z.boolean().optional(),
  unlock_level: z.number().int().min(1).optional(),
});

export const equipmentInstanceInsertSchema = z.object({
  player_id: z.string().uuid(),
  equipment_id: z.string().uuid(),
  level: z.number().int().min(1).default(1),
  is_equipped: z.boolean().default(false),
  stats: z.record(z.string(), z.unknown()).default({}),
  acquired_at: z.string().datetime().optional(),
});

export const equipmentInstanceUpdateSchema = z.object({
  equipment_id: z.string().uuid().optional(),
  level: z.number().int().min(1).optional(),
  is_equipped: z.boolean().optional(),
  stats: z.record(z.string(), z.unknown()).optional(),
});

// ============================================
// RESEARCH SCHEMAS
// ============================================

export const researchInsertSchema = z.object({
  research_key: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  description: z.string().nullable().optional(),
  category: z.string().max(50).nullable().optional(),
  prerequisite_research_id: z.string().uuid().nullable().optional(),
  cost_resource_id: z.string().uuid().nullable().optional(),
  cost_amount: z.number().int().min(0).default(0),
  research_time_seconds: z.number().int().min(0).default(0),
  unlock_level: z.number().int().min(1).default(1),
  effects: z.record(z.string(), z.unknown()).default({}),
  icon_url: z.string().url().nullable().optional(),
});

export const researchUpdateSchema = z.object({
  research_key: z.string().min(1).max(50).optional(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().nullable().optional(),
  category: z.string().max(50).nullable().optional(),
  prerequisite_research_id: z.string().uuid().nullable().optional(),
  cost_resource_id: z.string().uuid().nullable().optional(),
  cost_amount: z.number().int().min(0).optional(),
  research_time_seconds: z.number().int().min(0).optional(),
  unlock_level: z.number().int().min(1).optional(),
  effects: z.record(z.string(), z.unknown()).optional(),
  icon_url: z.string().url().nullable().optional(),
});

export const researchProgressInsertSchema = z.object({
  player_id: z.string().uuid(),
  research_id: z.string().uuid(),
  status: researchStatusEnum.default('available'),
  started_at: z.string().datetime().nullable().optional(),
  completed_at: z.string().datetime().nullable().optional(),
});

export const researchProgressUpdateSchema = z.object({
  status: researchStatusEnum.optional(),
  started_at: z.string().datetime().nullable().optional(),
  completed_at: z.string().datetime().nullable().optional(),
});

// ============================================
// QUEST SCHEMAS
// ============================================

export const questInsertSchema = z.object({
  quest_key: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  description: z.string().nullable().optional(),
  quest_type: questTypeEnum.default('daily'),
  requirements: z.record(z.string(), z.unknown()).default({}),
  rewards: z.record(z.string(), z.unknown()).default({}),
  start_date: z.string().date().nullable().optional(),
  end_date: z.string().date().nullable().optional(),
  is_repeatable: z.boolean().default(false),
  repeat_interval_days: z.number().int().positive().nullable().optional(),
  prerequisite_quest_id: z.string().uuid().nullable().optional(),
  unlock_level: z.number().int().min(1).default(1),
  icon_url: z.string().url().nullable().optional(),
});

export const questUpdateSchema = z.object({
  quest_key: z.string().min(1).max(50).optional(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().nullable().optional(),
  quest_type: questTypeEnum.optional(),
  requirements: z.record(z.string(), z.unknown()).optional(),
  rewards: z.record(z.string(), z.unknown()).optional(),
  start_date: z.string().date().nullable().optional(),
  end_date: z.string().date().nullable().optional(),
  is_repeatable: z.boolean().optional(),
  repeat_interval_days: z.number().int().positive().nullable().optional(),
  prerequisite_quest_id: z.string().uuid().nullable().optional(),
  unlock_level: z.number().int().min(1).optional(),
  icon_url: z.string().url().nullable().optional(),
});

export const questProgressInsertSchema = z.object({
  player_id: z.string().uuid(),
  quest_id: z.string().uuid(),
  status: questStatusEnum.default('available'),
  progress_data: z.record(z.string(), z.unknown()).default({}),
  started_at: z.string().datetime().nullable().optional(),
  completed_at: z.string().datetime().nullable().optional(),
});

export const questProgressUpdateSchema = z.object({
  status: questStatusEnum.optional(),
  progress_data: z.record(z.string(), z.unknown()).optional(),
  started_at: z.string().datetime().nullable().optional(),
  completed_at: z.string().datetime().nullable().optional(),
});

// ============================================
// ACHIEVEMENT SCHEMAS
// ============================================

export const achievementInsertSchema = z.object({
  achievement_key: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  description: z.string().nullable().optional(),
  category: z.string().max(50).nullable().optional(),
  requirements: z.record(z.string(), z.unknown()).default({}),
  rewards: z.record(z.string(), z.unknown()).default({}),
  points: z.number().int().min(0).default(0),
  is_hidden: z.boolean().default(false),
  icon_url: z.string().url().nullable().optional(),
});

export const achievementUpdateSchema = z.object({
  achievement_key: z.string().min(1).max(50).optional(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().nullable().optional(),
  category: z.string().max(50).nullable().optional(),
  requirements: z.record(z.string(), z.unknown()).optional(),
  rewards: z.record(z.string(), z.unknown()).optional(),
  points: z.number().int().min(0).optional(),
  is_hidden: z.boolean().optional(),
  icon_url: z.string().url().nullable().optional(),
});

export const achievementProgressInsertSchema = z.object({
  player_id: z.string().uuid(),
  achievement_id: z.string().uuid(),
  progress_data: z.record(z.string(), z.unknown()).default({}),
  is_completed: z.boolean().default(false),
  completed_at: z.string().datetime().nullable().optional(),
});

export const achievementProgressUpdateSchema = z.object({
  progress_data: z.record(z.string(), z.unknown()).optional(),
  is_completed: z.boolean().optional(),
  completed_at: z.string().datetime().nullable().optional(),
});

// ============================================
// NOTIFICATION SCHEMAS
// ============================================

export const notificationInsertSchema = z.object({
  player_id: z.string().uuid(),
  type: notificationTypeEnum.default('system'),
  priority: notificationPriorityEnum.default('normal'),
  title: z.string().min(1).max(200),
  message: z.string().min(1),
  data: z.record(z.string(), z.unknown()).default({}),
  is_read: z.boolean().default(false),
  read_at: z.string().datetime().nullable().optional(),
  expires_at: z.string().datetime().nullable().optional(),
});

export const notificationUpdateSchema = z.object({
  type: notificationTypeEnum.optional(),
  priority: notificationPriorityEnum.optional(),
  title: z.string().min(1).max(200).optional(),
  message: z.string().min(1).optional(),
  data: z.record(z.string(), z.unknown()).optional(),
  is_read: z.boolean().optional(),
  read_at: z.string().datetime().nullable().optional(),
  expires_at: z.string().datetime().nullable().optional(),
});

// ============================================
// DAILY REWARD SCHEMAS
// ============================================

export const dailyRewardInsertSchema = z.object({
  player_id: z.string().uuid(),
  day_sequence: z.number().int().positive(),
  claimed_at: z.string().datetime().optional(),
  rewards_claimed: z.record(z.string(), z.unknown()).default({}),
});

export const dailyRewardUpdateSchema = z.object({
  day_sequence: z.number().int().positive().optional(),
  claimed_at: z.string().datetime().optional(),
  rewards_claimed: z.record(z.string(), z.unknown()).optional(),
});

// ============================================
// FRIEND SCHEMAS
// ============================================

export const friendInsertSchema = z.object({
  requester_id: z.string().uuid(),
  receiver_id: z.string().uuid(),
  status: friendshipStatusEnum.default('pending'),
  requested_at: z.string().datetime().optional(),
  accepted_at: z.string().datetime().nullable().optional(),
  blocked_at: z.string().datetime().nullable().optional(),
});

export const friendUpdateSchema = z.object({
  status: friendshipStatusEnum.optional(),
  accepted_at: z.string().datetime().nullable().optional(),
  blocked_at: z.string().datetime().nullable().optional(),
});

// ============================================
// LEADERBOARD SCHEMAS
// ============================================

export const leaderboardInsertSchema = z.object({
  leaderboard_key: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  description: z.string().nullable().optional(),
  leaderboard_type: leaderboardTypeEnum.default('total_coins'),
  reset_period: z.string().max(50).nullable().optional(),
  last_reset_at: z.string().datetime().nullable().optional(),
  is_active: z.boolean().default(true),
});

export const leaderboardUpdateSchema = z.object({
  leaderboard_key: z.string().min(1).max(50).optional(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().nullable().optional(),
  leaderboard_type: leaderboardTypeEnum.optional(),
  reset_period: z.string().max(50).nullable().optional(),
  last_reset_at: z.string().datetime().nullable().optional(),
  is_active: z.boolean().optional(),
});

export const leaderboardEntryInsertSchema = z.object({
  leaderboard_id: z.string().uuid(),
  player_id: z.string().uuid(),
  score: z.number().int().min(0).default(0),
  rank: z.number().int().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const leaderboardEntryUpdateSchema = z.object({
  score: z.number().int().min(0).optional(),
  rank: z.number().int().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// ============================================
// TELEMETRY SCHEMAS
// ============================================

export const telemetryLogInsertSchema = z.object({
  player_id: z.string().uuid().nullable().optional(),
  event_type: telemetryEventTypeEnum,
  event_name: z.string().min(1).max(100),
  event_data: z.record(z.string(), z.unknown()).default({}),
  session_id: z.string().uuid().nullable().optional(),
  user_agent: z.string().nullable().optional(),
  ip_address: z.string().nullable().optional(),
});

// ============================================
// SETTINGS SCHEMAS
// ============================================

export const settingInsertSchema = z.object({
  player_id: z.string().uuid(),
  setting_key: z.string().min(1).max(100),
  setting_value: z.record(z.string(), z.unknown()),
});

export const settingUpdateSchema = z.object({
  setting_key: z.string().min(1).max(100).optional(),
  setting_value: z.record(z.string(), z.unknown()).optional(),
});
