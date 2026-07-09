import { leaderboardRepository } from '@/repositories/LeaderboardRepository';
import type {
  LeaderboardInsert,
  LeaderboardUpdate,
  LeaderboardEntryInsert,
  LeaderboardEntryUpdate,
} from '@/types/database';

/**
 * Leaderboard Service
 * Service layer for leaderboard operations
 * No business logic - only CRUD operations
 */
export class LeaderboardService {
  /**
   * Get all leaderboards
   */
  async getAllLeaderboards() {
    return leaderboardRepository.getAllLeaderboards();
  }

  /**
   * Get active leaderboards
   */
  async getActiveLeaderboards() {
    return leaderboardRepository.getActiveLeaderboards();
  }

  /**
   * Get leaderboard by key
   */
  async getLeaderboardByKey(key: string) {
    return leaderboardRepository.getLeaderboardByKey(key);
  }

  /**
   * Get leaderboard by ID
   */
  async getLeaderboardById(id: string) {
    return leaderboardRepository.getLeaderboardById(id);
  }

  /**
   * Create leaderboard (admin only)
   */
  async createLeaderboard(leaderboard: LeaderboardInsert) {
    return leaderboardRepository.createLeaderboard(leaderboard);
  }

  /**
   * Update leaderboard (admin only)
   */
  async updateLeaderboard(id: string, leaderboard: LeaderboardUpdate) {
    return leaderboardRepository.updateLeaderboard(id, leaderboard);
  }

  /**
   * Get leaderboard entries
   */
  async getLeaderboardEntries(leaderboardId: string, limit: number = 100, offset: number = 0) {
    return leaderboardRepository.getLeaderboardEntries(leaderboardId, limit, offset);
  }

  /**
   * Get player's leaderboard entry
   */
  async getPlayerEntry(leaderboardId: string, playerId: string) {
    return leaderboardRepository.getPlayerEntry(leaderboardId, playerId);
  }

  /**
   * Get player's entries across all leaderboards
   */
  async getPlayerEntries(playerId: string) {
    return leaderboardRepository.getPlayerEntries(playerId);
  }

  /**
   * Create leaderboard entry
   */
  async createLeaderboardEntry(entry: LeaderboardEntryInsert) {
    return leaderboardRepository.createLeaderboardEntry(entry);
  }

  /**
   * Update leaderboard entry
   */
  async updateLeaderboardEntry(leaderboardId: string, playerId: string, entry: LeaderboardEntryUpdate) {
    return leaderboardRepository.updateLeaderboardEntry(leaderboardId, playerId, entry);
  }

  /**
   * Update player score
   */
  async updatePlayerScore(leaderboardId: string, playerId: string, score: number) {
    return leaderboardRepository.updatePlayerScore(leaderboardId, playerId, score);
  }

  /**
   * Get leaderboard entries with player profiles
   */
  async getLeaderboardEntriesWithProfiles(leaderboardId: string, limit: number = 100) {
    return leaderboardRepository.getLeaderboardEntriesWithProfiles(leaderboardId, limit);
  }

  /**
   * Recalculate ranks for a leaderboard
   */
  async recalculateRanks(leaderboardId: string) {
    return leaderboardRepository.recalculateRanks(leaderboardId);
  }
}

export const leaderboardService = new LeaderboardService();
