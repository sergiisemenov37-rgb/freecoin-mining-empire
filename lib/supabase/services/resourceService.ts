/**
 * Resource Service
 * Handles resource-related database operations
 */

import { createServerClientClient } from '../client';
import { Database } from '../types';

type Resource = Database['public']['Tables']['resources']['Row'];
type ResourceInsert = Database['public']['Tables']['resources']['Insert'];
type ResourceUpdate = Database['public']['Tables']['resources']['Update'];

type ResourceBalance = Database['public']['Tables']['resource_balances']['Row'];
type ResourceBalanceInsert = Database['public']['Tables']['resource_balances']['Insert'];
type ResourceBalanceUpdate = Database['public']['Tables']['resource_balances']['Update'];

export class ResourceService {
  /**
   * Get all resources
   */
  static async getAllResources() {
    const supabase = await createServerClientClient();
    
    const { data, error } = await supabase
      .from('resources')
      .select('*');

    if (error) throw error;
    return data;
  }

  /**
   * Get resource by key
   */
  static async getResourceByKey(resourceKey: string) {
    const supabase = await createServerClientClient();
    
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('resource_key', resourceKey)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get player's resource balances
   */
  static async getPlayerBalances(playerId: string) {
    const supabase = await createServerClientClient();
    
    const { data, error } = await supabase
      .from('resource_balances')
      .select('*, resources(*)')
      .eq('player_id', playerId);

    if (error) throw error;
    return data;
  }

  /**
   * Get player's balance for specific resource
   */
  static async getPlayerBalance(playerId: string, resourceKey: string) {
    const supabase = await createServerClientClient();
    
    const { data, error } = await supabase
      .from('resource_balances')
      .select('*, resources(*)')
      .eq('player_id', playerId)
      .eq('resources.resource_key', resourceKey)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Add resource to player
   */
  static async addResource(playerId: string, resourceKey: string, amount: number) {
    const resource = await this.getResourceByKey(resourceKey);
    const existingBalance = await this.getPlayerBalance(playerId, resourceKey);
    
    const supabase = await createServerClientClient();
    
    if (existingBalance) {
      const { data, error } = await supabase
        .from('resource_balances')
        .update({
          amount: existingBalance.amount + amount,
          last_updated_at: new Date().toISOString(),
        })
        .eq('id', existingBalance.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const newBalance: ResourceBalanceInsert = {
        player_id: playerId,
        resource_id: resource.id,
        amount: amount,
      };
      
      const { data, error } = await supabase
        .from('resource_balances')
        .insert(newBalance)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }

  /**
   * Remove resource from player
   */
  static async removeResource(playerId: string, resourceKey: string, amount: number) {
    const existingBalance = await this.getPlayerBalance(playerId, resourceKey);
    
    if (!existingBalance) {
      throw new Error('Player does not have this resource');
    }
    
    if (existingBalance.amount < amount) {
      throw new Error('Insufficient resource balance');
    }
    
    const supabase = await createServerClientClient();
    
    const newAmount = existingBalance.amount - amount;
    
    if (newAmount === 0) {
      const { error } = await supabase
        .from('resource_balances')
        .delete()
        .eq('id', existingBalance.id);

      if (error) throw error;
      return null;
    } else {
      const { data, error } = await supabase
        .from('resource_balances')
        .update({
          amount: newAmount,
          last_updated_at: new Date().toISOString(),
        })
        .eq('id', existingBalance.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }

  /**
   * Check if player has enough resources
   */
  static async hasEnoughResources(playerId: string, resources: { [key: string]: number }) {
    for (const [resourceKey, amount] of Object.entries(resources)) {
      const balance = await this.getPlayerBalance(playerId, resourceKey);
      if (!balance || balance.amount < amount) {
        return false;
      }
    }
    return true;
  }

  /**
   * Transfer resources between players
   */
  static async transferResources(
    fromPlayerId: string,
    toPlayerId: string,
    resourceKey: string,
    amount: number
  ) {
    await this.removeResource(fromPlayerId, resourceKey, amount);
    await this.addResource(toPlayerId, resourceKey, amount);
  }
}
