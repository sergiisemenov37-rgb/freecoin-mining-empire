import { supabase } from '@/lib/supabase';
import type {
  Achievement,
  AchievementInsert,
  AchievementUpdate,
  AchievementProgress,
  AchievementProgressInsert,
  AchievementProgressUpdate,
} from '@/types/database';

/**
 * Achievement Repository
 * Handles achievement definitions and player achievement progress
 */
export class AchievementRepository {
  /**
   * Get all achievements
   */
  async getAllAchievements(): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('category');

    if (error) {
      throw new Error(`Failed to get achievements: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get achievement by key
   */
  async getAchievementByKey(key: string): Promise<Achievement | null> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('achievement_key', key)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get achievement: ${error.message}`);
    }

    return data;
  }

  /**
   * Get achievement by ID
   */
  async getAchievementById(id: string): Promise<Achievement | null> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get achievement: ${error.message}`);
    }

    return data;
  }

  /**
   * Get achievements by category
   */
  async getAchievementsByCategory(category: string): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('category', category)
      .order('points', { ascending: false });

    if (error) {
      throw new Error(`Failed to get achievements by category: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get visible achievements (not hidden)
   */
  async getVisibleAchievements(): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_hidden', false)
      .order('category');

    if (error) {
      throw new Error(`Failed to get visible achievements: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Create achievement (admin only)
   */
  async createAchievement(achievement: AchievementInsert): Promise<Achievement> {
    const { data, error } = await supabase
      .from('achievements')
      .insert(achievement)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create achievement: ${error.message}`);
    }

    return data;
  }

  /**
   * Update achievement (admin only)
   */
  async updateAchievement(id: string, achievement: AchievementUpdate): Promise<Achievement> {
    const { data, error } = await supabase
      .from('achievements')
      .update(achievement)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update achievement: ${error.message}`);
    }

    return data;
  }

  /**
   * Get player's achievement progress
   */
  async getAchievementProgress(playerId: string): Promise<AchievementProgress[]> {
    const { data, error } = await supabase
      .from('achievement_progress')
      .select('*')
      .eq('player_id', playerId)
      .order('completed_at', { ascending: false, nullsFirst: false });

    if (error) {
      throw new Error(`Failed to get achievement progress: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get achievement progress by achievement ID
   */
  async getAchievementProgressById(playerId: string, achievementId: string): Promise<AchievementProgress | null> {
    const { data, error } = await supabase
      .from('achievement_progress')
      .select('*')
      .eq('player_id', playerId)
      .eq('achievement_id', achievementId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get achievement progress: ${error.message}`);
    }

    return data;
  }

  /**
   * Create achievement progress
   */
  async createAchievementProgress(progress: AchievementProgressInsert): Promise<AchievementProgress> {
    const { data, error } = await supabase
      .from('achievement_progress')
      .insert(progress)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create achievement progress: ${error.message}`);
    }

    return data;
  }

  /**
   * Update achievement progress
   */
  async updateAchievementProgress(playerId: string, achievementId: string, progress: AchievementProgressUpdate): Promise<AchievementProgress> {
    const { data, error } = await supabase
      .from('achievement_progress')
      .update(progress)
      .eq('player_id', playerId)
      .eq('achievement_id', achievementId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update achievement progress: ${error.message}`);
    }

    return data;
  }

  /**
   * Complete achievement
   */
  async completeAchievement(playerId: string, achievementId: string): Promise<AchievementProgress> {
    return this.updateAchievementProgress(playerId, achievementId, {
      is_completed: true,
      completed_at: new Date().toISOString(),
    });
  }

  /**
   * Get completed achievements
   */
  async getCompletedAchievements(playerId: string): Promise<AchievementProgress[]> {
    const { data, error } = await supabase
      .from('achievement_progress')
      .select('*')
      .eq('player_id', playerId)
      .eq('is_completed', true)
      .order('completed_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get completed achievements: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get achievement progress with achievement details
   */
  async getAchievementProgressWithDetails(playerId: string): Promise<AchievementProgress[]> {
    const { data, error } = await supabase
      .from('achievement_progress')
      .select(`
        *,
        achievements(*)
      `)
      .eq('player_id', playerId)
      .order('completed_at', { ascending: false, nullsFirst: false });

    if (error) {
      throw new Error(`Failed to get achievement progress with details: ${error.message}`);
    }

    return data || [];
  }
}

export const achievementRepository = new AchievementRepository();
