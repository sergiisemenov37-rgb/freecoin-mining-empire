import { supabase } from '@/lib/supabase';
import type {
  Setting,
  SettingInsert,
  SettingUpdate,
} from '@/types/database';

/**
 * Settings Repository
 * Handles player settings
 */
export class SettingsRepository {
  /**
   * Get player's settings
   */
  async getPlayerSettings(playerId: string): Promise<Setting[]> {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('player_id', playerId);

    if (error) {
      throw new Error(`Failed to get player settings: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get setting by key
   */
  async getSetting(playerId: string, settingKey: string): Promise<Setting | null> {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('player_id', playerId)
      .eq('setting_key', settingKey)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get setting: ${error.message}`);
    }

    return data;
  }

  /**
   * Upsert setting
   */
  async upsertSetting(playerId: string, settingKey: string, settingValue: Record<string, unknown>): Promise<Setting> {
    const existing = await this.getSetting(playerId, settingKey);
    
    if (existing) {
      const { data, error } = await supabase
        .from('settings')
        .update({ setting_value: settingValue })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update setting: ${error.message}`);
      }

      return data;
    }

    const { data, error } = await supabase
      .from('settings')
      .insert({
        player_id: playerId,
        setting_key: settingKey,
        setting_value: settingValue,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create setting: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete setting
   */
  async deleteSetting(playerId: string, settingKey: string): Promise<void> {
    const { error } = await supabase
      .from('settings')
      .delete()
      .eq('player_id', playerId)
      .eq('setting_key', settingKey);

    if (error) {
      throw new Error(`Failed to delete setting: ${error.message}`);
    }
  }

  /**
   * Get all settings as a key-value object
   */
  async getSettingsAsObject(playerId: string): Promise<Record<string, Record<string, unknown>>> {
    const settings = await this.getPlayerSettings(playerId);
    
    const result: Record<string, Record<string, unknown>> = {};
    
    for (const setting of settings) {
      result[setting.setting_key] = setting.setting_value;
    }
    
    return result;
  }

  /**
   * Batch upsert settings
   */
  async batchUpsertSettings(playerId: string, settings: Record<string, Record<string, unknown>>): Promise<Setting[]> {
    const results: Setting[] = [];
    
    for (const [key, value] of Object.entries(settings)) {
      const setting = await this.upsertSetting(playerId, key, value);
      results.push(setting);
    }
    
    return results;
  }
}

export const settingsRepository = new SettingsRepository();
