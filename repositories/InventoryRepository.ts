import { supabase } from '@/lib/supabase';
import type {
  Inventory,
  InventoryInsert,
  InventoryUpdate,
  InventoryItem,
  InventoryItemInsert,
  InventoryItemUpdate,
} from '@/types/database';

/**
 * Inventory Repository
 * Handles inventory and inventory items
 */
export class InventoryRepository {
  /**
   * Get player's inventory
   */
  async getInventory(playerId: string): Promise<Inventory | null> {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('player_id', playerId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get inventory: ${error.message}`);
    }

    return data;
  }

  /**
   * Create inventory
   */
  async createInventory(inventory: InventoryInsert): Promise<Inventory> {
    const { data, error } = await supabase
      .from('inventory')
      .insert(inventory)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create inventory: ${error.message}`);
    }

    return data;
  }

  /**
   * Update inventory
   */
  async updateInventory(playerId: string, inventory: InventoryUpdate): Promise<Inventory> {
    const { data, error } = await supabase
      .from('inventory')
      .update(inventory)
      .eq('player_id', playerId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update inventory: ${error.message}`);
    }

    return data;
  }

  /**
   * Get inventory items
   */
  async getInventoryItems(inventoryId: string): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('inventory_id', inventoryId)
      .order('category');

    if (error) {
      throw new Error(`Failed to get inventory items: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get inventory item by ID
   */
  async getInventoryItemById(id: string): Promise<InventoryItem | null> {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get inventory item: ${error.message}`);
    }

    return data;
  }

  /**
   * Get inventory item by key
   */
  async getInventoryItemByKey(inventoryId: string, itemKey: string): Promise<InventoryItem | null> {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('inventory_id', inventoryId)
      .eq('item_key', itemKey)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get inventory item: ${error.message}`);
    }

    return data;
  }

  /**
   * Create inventory item
   */
  async createInventoryItem(item: InventoryItemInsert): Promise<InventoryItem> {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert(item)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create inventory item: ${error.message}`);
    }

    return data;
  }

  /**
   * Update inventory item
   */
  async updateInventoryItem(id: string, item: InventoryItemUpdate): Promise<InventoryItem> {
    const { data, error } = await supabase
      .from('inventory_items')
      .update(item)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update inventory item: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete inventory item
   */
  async deleteInventoryItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete inventory item: ${error.message}`);
    }
  }

  /**
   * Add item to inventory
   */
  async addItem(inventoryId: string, item: Omit<InventoryItemInsert, 'inventory_id'>): Promise<InventoryItem> {
    const existing = await this.getInventoryItemByKey(inventoryId, item.item_key);
    
    if (existing) {
      const newQuantity = existing.quantity + (item.quantity || 1);
      if (newQuantity > existing.max_stack) {
        throw new Error('Item would exceed max stack');
      }
      return this.updateInventoryItem(existing.id, { quantity: newQuantity });
    }

    return this.createInventoryItem({
      ...item,
      inventory_id: inventoryId,
    });
  }

  /**
   * Remove item from inventory
   */
  async removeItem(inventoryId: string, itemKey: string, quantity: number): Promise<InventoryItem | null> {
    const existing = await this.getInventoryItemByKey(inventoryId, itemKey);
    
    if (!existing) {
      throw new Error('Item not found in inventory');
    }

    if (existing.quantity <= quantity) {
      await this.deleteInventoryItem(existing.id);
      return null;
    }

    return this.updateInventoryItem(existing.id, { quantity: existing.quantity - quantity });
  }

  /**
   * Get inventory with items
   */
  async getInventoryWithItems(playerId: string): Promise<{ inventory: Inventory; items: InventoryItem[] } | null> {
    const inventory = await this.getInventory(playerId);
    
    if (!inventory) {
      return null;
    }

    const items = await this.getInventoryItems(inventory.id);

    return {
      inventory,
      items,
    };
  }
}

export const inventoryRepository = new InventoryRepository();
