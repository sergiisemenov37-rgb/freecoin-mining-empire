import { inventoryRepository } from '@/repositories/InventoryRepository';
import type {
  InventoryInsert,
  InventoryUpdate,
  InventoryItemInsert,
  InventoryItemUpdate,
} from '@/types/database';

/**
 * Inventory Service
 * Service layer for inventory operations
 * No business logic - only CRUD operations
 */
export class InventoryService {
  /**
   * Get player's inventory
   */
  async getInventory(playerId: string) {
    return inventoryRepository.getInventory(playerId);
  }

  /**
   * Create inventory
   */
  async createInventory(inventory: InventoryInsert) {
    return inventoryRepository.createInventory(inventory);
  }

  /**
   * Update inventory
   */
  async updateInventory(playerId: string, inventory: InventoryUpdate) {
    return inventoryRepository.updateInventory(playerId, inventory);
  }

  /**
   * Get inventory items
   */
  async getInventoryItems(inventoryId: string) {
    return inventoryRepository.getInventoryItems(inventoryId);
  }

  /**
   * Get inventory item by ID
   */
  async getInventoryItemById(id: string) {
    return inventoryRepository.getInventoryItemById(id);
  }

  /**
   * Get inventory item by key
   */
  async getInventoryItemByKey(inventoryId: string, itemKey: string) {
    return inventoryRepository.getInventoryItemByKey(inventoryId, itemKey);
  }

  /**
   * Create inventory item
   */
  async createInventoryItem(item: InventoryItemInsert) {
    return inventoryRepository.createInventoryItem(item);
  }

  /**
   * Update inventory item
   */
  async updateInventoryItem(id: string, item: InventoryItemUpdate) {
    return inventoryRepository.updateInventoryItem(id, item);
  }

  /**
   * Delete inventory item
   */
  async deleteInventoryItem(id: string) {
    return inventoryRepository.deleteInventoryItem(id);
  }

  /**
   * Add item to inventory
   */
  async addItem(inventoryId: string, item: Omit<InventoryItemInsert, 'inventory_id'>) {
    return inventoryRepository.addItem(inventoryId, item);
  }

  /**
   * Remove item from inventory
   */
  async removeItem(inventoryId: string, itemKey: string, quantity: number) {
    return inventoryRepository.removeItem(inventoryId, itemKey, quantity);
  }

  /**
   * Get inventory with items
   */
  async getInventoryWithItems(playerId: string) {
    return inventoryRepository.getInventoryWithItems(playerId);
  }
}

export const inventoryService = new InventoryService();
