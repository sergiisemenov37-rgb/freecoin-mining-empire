import { supabase } from '@/lib/supabase';
import type {
  Resource,
  ResourceInsert,
  ResourceUpdate,
  ResourceBalance,
  ResourceBalanceInsert,
  ResourceBalanceUpdate,
} from '@/types/database';

/**
 * Resource Repository
 * Handles resource definitions and player resource balances
 */
export class ResourceRepository {
  /**
   * Get all resources
   */
  async getAllResources(): Promise<Resource[]> {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('resource_type');

    if (error) {
      throw new Error(`Failed to get resources: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get resource by key
   */
  async getResourceByKey(key: string): Promise<Resource | null> {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('resource_key', key)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get resource: ${error.message}`);
    }

    return data;
  }

  /**
   * Get resource by ID
   */
  async getResourceById(id: string): Promise<Resource | null> {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get resource: ${error.message}`);
    }

    return data;
  }

  /**
   * Create resource (admin only)
   */
  async createResource(resource: ResourceInsert): Promise<Resource> {
    const { data, error } = await supabase
      .from('resources')
      .insert(resource)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create resource: ${error.message}`);
    }

    return data;
  }

  /**
   * Update resource (admin only)
   */
  async updateResource(id: string, resource: ResourceUpdate): Promise<Resource> {
    const { data, error } = await supabase
      .from('resources')
      .update(resource)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update resource: ${error.message}`);
    }

    return data;
  }

  /**
   * Get player's resource balance
   */
  async getBalance(playerId: string, resourceId: string): Promise<ResourceBalance | null> {
    const { data, error } = await supabase
      .from('resource_balances')
      .select('*')
      .eq('player_id', playerId)
      .eq('resource_id', resourceId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get resource balance: ${error.message}`);
    }

    return data;
  }

  /**
   * Get all player balances
   */
  async getPlayerBalances(playerId: string): Promise<ResourceBalance[]> {
    const { data, error } = await supabase
      .from('resource_balances')
      .select('*')
      .eq('player_id', playerId);

    if (error) {
      throw new Error(`Failed to get player balances: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Create resource balance
   */
  async createBalance(balance: ResourceBalanceInsert): Promise<ResourceBalance> {
    const { data, error } = await supabase
      .from('resource_balances')
      .insert(balance)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create resource balance: ${error.message}`);
    }

    return data;
  }

  /**
   * Update resource balance
   */
  async updateBalance(playerId: string, resourceId: string, balance: ResourceBalanceUpdate): Promise<ResourceBalance> {
    const { data, error } = await supabase
      .from('resource_balances')
      .update({
        ...balance,
        last_updated_at: new Date().toISOString(),
      })
      .eq('player_id', playerId)
      .eq('resource_id', resourceId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update resource balance: ${error.message}`);
    }

    return data;
  }

  /**
   * Add amount to balance
   */
  async addToBalance(playerId: string, resourceId: string, amount: number): Promise<ResourceBalance> {
    const current = await this.getBalance(playerId, resourceId);
    
    if (!current) {
      return this.createBalance({
        player_id: playerId,
        resource_id: resourceId,
        amount,
      });
    }

    return this.updateBalance(playerId, resourceId, {
      amount: current.amount + amount,
    });
  }

  /**
   * Subtract amount from balance
   */
  async subtractFromBalance(playerId: string, resourceId: string, amount: number): Promise<ResourceBalance> {
    const current = await this.getBalance(playerId, resourceId);
    
    if (!current) {
      throw new Error('Resource balance not found');
    }

    if (current.amount < amount) {
      throw new Error('Insufficient balance');
    }

    return this.updateBalance(playerId, resourceId, {
      amount: current.amount - amount,
    });
  }

  /**
   * Get player balances with resource details
   */
  async getPlayerBalancesWithResources(playerId: string): Promise<ResourceBalance[]> {
    const { data, error } = await supabase
      .from('resource_balances')
      .select(`
        *,
        resources(*)
      `)
      .eq('player_id', playerId);

    if (error) {
      throw new Error(`Failed to get player balances with resources: ${error.message}`);
    }

    return data || [];
  }
}

export const resourceRepository = new ResourceRepository();
