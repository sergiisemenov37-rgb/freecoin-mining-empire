import { settingsRepository } from '@/repositories/SettingsRepository';
import type {
  SettingUpdate,
} from '@/types/database';

/**
 * Settings Service
 * Service layer for settings operations
 * No business logic - only CRUD operations
 */
export class SettingsService {
  /**
   * Get player's settings
   */
  async getPlayerSettings(playerId: string) {
    return settingsRepository.getPlayerSettings(playerId);
  }

  /**
   * Get setting by key
   */
  async getSetting(playerId: string, settingKey: string) {
    return settingsRepository.getSetting(playerId, settingKey);
  }

  /**
   * Upsert setting
   */
  async upsertSetting(playerId: string, settingKey: string, settingValue: Record<string, unknown>) {
    return settingsRepository.upsertSetting(playerId, settingKey, settingValue);
  }

  /**
   * Delete setting
   */
  async deleteSetting(playerId: string, settingKey: string) {
    return settingsRepository.deleteSetting(playerId, settingKey);
  }

  /**
   * Get all settings as a key-value object
   */
  async getSettingsAsObject(playerId: string) {
    return settingsRepository.getSettingsAsObject(playerId);
  }

  /**
   * Batch upsert settings
   */
  async batchUpsertSettings(playerId: string, settings: Record<string, Record<string, unknown>>) {
    return settingsRepository.batchUpsertSettings(playerId, settings);
  }
}

export const settingsService = new SettingsService();
