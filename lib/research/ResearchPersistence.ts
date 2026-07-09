/**
 * Research Persistence
 * Manages saving and restoring research state with version support
 */

import type { ResearchSystemConfig } from './types';
import { DEFAULT_RESEARCH_CONFIG } from './types';
import { ResearchSystem } from './ResearchSystem';

/**
 * Persistence storage interface
 */
export interface ResearchStorage {
  save(key: string, data: string): Promise<void>;
  load(key: string): Promise<string | null>;
  delete(key: string): Promise<void>;
}

/**
 * Local storage implementation
 */
export class LocalStorageStorage implements ResearchStorage {
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
 * Research persistence class
 */
export class ResearchPersistence {
  private storage: ResearchStorage;
  private config: ResearchSystemConfig;
  private autoSaveInterval: NodeJS.Timeout | null;
  private saveKey: string;

  constructor(
    storage: ResearchStorage,
    empireId: string,
    config?: Partial<ResearchSystemConfig>
  ) {
    this.storage = storage;
    this.config = {
      ...DEFAULT_RESEARCH_CONFIG,
      ...config,
    };

    this.saveKey = `research_${empireId}`;
    this.autoSaveInterval = null;

    if (this.config.autoSave) {
      this.startAutoSave();
    }
  }

  /**
   * Save research state
   */
  async save(researchSystem: ResearchSystem): Promise<boolean> {
    try {
      const state = researchSystem.getState();
      const data = JSON.stringify({
        version: this.config.version,
        timestamp: Date.now(),
        state: this.serializeState(state),
      });

      await this.storage.save(this.saveKey, data);
      return true;
    } catch (error) {
      console.error('Failed to save research state:', error);
      return false;
    }
  }

  /**
   * Load research state
   */
  async load(): Promise<ReturnType<ResearchSystem['getState']> | null> {
    try {
      const data = await this.storage.load(this.saveKey);
      if (!data) return null;

      const parsed = JSON.parse(data);
      
      // Version migration
      const migratedState = this.migrateState(parsed.version, parsed.state);
      
      return this.deserializeState(migratedState);
    } catch (error) {
      console.error('Failed to load research state:', error);
      return null;
    }
  }

  /**
   * Delete research state
   */
  async delete(): Promise<boolean> {
    try {
      await this.storage.delete(this.saveKey);
      return true;
    } catch (error) {
      console.error('Failed to delete research state:', error);
      return false;
    }
  }

  /**
   * Serialize state
   */
  private serializeState(state: ReturnType<ResearchSystem['getState']>): unknown {
    return {
      graph: Array.from(state.graph.entries()),
      points: state.points,
      queue: state.queue,
      laboratories: Array.from(state.laboratories.entries()),
    };
  }

  /**
   * Deserialize state
   */
  private deserializeState(data: unknown): ReturnType<ResearchSystem['getState']> {
    const parsed = data as any;

    return {
      graph: new Map(parsed.graph),
      points: parsed.points,
      queue: parsed.queue,
      laboratories: new Map(parsed.laboratories),
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
  updateConfig(config: Partial<ResearchSystemConfig>): void {
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
  getConfig(): ResearchSystemConfig {
    return { ...this.config };
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stopAutoSave();
  }
}
