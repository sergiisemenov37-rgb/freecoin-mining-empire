# FreeCoin Empire - Database Architecture Documentation

## Overview

This document describes the complete database architecture for FreeCoin Empire, a production-ready Telegram Mini App designed to scale to millions of users. The database uses PostgreSQL via Supabase with Row Level Security (RLS) for data isolation.

## Design Principles

1. **Normalization**: Third Normal Form (3NF) to minimize redundancy
2. **Security**: Row Level Security ensures players can only access their own data
3. **Scalability**: Indexed columns for common queries, optimized for high read/write loads
4. **Flexibility**: JSONB fields for extensible data without schema changes
5. **Audit**: Timestamps on all tables for tracking changes
6. **Soft Deletes**: Where appropriate to preserve data integrity

## Entity Relationship Diagram

```
players (1) ----< (1) player_profiles
players (1) ----< (1) empire
players (1) ----< (1) inventory
players (1) ----< (N) resource_balances
players (1) ----< (N) placed_objects
players (1) ----< (N) equipment_instances
players (1) ----< (N) research_progress
players (1) ----< (N) quest_progress
players (1) ----< (N) achievement_progress
players (1) ----< (N) notifications
players (1) ----< (N) daily_rewards
players (1) ----< (N) friends (as requester or receiver)
players (1) ----< (N) leaderboard_entries
players (1) ----< (N) telemetry_logs
players (1) ----< (N) settings

resources (1) ----< (N) resource_balances
resources (1) ----< (N) buildings (as cost or production)
resources (1) ----< (N) research (as cost)

buildings (1) ----< (N) placed_objects

inventory (1) ----< (N) inventory_items

equipment (1) ----< (N) equipment_instances

research (1) ----< (N) research_progress
research (1) ----< (N) research (as prerequisite)

quests (1) ----< (N) quest_progress
quests (1) ----< (N) quests (as prerequisite)

achievements (1) ----< (N) achievement_progress

leaderboards (1) ----< (N) leaderboard_entries
```

## Table Descriptions

### Core Player Tables

#### `players`
Stores player account information linked to Telegram accounts.

**Key Fields:**
- `id`: UUID primary key
- `telegram_id`: Unique Telegram user ID (indexed)
- `telegram_username`: Optional Telegram username
- `is_active`: Account status flag
- `is_banned`: Ban status flag
- `deleted_at`: Soft delete timestamp

**Indexes:**
- `idx_players_telegram_id`: Fast lookup by Telegram ID
- `idx_players_last_active`: For active user tracking
- `idx_players_is_active`: For active user queries
- `idx_players_deleted_at`: For soft delete queries

#### `player_profiles`
Stores player profile data (display name, avatar, level, experience).

**Key Fields:**
- `id`: UUID primary key
- `player_id`: Foreign key to players (unique)
- `display_name`: Player's chosen display name
- `level`: Player level
- `experience`: Total experience points

**Indexes:**
- `idx_player_profiles_player_id`: Fast lookup by player
- `idx_player_profiles_level`: For level-based queries
- `idx_player_profiles_experience`: For leaderboard queries

### Resource System

#### `resources`
Defines all resource types (coins, gems, energy, materials, special).

**Key Fields:**
- `id`: UUID primary key
- `resource_key`: Unique identifier (e.g., "coins", "gems")
- `resource_type`: Enum (coins, gems, energy, materials, special)
- `is_tradable`: Whether resource can be traded
- `max_stack`: Maximum stack size

**Indexes:**
- `idx_resources_resource_key`: Fast lookup by key
- `idx_resources_resource_type`: For type-based queries

#### `resource_balances`
Tracks player's resource balances.

**Key Fields:**
- `id`: UUID primary key
- `player_id`: Foreign key to players
- `resource_id`: Foreign key to resources
- `amount`: Current balance
- `last_updated_at`: Last modification timestamp

**Constraints:**
- `uq_player_resource`: Unique player-resource combination
- `check_amount_positive`: Amount must be >= 0

**Indexes:**
- `idx_resource_balances_player_id`: Fast lookup by player
- `idx_resource_balances_resource_id`: Fast lookup by resource
- `idx_resource_balances_amount`: For sorting by balance

### Empire & Buildings

#### `empire`
Stores player's empire information.

**Key Fields:**
- `id`: UUID primary key
- `player_id`: Foreign key to players (unique)
- `name`: Empire name
- `level`: Empire level
- `grid_size`: Building grid dimensions

**Indexes:**
- `idx_empire_player_id`: Fast lookup by player
- `idx_empire_level`: For level-based queries

#### `buildings`
Defines building types available in the game.

**Key Fields:**
- `id`: UUID primary key
- `building_key`: Unique identifier
- `base_cost_resource_id`: Resource used for building
- `base_cost_amount`: Cost amount
- `build_time_seconds`: Time to build
- `produces_resource_id`: Resource produced (if any)
- `production_amount_per_second`: Production rate

**Indexes:**
- `idx_buildings_building_key`: Fast lookup by key
- `idx_buildings_category`: For category queries
- `idx_buildings_unlock_level`: For unlock queries

#### `placed_objects`
Tracks buildings placed on player's empire grid.

**Key Fields:**
- `id`: UUID primary key
- `player_id`: Foreign key to players
- `building_id`: Foreign key to buildings
- `grid_x`, `grid_y`: Grid coordinates
- `level`: Building level
- `status`: Current status (building, active, upgrading, destroyed)
- `build_started_at`, `build_completed_at`: Build timestamps
- `upgrade_started_at`, `upgrade_completed_at`: Upgrade timestamps
- `last_collected_at`: Last collection timestamp

**Constraints:**
- `uq_player_grid_position`: Unique grid position per player
- `check_grid_coordinates`: Coordinates must be >= 0

**Indexes:**
- `idx_placed_objects_player_id`: Fast lookup by player
- `idx_placed_objects_building_id`: Fast lookup by building type
- `idx_placed_objects_status`: For status queries
- `idx_placed_objects_grid_position`: For grid queries

### Inventory System

#### `inventory`
Stores player's inventory metadata.

**Key Fields:**
- `id`: UUID primary key
- `player_id`: Foreign key to players (unique)
- `max_slots`: Maximum inventory slots
- `used_slots`: Currently used slots

**Constraints:**
- `check_max_slots_positive`: Max slots must be > 0
- `check_used_slots_valid`: Used slots must be between 0 and max slots

**Indexes:**
- `idx_inventory_player_id`: Fast lookup by player

#### `inventory_items`
Stores individual items in player's inventory.

**Key Fields:**
- `id`: UUID primary key
- `inventory_id`: Foreign key to inventory
- `item_key`: Item identifier
- `quantity`: Item quantity
- `max_stack`: Maximum stack size
- `is_consumable`: Whether item is consumable

**Constraints:**
- `check_quantity_positive`: Quantity must be > 0
- `check_quantity_not_exceed_stack`: Quantity cannot exceed max stack

**Indexes:**
- `idx_inventory_items_inventory_id`: Fast lookup by inventory
- `idx_inventory_items_item_key`: Fast lookup by item type
- `idx_inventory_items_category`: For category queries

### Equipment System

#### `equipment`
Defines equipment types available in the game.

**Key Fields:**
- `id`: UUID primary key
- `equipment_key`: Unique identifier
- `rarity`: Enum (common, uncommon, rare, epic, legendary)
- `slot`: Enum (tool, armor, accessory, special)
- `base_stats`: JSONB with base statistics
- `unlock_level`: Level required to unlock

**Indexes:**
- `idx_equipment_equipment_key`: Fast lookup by key
- `idx_equipment_rarity`: For rarity queries
- `idx_equipment_slot`: For slot queries
- `idx_equipment_unlock_level`: For unlock queries

#### `equipment_instances`
Tracks player's equipment instances.

**Key Fields:**
- `id`: UUID primary key
- `player_id`: Foreign key to players
- `equipment_id`: Foreign key to equipment
- `level`: Equipment level
- `is_equipped`: Whether currently equipped
- `stats`: JSONB with current statistics
- `acquired_at`: Acquisition timestamp

**Indexes:**
- `idx_equipment_instances_player_id`: Fast lookup by player
- `idx_equipment_instances_equipment_id`: Fast lookup by equipment type
- `idx_equipment_instances_is_equipped`: For equipped equipment queries

### Progression Systems

#### `research`
Defines research topics available in the game.

**Key Fields:**
- `id`: UUID primary key
- `research_key`: Unique identifier
- `prerequisite_research_id`: Foreign key to self (prerequisite)
- `cost_resource_id`: Resource used for research
- `cost_amount`: Cost amount
- `research_time_seconds`: Time to complete
- `effects`: JSONB with research effects

**Indexes:**
- `idx_research_research_key`: Fast lookup by key
- `idx_research_category`: For category queries
- `idx_research_prerequisite`: For prerequisite queries
- `idx_research_unlock_level`: For unlock queries

#### `research_progress`
Tracks player's research progress.

**Key Fields:**
- `id`: UUID primary key
- `player_id`: Foreign key to players
- `research_id`: Foreign key to research
- `status`: Enum (available, in_progress, completed, locked)
- `started_at`: Research start timestamp
- `completed_at`: Research completion timestamp

**Constraints:**
- `uq_player_research`: Unique player-research combination

**Indexes:**
- `idx_research_progress_player_id`: Fast lookup by player
- `idx_research_progress_research_id`: Fast lookup by research
- `idx_research_progress_status`: For status queries

#### `quests`
Defines quests available in the game.

**Key Fields:**
- `id`: UUID primary key
- `quest_key`: Unique identifier
- `quest_type`: Enum (daily, weekly, story, achievement, special)
- `requirements`: JSONB with quest requirements
- `rewards`: JSONB with quest rewards
- `start_date`, `end_date`: Quest availability dates
- `is_repeatable`: Whether quest can be repeated
- `repeat_interval_days`: Days between repeats
- `prerequisite_quest_id`: Foreign key to self (prerequisite)

**Indexes:**
- `idx_quests_quest_key`: Fast lookup by key
- `idx_quests_quest_type`: For type queries
- `idx_quests_dates`: For date range queries
- `idx_quests_prerequisite`: For prerequisite queries

#### `quest_progress`
Tracks player's quest progress.

**Key Fields:**
- `id`: UUID primary key
- `player_id`: Foreign key to players
- `quest_id`: Foreign key to quests
- `status`: Enum (available, in_progress, completed, failed)
- `progress_data`: JSONB with progress information
- `started_at`: Quest start timestamp
- `completed_at`: Quest completion timestamp

**Constraints:**
- `uq_player_quest`: Unique player-quest combination

**Indexes:**
- `idx_quest_progress_player_id`: Fast lookup by player
- `idx_quest_progress_quest_id`: Fast lookup by quest
- `idx_quest_progress_status`: For status queries
- `idx_quest_progress_completed_at`: For completion queries

#### `achievements`
Defines achievements available in the game.

**Key Fields:**
- `id`: UUID primary key
- `achievement_key`: Unique identifier
- `requirements`: JSONB with achievement requirements
- `rewards`: JSONB with achievement rewards
- `points`: Achievement point value
- `is_hidden`: Whether achievement is hidden until completed

**Indexes:**
- `idx_achievements_achievement_key`: Fast lookup by key
- `idx_achievements_category`: For category queries
- `idx_achievements_points`: For point sorting

#### `achievement_progress`
Tracks player's achievement progress.

**Key Fields:**
- `id`: UUID primary key
- `player_id`: Foreign key to players
- `achievement_id`: Foreign key to achievements
- `progress_data`: JSONB with progress information
- `is_completed`: Whether achievement is completed
- `completed_at`: Completion timestamp

**Constraints:**
- `uq_player_achievement`: Unique player-achievement combination

**Indexes:**
- `idx_achievement_progress_player_id`: Fast lookup by player
- `idx_achievement_progress_achievement_id`: Fast lookup by achievement
- `idx_achievement_progress_is_completed`: For completion queries
- `idx_achievement_progress_completed_at`: For completion sorting

### Social & Communication

#### `notifications`
Stores player notifications.

**Key Fields:**
- `id`: UUID primary key
- `player_id`: Foreign key to players
- `type`: Enum (system, quest, social, reward, achievement, alert)
- `priority`: Enum (low, normal, high, urgent)
- `title`: Notification title
- `message`: Notification message
- `data`: JSONB with additional data
- `is_read`: Read status flag
- `read_at`: Read timestamp
- `expires_at`: Expiration timestamp

**Indexes:**
- `idx_notifications_player_id`: Fast lookup by player
- `idx_notifications_type`: For type queries
- `idx_notifications_priority`: For priority queries
- `idx_notifications_is_read`: For unread queries
- `idx_notifications_created_at`: For chronological queries
- `idx_notifications_expires_at`: For expiration queries

#### `daily_rewards`
Tracks player's daily reward claims.

**Key Fields:**
- `id`: UUID primary key
- `player_id`: Foreign key to players
- `day_sequence`: Day number in sequence
- `claimed_at`: Claim timestamp
- `rewards_claimed`: JSONB with claimed rewards

**Constraints:**
- `check_day_sequence_positive`: Day sequence must be > 0
- `uq_player_day_sequence`: Unique player-day combination

**Indexes:**
- `idx_daily_rewards_player_id`: Fast lookup by player
- `idx_daily_rewards_claimed_at`: For chronological queries
- `idx_daily_rewards_day_sequence`: For sequence queries

#### `friends`
Stores player friendships.

**Key Fields:**
- `id`: UUID primary key
- `requester_id`: Foreign key to players (requester)
- `receiver_id`: Foreign key to players (receiver)
- `status`: Enum (pending, accepted, blocked)
- `requested_at`: Request timestamp
- `accepted_at`: Acceptance timestamp
- `blocked_at`: Blocked timestamp

**Constraints:**
- `check_not_self`: Requester and receiver must be different
- `uq_friendship`: Unique requester-receiver combination

**Indexes:**
- `idx_friends_requester_id`: Fast lookup by requester
- `idx_friends_receiver_id`: Fast lookup by receiver
- `idx_friends_status`: For status queries
- `idx_friends_accepted_at`: For accepted friendship queries

#### `leaderboards`
Defines leaderboard types.

**Key Fields:**
- `id`: UUID primary key
- `leaderboard_key`: Unique identifier
- `leaderboard_type`: Enum (total_coins, daily_coins, buildings, research, special)
- `reset_period`: Reset period description
- `last_reset_at`: Last reset timestamp
- `is_active`: Active status flag

**Indexes:**
- `idx_leaderboards_leaderboard_key`: Fast lookup by key
- `idx_leaderboards_type`: For type queries
- `idx_leaderboards_is_active`: For active leaderboard queries

#### `leaderboard_entries`
Stores player leaderboard entries.

**Key Fields:**
- `id`: UUID primary key
- `leaderboard_id`: Foreign key to leaderboards
- `player_id`: Foreign key to players
- `score`: Player score
- `rank`: Current rank
- `metadata`: JSONB with additional data

**Constraints:**
- `check_score_positive`: Score must be >= 0
- `uq_leaderboard_player`: Unique leaderboard-player combination

**Indexes:**
- `idx_leaderboard_entries_leaderboard_id`: Fast lookup by leaderboard
- `idx_leaderboard_entries_player_id`: Fast lookup by player
- `idx_leaderboard_entries_score`: For score sorting
- `idx_leaderboard_entries_rank`: For rank queries

### Analytics & Settings

#### `telemetry_logs`
Stores telemetry and analytics data.

**Key Fields:**
- `id`: UUID primary key
- `player_id`: Foreign key to players (nullable)
- `event_type`: Enum (session_start, session_end, action, error, performance)
- `event_name`: Event name
- `event_data`: JSONB with event data
- `session_id`: Session identifier
- `user_agent`: User agent string
- `ip_address`: IP address

**Indexes:**
- `idx_telemetry_logs_player_id`: Fast lookup by player
- `idx_telemetry_logs_event_type`: For type queries
- `idx_telemetry_logs_event_name`: For event queries
- `idx_telemetry_logs_session_id`: For session queries
- `idx_telemetry_logs_created_at`: For chronological queries

#### `settings`
Stores player settings.

**Key Fields:**
- `id`: UUID primary key
- `player_id`: Foreign key to players
- `setting_key`: Setting identifier
- `setting_value`: JSONB with setting value

**Constraints:**
- `uq_player_setting`: Unique player-setting combination

**Indexes:**
- `idx_settings_player_id`: Fast lookup by player
- `idx_settings_setting_key`: Fast lookup by setting

## Row Level Security (RLS)

All tables have RLS enabled with the following policies:

### Player-Scoped Tables
Tables that belong to a specific player (e.g., `resource_balances`, `placed_objects`) have policies that:
- Allow players to read their own data
- Allow players to insert their own data
- Allow players to update their own data
- Allow players to delete their own data
- Allow service role to manage all data

### Global Tables
Tables that are game-wide (e.g., `resources`, `buildings`, `quests`) have policies that:
- Allow all authenticated users to read
- Allow service role to manage all data

### Social Tables
Social tables (e.g., `friends`) have policies that:
- Allow players to read their own friendships
- Allow players to send friend requests
- Allow players to accept/decline received requests
- Allow players to delete their own friendships

## Cascade Rules

### DELETE CASCADE
When a player is deleted, the following are automatically deleted:
- Player profile
- Empire
- Inventory
- Resource balances
- Placed objects
- Equipment instances
- Research progress
- Quest progress
- Achievement progress
- Notifications
- Daily rewards
- Friendships
- Leaderboard entries
- Settings

### DELETE RESTRICT
Some relationships prevent deletion to maintain data integrity:
- Buildings referenced by placed objects
- Equipment referenced by equipment instances
- Research referenced by research progress
- Quests referenced by quest progress
- Achievements referenced by achievement progress

### DELETE SET NULL
Telemetry logs set player_id to NULL when player is deleted (preserve analytics data).

## Performance Optimization

### Indexing Strategy
- **Foreign Keys**: All foreign keys are indexed for join performance
- **Common Queries**: Frequently queried columns have dedicated indexes
- **Composite Indexes**: Multi-column indexes for common query patterns
- **Partial Indexes**: Indexes with WHERE clauses for filtered queries

### Query Patterns
- **Player Data**: Always filter by player_id first (uses RLS + indexes)
- **Leaderboards**: Use score DESC with LIMIT for top rankings
- **Notifications**: Filter by is_read = false for unread count
- **Time-based Queries**: Use timestamp indexes with range queries

### JSONB Usage
JSONB fields are used for:
- Flexible data storage (stats, effects, requirements)
- Extensible schemas without migrations
- Complex nested data structures

JSONB fields are indexed using GIN indexes when queried frequently.

## Scalability Considerations

### Database Scaling
- **Connection Pooling**: Supabase manages connection pooling automatically
- **Read Replicas**: Can be added for read-heavy workloads
- **Partitioning**: Large tables can be partitioned by player_id
- **Caching**: Application-level caching for frequently accessed data

### Data Retention
- **Telemetry Logs**: Implement cleanup job to delete old logs (30-day retention)
- **Notifications**: Delete expired notifications automatically
- **Soft Deletes**: Preserve data for audit trails

### Monitoring
- **Query Performance**: Monitor slow queries and add indexes as needed
- **Table Sizes**: Monitor table growth and archive old data
- **Connection Usage**: Monitor connection pool utilization

## Extension Points

### Adding New Game Features
1. Create new table in migration
2. Add RLS policies
3. Create TypeScript types
4. Create repository
5. Create service
6. Create validation schemas
7. Update documentation

### Adding New Resource Types
1. Add new enum value to `resource_type`
2. Create migration to update enum
3. Update TypeScript types
4. Update validation schemas

### Adding New Equipment Slots
1. Add new enum value to `equipment_slot`
2. Create migration to update enum
3. Update TypeScript types
4. Update validation schemas

## Migration Strategy

### Version Control
- All migrations are versioned (001, 002, etc.)
- Migrations are ordered and applied sequentially
- Never modify existing migrations

### Rollback Strategy
- Each migration should be reversible
- Document rollback steps in comments
- Test rollback in development environment

### Data Migration
- For schema changes requiring data migration:
  1. Create new table/column
  2. Migrate data
  3. Update application to use new structure
  4. Remove old structure in separate migration

## Security Considerations

### SQL Injection Prevention
- Always use parameterized queries (Supabase client handles this)
- Never concatenate user input into SQL strings
- Validate all inputs with Zod schemas

### Data Privacy
- Player data is isolated via RLS
- Sensitive data should be encrypted at rest
- Implement data retention policies

### Access Control
- Service role for administrative operations
- Authenticated role for player operations
- Anon role for public read-only data (if needed)

## Backup Strategy

### Automated Backups
- Supabase provides automated daily backups
- Point-in-time recovery available (up to 7 days)
- Consider additional backup strategy for critical data

### Manual Backups
- Export schema before major changes
- Export data before bulk operations
- Test restore process regularly

## Conclusion

This database architecture provides a solid foundation for FreeCoin Empire to scale to millions of users. The normalized schema, proper indexing, RLS policies, and clean separation of concerns ensure the database is performant, secure, and maintainable.

The repository and service layers abstract database operations, making it easy to add new features without modifying existing code. The validation schemas ensure data integrity at the application layer.
