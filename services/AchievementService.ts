import { achievementRepository } from '@/repositories/AchievementRepository';
import type {
  AchievementInsert,
  AchievementUpdate,
  AchievementProgressInsert,
  AchievementProgressUpdate,
} from '@/types/database';

/**
 * Achievement Service
 * Service layer for achievement operations
 * No business logic - only CRUD operations
 */
export class AchievementService {
  /**
   * Get all achievements
   */
  async getAllAchievements() {
    return achievementRepository.getAllAchievements();
  }

  /**
   * Get achievement by key
   */
  async getAchievementByKey(key: string) {
    return achievementRepository.getAchievementByKey(key);
  }

  /**
   * Get achievement by ID
   */
  async getAchievementById(id: string) {
    return achievementRepository.getAchievementById(id);
  }

  /**
   * Get achievements by category
   */
  async getAchievementsByCategory(category: string) {
    return achievementRepository.getAchievementsByCategory(category);
  }

  /**
   * Get visible achievements
   */
  async getVisibleAchievements() {
    return achievementRepository.getVisibleAchievements();
  }

  /**
   * Create achievement (admin only)
   */
  async createAchievement(achievement: AchievementInsert) {
    return achievementRepository.createAchievement(achievement);
  }

  /**
   * Update achievement (admin only)
   */
  async updateAchievement(id: string, achievement: AchievementUpdate) {
    return achievementRepository.updateAchievement(id, achievement);
  }

  /**
   * Get player's achievement progress
   */
  async getAchievementProgress(playerId: string) {
    return achievementRepository.getAchievementProgress(playerId);
  }

  /**
   * Get achievement progress by achievement ID
   */
  async getAchievementProgressById(playerId: string, achievementId: string) {
    return achievementRepository.getAchievementProgressById(playerId, achievementId);
  }

  /**
   * Create achievement progress
   */
  async createAchievementProgress(progress: AchievementProgressInsert) {
    return achievementRepository.createAchievementProgress(progress);
  }

  /**
   * Update achievement progress
   */
  async updateAchievementProgress(playerId: string, achievementId: string, progress: AchievementProgressUpdate) {
    return achievementRepository.updateAchievementProgress(playerId, achievementId, progress);
  }

  /**
   * Complete achievement
   */
  async completeAchievement(playerId: string, achievementId: string) {
    return achievementRepository.completeAchievement(playerId, achievementId);
  }

  /**
   * Get completed achievements
   */
  async getCompletedAchievements(playerId: string) {
    return achievementRepository.getCompletedAchievements(playerId);
  }

  /**
   * Get achievement progress with achievement details
   */
  async getAchievementProgressWithDetails(playerId: string) {
    return achievementRepository.getAchievementProgressWithDetails(playerId);
  }
}

export const achievementService = new AchievementService();
