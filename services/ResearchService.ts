import { researchRepository } from '@/repositories/ResearchRepository';
import type {
  ResearchInsert,
  ResearchUpdate,
  ResearchProgressInsert,
  ResearchProgressUpdate,
} from '@/types/database';

/**
 * Research Service
 * Service layer for research operations
 * No business logic - only CRUD operations
 */
export class ResearchService {
  /**
   * Get all research
   */
  async getAllResearch() {
    return researchRepository.getAllResearch();
  }

  /**
   * Get research by key
   */
  async getResearchByKey(key: string) {
    return researchRepository.getResearchByKey(key);
  }

  /**
   * Get research by ID
   */
  async getResearchById(id: string) {
    return researchRepository.getResearchById(id);
  }

  /**
   * Create research (admin only)
   */
  async createResearch(research: ResearchInsert) {
    return researchRepository.createResearch(research);
  }

  /**
   * Update research (admin only)
   */
  async updateResearch(id: string, research: ResearchUpdate) {
    return researchRepository.updateResearch(id, research);
  }

  /**
   * Get player's research progress
   */
  async getResearchProgress(playerId: string) {
    return researchRepository.getResearchProgress(playerId);
  }

  /**
   * Get research progress by research ID
   */
  async getResearchProgressById(playerId: string, researchId: string) {
    return researchRepository.getResearchProgressById(playerId, researchId);
  }

  /**
   * Create research progress
   */
  async createResearchProgress(progress: ResearchProgressInsert) {
    return researchRepository.createResearchProgress(progress);
  }

  /**
   * Update research progress
   */
  async updateResearchProgress(playerId: string, researchId: string, progress: ResearchProgressUpdate) {
    return researchRepository.updateResearchProgress(playerId, researchId, progress);
  }

  /**
   * Start research
   */
  async startResearch(playerId: string, researchId: string) {
    return researchRepository.startResearch(playerId, researchId);
  }

  /**
   * Complete research
   */
  async completeResearch(playerId: string, researchId: string) {
    return researchRepository.completeResearch(playerId, researchId);
  }

  /**
   * Get research progress with research details
   */
  async getResearchProgressWithDetails(playerId: string) {
    return researchRepository.getResearchProgressWithDetails(playerId);
  }
}

export const researchService = new ResearchService();
