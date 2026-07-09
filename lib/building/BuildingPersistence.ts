/**
 * Building Persistence
 * Manages saving and restoring building state with version support
 */

import type { BuildingSystemConfig } from './types';
import { DEFAULT_BUILDING_CONFIG } from './types';
import { BuildingSystem } from './BuildingSystem';

/**
 * Persistence storage interface
 */
export interface BuildingStorage {
  save(key: string, data: string): Promise<void>;
  load(key: string): Promise<string | null>;
  delete(key: string): Promise<void>;
}

/**
 * Local storage implementation
 */
export class LocalStorageStorage implements BuildingStorage {
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
 * Building persistence class
 */
export class BuildingPersistence {
  private storage: BuildingStorage;
  private config: BuildingSystemConfig;
  private autoSaveInterval: NodeJS.Timeout | null;
  private saveKey: string;

  constructor(
    storage: BuildingStorage,
    empireId: string,
    config?: Partial<BuildingSystemConfig>
  ) {
    this.storage = storage;
    this.config = {
      ...DEFAULT_BUILDING_CONFIG,
      ...config,
    };

    this.saveKey = `building_${empireId}`;
    this.autoSaveInterval = null;

    if (this.config.autoSave) {
      this.startAutoSave();
    }
  }

  /**
   * Save building state
   */
  async save(buildingSystem: BuildingSystem): Promise<boolean> {
    try {
      const state = buildingSystem.getState();
      const data = JSON.stringify({
        version: this.config.version,
        timestamp: Date.now(),
        state: this.serializeState(state),
      });

      await this.storage.save(this.saveKey, data);
      return true;
    } catch (error) {
      console.error('Failed to save building state:', error);
      return false;
    }
  }

  /**
   * Load building state
   */
  async load(): Promise<ReturnType<BuildingSystem['getState']> | null> {
    try {
      const data = await this.storage.load(this.saveKey);
      if (!data) return null;

      const parsed = JSON.parse(data);
      
      // Version migration
      const migratedState = this.migrateState(parsed.version, parsed.state);
      
      return this.deserializeState(migratedState);
    } catch (error) {
      console.error('Failed to load building state:', error);
      return null;
    }
  }

  /**
   * Delete building state
   */
  async delete(): Promise<boolean> {
    try {
      await this.storage.delete(this.saveKey);
      return true;
    } catch (error) {
      console.error('Failed to delete building state:', error);
      return false;
    }
  }

  /**
   * Serialize state
   */
  private serializeState(state: ReturnType<BuildingSystem['getState']>): unknown {
    return {
      construction: {
        buildings: Array.from(state.construction.buildings.entries()),
        constructionQueue: state.construction.constructionQueue,
      },
      expansion: {
        expansions: Array.from(state.expansion.expansions.entries()),
      },
      capacity: {
        buildings: Array.from(state.capacity.buildings.entries()),
      },
    };
  }

  /**
   * Deserialize state
   */
  private deserializeState(data: unknown): ReturnType<BuildingSystem['getState']> {
    const parsed = data as any;

    return {
      construction: {
        buildings: new Map(parsed.construction.buildings),
        constructionQueue: parsed.construction.constructionQueue,
      },
      expansion: {
        expansions: new Map(parsed.expansion.expansions),
      },
      capacity: {
        buildings: new Map(parsed.capacity.buildings),
      },
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
  updateConfig(config: Partial<BuildingSystemConfig>): void {
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
  getConfig(): BuildingSystemConfig {
    return { ...this.config };
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stopAutoSave();
  }
}
