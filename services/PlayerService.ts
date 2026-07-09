import { playerRepository } from '@/repositories/PlayerRepository';
import type {
  PlayerInsert,
  PlayerUpdate,
  PlayerProfileInsert,
  PlayerProfileUpdate,
} from '@/types/database';

/**
 * Player Service
 * Service layer for player operations
 * No business logic - only CRUD operations
 */
export class PlayerService {
  /**
   * Get player by Telegram ID
   */
  async getByTelegramId(telegramId: number) {
    return playerRepository.findByTelegramId(telegramId);
  }

  /**
   * Get player by ID
   */
  async getById(id: string) {
    return playerRepository.findById(id);
  }

  /**
   * Create new player
   */
  async create(player: PlayerInsert) {
    return playerRepository.create(player);
  }

  /**
   * Update player
   */
  async update(id: string, player: PlayerUpdate) {
    return playerRepository.update(id, player);
  }

  /**
   * Update last active timestamp
   */
  async updateLastActive(id: string) {
    return playerRepository.updateLastActive(id);
  }

  /**
   * Soft delete player
   */
  async softDelete(id: string) {
    return playerRepository.softDelete(id);
  }

  /**
   * Get player profile
   */
  async getProfile(playerId: string) {
    return playerRepository.getProfile(playerId);
  }

  /**
   * Create player profile
   */
  async createProfile(profile: PlayerProfileInsert) {
    return playerRepository.createProfile(profile);
  }

  /**
   * Update player profile
   */
  async updateProfile(playerId: string, profile: PlayerProfileUpdate) {
    return playerRepository.updateProfile(playerId, profile);
  }

  /**
   * Get player with profile
   */
  async getPlayerWithProfile(telegramId: number) {
    return playerRepository.getPlayerWithProfile(telegramId);
  }
}

export const playerService = new PlayerService();
