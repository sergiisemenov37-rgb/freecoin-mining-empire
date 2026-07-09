import { resourceRepository } from '@/repositories/ResourceRepository';
import type {
  ResourceInsert,
  ResourceUpdate,
  ResourceBalanceInsert,
  ResourceBalanceUpdate,
} from '@/types/database';

/**
 * Resource Service
 * Service layer for resource operations
 * No business logic - only CRUD operations
 */
export class ResourceService {
  /**
   * Get all resources
   */
  async getAllResources() {
    return resourceRepository.getAllResources();
  }

  /**
   * Get resource by key
   */
  async getResourceByKey(key: string) {
    return resourceRepository.getResourceByKey(key);
  }

  /**
   * Get resource by ID
   */
  async getResourceById(id: string) {
    return resourceRepository.getResourceById(id);
  }

  /**
   * Create resource (admin only)
   */
  async createResource(resource: ResourceInsert) {
    return resourceRepository.createResource(resource);
  }

  /**
   * Update resource (admin only)
   */
  async updateResource(id: string, resource: ResourceUpdate) {
    return resourceRepository.updateResource(id, resource);
  }

  /**
   * Get player's resource balance
   */
  async getBalance(playerId: string, resourceId: string) {
    return resourceRepository.getBalance(playerId, resourceId);
  }

  /**
   * Get all player balances
   */
  async getPlayerBalances(playerId: string) {
    return resourceRepository.getPlayerBalances(playerId);
  }

  /**
   * Create resource balance
   */
  async createBalance(balance: ResourceBalanceInsert) {
    return resourceRepository.createBalance(balance);
  }

  /**
   * Update resource balance
   */
  async updateBalance(playerId: string, resourceId: string, balance: ResourceBalanceUpdate) {
    return resourceRepository.updateBalance(playerId, resourceId, balance);
  }

  /**
   * Add amount to balance
   */
  async addToBalance(playerId: string, resourceId: string, amount: number) {
    return resourceRepository.addToBalance(playerId, resourceId, amount);
  }

  /**
   * Subtract amount from balance
   */
  async subtractFromBalance(playerId: string, resourceId: string, amount: number) {
    return resourceRepository.subtractFromBalance(playerId, resourceId, amount);
  }

  /**
   * Get player balances with resource details
   */
  async getPlayerBalancesWithResources(playerId: string) {
    return resourceRepository.getPlayerBalancesWithResources(playerId);
  }
}

export const resourceService = new ResourceService();
