import { supabase } from '@/lib/supabase';
import type {
  Player,
  PlayerInsert,
  PlayerUpdate,
  PlayerProfile,
  PlayerProfileInsert,
  PlayerProfileUpdate,
} from '@/types/database';

/**
 * Player Repository
 * Handles all player-related database operations
 * Hides Supabase implementation details
 */
export class PlayerRepository {
  /**
   * Find player by Telegram ID
   */
  async findByTelegramId(telegramId: number): Promise<Player | null> {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('telegram_id', telegramId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to find player: ${error.message}`);
    }

    return data;
  }

  /**
   * Find player by ID
   */
  async findById(id: string): Promise<Player | null> {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find player: ${error.message}`);
    }

    return data;
  }

  /**
   * Create new player
   */
  async create(player: PlayerInsert): Promise<Player> {
    const { data, error } = await supabase
      .from('players')
      .insert(player)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create player: ${error.message}`);
    }

    return data;
  }

  /**
   * Update player
   */
  async update(id: string, player: PlayerUpdate): Promise<Player> {
    const { data, error } = await supabase
      .from('players')
      .update(player)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update player: ${error.message}`);
    }

    return data;
  }

  /**
   * Update last active timestamp
   */
  async updateLastActive(id: string): Promise<void> {
    const { error } = await supabase
      .from('players')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update last active: ${error.message}`);
    }
  }

  /**
   * Soft delete player
   */
  async softDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from('players')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to soft delete player: ${error.message}`);
    }
  }

  /**
   * Get player profile
   */
  async getProfile(playerId: string): Promise<PlayerProfile | null> {
    const { data, error } = await supabase
      .from('player_profiles')
      .select('*')
      .eq('player_id', playerId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get player profile: ${error.message}`);
    }

    return data;
  }

  /**
   * Create player profile
   */
  async createProfile(profile: PlayerProfileInsert): Promise<PlayerProfile> {
    const { data, error } = await supabase
      .from('player_profiles')
      .insert(profile)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create player profile: ${error.message}`);
    }

    return data;
  }

  /**
   * Update player profile
   */
  async updateProfile(playerId: string, profile: PlayerProfileUpdate): Promise<PlayerProfile> {
    const { data, error } = await supabase
      .from('player_profiles')
      .update(profile)
      .eq('player_id', playerId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update player profile: ${error.message}`);
    }

    return data;
  }

  /**
   * Get player with profile
   */
  async getPlayerWithProfile(telegramId: number): Promise<{ player: Player; profile: PlayerProfile } | null> {
    const { data, error } = await supabase
      .from('players')
      .select(`
        *,
        player_profiles(*)
      `)
      .eq('telegram_id', telegramId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get player with profile: ${error.message}`);
    }

    if (!data.player_profiles || data.player_profiles.length === 0) {
      throw new Error('Player profile not found');
    }

    return {
      player: data,
      profile: data.player_profiles[0],
    };
  }
}

export const playerRepository = new PlayerRepository();
