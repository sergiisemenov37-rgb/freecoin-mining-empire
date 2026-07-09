/**
 * Robot Persistence
 * Manages saving and restoring robot state with version support
 */

import type { RobotSystemConfig } from './types';
import { DEFAULT_ROBOT_CONFIG } from './types';
import { RobotSystem } from './RobotSystem';

/**
 * Persistence storage interface
 */
export interface RobotStorage {
  save(key: string, data: string): Promise<void>;
  load(key: string): Promise<string | null>;
  delete(key: string): Promise<void>;
}

/**
 * Local storage implementation
 */
export class LocalStorageStorage implements RobotStorage {
  async save(key: string, data: string): Promise<void> {
    localStorage.setItem(key, data);
  }

  async load(key: string): Promise<string | null> {
    return localStorage.getItem(key);
  }

  async delete(key: string): Promise<void> {
    localStorage.removeItem(key);
  }
}

/**
 * Robot persistence class
 */
export class RobotPersistence {
  private storage: RobotStorage;
  private config: RobotSystemConfig;
  private autoSaveInterval: NodeJS.Timeout | null;
  private saveKey: string;

  constructor(
    storage: RobotStorage,
    empireId: string,
    config?: Partial<RobotSystemConfig>
  ) {
    this.storage = storage;
    this.config = {
      ...DEFAULT_ROBOT_CONFIG,
      ...config,
    };

    this.saveKey = `robot_${empireId}`;
    this.autoSaveInterval = null;

    if (this.config.autoSave) {
      this.startAutoSave();
    }
  }

  /**
   * Save robot state
   */
  async save(robotSystem: RobotSystem): Promise<boolean> {
    try {
      const state = robotSystem.getState();
      const data = JSON.stringify({
        version: this.config.version,
        timestamp: Date.now(),
        state: this.serializeState(state),
      });

      await this.storage.save(this.saveKey, data);
      return true;
    } catch (error) {
      console.error('Failed to save robot state:', error);
      return false;
    }
  }

  /**
   * Load robot state
   */
  async load(): Promise<ReturnType<RobotSystem['getState']> | null> {
    try {
      const data = await this.storage.load(this.saveKey);
      if (!data) return null;

      const parsed = JSON.parse(data);
      
      // Version migration
      const migratedState = this.migrateState(parsed.version, parsed.state);
      
      return this.deserializeState(migratedState);
    } catch (error) {
      console.error('Failed to load robot state:', error);
      return null;
    }
  }

  /**
   * Delete robot state
   */
  async delete(): Promise<boolean> {
    try {
      await this.storage.delete(this.saveKey);
      return true;
    } catch (error) {
      console.error('Failed to delete robot state:', error);
      return false;
    }
  }

  /**
   * Serialize state
   */
  private serializeState(state: ReturnType<RobotSystem['getState']>): unknown {
    return {
      robots: Array.from(state.robots.entries()),
      tasks: Array.from(state.tasks.entries()),
      chargingStations: Array.from(state.chargingStations.entries()),
    };
  }

  /**
   * Deserialize state
   */
  private deserializeState(data: unknown): ReturnType<RobotSystem['getState']> {
    const parsed = data as any;

    return {
      robots: new Map(parsed.robots),
      tasks: new Map(parsed.tasks),
      chargingStations: new Map(parsed.chargingStations),
    };
  }

  /**
   * Migrate state from old version
   */
  private migrateState(version: number, state: unknown): unknown {
    // In a real implementation, this would handle version migrations
    // For now, we just return the state as-is
    return state;
  }

  /**
   * Start auto save
   */
  private startAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }

    this.autoSaveInterval = setInterval(() => {
      // In a real implementation, this would trigger a save
      // For now, this is a placeholder
    }, this.config.autoSaveInterval);
  }

  /**
   * Stop auto save
   */
  private stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<RobotSystemConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (this.config.autoSave) {
      this.startAutoSave();
    } else {
      this.stopAutoSave();
    }
  }

  /**
   * Get configuration
   */
  getConfig(): RobotSystemConfig {
    return { ...this.config };
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stopAutoSave();
  }
}
