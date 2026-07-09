/**
 * Grid System
 * Core grid management with isometric-ready architecture
 */

import type {
  GridPosition,
  Tile,
  TileData,
  TileFlags,
  GridState,
  BaseSizeConfig,
  Rotation,
  PlacedObject,
  PlacementRequest,
  MovementRequest,
  RemovalRequest,
  ValidationResult,
  ValidationOptions,
  PlacementEvent,
  PlacementEventListener,
  HistoryAction,
  HistoryState,
  GridSnapshot,
  ObjectType,
  ObjectSize,
} from './types';
import {
  tileKey,
  parseTileKey,
  positionsEqual,
  getObjectTiles,
  rotateSize,
  normalizeRotation,
  BASE_SIZES,
  OBJECT_CONFIGS,
  BaseSize,
  HistoryActionType,
  PlacementEventType,
} from './types';

/**
 * Grid class
 * Manages grid state, placement logic, and collision detection
 */
export class Grid {
  private state: GridState;
  private history: HistoryState;
  private eventListeners: Map<PlacementEventType, Set<PlacementEventListener>>;

  constructor(baseSize: BaseSize = BaseSize.ROOM) {
    const config = BASE_SIZES[baseSize];
    this.state = this.createInitialState(config);
    this.history = {
      past: [],
      present: this.createSnapshot(),
      future: [],
    };
    this.eventListeners = new Map();
  }

  /**
   * Create initial grid state
   */
  private createInitialState(config: BaseSizeConfig): GridState {
    const tiles = new Map<string, Tile>();
    
    // Initialize all tiles
    for (let x = 0; x < config.width; x++) {
      for (let y = 0; y < config.height; y++) {
        const position = { x, y };
        tiles.set(tileKey(position), {
          position,
          rotation: 0,
          objectId: null,
          ownerId: '',
          layer: 0,
          flags: {
            walkable: true,
            occupied: false,
            reserved: false,
          },
        });
      }
    }

    return {
      width: config.width,
      height: config.height,
      tiles,
      objects: new Map(),
      baseSize: config.type,
    };
  }

  /**
   * Create snapshot of current state
   */
  private createSnapshot(): GridSnapshot {
    const tiles = new Map<string, TileData>();
    for (const [key, tile] of this.state.tiles) {
      tiles.set(key, {
        x: tile.position.x,
        y: tile.position.y,
        rotation: tile.rotation,
        objectId: tile.objectId,
        layer: tile.layer,
        walkable: tile.flags.walkable,
      });
    }

    const objects = new Map<string, PlacedObject>();
    for (const [id, obj] of this.state.objects) {
      objects.set(id, { ...obj });
    }

    return {
      timestamp: Date.now(),
      tiles,
      objects,
    };
  }

  /**
   * Restore state from snapshot
   */
  private restoreSnapshot(snapshot: GridSnapshot): void {
    // Restore tiles
    this.state.tiles.clear();
    for (const [key, data] of snapshot.tiles) {
      this.state.tiles.set(key, {
        position: { x: data.x, y: data.y },
        rotation: data.rotation,
        objectId: data.objectId,
        ownerId: this.state.tiles.get(key)?.ownerId || '',
        layer: data.layer,
        flags: {
          walkable: data.walkable,
          occupied: data.objectId !== null,
          reserved: false,
        },
      });
    }

    // Restore objects
    this.state.objects.clear();
    for (const [id, obj] of snapshot.objects) {
      this.state.objects.set(id, { ...obj });
    }
  }

  /**
   * Get current grid state
   */
  getState(): GridState {
    return {
      ...this.state,
      tiles: new Map(this.state.tiles),
      objects: new Map(this.state.objects),
    };
  }

  /**
   * Get tile at position
   */
  getTile(position: GridPosition): Tile | null {
    const key = tileKey(position);
    return this.state.tiles.get(key) || null;
  }

  /**
   * Get object by ID
   */
  getObject(id: string): PlacedObject | null {
    return this.state.objects.get(id) || null;
  }

  /**
   * Get all objects
   */
  getAllObjects(): PlacedObject[] {
    return Array.from(this.state.objects.values());
  }

  /**
   * Check if position is within grid bounds
   */
  isInBounds(position: GridPosition): boolean {
    return (
      position.x >= 0 &&
      position.x < this.state.width &&
      position.y >= 0 &&
      position.y < this.state.height
    );
  }

  /**
   * Check if position is occupied
   */
  isOccupied(position: GridPosition): boolean {
    const tile = this.getTile(position);
    return tile?.flags.occupied || false;
  }

  /**
   * Check if position is reserved
   */
  isReserved(position: GridPosition): boolean {
    const tile = this.getTile(position);
    return tile?.flags.reserved || false;
  }

  /**
   * Check if position is walkable
   */
  isWalkable(position: GridPosition): boolean {
    const tile = this.getTile(position);
    return tile?.flags.walkable || false;
  }

  /**
   * Validate placement request
   */
  validatePlacement(
    request: PlacementRequest,
    options: ValidationOptions = {
      checkCollision: true,
      checkBounds: true,
      checkWalkable: true,
      checkReserved: true,
    }
  ): ValidationResult {
    const config = OBJECT_CONFIGS[request.type];
    const rotatedSize = rotateSize(config.size, request.rotation);
    const tiles = getObjectTiles(request.position, rotatedSize);

    const conflictingTiles: GridPosition[] = [];

    for (const tile of tiles) {
      // Check bounds
      if (options.checkBounds && !this.isInBounds(tile)) {
        return {
          valid: false,
          reason: 'Position out of bounds',
          conflictingTiles: [tile],
        };
      }

      const existingTile = this.getTile(tile);
      if (!existingTile) {
        return {
          valid: false,
          reason: 'Invalid tile position',
          conflictingTiles: [tile],
        };
      }

      // Check collision
      if (options.checkCollision && existingTile.flags.occupied && existingTile.objectId !== null) {
        conflictingTiles.push(tile);
      }

      // Check walkable
      if (options.checkWalkable && !existingTile.flags.walkable) {
        conflictingTiles.push(tile);
      }

      // Check reserved
      if (options.checkReserved && existingTile.flags.reserved) {
        conflictingTiles.push(tile);
      }
    }

    if (conflictingTiles.length > 0) {
      return {
        valid: false,
        reason: 'Position conflicts with existing objects',
        conflictingTiles,
      };
    }

    return { valid: true };
  }

  /**
   * Place object on grid
   */
  placeObject(request: PlacementRequest): PlacedObject | null {
    const validation = this.validatePlacement(request);
    if (!validation.valid) {
      return null;
    }

    // Save snapshot for undo
    const before = this.createSnapshot();

    // Create object
    const objectId = `${request.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const object: PlacedObject = {
      id: objectId,
      type: request.type,
      position: request.position,
      rotation: request.rotation,
      ownerId: request.ownerId,
      layer: request.layer,
      placedAt: Date.now(),
      metadata: {},
    };

    // Update tiles
    const config = OBJECT_CONFIGS[request.type];
    const rotatedSize = rotateSize(config.size, request.rotation);
    const tiles = getObjectTiles(request.position, rotatedSize);

    for (const tile of tiles) {
      const existing = this.getTile(tile);
      if (existing) {
        existing.objectId = objectId;
        existing.rotation = request.rotation;
        existing.layer = request.layer;
        existing.flags.occupied = !config.walkable;
        existing.ownerId = request.ownerId;
      }
    }

    // Add object
    this.state.objects.set(objectId, object);

    // Save history
    const after = this.createSnapshot();
    this.history.past.push({
      type: HistoryActionType.PLACE,
      timestamp: Date.now(),
      before,
      after,
    });
    this.history.future = [];

    // Fire event
    this.fireEvent({
      type: PlacementEventType.OBJECT_PLACED,
      timestamp: Date.now(),
      objectId,
      ownerId: request.ownerId,
      objectType: request.type,
      position: request.position,
      rotation: request.rotation,
      layer: request.layer,
    } as any);

    return object;
  }

  /**
   * Move object to new position
   */
  moveObject(request: MovementRequest): boolean {
    const object = this.getObject(request.objectId);
    if (!object) {
      return false;
    }

    // Validate new position
    const validation = this.validatePlacement({
      type: object.type,
      position: request.newPosition,
      rotation: request.newRotation,
      layer: object.layer,
      ownerId: object.ownerId,
    });

    if (!validation.valid) {
      return false;
    }

    // Save snapshot for undo
    const before = this.createSnapshot();

    // Clear old tiles
    const config = OBJECT_CONFIGS[object.type];
    const oldRotatedSize = rotateSize(config.size, object.rotation);
    const oldTiles = getObjectTiles(object.position, oldRotatedSize);

    for (const tile of oldTiles) {
      const existing = this.getTile(tile);
      if (existing && existing.objectId === object.id) {
        existing.objectId = null;
        existing.rotation = 0;
        existing.flags.occupied = false;
      }
    }

    // Update object
    const oldPosition = object.position;
    const oldRotation = object.rotation;
    object.position = request.newPosition;
    object.rotation = request.newRotation;

    // Update new tiles
    const newRotatedSize = rotateSize(config.size, request.newRotation);
    const newTiles = getObjectTiles(request.newPosition, newRotatedSize);

    for (const tile of newTiles) {
      const existing = this.getTile(tile);
      if (existing) {
        existing.objectId = object.id;
        existing.rotation = request.newRotation;
        existing.layer = object.layer;
        existing.flags.occupied = !config.walkable;
        existing.ownerId = object.ownerId;
      }
    }

    // Save history
    const after = this.createSnapshot();
    this.history.past.push({
      type: HistoryActionType.MOVE,
      timestamp: Date.now(),
      before,
      after,
    });
    this.history.future = [];

    // Fire event
    this.fireEvent({
      type: PlacementEventType.OBJECT_MOVED,
      timestamp: Date.now(),
      objectId: object.id,
      ownerId: object.ownerId,
      oldPosition,
      newPosition: request.newPosition,
      oldRotation,
      newRotation: request.newRotation,
    } as any);

    return true;
  }

  /**
   * Remove object from grid
   */
  removeObject(request: RemovalRequest): boolean {
    const object = this.getObject(request.objectId);
    if (!object) {
      return false;
    }

    // Save snapshot for undo
    const before = this.createSnapshot();

    // Clear tiles
    const config = OBJECT_CONFIGS[object.type];
    const rotatedSize = rotateSize(config.size, object.rotation);
    const tiles = getObjectTiles(object.position, rotatedSize);

    for (const tile of tiles) {
      const existing = this.getTile(tile);
      if (existing && existing.objectId === object.id) {
        existing.objectId = null;
        existing.rotation = 0;
        existing.flags.occupied = false;
      }
    }

    // Remove object
    this.state.objects.delete(object.id);

    // Save history
    const after = this.createSnapshot();
    this.history.past.push({
      type: HistoryActionType.REMOVE,
      timestamp: Date.now(),
      before,
      after,
    });
    this.history.future = [];

    // Fire event
    this.fireEvent({
      type: PlacementEventType.OBJECT_REMOVED,
      timestamp: Date.now(),
      objectId: object.id,
      ownerId: object.ownerId,
      objectType: object.type,
      position: object.position,
    } as any);

    return true;
  }

  /**
   * Rotate object
   */
  rotateObject(objectId: string, newRotation: Rotation): boolean {
    const object = this.getObject(objectId);
    if (!object) {
      return false;
    }

    const config = OBJECT_CONFIGS[object.type];
    if (!config.rotatable) {
      return false;
    }

    // Save snapshot for undo
    const before = this.createSnapshot();

    const oldRotation = object.rotation;
    object.rotation = newRotation;

    // Update tiles
    const rotatedSize = rotateSize(config.size, newRotation);
    const tiles = getObjectTiles(object.position, rotatedSize);

    for (const tile of tiles) {
      const existing = this.getTile(tile);
      if (existing && existing.objectId === object.id) {
        existing.rotation = newRotation;
      }
    }

    // Save history
    const after = this.createSnapshot();
    this.history.past.push({
      type: HistoryActionType.ROTATE,
      timestamp: Date.now(),
      before,
      after,
    });
    this.history.future = [];

    // Fire event
    this.fireEvent({
      type: PlacementEventType.OBJECT_ROTATED,
      timestamp: Date.now(),
      objectId: object.id,
      ownerId: object.ownerId,
      oldRotation,
      newRotation,
    } as any);

    return true;
  }

  /**
   * Undo last action
   */
  undo(): boolean {
    if (this.history.past.length === 0) {
      return false;
    }

    const action = this.history.past.pop()!;
    this.history.future.push(action);
    this.restoreSnapshot(action.before);
    this.history.present = action.before;

    return true;
  }

  /**
   * Redo last undone action
   */
  redo(): boolean {
    if (this.history.future.length === 0) {
      return false;
    }

    const action = this.history.future.pop()!;
    this.history.past.push(action);
    this.restoreSnapshot(action.after);
    this.history.present = action.after;

    return true;
  }

  /**
   * Can undo
   */
  canUndo(): boolean {
    return this.history.past.length > 0;
  }

  /**
   * Can redo
   */
  canRedo(): boolean {
    return this.history.future.length > 0;
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.history.past = [];
    this.history.future = [];
    this.history.present = this.createSnapshot();
  }

  /**
   * Register event listener
   */
  public on(eventType: PlacementEventType, listener: PlacementEventListener): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(listener);
  }

  /**
   * Unregister event listener
   */
  public off(eventType: PlacementEventType, listener: PlacementEventListener): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Fire event to all listeners
   */
  private fireEvent(event: PlacementEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      for (const listener of listeners) {
        listener(event);
      }
    }
  }

  /**
   * Resize grid (for base upgrades)
   */
  resize(newBaseSize: BaseSize): void {
    const config = BASE_SIZES[newBaseSize];
    
    // Create new grid
    const newTiles = new Map<string, Tile>();
    
    // Copy existing tiles
    for (let x = 0; x < Math.min(this.state.width, config.width); x++) {
      for (let y = 0; y < Math.min(this.state.height, config.height); y++) {
        const position = { x, y };
        const existing = this.getTile(position);
        if (existing) {
          newTiles.set(tileKey(position), { ...existing });
        }
      }
    }

    // Add new tiles
    for (let x = 0; x < config.width; x++) {
      for (let y = 0; y < config.height; y++) {
        const position = { x, y };
        if (!newTiles.has(tileKey(position))) {
          newTiles.set(tileKey(position), {
            position,
            rotation: 0,
            objectId: null,
            ownerId: '',
            layer: 0,
            flags: {
              walkable: true,
              occupied: false,
              reserved: false,
            },
          });
        }
      }
    }

    this.state.width = config.width;
    this.state.height = config.height;
    this.state.tiles = newTiles;
    this.state.baseSize = config.type;
  }

  /**
   * Get grid dimensions
   */
  getDimensions(): { width: number; height: number } {
    return {
      width: this.state.width,
      height: this.state.height,
    };
  }

  /**
   * Serialize grid state for persistence
   */
  serialize(): string {
    const snapshot = this.createSnapshot();
    return JSON.stringify({
      width: this.state.width,
      height: this.state.height,
      baseSize: this.state.baseSize,
      snapshot,
    });
  }

  /**
   * Deserialize grid state from persistence
   */
  static deserialize(data: string): Grid {
    const parsed = JSON.parse(data);
    const grid = new Grid(parsed.baseSize);
    grid.restoreSnapshot(parsed.snapshot);
    return grid;
  }
}
