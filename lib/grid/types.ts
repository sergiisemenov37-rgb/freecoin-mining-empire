/**
 * Grid System Types
 * Isometric-ready grid data structures
 * Supports 2D, isometric, and 3D rendering with same game logic
 */

// ============================================
// COORDINATE SYSTEMS
// ============================================

/**
 * Grid position (2D logical coordinates)
 * Works for both 2D and isometric rendering
 */
export interface GridPosition {
  x: number;
  y: number;
}

/**
 * 3D world position for future isometric/3D rendering
 */
export interface WorldPosition {
  x: number;
  y: number;
  z: number;
}

/**
 * Rotation in degrees (0, 90, 180, 270)
 */
export type Rotation = 0 | 90 | 180 | 270;

// ============================================
// BASE SIZES
// ============================================

/**
 * Base size definitions
 * Different room types with different grid dimensions
 */
export enum BaseSize {
  ROOM = 'room',
  GARAGE = 'garage',
  WAREHOUSE = 'warehouse',
  FACTORY = 'factory',
  DATA_CENTER = 'data_center',
}

/**
 * Base size configuration
 */
export interface BaseSizeConfig {
  type: BaseSize;
  width: number;
  height: number;
  name: string;
  description: string;
}

/**
 * Predefined base sizes
 */
export const BASE_SIZES: Record<BaseSize, BaseSizeConfig> = {
  [BaseSize.ROOM]: {
    type: BaseSize.ROOM,
    width: 10,
    height: 10,
    name: 'Room',
    description: 'Small starter base',
  },
  [BaseSize.GARAGE]: {
    type: BaseSize.GARAGE,
    width: 15,
    height: 15,
    name: 'Garage',
    description: 'Medium base for equipment',
  },
  [BaseSize.WAREHOUSE]: {
    type: BaseSize.WAREHOUSE,
    width: 20,
    height: 20,
    name: 'Warehouse',
    description: 'Large storage base',
  },
  [BaseSize.FACTORY]: {
    type: BaseSize.FACTORY,
    width: 25,
    height: 25,
    name: 'Factory',
    description: 'Industrial production base',
  },
  [BaseSize.DATA_CENTER]: {
    type: BaseSize.DATA_CENTER,
    width: 30,
    height: 30,
    name: 'Data Center',
    description: 'Massive computing facility',
  },
};

// ============================================
// TILE PROPERTIES
// ============================================

/**
 * Tile state flags
 */
export interface TileFlags {
  walkable: boolean;
  occupied: boolean;
  reserved: boolean;
}

/**
 * Complete tile data structure
 * Each tile stores all necessary information for placement logic
 */
export interface Tile {
  position: GridPosition;
  rotation: Rotation;
  objectId: string | null;
  ownerId: string;
  layer: number;
  flags: TileFlags;
}

/**
 * Minimal tile data for storage/transmission
 */
export interface TileData {
  x: number;
  y: number;
  rotation: Rotation;
  objectId: string | null;
  layer: number;
  walkable: boolean;
}

// ============================================
// OBJECT DEFINITIONS
// ============================================

/**
 * Object size (how many grid tiles it occupies)
 */
export interface ObjectSize {
  width: number;
  height: number;
}

/**
 * Object type definitions
 * Future objects will be added here
 */
export enum ObjectType {
  GPU = 'gpu',
  BATTERY = 'battery',
  SOLAR_PANEL = 'solar_panel',
  COOLING = 'cooling',
  WORKSHOP = 'workshop',
  DECORATION = 'decoration',
  ROBOT_STATION = 'robot_station',
}

/**
 * Object configuration
 */
export interface ObjectConfig {
  type: ObjectType;
  name: string;
  size: ObjectSize;
  walkable: boolean;
  rotatable: boolean;
  layers: number[];
  description: string;
}

/**
 * Predefined object configurations
 */
export const OBJECT_CONFIGS: Record<ObjectType, ObjectConfig> = {
  [ObjectType.GPU]: {
    type: ObjectType.GPU,
    name: 'GPU',
    size: { width: 1, height: 1 },
    walkable: false,
    rotatable: false,
    layers: [0],
    description: 'Graphics processing unit',
  },
  [ObjectType.BATTERY]: {
    type: ObjectType.BATTERY,
    name: 'Battery',
    size: { width: 1, height: 1 },
    walkable: false,
    rotatable: false,
    layers: [0],
    description: 'Energy storage unit',
  },
  [ObjectType.SOLAR_PANEL]: {
    type: ObjectType.SOLAR_PANEL,
    name: 'Solar Panel',
    size: { width: 2, height: 1 },
    walkable: true,
    rotatable: true,
    layers: [0],
    description: 'Solar energy collector',
  },
  [ObjectType.COOLING]: {
    type: ObjectType.COOLING,
    name: 'Cooling Unit',
    size: { width: 1, height: 1 },
    walkable: false,
    rotatable: false,
    layers: [0],
    description: 'Temperature regulation',
  },
  [ObjectType.WORKSHOP]: {
    type: ObjectType.WORKSHOP,
    name: 'Workshop',
    size: { width: 3, height: 2 },
    walkable: false,
    rotatable: true,
    layers: [0],
    description: 'Manufacturing station',
  },
  [ObjectType.DECORATION]: {
    type: ObjectType.DECORATION,
    name: 'Decoration',
    size: { width: 1, height: 1 },
    walkable: true,
    rotatable: true,
    layers: [0, 1], // Can be placed on ground or wall
    description: 'Decorative item',
  },
  [ObjectType.ROBOT_STATION]: {
    type: ObjectType.ROBOT_STATION,
    name: 'Robot Station',
    size: { width: 2, height: 2 },
    walkable: false,
    rotatable: false,
    layers: [0],
    description: 'Robot deployment point',
  },
};

// ============================================
// PLACED OBJECTS
// ============================================

/**
 * Placed object instance
 * Independent object with its own state
 */
export interface PlacedObject {
  id: string;
  type: ObjectType;
  position: GridPosition;
  rotation: Rotation;
  ownerId: string;
  layer: number;
  placedAt: number;
  metadata: Record<string, unknown>;
}

/**
 * Object placement request
 */
export interface PlacementRequest {
  type: ObjectType;
  position: GridPosition;
  rotation: Rotation;
  layer: number;
  ownerId: string;
}

/**
 * Object movement request
 */
export interface MovementRequest {
  objectId: string;
  newPosition: GridPosition;
  newRotation: Rotation;
}

/**
 * Object removal request
 */
export interface RemovalRequest {
  objectId: string;
}

// ============================================
// PLACEMENT VALIDATION
// ============================================

/**
 * Placement validation result
 */
export interface ValidationResult {
  valid: boolean;
  reason?: string;
  conflictingTiles?: GridPosition[];
}

/**
 * Placement validation options
 */
export interface ValidationOptions {
  checkCollision: boolean;
  checkBounds: boolean;
  checkWalkable: boolean;
  checkReserved: boolean;
}

// ============================================
// GRID STATE
// ============================================

/**
 * Complete grid state
 */
export interface GridState {
  width: number;
  height: number;
  tiles: Map<string, Tile>;
  objects: Map<string, PlacedObject>;
  baseSize: BaseSize;
}

/**
 * Grid snapshot for undo/redo
 */
export interface GridSnapshot {
  timestamp: number;
  tiles: Map<string, TileData>;
  objects: Map<string, PlacedObject>;
}

// ============================================
// EVENTS
// ============================================

/**
 * Placement event types
 */
export enum PlacementEventType {
  OBJECT_PLACED = 'object_placed',
  OBJECT_MOVED = 'object_moved',
  OBJECT_REMOVED = 'object_removed',
  OBJECT_ROTATED = 'object_rotated',
}

/**
 * Base placement event
 */
export interface PlacementEvent {
  type: PlacementEventType;
  timestamp: number;
  objectId: string;
  ownerId: string;
}

/**
 * Object placed event
 */
export interface ObjectPlacedEvent extends PlacementEvent {
  type: PlacementEventType.OBJECT_PLACED;
  objectType: ObjectType;
  position: GridPosition;
  rotation: Rotation;
  layer: number;
}

/**
 * Object moved event
 */
export interface ObjectMovedEvent extends PlacementEvent {
  type: PlacementEventType.OBJECT_MOVED;
  oldPosition: GridPosition;
  newPosition: GridPosition;
  oldRotation: Rotation;
  newRotation: Rotation;
}

/**
 * Object removed event
 */
export interface ObjectRemovedEvent extends PlacementEvent {
  type: PlacementEventType.OBJECT_REMOVED;
  objectType: ObjectType;
  position: GridPosition;
}

/**
 * Object rotated event
 */
export interface ObjectRotatedEvent extends PlacementEvent {
  type: PlacementEventType.OBJECT_ROTATED;
  oldRotation: Rotation;
  newRotation: Rotation;
}

/**
 * Event listener type
 */
export type PlacementEventListener = (event: PlacementEvent) => void;

// ============================================
// RENDERING ABSTRACTION
// ============================================

/**
 * Renderer type
 */
export enum RendererType {
  TWO_D = '2d',
  ISOMETRIC = 'isometric',
  THREE_D = '3d',
}

/**
 * Render context
 * Abstract rendering context that works with any renderer
 */
export interface RenderContext {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  tileSize: number;
  offsetX: number;
  offsetY: number;
}

/**
 * Renderable object
 * Interface for objects that can be rendered
 */
export interface Renderable {
  objectId: string;
  position: GridPosition;
  rotation: Rotation;
  layer: number;
}

/**
 * Renderer interface
 * Abstract renderer interface for multiple rendering modes
 */
export interface IRenderer {
  type: RendererType;
  initialize(context: RenderContext): void;
  renderGrid(state: GridState): void;
  renderObject(object: Renderable): void;
  renderPreview(object: Renderable, valid: boolean): void;
  cleanup(): void;
}

/**
 * Coordinate converter
 * Converts between grid coordinates and screen/world coordinates
 */
export interface ICoordinateConverter {
  gridToScreen(position: GridPosition): { x: number; y: number };
  screenToGrid(x: number, y: number): GridPosition;
  gridToWorld(position: GridPosition): WorldPosition;
  worldToGrid(position: WorldPosition): GridPosition;
}

// ============================================
// PREVIEW
// ============================================

/**
 * Placement preview state
 */
export interface PlacementPreview {
  active: boolean;
  objectType: ObjectType;
  position: GridPosition;
  rotation: Rotation;
  layer: number;
  valid: boolean;
}

// ============================================
// HISTORY (UNDO/REDO)
// ============================================

/**
 * History action type
 */
export enum HistoryActionType {
  PLACE = 'place',
  MOVE = 'move',
  REMOVE = 'remove',
  ROTATE = 'rotate',
}

/**
 * History action
 */
export interface HistoryAction {
  type: HistoryActionType;
  timestamp: number;
  before: GridSnapshot;
  after: GridSnapshot;
}

/**
 * History state
 */
export interface HistoryState {
  past: HistoryAction[];
  present: GridSnapshot;
  future: HistoryAction[];
}

// ============================================
// UTILITIES
// ============================================

/**
 * Tile key generator for Map storage
 */
export function tileKey(position: GridPosition): string {
  return `${position.x},${position.y}`;
}

/**
 * Parse tile key back to position
 */
export function parseTileKey(key: string): GridPosition {
  const [x, y] = key.split(',').map(Number);
  return { x, y };
}

/**
 * Check if two positions are equal
 */
export function positionsEqual(a: GridPosition, b: GridPosition): boolean {
  return a.x === b.x && a.y === b.y;
}

/**
 * Get all tiles occupied by an object
 */
export function getObjectTiles(position: GridPosition, size: ObjectSize): GridPosition[] {
  const tiles: GridPosition[] = [];
  for (let x = 0; x < size.width; x++) {
    for (let y = 0; y < size.height; y++) {
      tiles.push({ x: position.x + x, y: position.y + y });
    }
  }
  return tiles;
}

/**
 * Rotate size based on rotation
 */
export function rotateSize(size: ObjectSize, rotation: Rotation): ObjectSize {
  if (rotation === 0 || rotation === 180) {
    return size;
  } else {
    return { width: size.height, height: size.width };
  }
}

/**
 * Normalize rotation to 0-270 range
 */
export function normalizeRotation(rotation: number): Rotation {
  const normalized = ((rotation % 360) + 360) % 360;
  if (normalized < 90) return 0;
  if (normalized < 180) return 90;
  if (normalized < 270) return 180;
  return 270;
}
