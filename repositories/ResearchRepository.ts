import { supabase } from '@/lib/supabase';
import type {
  Research,
  ResearchInsert,
  ResearchUpdate,
  ResearchProgress,
  ResearchProgressInsert,
  ResearchProgressUpdate,
} from '@/types/database';

/**
 * Research Repository
 * Handles research definitions and player research progress
 */
export class ResearchRepository {
  /**
   * Get all research
   */
  async getAllResearch(): Promise<Research[]> {
    const { data, error } = await supabase
      .from('research')
      .select('*')
      .order('unlock_level');

    if (error) {
      throw new Error(`Failed to get research: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get research by key
   */
  async getResearchByKey(key: string): Promise<Research | null> {
    const { data, error } = await supabase
      .from('research')
      .select('*')
      .eq('research_key', key)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get research: ${error.message}`);
    }

    return data;
  }

  /**
   * Get research by ID
   */
  async getResearchById(id: string): Promise<Research | null> {
    const { data, error } = await supabase
      .from('research')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get research: ${error.message}`);
    }

    return data;
  }

  /**
   * Create research (admin only)
   */
  async createResearch(research: ResearchInsert): Promise<Research> {
    const { data, error } = await supabase
      .from('research')
      .insert(research)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create research: ${error.message}`);
    }

    return data;
  }

  /**
   * Update research (admin only)
   */
  async updateResearch(id: string, research: ResearchUpdate): Promise<Research> {
    const { data, error } = await supabase
      .from('research')
      .update(research)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update research: ${error.message}`);
    }

    return data;
  }

  /**
   * Get player's research progress
   */
  async getResearchProgress(playerId: string): Promise<ResearchProgress[]> {
    const { data, error } = await supabase
      .from('research_progress')
      .select('*')
      .eq('player_id', playerId);

    if (error) {
      throw new Error(`Failed to get research progress: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get research progress by research ID
   */
  async getResearchProgressById(playerId: string, researchId: string): Promise<ResearchProgress | null> {
    const { data, error } = await supabase
      .from('research_progress')
      .select('*')
      .eq('player_id', playerId)
      .eq('research_id', researchId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get research progress: ${error.message}`);
    }

    return data;
  }

  /**
   * Create research progress
   */
  async createResearchProgress(progress: ResearchProgressInsert): Promise<ResearchProgress> {
    const { data, error } = await supabase
      .from('research_progress')
      .insert(progress)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create research progress: ${error.message}`);
    }

    return data;
  }

  /**
   * Update research progress
   */
  async updateResearchProgress(playerId: string, researchId: string, progress: ResearchProgressUpdate): Promise<ResearchProgress> {
    const { data, error } = await supabase
      .from('research_progress')
      .update(progress)
      .eq('player_id', playerId)
      .eq('research_id', researchId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update research progress: ${error.message}`);
    }

    return data;
  }

  /**
   * Start research
   */
  async startResearch(playerId: string, researchId: string): Promise<ResearchProgress> {
    const existing = await this.getResearchProgressById(playerId, researchId);
    
    if (existing) {
      return this.updateResearchProgress(playerId, researchId, {
        status: 'in_progress',
        started_at: new Date().toISOString(),
      });
    }

    return this.createResearchProgress({
      player_id: playerId,
      research_id: researchId,
      status: 'in_progress',
      started_at: new Date().toISOString(),
    });
  }

  /**
   * Complete research
   */
  async completeResearch(playerId: string, researchId: string): Promise<ResearchProgress> {
    return this.updateResearchProgress(playerId, researchId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    });
  }

  /**
   * Get research progress with research details
   */
  async getResearchProgressWithDetails(playerId: string): Promise<ResearchProgress[]> {
    const { data, error } = await supabase
      .from('research_progress')
      .select(`
        *,
        research(*)
      `)
      .eq('player_id', playerId);

    if (error) {
      throw new Error(`Failed to get research progress with details: ${error.message}`);
    }

    return data || [];
  }
}

export const researchRepository = new ResearchRepository();
