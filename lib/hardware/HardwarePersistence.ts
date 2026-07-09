/**
 * Hardware Persistence Layer
 * Persists hardware instances to database
 * Integrates with existing database schema without changing architecture
 */

import type { HardwareInstance, HardwareConfig } from './types';
import { HardwareManager } from './HardwareManager';

/**
 * Persistence options
 */
export interface PersistenceOptions {
  enableAutoSave: boolean;
  autoSaveInterval: number;
  batchSize: number;
}

/**
 * Hardware persistence class
 */
export class HardwarePersistence {
  private manager: HardwareManager;
  private options: PersistenceOptions;
  private autoSaveInterval: NodeJS.Timeout | null = null;
  private pendingSaves: Set<string> = new Set();

  constructor(
    manager: HardwareManager,
    options?: Partial<PersistenceOptions>
  ) {
    this.manager = manager;
    this.options = {
      enableAutoSave: true,
      autoSaveInterval: 30000, // 30 seconds
      batchSize: 100,
      ...options,
    };

    if (this.options.enableAutoSave) {
      this.startAutoSave();
    }
  }

  /**
   * Save single instance to database
   */
  async saveInstance(instanceId: string): Promise<boolean> {
    const instance = this.manager.getInstance(instanceId);
    if (!instance) {
      return false;
    }

    try {
      // In a real implementation, this would save to the database
      // For now, we simulate the save
      console.log(`[Hardware Persistence] Saving instance ${instanceId} to database`);
      
      this.pendingSaves.delete(instanceId);
      return true;
    } catch (error) {
      console.error(`[Hardware Persistence] Failed to save instance ${instanceId}:`, error);
      return false;
    }
  }

  /**
   * Save multiple instances to database
   */
  async saveInstances(instanceIds: string[]): Promise<number> {
    let saved = 0;

    for (let i = 0; i < instanceIds.length; i += this.options.batchSize) {
      const batch = instanceIds.slice(i, i + this.options.batchSize);
      
      for (const instanceId of batch) {
        const success = await this.saveInstance(instanceId);
        if (success) {
          saved++;
        }
      }
    }

    return saved;
  }

  /**
   * Save all instances to database
   */
  async saveAll(): Promise<number> {
    const instances = this.manager.getAllInstances();
    const instanceIds = instances.map(instance => instance.id);
    return await this.saveInstances(instanceIds);
  }

  /**
   * Load instance from database
   */
  async loadInstance(instanceId: string): Promise<HardwareInstance | null> {
    try {
      // In a real implementation, this would load from the database
      // For now, we simulate the load
      console.log(`[Hardware Persistence] Loading instance ${instanceId} from database`);
      
      return this.manager.getInstance(instanceId);
    } catch (error) {
      console.error(`[Hardware Persistence] Failed to load instance ${instanceId}:`, error);
      return null;
    }
  }

  /**
   * Load instances by owner from database
   */
  async loadInstancesByOwner(ownerId: string): Promise<HardwareInstance[]> {
    try {
      // In a real implementation, this would load from the database
      // For now, we simulate the load
      console.log(`[Hardware Persistence] Loading instances for owner ${ownerId} from database`);
      
      return this.manager.getInstancesByOwner(ownerId);
    } catch (error) {
      console.error(`[Hardware Persistence] Failed to load instances for owner ${ownerId}:`, error);
      return [];
    }
  }

  /**
   * Delete instance from database
   */
  async deleteInstance(instanceId: string): Promise<boolean> {
    try {
      // In a real implementation, this would delete from the database
      // For now, we simulate the delete
      console.log(`[Hardware Persistence] Deleting instance ${instanceId} from database`);
      
      return true;
    } catch (error) {
      console.error(`[Hardware Persistence] Failed to delete instance ${instanceId}:`, error);
      return false;
    }
  }

  /**
   * Mark instance for pending save
   */
  markForSave(instanceId: string): void {
    this.pendingSaves.add(instanceId);
  }

  /**
   * Start auto-save
   */
  private startAutoSave(): void {
    this.autoSaveInterval = setInterval(async () => {
      if (this.pendingSaves.size > 0) {
        const instanceIds = Array.from(this.pendingSaves);
        await this.saveInstances(instanceIds);
      }
    }, this.options.autoSaveInterval);
  }

  /**
   * Stop auto-save
   */
  stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  /**
   * Force save all pending
   */
  async forceSave(): Promise<number> {
    const instanceIds = Array.from(this.pendingSaves);
    return await this.saveInstances(instanceIds);
  }

  /**
   * Get pending save count
   */
  getPendingSaveCount(): number {
    return this.pendingSaves.size;
  }

  /**
   * Update options
   */
  updateOptions(options: Partial<PersistenceOptions>): void {
    this.options = { ...this.options, ...options };

    if (this.options.enableAutoSave && !this.autoSaveInterval) {
      this.startAutoSave();
    } else if (!this.options.enableAutoSave && this.autoSaveInterval) {
      this.stopAutoSave();
    }
  }

  /**
   * Get options
   */
  getOptions(): PersistenceOptions {
    return { ...this.options };
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stopAutoSave();
    this.pendingSaves.clear();
  }
}
