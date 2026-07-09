import { supabase } from '@/lib/supabase';
import type {
  Leaderboard,
  LeaderboardInsert,
  LeaderboardUpdate,
  LeaderboardEntry,
  LeaderboardEntryInsert,
  LeaderboardEntryUpdate,
} from '@/types/database';

/**
 * Leaderboard Repository
 * Handles leaderboards and leaderboard entries
 */
export class LeaderboardRepository {
  /**
   * Get all leaderboards
   */
  async getAllLeaderboards(): Promise<Leaderboard[]> {
    const { data, error } = await supabase
      .from('leaderboards')
      .select('*')
      .order('leaderboard_type');

    if (error) {
      throw new Error(`Failed to get leaderboards: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get active leaderboards
   */
  async getActiveLeaderboards(): Promise<Leaderboard[]> {
    const { data, error } = await supabase
      .from('leaderboards')
      .select('*')
      .eq('is_active', true)
      .order('leaderboard_type');

    if (error) {
      throw new Error(`Failed to get active leaderboards: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get leaderboard by key
   */
  async getLeaderboardByKey(key: string): Promise<Leaderboard | null> {
    const { data, error } = await supabase
      .from('leaderboards')
      .select('*')
      .eq('leaderboard_key', key)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get leaderboard: ${error.message}`);
    }

    return data;
  }

  /**
   * Get leaderboard by ID
   */
  async getLeaderboardById(id: string): Promise<Leaderboard | null> {
    const { data, error } = await supabase
      .from('leaderboards')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get leaderboard: ${error.message}`);
    }

    return data;
  }

  /**
   * Create leaderboard (admin only)
   */
  async createLeaderboard(leaderboard: LeaderboardInsert): Promise<Leaderboard> {
    const { data, error } = await supabase
      .from('leaderboards')
      .insert(leaderboard)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create leaderboard: ${error.message}`);
    }

    return data;
  }

  /**
   * Update leaderboard (admin only)
   */
  async updateLeaderboard(id: string, leaderboard: LeaderboardUpdate): Promise<Leaderboard> {
    const { data, error } = await supabase
      .from('leaderboards')
      .update(leaderboard)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update leaderboard: ${error.message}`);
    }

    return data;
  }

  /**
   * Get leaderboard entries
   */
  async getLeaderboardEntries(leaderboardId: string, limit: number = 100, offset: number = 0): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase
      .from('leaderboard_entries')
      .select('*')
      .eq('leaderboard_id', leaderboardId)
      .order('score', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to get leaderboard entries: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get player's leaderboard entry
   */
  async getPlayerEntry(leaderboardId: string, playerId: string): Promise<LeaderboardEntry | null> {
    const { data, error } = await supabase
      .from('leaderboard_entries')
      .select('*')
      .eq('leaderboard_id', leaderboardId)
      .eq('player_id', playerId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get player entry: ${error.message}`);
    }

    return data;
  }

  /**
   * Get player's entries across all leaderboards
   */
  async getPlayerEntries(playerId: string): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase
      .from('leaderboard_entries')
      .select('*')
      .eq('player_id', playerId);

    if (error) {
      throw new Error(`Failed to get player entries: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Create leaderboard entry
   */
  async createLeaderboardEntry(entry: LeaderboardEntryInsert): Promise<LeaderboardEntry> {
    const { data, error } = await supabase
      .from('leaderboard_entries')
      .insert(entry)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create leaderboard entry: ${error.message}`);
    }

    return data;
  }

  /**
   * Update leaderboard entry
   */
  async updateLeaderboardEntry(leaderboardId: string, playerId: string, entry: LeaderboardEntryUpdate): Promise<LeaderboardEntry> {
    const { data, error } = await supabase
      .from('leaderboard_entries')
      .update(entry)
      .eq('leaderboard_id', leaderboardId)
      .eq('player_id', playerId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update leaderboard entry: ${error.message}`);
    }

    return data;
  }

  /**
   * Update player score
   */
  async updatePlayerScore(leaderboardId: string, playerId: string, score: number): Promise<LeaderboardEntry> {
    const existing = await this.getPlayerEntry(leaderboardId, playerId);
    
    if (existing) {
      return this.updateLeaderboardEntry(leaderboardId, playerId, { score });
    }

    return this.createLeaderboardEntry({
      leaderboard_id: leaderboardId,
      player_id: playerId,
      score,
    });
  }

  /**
   * Get leaderboard entries with player profiles
   */
  async getLeaderboardEntriesWithProfiles(leaderboardId: string, limit: number = 100): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase
      .from('leaderboard_entries')
      .select(`
        *,
        players(*),
        player_profiles(*)
      `)
      .eq('leaderboard_id', leaderboardId)
      .order('score', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get leaderboard entries with profiles: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Recalculate ranks for a leaderboard
   */
  async recalculateRanks(leaderboardId: string): Promise<void> {
    const { error } = await supabase.rpc('recalculate_leaderboard_ranks', {
      p_leaderboard_id: leaderboardId,
    });

    if (error) {
      throw new Error(`Failed to recalculate ranks: ${error.message}`);
    }
  }
}

export const leaderboardRepository = new LeaderboardRepository();
