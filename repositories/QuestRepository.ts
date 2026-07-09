import { supabase } from '@/lib/supabase';
import type {
  Quest,
  QuestInsert,
  QuestUpdate,
  QuestProgress,
  QuestProgressInsert,
  QuestProgressUpdate,
} from '@/types/database';

/**
 * Quest Repository
 * Handles quest definitions and player quest progress
 */
export class QuestRepository {
  /**
   * Get all quests
   */
  async getAllQuests(): Promise<Quest[]> {
    const { data, error } = await supabase
      .from('quests')
      .select('*')
      .order('unlock_level');

    if (error) {
      throw new Error(`Failed to get quests: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get quest by key
   */
  async getQuestByKey(key: string): Promise<Quest | null> {
    const { data, error } = await supabase
      .from('quests')
      .select('*')
      .eq('quest_key', key)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get quest: ${error.message}`);
    }

    return data;
  }

  /**
   * Get quest by ID
   */
  async getQuestById(id: string): Promise<Quest | null> {
    const { data, error } = await supabase
      .from('quests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get quest: ${error.message}`);
    }

    return data;
  }

  /**
   * Get quests by type
   */
  async getQuestsByType(type: string): Promise<Quest[]> {
    const { data, error } = await supabase
      .from('quests')
      .select('*')
      .eq('quest_type', type)
      .order('unlock_level');

    if (error) {
      throw new Error(`Failed to get quests by type: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get active quests (within date range)
   */
  async getActiveQuests(): Promise<Quest[]> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('quests')
      .select('*')
      .or(`start_date.is.null,start_date.lte.${now}`)
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order('unlock_level');

    if (error) {
      throw new Error(`Failed to get active quests: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Create quest (admin only)
   */
  async createQuest(quest: QuestInsert): Promise<Quest> {
    const { data, error } = await supabase
      .from('quests')
      .insert(quest)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create quest: ${error.message}`);
    }

    return data;
  }

  /**
   * Update quest (admin only)
   */
  async updateQuest(id: string, quest: QuestUpdate): Promise<Quest> {
    const { data, error } = await supabase
      .from('quests')
      .update(quest)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update quest: ${error.message}`);
    }

    return data;
  }

  /**
   * Get player's quest progress
   */
  async getQuestProgress(playerId: string): Promise<QuestProgress[]> {
    const { data, error } = await supabase
      .from('quest_progress')
      .select('*')
      .eq('player_id', playerId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get quest progress: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get quest progress by quest ID
   */
  async getQuestProgressById(playerId: string, questId: string): Promise<QuestProgress | null> {
    const { data, error } = await supabase
      .from('quest_progress')
      .select('*')
      .eq('player_id', playerId)
      .eq('quest_id', questId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get quest progress: ${error.message}`);
    }

    return data;
  }

  /**
   * Create quest progress
   */
  async createQuestProgress(progress: QuestProgressInsert): Promise<QuestProgress> {
    const { data, error } = await supabase
      .from('quest_progress')
      .insert(progress)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create quest progress: ${error.message}`);
    }

    return data;
  }

  /**
   * Update quest progress
   */
  async updateQuestProgress(playerId: string, questId: string, progress: QuestProgressUpdate): Promise<QuestProgress> {
    const { data, error } = await supabase
      .from('quest_progress')
      .update(progress)
      .eq('player_id', playerId)
      .eq('quest_id', questId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update quest progress: ${error.message}`);
    }

    return data;
  }

  /**
   * Start quest
   */
  async startQuest(playerId: string, questId: string): Promise<QuestProgress> {
    const existing = await this.getQuestProgressById(playerId, questId);
    
    if (existing) {
      return this.updateQuestProgress(playerId, questId, {
        status: 'in_progress',
        started_at: new Date().toISOString(),
      });
    }

    return this.createQuestProgress({
      player_id: playerId,
      quest_id: questId,
      status: 'in_progress',
      started_at: new Date().toISOString(),
    });
  }

  /**
   * Complete quest
   */
  async completeQuest(playerId: string, questId: string): Promise<QuestProgress> {
    return this.updateQuestProgress(playerId, questId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    });
  }

  /**
   * Get quest progress with quest details
   */
  async getQuestProgressWithDetails(playerId: string): Promise<QuestProgress[]> {
    const { data, error } = await supabase
      .from('quest_progress')
      .select(`
        *,
        quests(*)
      `)
      .eq('player_id', playerId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get quest progress with details: ${error.message}`);
    }

    return data || [];
  }
}

export const questRepository = new QuestRepository();
