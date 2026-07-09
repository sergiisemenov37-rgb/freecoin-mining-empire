/**
 * Energy Persistence
 * Manages saving and restoring energy system state with version support
 */

import type { EnergySystemConfig } from './types';
import { DEFAULT_ENERGY_CONFIG } from './types';
import { EnergySystem } from './EnergySystem';

/**
 * Persistence storage interface
 */
export interface EnergyStorage {
  save(key: string, data: string): Promise<void>;
  load(key: string): Promise<string | null>;
  delete(key: string): Promise<void>;
}

/**
 * Local storage implementation
 */
export class LocalStorageStorage implements EnergyStorage {
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
 * Energy persistence class
 */
export class EnergyPersistence {
  private storage: EnergyStorage;
  private config: EnergySystemConfig;
  private autoSaveInterval: NodeJS.Timeout | null;
  private saveKey: string;

  constructor(
    storage: EnergyStorage,
    empireId: string,
    config?: Partial<EnergySystemConfig>
  ) {
    this.storage = storage;
    this.config = {
      ...DEFAULT_ENERGY_CONFIG,
      ...config,
    };

    this.saveKey = `energy_${empireId}`;
    this.autoSaveInterval = null;

    if (this.config.autoSave) {
      this.startAutoSave();
    }
  }

  /**
   * Save energy state
   */
  async save(energySystem: EnergySystem): Promise<boolean> {
    try {
      const state = energySystem.getState();
      const data = JSON.stringify({
        version: this.config.version,
        timestamp: Date.now(),
        state: this.serializeState(state),
      });

      await this.storage.save(this.saveKey, data);
      return true;
    } catch (error) {
      console.error('Failed to save energy state:', error);
      return false;
    }
  }

  /**
   * Load energy state
   */
  async load(): Promise<ReturnType<EnergySystem['getState']> | null> {
    try {
      const data = await this.storage.load(this.saveKey);
      if (!data) return null;

      const parsed = JSON.parse(data);
      
      // Version migration
      const migratedState = this.migrateState(parsed.version, parsed.state);
      
      return this.deserializeState(migratedState);
    } catch (error) {
      console.error('Failed to load energy state:', error);
      return null;
    }
  }

  /**
   * Delete energy state
   */
  async delete(): Promise<boolean> {
    try {
      await this.storage.delete(this.saveKey);
      return true;
    } catch (error) {
      console.error('Failed to delete energy state:', error);
      return false;
    }
  }

  /**
   * Serialize state
   */
  private serializeState(state: ReturnType<EnergySystem['getState']>): unknown {
    return {
      power: {
        grid: state.power.grid,
        sources: Array.from(state.power.sources.entries()),
        consumers: Array.from(state.power.consumers.entries()),
        batteries: Array.from(state.power.batteries.entries()),
      },
      thermal: {
        thermal: state.thermal.thermal,
        heatSources: Array.from(state.thermal.heatSources.entries()),
        coolingSystems: Array.from(state.thermal.coolingSystems.entries()),
        hardwarePositions: Array.from(state.thermal.hardwarePositions.entries()),
      },
      hardwareStates: Array.from(state.hardwareStates.entries()),
      hardwareRequirements: Array.from(state.hardwareRequirements.entries()),
    };
  }

  /**
   * Deserialize state
   */
  private deserializeState(data: unknown): ReturnType<EnergySystem['getState']> {
    const parsed = data as any;

    return {
      power: {
        grid: parsed.power.grid,
        sources: new Map(parsed.power.sources),
        consumers: new Map(parsed.power.consumers),
        batteries: new Map(parsed.power.batteries),
      },
      thermal: {
        thermal: parsed.thermal.thermal,
        heatSources: new Map(parsed.thermal.heatSources),
        coolingSystems: new Map(parsed.thermal.coolingSystems),
        hardwarePositions: new Map(parsed.thermal.hardwarePositions),
      },
      hardwareStates: new Map(parsed.hardwareStates),
      hardwareRequirements: new Map(parsed.hardwareRequirements),
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
  updateConfig(config: Partial<EnergySystemConfig>): void {
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
  getConfig(): EnergySystemConfig {
    return { ...this.config };
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stopAutoSave();
  }
}
