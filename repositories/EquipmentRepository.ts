import { supabase } from '@/lib/supabase';
import type {
  Equipment,
  EquipmentInsert,
  EquipmentUpdate,
  EquipmentInstance,
  EquipmentInstanceInsert,
  EquipmentInstanceUpdate,
} from '@/types/database';

/**
 * Equipment Repository
 * Handles equipment definitions and player equipment instances
 */
export class EquipmentRepository {
  /**
   * Get all equipment
   */
  async getAllEquipment(): Promise<Equipment[]> {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .order('unlock_level');

    if (error) {
      throw new Error(`Failed to get equipment: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get equipment by key
   */
  async getEquipmentByKey(key: string): Promise<Equipment | null> {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('equipment_key', key)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get equipment: ${error.message}`);
    }

    return data;
  }

  /**
   * Get equipment by ID
   */
  async getEquipmentById(id: string): Promise<Equipment | null> {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get equipment: ${error.message}`);
    }

    return data;
  }

  /**
   * Create equipment (admin only)
   */
  async createEquipment(equipment: EquipmentInsert): Promise<Equipment> {
    const { data, error } = await supabase
      .from('equipment')
      .insert(equipment)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create equipment: ${error.message}`);
    }

    return data;
  }

  /**
   * Update equipment (admin only)
   */
  async updateEquipment(id: string, equipment: EquipmentUpdate): Promise<Equipment> {
    const { data, error } = await supabase
      .from('equipment')
      .update(equipment)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update equipment: ${error.message}`);
    }

    return data;
  }

  /**
   * Get player's equipment instances
   */
  async getEquipmentInstances(playerId: string): Promise<EquipmentInstance[]> {
    const { data, error } = await supabase
      .from('equipment_instances')
      .select('*')
      .eq('player_id', playerId)
      .order('acquired_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get equipment instances: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get equipment instance by ID
   */
  async getEquipmentInstanceById(id: string): Promise<EquipmentInstance | null> {
    const { data, error } = await supabase
      .from('equipment_instances')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get equipment instance: ${error.message}`);
    }

    return data;
  }

  /**
   * Create equipment instance
   */
  async createEquipmentInstance(instance: EquipmentInstanceInsert): Promise<EquipmentInstance> {
    const { data, error } = await supabase
      .from('equipment_instances')
      .insert(instance)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create equipment instance: ${error.message}`);
    }

    return data;
  }

  /**
   * Update equipment instance
   */
  async updateEquipmentInstance(id: string, instance: EquipmentInstanceUpdate): Promise<EquipmentInstance> {
    const { data, error } = await supabase
      .from('equipment_instances')
      .update(instance)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update equipment instance: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete equipment instance
   */
  async deleteEquipmentInstance(id: string): Promise<void> {
    const { error } = await supabase
      .from('equipment_instances')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete equipment instance: ${error.message}`);
    }
  }

  /**
   * Equip equipment instance
   */
  async equipEquipment(id: string): Promise<EquipmentInstance> {
    return this.updateEquipmentInstance(id, { is_equipped: true });
  }

  /**
   * Unequip equipment instance
   */
  async unequipEquipment(id: string): Promise<EquipmentInstance> {
    return this.updateEquipmentInstance(id, { is_equipped: false });
  }

  /**
   * Get equipped equipment
   */
  async getEquippedEquipment(playerId: string): Promise<EquipmentInstance[]> {
    const { data, error } = await supabase
      .from('equipment_instances')
      .select('*')
      .eq('player_id', playerId)
      .eq('is_equipped', true);

    if (error) {
      throw new Error(`Failed to get equipped equipment: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get equipment instances with equipment details
   */
  async getEquipmentInstancesWithDetails(playerId: string): Promise<EquipmentInstance[]> {
    const { data, error } = await supabase
      .from('equipment_instances')
      .select(`
        *,
        equipment(*)
      `)
      .eq('player_id', playerId)
      .order('acquired_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get equipment instances with details: ${error.message}`);
    }

    return data || [];
  }
}

export const equipmentRepository = new EquipmentRepository();
