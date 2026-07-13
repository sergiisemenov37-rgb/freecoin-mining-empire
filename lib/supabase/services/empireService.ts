/**
 * Empire Service
 * Handles empire-related database operations
 */

// @ts-nocheck
import { createBrowserClient } from '@/lib/supabase/browser-client';
import { Database } from '@/lib/supabase/types';

type Empire = Database['public']['Tables']['empire']['Row'];
type EmpireInsert = Database['public']['Tables']['empire']['Insert'];
type EmpireUpdate = Database['public']['Tables']['empire']['Update'];

type PlacedObject = Database['public']['Tables']['placed_objects']['Row'];
type PlacedObjectInsert = Database['public']['Tables']['placed_objects']['Insert'];
type PlacedObjectUpdate = Database['public']['Tables']['placed_objects']['Update'];

export class EmpireService {
  /**
   * Get empire by player ID
   */
  static async getEmpireByPlayerId(playerId: string): Promise<Empire | null> {
    const supabase = createBrowserClient();
    
    const { data, error } = await supabase
      .from('empire')
      .select('*')
      .eq('player_id', playerId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Empire | null;
  }

  /**
   * Create empire
   */
  static async createEmpire(empire: EmpireInsert): Promise<Empire> {
    const supabase = createBrowserClient();
    
    const { data, error } = await supabase
      .from('empire')
      .insert(empire as any)
      .select()
      .single();

    if (error) throw error;
    return data as Empire;
  }

  /**
   * Update empire
   */
  static async updateEmpire(playerId: string, updates: Record<string, any>) {
    const supabase = createBrowserClient();
    
    const { data, error } = await (supabase as any)
      .from('empire')
      .update(updates)
      .eq('player_id', playerId)
      .select()
      .single();

    if (error) throw error;
    return data as Empire;
  }

  /**
   * Add experience to empire
   */
  static async addExperience(playerId: string, amount: number) {
    const empire = await this.getEmpireByPlayerId(playerId);
    
    if (!empire) {
      throw new Error('Empire not found for player');
    }
    
    const newExperience = empire.experience + amount;
    
    // Calculate level (simplified)
    const newLevel = Math.floor(Math.sqrt(newExperience / 100)) + 1;
    
    return this.updateEmpire(playerId, {
      experience: newExperience,
      level: newLevel,
    });
  }

  /**
   * Expand grid size
   */
  static async expandGrid(playerId: string) {
    const empire = await this.getEmpireByPlayerId(playerId);
    
    if (!empire) {
      throw new Error('Empire not found for player');
    }
    
    const newGridSize = empire.grid_size + 2;
    
    return this.updateEmpire(playerId, {
      grid_size: newGridSize,
    });
  }

  /**
   * Get all placed objects for a player
   */
  static async getPlacedObjects(playerId: string) {
    const supabase = createBrowserClient();
    
    const { data, error } = await supabase
      .from('placed_objects')
      .select('*')
      .eq('player_id', playerId);

    if (error) throw error;
    return data;
  }

  /**
   * Get placed object at specific grid position
   */
  static async getPlacedObjectAt(playerId: string, gridX: number, gridY: number) {
    const supabase = createBrowserClient();
    
    const { data, error } = await supabase
      .from('placed_objects')
      .select('*')
      .eq('player_id', playerId)
      .eq('grid_x', gridX)
      .eq('grid_y', gridY)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Place object
   */
  static async placeObject(object: PlacedObjectInsert) {
    const supabase = createBrowserClient();
    
    const { data, error } = await (supabase as any)
      .from('placed_objects')
      .insert(object)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update placed object
   */
  static async updatePlacedObject(id: string, updates: Record<string, any>) {
    const supabase = createBrowserClient();
    
    const { data, error } = await (supabase as any)
      .from('placed_objects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Remove placed object
   */
  static async removePlacedObject(id: string) {
    const supabase = createBrowserClient();
    
    const { error } = await supabase
      .from('placed_objects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Start building construction
   */
  static async startConstruction(id: string) {
    return this.updatePlacedObject(id, {
      status: 'building',
      build_started_at: new Date().toISOString(),
    });
  }

  /**
   * Complete building construction
   */
  static async completeConstruction(id: string) {
    return this.updatePlacedObject(id, {
      status: 'active',
      build_completed_at: new Date().toISOString(),
    });
  }

  /**
   * Start building upgrade
   */
  static async startUpgrade(id: string) {
    const object = await this.getPlacedObjectById(id);
    const newLevel = object.level + 1;
    
    await this.updatePlacedObject(id, {
      status: 'upgrading',
      upgrade_started_at: new Date().toISOString(),
      level: newLevel,
    });
  }

  /**
   * Complete building upgrade
   */
  static async completeUpgrade(id: string) {
    return this.updatePlacedObject(id, {
      status: 'active',
      upgrade_completed_at: new Date().toISOString(),
    });
  }

  /**
   * Get placed object by ID
   */
  static async getPlacedObjectById(id: string) {
    const supabase = createBrowserClient();
    
    const { data, error } = await supabase
      .from('placed_objects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }
}
