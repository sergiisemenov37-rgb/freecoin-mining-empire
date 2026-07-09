import { empireRepository } from '@/repositories/EmpireRepository';
import type {
  EmpireInsert,
  EmpireUpdate,
  BuildingInsert,
  BuildingUpdate,
  PlacedObjectInsert,
  PlacedObjectUpdate,
} from '@/types/database';

/**
 * Empire Service
 * Service layer for empire operations
 * No business logic - only CRUD operations
 */
export class EmpireService {
  /**
   * Get player's empire
   */
  async getEmpire(playerId: string) {
    return empireRepository.getEmpire(playerId);
  }

  /**
   * Create empire
   */
  async createEmpire(empire: EmpireInsert) {
    return empireRepository.createEmpire(empire);
  }

  /**
   * Update empire
   */
  async updateEmpire(playerId: string, empire: EmpireUpdate) {
    return empireRepository.updateEmpire(playerId, empire);
  }

  /**
   * Get all buildings
   */
  async getAllBuildings() {
    return empireRepository.getAllBuildings();
  }

  /**
   * Get building by key
   */
  async getBuildingByKey(key: string) {
    return empireRepository.getBuildingByKey(key);
  }

  /**
   * Get building by ID
   */
  async getBuildingById(id: string) {
    return empireRepository.getBuildingById(id);
  }

  /**
   * Create building (admin only)
   */
  async createBuilding(building: BuildingInsert) {
    return empireRepository.createBuilding(building);
  }

  /**
   * Update building (admin only)
   */
  async updateBuilding(id: string, building: BuildingUpdate) {
    return empireRepository.updateBuilding(id, building);
  }

  /**
   * Get player's placed objects
   */
  async getPlacedObjects(playerId: string) {
    return empireRepository.getPlacedObjects(playerId);
  }

  /**
   * Get placed object by ID
   */
  async getPlacedObjectById(id: string) {
    return empireRepository.getPlacedObjectById(id);
  }

  /**
   * Get placed object at grid position
   */
  async getPlacedObjectAtPosition(playerId: string, gridX: number, gridY: number) {
    return empireRepository.getPlacedObjectAtPosition(playerId, gridX, gridY);
  }

  /**
   * Create placed object
   */
  async createPlacedObject(object: PlacedObjectInsert) {
    return empireRepository.createPlacedObject(object);
  }

  /**
   * Update placed object
   */
  async updatePlacedObject(id: string, object: PlacedObjectUpdate) {
    return empireRepository.updatePlacedObject(id, object);
  }

  /**
   * Delete placed object
   */
  async deletePlacedObject(id: string) {
    return empireRepository.deletePlacedObject(id);
  }

  /**
   * Get placed objects with building details
   */
  async getPlacedObjectsWithBuildings(playerId: string) {
    return empireRepository.getPlacedObjectsWithBuildings(playerId);
  }
}

export const empireService = new EmpireService();
