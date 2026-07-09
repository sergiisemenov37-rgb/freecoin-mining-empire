import { supabase } from '@/lib/supabase';
import type {
  Empire,
  EmpireInsert,
  EmpireUpdate,
  Building,
  BuildingInsert,
  BuildingUpdate,
  PlacedObject,
  PlacedObjectInsert,
  PlacedObjectUpdate,
} from '@/types/database';

/**
 * Empire Repository
 * Handles empire, buildings, and placed objects
 */
export class EmpireRepository {
  /**
   * Get player's empire
   */
  async getEmpire(playerId: string): Promise<Empire | null> {
    const { data, error } = await supabase
      .from('empire')
      .select('*')
      .eq('player_id', playerId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get empire: ${error.message}`);
    }

    return data;
  }

  /**
   * Create empire
   */
  async createEmpire(empire: EmpireInsert): Promise<Empire> {
    const { data, error } = await supabase
      .from('empire')
      .insert(empire)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create empire: ${error.message}`);
    }

    return data;
  }

  /**
   * Update empire
   */
  async updateEmpire(playerId: string, empire: EmpireUpdate): Promise<Empire> {
    const { data, error } = await supabase
      .from('empire')
      .update(empire)
      .eq('player_id', playerId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update empire: ${error.message}`);
    }

    return data;
  }

  /**
   * Get all buildings
   */
  async getAllBuildings(): Promise<Building[]> {
    const { data, error } = await supabase
      .from('buildings')
      .select('*')
      .order('unlock_level');

    if (error) {
      throw new Error(`Failed to get buildings: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get building by key
   */
  async getBuildingByKey(key: string): Promise<Building | null> {
    const { data, error } = await supabase
      .from('buildings')
      .select('*')
      .eq('building_key', key)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get building: ${error.message}`);
    }

    return data;
  }

  /**
   * Get building by ID
   */
  async getBuildingById(id: string): Promise<Building | null> {
    const { data, error } = await supabase
      .from('buildings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get building: ${error.message}`);
    }

    return data;
  }

  /**
   * Create building (admin only)
   */
  async createBuilding(building: BuildingInsert): Promise<Building> {
    const { data, error } = await supabase
      .from('buildings')
      .insert(building)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create building: ${error.message}`);
    }

    return data;
  }

  /**
   * Update building (admin only)
   */
  async updateBuilding(id: string, building: BuildingUpdate): Promise<Building> {
    const { data, error } = await supabase
      .from('buildings')
      .update(building)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update building: ${error.message}`);
    }

    return data;
  }

  /**
   * Get player's placed objects
   */
  async getPlacedObjects(playerId: string): Promise<PlacedObject[]> {
    const { data, error } = await supabase
      .from('placed_objects')
      .select('*')
      .eq('player_id', playerId)
      .order('grid_x, grid_y');

    if (error) {
      throw new Error(`Failed to get placed objects: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get placed object by ID
   */
  async getPlacedObjectById(id: string): Promise<PlacedObject | null> {
    const { data, error } = await supabase
      .from('placed_objects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get placed object: ${error.message}`);
    }

    return data;
  }

  /**
   * Get placed object at grid position
   */
  async getPlacedObjectAtPosition(playerId: string, gridX: number, gridY: number): Promise<PlacedObject | null> {
    const { data, error } = await supabase
      .from('placed_objects')
      .select('*')
      .eq('player_id', playerId)
      .eq('grid_x', gridX)
      .eq('grid_y', gridY)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get placed object at position: ${error.message}`);
    }

    return data;
  }

  /**
   * Create placed object
   */
  async createPlacedObject(object: PlacedObjectInsert): Promise<PlacedObject> {
    const { data, error } = await supabase
      .from('placed_objects')
      .insert(object)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create placed object: ${error.message}`);
    }

    return data;
  }

  /**
   * Update placed object
   */
  async updatePlacedObject(id: string, object: PlacedObjectUpdate): Promise<PlacedObject> {
    const { data, error } = await supabase
      .from('placed_objects')
      .update(object)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update placed object: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete placed object
   */
  async deletePlacedObject(id: string): Promise<void> {
    const { error } = await supabase
      .from('placed_objects')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete placed object: ${error.message}`);
    }
  }

  /**
   * Get placed objects with building details
   */
  async getPlacedObjectsWithBuildings(playerId: string): Promise<PlacedObject[]> {
    const { data, error } = await supabase
      .from('placed_objects')
      .select(`
        *,
        buildings(*)
      `)
      .eq('player_id', playerId)
      .order('grid_x, grid_y');

    if (error) {
      throw new Error(`Failed to get placed objects with buildings: ${error.message}`);
    }

    return data || [];
  }
}

export const empireRepository = new EmpireRepository();
