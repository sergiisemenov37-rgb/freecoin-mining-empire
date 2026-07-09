import { equipmentRepository } from '@/repositories/EquipmentRepository';
import type {
  EquipmentInsert,
  EquipmentUpdate,
  EquipmentInstanceInsert,
  EquipmentInstanceUpdate,
} from '@/types/database';

/**
 * Equipment Service
 * Service layer for equipment operations
 * No business logic - only CRUD operations
 */
export class EquipmentService {
  /**
   * Get all equipment
   */
  async getAllEquipment() {
    return equipmentRepository.getAllEquipment();
  }

  /**
   * Get equipment by key
   */
  async getEquipmentByKey(key: string) {
    return equipmentRepository.getEquipmentByKey(key);
  }

  /**
   * Get equipment by ID
   */
  async getEquipmentById(id: string) {
    return equipmentRepository.getEquipmentById(id);
  }

  /**
   * Create equipment (admin only)
   */
  async createEquipment(equipment: EquipmentInsert) {
    return equipmentRepository.createEquipment(equipment);
  }

  /**
   * Update equipment (admin only)
   */
  async updateEquipment(id: string, equipment: EquipmentUpdate) {
    return equipmentRepository.updateEquipment(id, equipment);
  }

  /**
   * Get player's equipment instances
   */
  async getEquipmentInstances(playerId: string) {
    return equipmentRepository.getEquipmentInstances(playerId);
  }

  /**
   * Get equipment instance by ID
   */
  async getEquipmentInstanceById(id: string) {
    return equipmentRepository.getEquipmentInstanceById(id);
  }

  /**
   * Create equipment instance
   */
  async createEquipmentInstance(instance: EquipmentInstanceInsert) {
    return equipmentRepository.createEquipmentInstance(instance);
  }

  /**
   * Update equipment instance
   */
  async updateEquipmentInstance(id: string, instance: EquipmentInstanceUpdate) {
    return equipmentRepository.updateEquipmentInstance(id, instance);
  }

  /**
   * Delete equipment instance
   */
  async deleteEquipmentInstance(id: string) {
    return equipmentRepository.deleteEquipmentInstance(id);
  }

  /**
   * Equip equipment instance
   */
  async equipEquipment(id: string) {
    return equipmentRepository.equipEquipment(id);
  }

  /**
   * Unequip equipment instance
   */
  async unequipEquipment(id: string) {
    return equipmentRepository.unequipEquipment(id);
  }

  /**
   * Get equipped equipment
   */
  async getEquippedEquipment(playerId: string) {
    return equipmentRepository.getEquippedEquipment(playerId);
  }

  /**
   * Get equipment instances with equipment details
   */
  async getEquipmentInstancesWithDetails(playerId: string) {
    return equipmentRepository.getEquipmentInstancesWithDetails(playerId);
  }
}

export const equipmentService = new EquipmentService();
