/**
 * Player Service
 * Handles player-related database operations
 */

import { createServerClientClient } from '../client';
import { Database } from '../types';

type Player = Database['public']['Tables']['players']['Row'];
type PlayerInsert = Database['public']['Tables']['players']['Insert'];
type PlayerUpdate = Database['public']['Tables']['players']['Update'];

type PlayerProfile = Database['public']['Tables']['player_profiles']['Row'];
type PlayerProfileInsert = Database['public']['Tables']['player_profiles']['Insert'];
type PlayerProfileUpdate = Database['public']['Tables']['player_profiles']['Update'];

export class PlayerService {
  /**
   * Get player by Telegram ID
   */
  static async getPlayerByTelegramId(telegramId: bigint): Promise<Player | null> {
    const supabase = await createServerClientClient();
    
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('telegram_id', Number(telegramId))
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Player | null;
  }

  /**
   * Create new player
   */
  static async createPlayer(player: PlayerInsert): Promise<Player> {
    const supabase = await createServerClientClient();
    
    const { data, error } = await supabase
      .from('players')
      .insert(player)
      .select()
      .single();

    if (error) throw error;
    return data as Player;
  }

  /**
   * Update player
   */
  static async updatePlayer(id: string, updates: PlayerUpdate) {
    const supabase = await createServerClientClient();
    
    const { data, error } = await supabase
      .from('players')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update last active timestamp
   */
  static async updateLastActive(id: string) {
    return this.updatePlayer(id, {
      last_active_at: new Date().toISOString(),
    });
  }

  /**
   * Get player profile
   */
  static async getPlayerProfile(playerId: string) {
    const supabase = await createServerClientClient();
    
    const { data, error } = await supabase
      .from('player_profiles')
      .select('*')
      .eq('player_id', playerId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Create player profile
   */
  static async createPlayerProfile(profile: PlayerProfileInsert) {
    const supabase = await createServerClientClient();
    
    const { data, error } = await supabase
      .from('player_profiles')
      .insert(profile)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update player profile
   */
  static async updatePlayerProfile(playerId: string, updates: PlayerProfileUpdate) {
    const supabase = await createServerClientClient();
    
    const { data, error } = await supabase
      .from('player_profiles')
      .update(updates)
      .eq('player_id', playerId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Add experience to player
   */
  static async addExperience(playerId: string, amount: number) {
    const profile = await this.getPlayerProfile(playerId);
    const newExperience = profile.experience + amount;
    
    // Calculate level (simplified - should use proper level curve)
    const newLevel = Math.floor(Math.sqrt(newExperience / 100)) + 1;
    
    return this.updatePlayerProfile(playerId, {
      experience: newExperience,
      level: newLevel,
    });
  }
}
