-- FreeCoin Empire - Row Level Security Policies
-- Every player can access ONLY their own data
-- Prepared for future social features

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE empire ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE placed_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE research ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PLAYERS
-- ============================================

-- Players can read their own record
CREATE POLICY "Players can view own profile"
    ON players FOR SELECT
    USING (auth.uid() = id);

-- Players can update their own record
CREATE POLICY "Players can update own profile"
    ON players FOR UPDATE
    USING (auth.uid() = id);

-- Service can insert new players (via server-side)
CREATE POLICY "Service can insert players"
    ON players FOR INSERT
    WITH CHECK (true);

-- ============================================
-- PLAYER PROFILES
-- ============================================

CREATE POLICY "Players can view own profile"
    ON player_profiles FOR SELECT
    USING (player_id IN (
        SELECT id FROM players WHERE telegram_id = (
            SELECT (raw_user_meta_data->>'telegram_id')::bigint 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Players can update own profile"
    ON player_profiles FOR UPDATE
    USING (player_id IN (
        SELECT id FROM players WHERE telegram_id = (
            SELECT (raw_user_meta_data->>'telegram_id')::bigint 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Service can insert profiles"
    ON player_profiles FOR INSERT
    WITH CHECK (true);

-- ============================================
-- RESOURCES (Global - Read Only for All)
-- ============================================

CREATE POLICY "All authenticated users can view resources"
    ON resources FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Service can manage resources"
    ON resources FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================
-- RESOURCE BALANCES
-- ============================================

CREATE POLICY "Players can view own balances"
    ON resource_balances FOR SELECT
    USING (player_id IN (
        SELECT id FROM players WHERE telegram_id = (
            SELECT (raw_user_meta_data->>'telegram_id')::bigint 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Players can update own balances"
    ON resource_balances FOR UPDATE
    USING (player_id IN (
        SELECT id FROM players WHERE telegram_id = (
            SELECT (raw_user_meta_data->>'telegram_id')::bigint 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Service can manage balances"
    ON resource_balances FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================
-- EMPIRE
-- ============================================

CREATE POLICY "Players can view own empire"
    ON empire FOR SELECT
    USING (player_id IN (
        SELECT id FROM players WHERE telegram_id = (
            SELECT (raw_user_meta_data->>'telegram_id')::bigint 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Players can update own empire"
    ON empire FOR UPDATE
    USING (player_id IN (
        SELECT id FROM players WHERE telegram_id = (
            SELECT (raw_user_meta_data->>'telegram_id')::bigint 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Service can manage empire"
    ON empire FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================
-- BUILDINGS (Global - Read Only for All)
-- ============================================

CREATE POLICY "All authenticated users can view buildings"
    ON buildings FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Service can manage buildings"
    ON buildings FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================
-- PLACED OBJECTS
-- ============================================

CREATE POLICY "Players can view own placed objects"
    ON placed_objects FOR SELECT
    USING (player_id IN (
        SELECT id FROM players WHERE telegram_id = (
            SELECT (raw_user_meta_data->>'telegram_id')::bigint 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Players can insert own placed objects"
    ON placed_objects FOR INSERT
    WITH CHECK (player_id IN (
        SELECT id FROM players WHERE telegram_id = (
            SELECT (raw_user_meta_data->>'telegram_id')::bigint 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Players can update own placed objects"
    ON placed_objects FOR UPDATE
    USING (player_id IN (
        SELECT id FROM players WHERE telegram_id = (
            SELECT (raw_user_meta_data->>'telegram_id')::bigint 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Players can delete own placed objects"
    ON placed_objects FOR DELETE
    USING (player_id IN (
        SELECT id FROM players WHERE telegram_id = (
            SELECT (raw_user_meta_data->>'telegram_id')::bigint 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    ));

-- ============================================
-- INVENTORY
-- ============================================

CREATE POLICY "Players can view own inventory"
    ON inventory FOR SELECT
    USING (player_id IN (
        SELECT id FROM players WHERE telegram_id = (
            SELECT (raw_user_meta_data->>'telegram_id')::bigint 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Players can update own inventory"
    ON inventory FOR UPDATE
    USING (player_id IN (
        SELECT id FROM players WHERE telegram_id = (
            SELECT (raw_user_meta_data->>'telegram_id')::bigint 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Service can manage inventory"
    ON inventory FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================
-- INVENTORY ITEMS
-- ============================================

CREATE POLICY "Players can view own inventory items"
    ON inventory_items FOR SELECT
    USING (inventory_id IN (
        SELECT id FROM inventory WHERE player_id IN (
            SELECT id FROM players WHERE telegram_id = (
                SELECT (raw_user_meta_data->>'telegram_id')::bigint 
                FROM auth.users 
                WHERE id = auth.uid()
            )
        )
    ));

CREATE POLICY "Players can insert own inventory items"
    ON inventory_items FOR INSERT
    WITH CHECK (inventory_id IN (
        SELECT id FROM inventory WHERE player_id IN (
            SELECT id FROM players WHERE telegram_id = (
                SELECT (raw_user_meta_data->>'telegram_id')::bigint 
                FROM auth.users 
                WHERE id = auth.uid()
            )
        )
    ));

CREATE POLICY "Players can update own inventory items"
    ON inventory_items FOR UPDATE
    USING (inventory_id IN (
        SELECT id FROM inventory WHERE player_id IN (
            SELECT id FROM players WHERE telegram_id = (
                SELECT (raw_user_meta_data->>'telegram_id')::bigint 
                FROM auth.users 
                WHERE id = auth.uid()
            )
        )
    ));

CREATE POLICY "Players can delete own inventory items"
    ON inventory_items FOR DELETE
    USING (inventory_id IN (
        SELECT id FROM inventory WHERE player_id IN (
            SELECT id FROM players WHERE telegram_id = (
                SELECT (raw_user_meta_data->>'telegram_id')::bigint 
                FROM auth.users 
                WHERE id = auth.uid()
            )
        )
    ));

-- ============================================
-- EQUIPMENT (Global - Read Only for All)
-- ============================================

CREATE POLICY "All authenticated users can view equipment"
    ON equipment FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Service can manage equipment"
    ON equipment FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================
-- EQUIPMENT INSTANCES
-- ============================================

CREATE POLICY "Players can view own equipment instances"
    ON equipment_instances FOR SELECT
    USING (player_id IN (
        SELECT id FROM players WHERE telegram_id = (
            SELECT (raw_user_meta_data->>'telegram_id')::bigint 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Players can insert own equipment instances"
    ON equipment_instances FOR INSERT
    WITH CHECK (player_id IN (
        SELECT id FROM players WHERE telegram_id = (
            SELECT (raw_user_meta_data->>'telegram_id')::bigint 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Players can update own equipment instances"
    ON equipment_instances FOR UPDATE
    USING (player_id IN (
        SELECT id FROM players WHERE telegram_id = (
            SELECT (raw_user_meta_data->>'telegram_id')::bigint 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Players can delete own equipment instances"
    ON equipment_instances FOR DELETE
    USING (player_id IN (
        SELECT id FROM players WHERE telegram_id = (
            SELECT (raw_user_meta_data->>'telegram_id')::bigint 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    ));

-- ============================================
-- RESEARCH (Global - Read Only for All)
-- ============================================

CREATE POLICY "All authenticated users can view research"
    ON research FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Service can manage research"
    ON research FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================
-- RESEARCH PROGRESS
-- ============================================

CREATE POLICY "Players can view own research progress"
    ON research_progress FOR SELECT
    USING (player_id IN (
        SELECT id FROM players WHERE telegram_id = (
            SELECT (raw_user_meta_data->>'telegram_id')::bigint 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Players can insert own research progress"
    ON research_progress FOR INSERT
    WITH CHECK (player_id IN (
        SELECT id FROM players WHERE telegram_id = (
            SELECT (raw_user_meta_data->>'telegram_id')::bigint 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Players can update own research progress"
    ON research_progress FOR UPDATE
    USING (player_id IN (
        SELECT id FROM players WHERE telegram_id = (
            SELECT (raw_user_meta_data->>'telegram_id')::bigint 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Service can manage research progress"
    ON research_progress FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================
-- QUESTS (Global - Read Only for All)
-- ============================================

CREATE POLICY "All authenticated users can view quests"
    ON quests FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Service can manage quests"
    ON quests FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================
-- QUEST PROGRESS
-- ============================================

CREATE POLICY "Players can view own quest progress"
    ON quest_progress FOR SELECT
    USING (player_id IN (
        SELECT id FROM players WHERE telegram_id = (
            SELECT (raw_user_meta_data->>'telegram_id')::bigint 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Players can insert own quest progress"
    ON quest_progress FOR INSERT
    WITH CHECK (player_id IN (
        SELECT id FROM players WHERE telegram_id = (
            SELECT (raw_user_meta_data->>'telegram_id')::bigint 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Players can update own quest progress"
    ON quest_progress FOR UPDATE
    USING (player_id IN (
        SELECT id FROM players WHERE telegram_id = (
            SELECT (raw_user_meta_data->>'telegram_id')::bigint 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Service can manage quest progress"
    ON quest_progress FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================
-- ACHIEVEMENTS (Global - Read Only for All)
-- ============================================

CREATE POLICY "All authenticated users can view achievements"
    ON achievements FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Service can manage achievements"
    ON achievements FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================
-- ACHIEVEMENT PROGRESS
-- ============================================

CREATE POLICY "Players can view own achievement progress"
    ON achievement_progress FOR SELECT
    USING (player_id IN (
        SELECT id FROM players WHERE telegram_id = (
            SELECT (raw_user_meta_data->>'telegram_id')::bigint 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Players can insert own achievement progress"
    ON achievement_progress FOR INSERT
    WITH CHECK (player_id IN (
        SELECT id FROM players WHERE telegram_id = (
            SELECT (raw_user_meta_data->>'telegram_id')::bigint 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Players can update own achievement progress"
    ON achievement_progress FOR UPDATE
    USING (player_id IN (
        SELECT id FROM players WHERE telegram_id = (
            SELECT (raw_user_meta_data->>'telegram_id')::bigint 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Service can manage achievement progress"
    ON achievement_progress FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE POLICY "Players can view own notifications"
    ON notifications FOR SELECT
    USING (player_id IN (
        SELECT id FROM players WHERE telegram_id = (
            SELECT (raw_user_meta_data->>'telegram_id')::bigint 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Players can update own notifications"
    ON notifications FOR UPDATE
    USING (player_id IN (
        SELECT id FROM players WHERE telegram_id = (
            SELECT (raw_user_meta_data->>'telegram_id')::bigint 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Players can delete own notifications"
    ON notifications FOR DELETE
    USING (player_id IN (
        SELECT id FROM players WHERE telegram_id = (
            SELECT (raw_user_meta_data->>'telegram_id')::bigint 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Service can manage notifications"
    ON notifications FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================
-- DAILY REWARDS
-- ============================================

CREATE POLICY "Players can view own daily rewards"
    ON daily_rewards FOR SELECT
    USING (player_id IN (
        SELECT id FROM players WHERE telegram_id = (
            SELECT (raw_user_meta_data->>'telegram_id')::bigint 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Players can insert own daily rewards"
    ON daily_rewards FOR INSERT
    WITH CHECK (player_id IN (
        SELECT id FROM players WHERE telegram_id = (
            SELECT (raw_user_meta_data->>'telegram_id')::bigint 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Service can manage daily rewards"
    ON daily_rewards FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================
-- FRIENDS (Social Feature - Prepared)
-- ============================================

CREATE POLICY "Players can view own friendships"
    ON friends FOR SELECT
    USING (requester_id IN (
        SELECT id FROM players WHERE telegram_id = (
            SELECT (raw_user_meta_data->>'telegram_id')::bigint 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    ) OR receiver_id IN (
        SELECT id FROM players WHERE telegram_id = (
            SELECT (raw_user_meta_data->>'telegram_id')::bigint 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Players can send friend requests"
    ON friends FOR INSERT
    WITH CHECK (requester_id IN (
        SELECT id FROM players WHERE telegram_id = (
            SELECT (raw_user_meta_data->>'telegram_id')::bigint 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Players can update received friend requests"
    ON friends FOR UPDATE
    USING (receiver_id IN (
        SELECT id FROM players WHERE telegram_id = (
            SELECT (raw_user_meta_data->>'telegram_id')::bigint 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Players can delete own friendships"
    ON friends FOR DELETE
    USING (requester_id IN (
        SELECT id FROM players WHERE telegram_id = (
            SELECT (raw_user_meta_data->>'telegram_id')::bigint 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    ) OR receiver_id IN (
        SELECT id FROM players WHERE telegram_id = (
            SELECT (raw_user_meta_data->>'telegram_id')::bigint 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    ));

-- ============================================
-- LEADERBOARDS (Global - Read Only for All)
-- ============================================

CREATE POLICY "All authenticated users can view leaderboards"
    ON leaderboards FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Service can manage leaderboards"
    ON leaderboards FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================
-- LEADERBOARD ENTRIES
-- ============================================

CREATE POLICY "Players can view own leaderboard entries"
    ON leaderboard_entries FOR SELECT
    USING (player_id IN (
        SELECT id FROM players WHERE telegram_id = (
            SELECT (raw_user_meta_data->>'telegram_id')::bigint 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Players can view all leaderboard entries for ranking"
    ON leaderboard_entries FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Service can manage leaderboard entries"
    ON leaderboard_entries FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================
-- TELEMETRY LOGS
-- ============================================

CREATE POLICY "Players can view own telemetry logs"
    ON telemetry_logs FOR SELECT
    USING (player_id IN (
        SELECT id FROM players WHERE telegram_id = (
            SELECT (raw_user_meta_data->>'telegram_id')::bigint 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Players can insert own telemetry logs"
    ON telemetry_logs FOR INSERT
    WITH CHECK (player_id IN (
        SELECT id FROM players WHERE telegram_id = (
            SELECT (raw_user_meta_data->>'telegram_id')::bigint 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Service can manage telemetry logs"
    ON telemetry_logs FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================
-- SETTINGS
-- ============================================

CREATE POLICY "Players can view own settings"
    ON settings FOR SELECT
    USING (player_id IN (
        SELECT id FROM players WHERE telegram_id = (
            SELECT (raw_user_meta_data->>'telegram_id')::bigint 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Players can upsert own settings"
    ON settings FOR ALL
    USING (player_id IN (
        SELECT id FROM players WHERE telegram_id = (
            SELECT (raw_user_meta_data->>'telegram_id')::bigint 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    ))
    WITH CHECK (player_id IN (
        SELECT id FROM players WHERE telegram_id = (
            SELECT (raw_user_meta_data->>'telegram_id')::bigint 
            FROM auth.users 
            WHERE id = auth.uid()
        )
    ));
