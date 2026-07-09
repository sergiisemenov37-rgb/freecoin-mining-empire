/**
 * Grid Persistence Layer
 * Saves and loads grid state to/from Supabase
 * Integrates with existing placed_objects table
 */

import { supabase } from '@/lib/supabase';
import { empireRepository } from '@/repositories/EmpireRepository';
import type { GridState, PlacedObject, BaseSize } from '../types';
import { BaseSize as BaseSizeEnum } from '../types';
import type { Grid } from '../Grid';

/**
 * Grid persistence service
 */
export class GridPersistence {
  /**
   * Save grid state to Supabase
   * Saves empire metadata and all placed objects
   */
  async saveGrid(playerId: string, grid: Grid): Promise<boolean> {
    try {
      const state = grid.getState();
      
      // Save empire metadata
      const empire = await empireRepository.getEmpire(playerId);
      if (empire) {
        await empireRepository.updateEmpire(playerId, {
          name: empire.name,
          level: empire.level,
          experience: empire.experience,
          grid_size: state.width,
        });
      }

      // Get existing placed objects
      const { data: existingObjects, error: fetchError } = await supabase
        .from('placed_objects')
        .select('*')
        .eq('player_id', playerId);

      if (fetchError) {
        console.error('Failed to fetch existing objects:', fetchError);
        return false;
      }

      // Delete all existing objects
      if (existingObjects && existingObjects.length > 0) {
        const { error: deleteError } = await supabase
          .from('placed_objects')
          .delete()
          .eq('player_id', playerId);

        if (deleteError) {
          console.error('Failed to delete existing objects:', deleteError);
          return false;
        }
      }

      // Insert all current objects
      const objects = grid.getAllObjects();
      if (objects.length > 0) {
        const objectsToInsert = objects.map(obj => ({
          player_id: playerId,
          building_id: obj.type, // Use object type as building_id reference
          grid_x: obj.position.x,
          grid_y: obj.position.y,
          level: 1, // Object level (for future upgrades)
          status: 'active' as const,
          build_started_at: new Date(obj.placedAt).toISOString(),
          build_completed_at: new Date(obj.placedAt).toISOString(),
        }));

        const { error: insertError } = await supabase
          .from('placed_objects')
          .insert(objectsToInsert);

        if (insertError) {
          console.error('Failed to insert objects:', insertError);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Failed to save grid:', error);
      return false;
    }
  }

  /**
   * Load grid state from Supabase
   * Loads empire metadata and all placed objects
   */
  async loadGrid(playerId: string): Promise<Grid | null> {
    try {
      // Get empire metadata
      const empire = await empireRepository.getEmpire(playerId);
      if (!empire) {
        return null;
      }

      // Determine base size from grid size
      let baseSize: BaseSize = BaseSizeEnum.ROOM;
      if (empire.grid_size <= 10) {
        baseSize = BaseSizeEnum.ROOM;
      } else if (empire.grid_size <= 15) {
        baseSize = BaseSizeEnum.GARAGE;
      } else if (empire.grid_size <= 20) {
        baseSize = BaseSizeEnum.WAREHOUSE;
      } else if (empire.grid_size <= 25) {
        baseSize = BaseSizeEnum.FACTORY;
      } else {
        baseSize = BaseSizeEnum.DATA_CENTER;
      }

      // Create grid
      const { Grid: GridClass } = await import('../Grid');
      const grid = new GridClass(baseSize);

      // Load placed objects
      const { data: objects, error } = await supabase
        .from('placed_objects')
        .select('*')
        .eq('player_id', playerId);

      if (error) {
        console.error('Failed to load objects:', error);
        return grid;
      }

      // Place objects on grid
      if (objects && objects.length > 0) {
        for (const obj of objects) {
          const placedObject: PlacedObject = {
            id: obj.id,
            type: obj.building_id as any, // Map building_id to object type
            position: { x: obj.grid_x, y: obj.grid_y },
            rotation: 0, // Default rotation (not stored in current schema)
            ownerId: playerId,
            layer: 0, // Default layer
            placedAt: new Date(obj.build_completed_at || obj.created_at).getTime(),
            metadata: {},
          };

          // Place object directly (bypass validation for loaded objects)
          grid.placeObject({
            type: placedObject.type,
            position: placedObject.position,
            rotation: placedObject.rotation,
            layer: placedObject.layer,
            ownerId: placedObject.ownerId,
          });
        }
      }

      return grid;
    } catch (error) {
      console.error('Failed to load grid:', error);
      return null;
    }
  }

  /**
   * Auto-save grid state (debounced)
   * For frequent updates during gameplay
   */
  private autoSaveTimeout: NodeJS.Timeout | null = null;
  private pendingSave = false;

  autoSave(playerId: string, grid: Grid, delay: number = 1000): void {
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }

    this.pendingSave = true;
    this.autoSaveTimeout = setTimeout(async () => {
      if (this.pendingSave) {
        await this.saveGrid(playerId, grid);
        this.pendingSave = false;
      }
    }, delay);
  }

  /**
   * Cancel pending auto-save
   */
  cancelAutoSave(): void {
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
      this.autoSaveTimeout = null;
    }
    this.pendingSave = false;
  }

  /**
   * Incremental update
   * Save only changed objects for performance
   */
  async saveIncremental(
    playerId: string,
    addedObjects: PlacedObject[],
    removedObjects: string[],
    movedObjects: Array<{ id: string; newPosition: { x: number; y: number } }>
  ): Promise<boolean> {
    try {
      // Remove deleted objects
      if (removedObjects.length > 0) {
        const { error: deleteError } = await supabase
          .from('placed_objects')
          .delete()
          .in('id', removedObjects);

        if (deleteError) {
          console.error('Failed to delete objects:', deleteError);
          return false;
        }
      }

      // Add new objects
      if (addedObjects.length > 0) {
        const objectsToInsert = addedObjects.map(obj => ({
          player_id: playerId,
          building_id: obj.type,
          grid_x: obj.position.x,
          grid_y: obj.position.y,
          level: 1,
          status: 'active' as const,
          build_started_at: new Date(obj.placedAt).toISOString(),
          build_completed_at: new Date(obj.placedAt).toISOString(),
        }));

        const { error: insertError } = await supabase
          .from('placed_objects')
          .insert(objectsToInsert);

        if (insertError) {
          console.error('Failed to insert objects:', insertError);
          return false;
        }
      }

      // Update moved objects
      if (movedObjects.length > 0) {
        for (const moved of movedObjects) {
          const { error: updateError } = await supabase
            .from('placed_objects')
            .update({
              grid_x: moved.newPosition.x,
              grid_y: moved.newPosition.y,
            })
            .eq('id', moved.id);

          if (updateError) {
            console.error('Failed to update object:', updateError);
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Failed to save incremental update:', error);
      return false;
    }
  }
}

export const gridPersistence = new GridPersistence();
