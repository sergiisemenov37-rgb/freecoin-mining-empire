import { questRepository } from '@/repositories/QuestRepository';
import type {
  QuestInsert,
  QuestUpdate,
  QuestProgressInsert,
  QuestProgressUpdate,
} from '@/types/database';

/**
 * Quest Service
 * Service layer for quest operations
 * No business logic - only CRUD operations
 */
export class QuestService {
  /**
   * Get all quests
   */
  async getAllQuests() {
    return questRepository.getAllQuests();
  }

  /**
   * Get quest by key
   */
  async getQuestByKey(key: string) {
    return questRepository.getQuestByKey(key);
  }

  /**
   * Get quest by ID
   */
  async getQuestById(id: string) {
    return questRepository.getQuestById(id);
  }

  /**
   * Get quests by type
   */
  async getQuestsByType(type: string) {
    return questRepository.getQuestsByType(type);
  }

  /**
   * Get active quests
   */
  async getActiveQuests() {
    return questRepository.getActiveQuests();
  }

  /**
   * Create quest (admin only)
   */
  async createQuest(quest: QuestInsert) {
    return questRepository.createQuest(quest);
  }

  /**
   * Update quest (admin only)
   */
  async updateQuest(id: string, quest: QuestUpdate) {
    return questRepository.updateQuest(id, quest);
  }

  /**
   * Get player's quest progress
   */
  async getQuestProgress(playerId: string) {
    return questRepository.getQuestProgress(playerId);
  }

  /**
   * Get quest progress by quest ID
   */
  async getQuestProgressById(playerId: string, questId: string) {
    return questRepository.getQuestProgressById(playerId, questId);
  }

  /**
   * Create quest progress
   */
  async createQuestProgress(progress: QuestProgressInsert) {
    return questRepository.createQuestProgress(progress);
  }

  /**
   * Update quest progress
   */
  async updateQuestProgress(playerId: string, questId: string, progress: QuestProgressUpdate) {
    return questRepository.updateQuestProgress(playerId, questId, progress);
  }

  /**
   * Start quest
   */
  async startQuest(playerId: string, questId: string) {
    return questRepository.startQuest(playerId, questId);
  }

  /**
   * Complete quest
   */
  async completeQuest(playerId: string, questId: string) {
    return questRepository.completeQuest(playerId, questId);
  }

  /**
   * Get quest progress with quest details
   */
  async getQuestProgressWithDetails(playerId: string) {
    return questRepository.getQuestProgressWithDetails(playerId);
  }
}

export const questService = new QuestService();
