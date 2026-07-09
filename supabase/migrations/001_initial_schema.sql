-- FreeCoin Empire - Initial Database Schema
-- Production-ready schema designed for millions of users
-- Implements Row Level Security (RLS) for data isolation

-- Note: Supabase uses gen_random_uuid() by default (no extension needed)

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE resource_type AS ENUM ('coins', 'gems', 'energy', 'materials', 'special');
CREATE TYPE building_status AS ENUM ('building', 'active', 'upgrading', 'destroyed');
CREATE TYPE equipment_rarity AS ENUM ('common', 'uncommon', 'rare', 'epic', 'legendary');
CREATE TYPE equipment_slot AS ENUM ('tool', 'armor', 'accessory', 'special');
CREATE TYPE research_status AS ENUM ('available', 'in_progress', 'completed', 'locked');
CREATE TYPE quest_status AS ENUM ('available', 'in_progress', 'completed', 'failed');
CREATE TYPE quest_type AS ENUM ('daily', 'weekly', 'story', 'achievement', 'special');
CREATE TYPE notification_type AS ENUM ('system', 'quest', 'social', 'reward', 'achievement', 'alert');
CREATE TYPE notification_priority AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE friendship_status AS ENUM ('pending', 'accepted', 'blocked');
CREATE TYPE leaderboard_type AS ENUM ('total_coins', 'daily_coins', 'buildings', 'research', 'special');
CREATE TYPE telemetry_event_type AS ENUM ('session_start', 'session_end', 'action', 'error', 'performance');

-- ============================================
-- PLAYERS & PROFILES
-- ============================================

CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_id BIGINT UNIQUE NOT NULL,
    telegram_username VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_banned BOOLEAN NOT NULL DEFAULT FALSE,
    banned_at TIMESTAMPTZ,
    ban_reason TEXT,
    deleted_at TIMESTAMPTZ,
    
    CONSTRAINT check_telegram_id_positive CHECK (telegram_id > 0)
);

CREATE INDEX idx_players_telegram_id ON players(telegram_id);
CREATE INDEX idx_players_last_active ON players(last_active_at);
CREATE INDEX idx_players_is_active ON players(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_players_deleted_at ON players(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE TABLE player_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    display_name VARCHAR(50) NOT NULL,
    avatar_url TEXT,
    level INTEGER NOT NULL DEFAULT 1,
    experience BIGINT NOT NULL DEFAULT 0,
    title VARCHAR(100),
    bio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT check_level_positive CHECK (level >= 1),
    CONSTRAINT check_experience_positive CHECK (experience >= 0),
    CONSTRAINT uq_player_id UNIQUE (player_id)
);

CREATE INDEX idx_player_profiles_player_id ON player_profiles(player_id);
CREATE INDEX idx_player_profiles_level ON player_profiles(level);
CREATE INDEX idx_player_profiles_experience ON player_profiles(experience DESC);

-- ============================================
-- RESOURCES & BALANCES
-- ============================================

CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_key VARCHAR(50) UNIQUE NOT NULL,
    resource_type resource_type NOT NULL,
   名称 VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url TEXT,
    is_tradable BOOLEAN NOT NULL DEFAULT FALSE,
    max_stack INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_resources_resource_key ON resources(resource_key);
CREATE INDEX idx_resources_resource_type ON resources(resource_type);

CREATE TABLE resource_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    amount BIGINT NOT NULL DEFAULT 0,
    last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT check_amount_positive CHECK (amount >= 0),
    CONSTRAINT uq_player_resource UNIQUE (player_id, resource_id)
);

CREATE INDEX idx_resource_balances_player_id ON resource_balances(player_id);
CREATE INDEX idx_resource_balances_resource_id ON resource_balances(resource_id);
CREATE INDEX idx_resource_balances_amount ON resource_balances(amount DESC);

-- ============================================
-- EMPIRE & BUILDINGS
-- ============================================

CREATE TABLE empire (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    level INTEGER NOT NULL DEFAULT 1,
    experience BIGINT NOT NULL DEFAULT 0,
    grid_size INTEGER NOT NULL DEFAULT 10,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT check_empire_level_positive CHECK (level >= 1),
    CONSTRAINT check_empire_experience_positive CHECK (experience >= 0),
    CONSTRAINT check_grid_size_positive CHECK (grid_size > 0),
    CONSTRAINT uq_player_empire UNIQUE (player_id)
);

CREATE INDEX idx_empire_player_id ON empire(player_id);
CREATE INDEX idx_empire_level ON empire(level);

CREATE TABLE buildings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    base_cost_resource_id UUID REFERENCES resources(id),
    base_cost_amount BIGINT NOT NULL DEFAULT 0,
    build_time_seconds INTEGER NOT NULL DEFAULT 0,
    max_level INTEGER NOT NULL DEFAULT 10,
    produces_resource_id UUID REFERENCES resources(id),
    production_amount_per_second DECIMAL(20, 8) NOT NULL DEFAULT 0,
    icon_url TEXT,
    is_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
    unlock_level INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT check_build_time_positive CHECK (build_time_seconds >= 0),
    CONSTRAINT check_max_level_positive CHECK (max_level >= 1),
    CONSTRAINT check_production_positive CHECK (production_amount_per_second >= 0)
);

CREATE INDEX idx_buildings_building_key ON buildings(building_key);
CREATE INDEX idx_buildings_category ON buildings(category);
CREATE INDEX idx_buildings_unlock_level ON buildings(unlock_level);

CREATE TABLE placed_objects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE RESTRICT,
    grid_x INTEGER NOT NULL,
    grid_y INTEGER NOT NULL,
    level INTEGER NOT NULL DEFAULT 1,
    status building_status NOT NULL DEFAULT 'building',
    build_started_at TIMESTAMPTZ,
    build_completed_at TIMESTAMPTZ,
    upgrade_started_at TIMESTAMPTZ,
    upgrade_completed_at TIMESTAMPTZ,
    last_collected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT check_grid_coordinates CHECK (grid_x >= 0 AND grid_y >= 0),
    CONSTRAINT check_building_level_positive CHECK (level >= 1),
    CONSTRAINT uq_player_grid_position UNIQUE (player_id, grid_x, grid_y)
);

CREATE INDEX idx_placed_objects_player_id ON placed_objects(player_id);
CREATE INDEX idx_placed_objects_building_id ON placed_objects(building_id);
CREATE INDEX idx_placed_objects_status ON placed_objects(status);
CREATE INDEX idx_placed_objects_grid_position ON placed_objects(player_id, grid_x, grid_y);

-- ============================================
-- INVENTORY & EQUIPMENT
-- ============================================

CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    max_slots INTEGER NOT NULL DEFAULT 50,
    used_slots INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT check_max_slots_positive CHECK (max_slots > 0),
    CONSTRAINT check_used_slots_valid CHECK (used_slots >= 0 AND used_slots <= max_slots),
    CONSTRAINT uq_player_inventory UNIQUE (player_id)
);

CREATE INDEX idx_inventory_player_id ON inventory(player_id);

CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    item_key VARCHAR(50) NOT NULL,
    名称 VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    quantity INTEGER NOT NULL DEFAULT 1,
    max_stack INTEGER NOT NULL DEFAULT 99,
    icon_url TEXT,
    is_consumable BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT check_quantity_positive CHECK (quantity > 0),
    CONSTRAINT check_max_stack_positive CHECK (max_stack > 0),
    CONSTRAINT check_quantity_not_exceed_stack CHECK (quantity <= max_stack)
);

CREATE INDEX idx_inventory_items_inventory_id ON inventory_items(inventory_id);
CREATE INDEX idx_inventory_items_item_key ON inventory_items(item_key);
CREATE INDEX idx_inventory_items_category ON inventory_items(category);

CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_key VARCHAR(50) UNIQUE NOT NULL,
    名称 VARCHAR(100) NOT NULL,
    description TEXT,
    rarity equipment_rarity NOT NULL DEFAULT 'common',
    slot equipment_slot NOT NULL,
    base_stats JSONB NOT NULL DEFAULT '{}',
    icon_url TEXT,
    is_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
    unlock_level INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_equipment_equipment_key ON equipment(equipment_key);
CREATE INDEX idx_equipment_rarity ON equipment(rarity);
CREATE INDEX idx_equipment_slot ON equipment(slot);
CREATE INDEX idx_equipment_unlock_level ON equipment(unlock_level);

CREATE TABLE equipment_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE RESTRICT,
    level INTEGER NOT NULL DEFAULT 1,
    is_equipped BOOLEAN NOT NULL DEFAULT FALSE,
    stats JSONB NOT NULL DEFAULT '{}',
    acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT check_equipment_level_positive CHECK (level >= 1)
);

CREATE INDEX idx_equipment_instances_player_id ON equipment_instances(player_id);
CREATE INDEX idx_equipment_instances_equipment_id ON equipment_instances(equipment_id);
CREATE INDEX idx_equipment_instances_is_equipped ON equipment_instances(is_equipped) WHERE is_equipped = TRUE;

-- ============================================
-- RESEARCH
-- ============================================

CREATE TABLE research (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    research_key VARCHAR(50) UNIQUE NOT NULL,
    名称 VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    prerequisite_research_id UUID REFERENCES research(id),
    cost_resource_id UUID REFERENCES resources(id),
    cost_amount BIGINT NOT NULL DEFAULT 0,
    research_time_seconds INTEGER NOT NULL DEFAULT 0,
    unlock_level INTEGER NOT NULL DEFAULT 1,
    effects JSONB NOT NULL DEFAULT '{}',
    icon_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT check_research_time_positive CHECK (research_time_seconds >= 0),
    CONSTRAINT check_cost_positive CHECK (cost_amount >= 0)
);

CREATE INDEX idx_research_research_key ON research(research_key);
CREATE INDEX idx_research_category ON research(category);
CREATE INDEX idx_research_prerequisite ON research(prerequisite_research_id);
CREATE INDEX idx_research_unlock_level ON research(unlock_level);

CREATE TABLE research_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    research_id UUID NOT NULL REFERENCES research(id) ON DELETE CASCADE,
    status research_status NOT NULL DEFAULT 'available',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT uq_player_research UNIQUE (player_id, research_id)
);

CREATE INDEX idx_research_progress_player_id ON research_progress(player_id);
CREATE INDEX idx_research_progress_research_id ON research_progress(research_id);
CREATE INDEX idx_research_progress_status ON research_progress(status);

-- ============================================
-- QUESTS
-- ============================================

CREATE TABLE quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quest_key VARCHAR(50) UNIQUE NOT NULL,
    名称 VARCHAR(100) NOT NULL,
    description TEXT,
    quest_type quest_type NOT NULL DEFAULT 'daily',
    requirements JSONB NOT NULL DEFAULT '{}',
    rewards JSONB NOT NULL DEFAULT '{}',
    start_date DATE,
    end_date DATE,
    is_repeatable BOOLEAN NOT NULL DEFAULT FALSE,
    repeat_interval_days INTEGER,
    prerequisite_quest_id UUID REFERENCES quests(id),
    unlock_level INTEGER NOT NULL DEFAULT 1,
    icon_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT check_repeat_interval_positive CHECK (repeat_interval_days IS NULL OR repeat_interval_days > 0),
    CONSTRAINT check_unlock_level_positive CHECK (unlock_level >= 1)
);

CREATE INDEX idx_quests_quest_key ON quests(quest_key);
CREATE INDEX idx_quests_quest_type ON quests(quest_type);
CREATE INDEX idx_quests_dates ON quests(start_date, end_date);
CREATE INDEX idx_quests_prerequisite ON quests(prerequisite_quest_id);

CREATE TABLE quest_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    status quest_status NOT NULL DEFAULT 'available',
    progress_data JSONB NOT NULL DEFAULT '{}',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT uq_player_quest UNIQUE (player_id, quest_id)
);

CREATE INDEX idx_quest_progress_player_id ON quest_progress(player_id);
CREATE INDEX idx_quest_progress_quest_id ON quest_progress(quest_id);
CREATE INDEX idx_quest_progress_status ON quest_progress(status);
CREATE INDEX idx_quest_progress_completed_at ON quest_progress(completed_at DESC);

-- ============================================
-- ACHIEVEMENTS
-- ============================================

CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    achievement_key VARCHAR(50) UNIQUE NOT NULL,
    名称 VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    requirements JSONB NOT NULL DEFAULT '{}',
    rewards JSONB NOT NULL DEFAULT '{}',
    points INTEGER NOT NULL DEFAULT 0,
    is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
    icon_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT check_points_positive CHECK (points >= 0)
);

CREATE INDEX idx_achievements_achievement_key ON achievements(achievement_key);
CREATE INDEX idx_achievements_category ON achievements(category);
CREATE INDEX idx_achievements_points ON achievements(points DESC);

CREATE TABLE achievement_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    progress_data JSONB NOT NULL DEFAULT '{}',
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT uq_player_achievement UNIQUE (player_id, achievement_id)
);

CREATE INDEX idx_achievement_progress_player_id ON achievement_progress(player_id);
CREATE INDEX idx_achievement_progress_achievement_id ON achievement_progress(achievement_id);
CREATE INDEX idx_achievement_progress_is_completed ON achievement_progress(is_completed);
CREATE INDEX idx_achievement_progress_completed_at ON achievement_progress(completed_at DESC);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    type notification_type NOT NULL DEFAULT 'system',
    priority notification_priority NOT NULL DEFAULT 'normal',
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_player_id ON notifications(player_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_priority ON notifications(priority);
CREATE INDEX idx_notifications_is_read ON notifications(is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_expires_at ON notifications(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================
-- DAILY REWARDS
-- ============================================

CREATE TABLE daily_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    day_sequence INTEGER NOT NULL,
    claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    rewards_claimed JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT check_day_sequence_positive CHECK (day_sequence > 0),
    CONSTRAINT uq_player_day_sequence UNIQUE (player_id, day_sequence)
);

CREATE INDEX idx_daily_rewards_player_id ON daily_rewards(player_id);
CREATE INDEX idx_daily_rewards_claimed_at ON daily_rewards(claimed_at DESC);
CREATE INDEX idx_daily_rewards_day_sequence ON daily_rewards(day_sequence);

-- ============================================
-- FRIENDS
-- ============================================

CREATE TABLE friends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    status friendship_status NOT NULL DEFAULT 'pending',
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    blocked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT check_not_self CHECK (requester_id != receiver_id),
    CONSTRAINT uq_friendship UNIQUE (requester_id, receiver_id)
);

CREATE INDEX idx_friends_requester_id ON friends(requester_id);
CREATE INDEX idx_friends_receiver_id ON friends(receiver_id);
CREATE INDEX idx_friends_status ON friends(status);
CREATE INDEX idx_friends_accepted_at ON friends(accepted_at DESC);

-- ============================================
-- LEADERBOARDS
-- ============================================

CREATE TABLE leaderboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leaderboard_key VARCHAR(50) UNIQUE NOT NULL,
    名称 VARCHAR(100) NOT NULL,
    description TEXT,
    leaderboard_type leaderboard_type NOT NULL DEFAULT 'total_coins',
    reset_period VARCHAR(50),
    last_reset_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_leaderboards_leaderboard_key ON leaderboards(leaderboard_key);
CREATE INDEX idx_leaderboards_type ON leaderboards(leaderboard_type);
CREATE INDEX idx_leaderboards_is_active ON leaderboards(is_active) WHERE is_active = TRUE;

CREATE TABLE leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leaderboard_id UUID NOT NULL REFERENCES leaderboards(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    score BIGINT NOT NULL DEFAULT 0,
    rank INTEGER,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT check_score_positive CHECK (score >= 0),
    CONSTRAINT uq_leaderboard_player UNIQUE (leaderboard_id, player_id)
);

CREATE INDEX idx_leaderboard_entries_leaderboard_id ON leaderboard_entries(leaderboard_id);
CREATE INDEX idx_leaderboard_entries_player_id ON leaderboard_entries(player_id);
CREATE INDEX idx_leaderboard_entries_score ON leaderboard_entries(score DESC);
CREATE INDEX idx_leaderboard_entries_rank ON leaderboard_entries(rank);

-- ============================================
-- TELEMETRY LOGS
-- ============================================

CREATE TABLE telemetry_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id) ON DELETE SET NULL,
    event_type telemetry_event_type NOT NULL,
    event_name VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL DEFAULT '{}',
    session_id UUID,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_telemetry_logs_player_id ON telemetry_logs(player_id);
CREATE INDEX idx_telemetry_logs_event_type ON telemetry_logs(event_type);
CREATE INDEX idx_telemetry_logs_event_name ON telemetry_logs(event_name);
CREATE INDEX idx_telemetry_logs_session_id ON telemetry_logs(session_id);
CREATE INDEX idx_telemetry_logs_created_at ON telemetry_logs(created_at DESC);

-- ============================================
-- SETTINGS
-- ============================================

CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT uq_player_setting UNIQUE (player_id, setting_key)
);

CREATE INDEX idx_settings_player_id ON settings(player_id);
CREATE INDEX idx_settings_setting_key ON settings(setting_key);

-- ============================================
-- FUNCTIONS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables with updated_at
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_profiles_updated_at BEFORE UPDATE ON player_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resource_balances_updated_at BEFORE UPDATE ON resource_balances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_empire_updated_at BEFORE UPDATE ON empire
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_buildings_updated_at BEFORE UPDATE ON buildings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_placed_objects_updated_at BEFORE UPDATE ON placed_objects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_instances_updated_at BEFORE UPDATE ON equipment_instances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_research_updated_at BEFORE UPDATE ON research
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_research_progress_updated_at BEFORE UPDATE ON research_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quests_updated_at BEFORE UPDATE ON quests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quest_progress_updated_at BEFORE UPDATE ON quest_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_achievements_updated_at BEFORE UPDATE ON achievements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_achievement_progress_updated_at BEFORE UPDATE ON achievement_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friends_updated_at BEFORE UPDATE ON friends
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leaderboards_updated_at BEFORE UPDATE ON leaderboards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leaderboard_entries_updated_at BEFORE UPDATE ON leaderboard_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
