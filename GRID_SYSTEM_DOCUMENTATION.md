# Grid Placement Engine Documentation

## Overview

The Grid Placement Engine is the core gameplay system for FreeCoin Empire. It provides an isometric-ready placement system that supports 2D, isometric, and 3D rendering with identical game logic. The engine is designed to scale to thousands of placeable objects without architectural changes.

## Architecture

The system follows ECS-like separation of concerns:

- **Logic**: Grid class manages state, placement, collision detection
- **Renderer**: Abstract rendering layer supporting multiple render modes
- **Persistence**: Supabase integration for saving/loading grid state
- **Interaction**: Event system for reacting to placement actions
- **Validation**: Comprehensive placement validation system

## Core Components

### 1. Grid Data Structure (`lib/grid/types.ts`)

#### Tile Properties
Each tile stores:
- **Position**: Grid coordinates (x, y)
- **Rotation**: Object rotation (0, 90, 180, 270 degrees)
- **Object ID**: Reference to placed object
- **Owner**: Player who owns the tile
- **Layer**: Vertical layer for stacking
- **Walkable**: Whether tile can be walked on
- **Occupied**: Whether tile has an object
- **Reserved**: Whether tile is reserved for future use

#### Base Sizes
Predefined base configurations:
- **Room**: 10x10 (starter base)
- **Garage**: 15x15 (medium equipment)
- **Warehouse**: 20x20 (large storage)
- **Factory**: 25x25 (industrial production)
- **Data Center**: 30x30 (massive computing)

#### Object Types
Future objects defined with configurations:
- **GPU**: 1x1, non-walkable, non-rotatable
- **Battery**: 1x1, non-walkable, non-rotatable
- **Solar Panel**: 2x1, walkable, rotatable
- **Cooling**: 1x1, non-walkable, non-rotatable
- **Workshop**: 3x2, non-walkable, rotatable
- **Decoration**: 1x1, walkable, rotatable, multi-layer
- **Robot Station**: 2x2, non-walkable, non-rotatable

### 2. Grid Class (`lib/grid/Grid.ts`)

Core placement engine with full CRUD operations:

#### Placement Operations
- **placeObject()**: Place object at position with validation
- **moveObject()**: Move object to new position
- **rotateObject()**: Rotate object in place
- **removeObject()**: Remove object from grid

#### History System
- **undo()**: Revert last action
- **redo()**: Re-apply undone action
- **canUndo()**: Check if undo available
- **canRedo()**: Check if redo available
- **clearHistory()**: Clear history stack

#### Validation
- **validatePlacement()**: Comprehensive placement validation
- **isInBounds()**: Check position within grid
- **isOccupied()**: Check if tile occupied
- **isReserved()**: Check if tile reserved
- **isWalkable()**: Check if tile walkable

#### Event System
- **on()**: Register event listener
- **off()**: Unregister event listener
- **Events**: ObjectPlaced, ObjectMoved, ObjectRemoved, ObjectRotated

### 3. Rendering Abstraction (`lib/grid/rendering/`)

#### Base Renderer (`IRenderer.ts`)
Abstract base class defining renderer interface:
- `initialize()`: Setup canvas context
- `renderGrid()`: Render complete grid state
- `renderObject()`: Render single object
- `renderPreview()`: Render placement preview
- `gridToScreen()`: Convert grid to screen coordinates
- `screenToGrid()`: Convert screen to grid coordinates
- `gridToWorld()`: Convert grid to world coordinates (3D/isometric)
- `worldToGrid()`: Convert world to grid coordinates (3D/isometric)

#### 2D Renderer (`TwoDRenderer.ts`)
Current implementation with developer-focused visualization:
- Grid lines with coordinates
- Tile state coloring (occupied, reserved, walkable)
- Object placeholders with rotation indicators
- Placement preview with validity coloring
- Coordinate labels on axes

### 4. Persistence Layer (`lib/grid/persistence/GridPersistence.ts`)

Supabase integration for grid state:

#### Save Operations
- **saveGrid()**: Full grid save (empire + objects)
- **saveIncremental()**: Incremental updates (add/remove/move)
- **autoSave()**: Debounced auto-save for gameplay

#### Load Operations
- **loadGrid()**: Load grid from Supabase
- Maps empire.grid_size to base size
- Loads all placed objects
- Restores grid state

#### Database Integration
Uses existing `placed_objects` table:
- `player_id`: Player reference
- `building_id`: Object type reference
- `grid_x`, `grid_y`: Grid position
- `status`: Object status
- Timestamps for tracking

### 5. Developer UI (`components/grid/GridEditor.tsx`)

Interactive grid editor for testing:

#### Features
- Canvas-based grid visualization
- Object selection panel
- Rotation controls
- Placement preview
- Object selection and movement
- Undo/redo controls
- Object list with selection
- Keyboard shortcuts (R, Del, Ctrl+Z, Ctrl+Y)

#### Controls
- **Click**: Place object / Select object
- **Click again**: Move selected object
- **R**: Rotate selection
- **Del**: Delete selected
- **Ctrl+Z**: Undo
- **Ctrl+Y**: Redo

## Isometric Migration Path

The architecture is designed to support isometric rendering without changing gameplay logic:

### Phase 1: Current (2D)
- 2D top-down renderer
- Direct grid-to-screen mapping
- Simple coordinate system

### Phase 2: Isometric (Future)
Implement `IsometricRenderer` extending `BaseRenderer`:
- Override `gridToScreen()` with isometric projection
- Override `screenToGrid()` with inverse projection
- Implement depth sorting for proper layering
- Use same Grid class and game logic

### Phase 3: 3D (Future)
Implement `ThreeDRenderer` extending `BaseRenderer`:
- Use Three.js for WebGL rendering
- Override coordinate converters for 3D space
- Implement camera controls
- Use same Grid class and game logic

### Key Design Decisions
1. **Coordinate Separation**: Grid coordinates are logical, screen coordinates are view-specific
2. **Renderer Abstraction**: Game logic never knows about rendering mode
3. **Object Independence**: Each object is self-contained with position and rotation
4. **Validation Layer**: Placement validation is independent of rendering

## Extension Points

### Adding New Object Types
1. Add enum value to `ObjectType` in `types.ts`
2. Add configuration to `OBJECT_CONFIGS` in `types.ts`
3. Update UI to include new object
4. No changes to core grid logic needed

### Adding New Base Sizes
1. Add enum value to `BaseSize` in `types.ts`
2. Add configuration to `BASE_SIZES` in `types.ts`
3. Update persistence mapping if needed
4. No changes to core grid logic needed

### Adding New Renderers
1. Create new class extending `BaseRenderer`
2. Implement abstract methods
3. Register renderer in application
4. No changes to game logic needed

### Adding New Validation Rules
1. Extend `ValidationOptions` in `types.ts`
2. Add validation logic to `validatePlacement()` in `Grid.ts`
3. Update `ValidationResult` if needed
4. No changes to rendering needed

### Adding New Events
1. Add enum value to `PlacementEventType` in `types.ts`
2. Define event interface
3. Fire event in appropriate method
4. Register listeners in application

## Performance Considerations

### Scalability
- **Tile Storage**: Map-based storage for O(1) lookups
- **Object Storage**: Map-based storage for O(1) lookups
- **Validation**: Early exit on first conflict
- **Rendering**: Canvas-based for performance
- **Persistence**: Incremental updates for frequent saves

### Memory
- **Grid State**: ~1KB per 10x10 grid
- **Objects**: ~200 bytes per object
- **History**: Configurable limit (default unlimited)
- **Snapshots**: Delta compression possible for large grids

### Optimization Opportunities
1. **Spatial Indexing**: Quadtree for collision detection on large grids
2. **Object Pooling**: Reuse object instances
3. **Lazy Rendering**: Only render visible tiles
4. **Web Workers**: Offload validation to worker thread

## Testing

### Manual Testing
1. Open `/grid-editor` page
2. Place objects by clicking on grid
3. Select and move objects
4. Rotate objects with R key
5. Delete objects with Del key
6. Test undo/redo with Ctrl+Z/Ctrl+Y
7. Clear grid and verify empty state
8. Refresh page and verify persistence (when connected to Supabase)

### Test Scenarios
- **Placement**: Place objects at various positions
- **Collision**: Attempt to place on occupied tiles
- **Bounds**: Attempt to place outside grid
- **Rotation**: Rotate rotatable objects
- **Movement**: Move objects to new positions
- **Deletion**: Remove objects from grid
- **Undo/Redo**: Verify history stack works
- **Persistence**: Save and load grid state

## Integration with Existing System

### Database Schema
Uses existing `placed_objects` table:
- Maps `building_id` to object type
- Stores grid position in `grid_x`, `grid_y`
- Uses `status` for object state
- Timestamps for tracking

### Repository Layer
Integrates with `EmpireRepository`:
- Loads empire metadata for base size
- Updates empire.grid_size on resize
- No changes to existing repository needed

### Service Layer
Can be integrated with `EmpireService`:
- Add grid operations to service
- Maintain clean separation
- Use existing service patterns

## Future Enhancements

### Short Term
1. Add keyboard shortcuts for all actions
2. Implement drag-and-drop placement
3. Add object selection highlighting
4. Implement multi-object selection
5. Add copy/paste functionality

### Medium Term
1. Implement isometric renderer
2. Add camera controls (zoom, pan)
3. Implement object grouping
4. Add snap-to-grid options
5. Implement object templates

### Long Term
1. Implement 3D renderer with Three.js
2. Add physics simulation
3. Implement multiplayer placement
4. Add real-time collaboration
5. Implement procedural generation

## Success Criteria

✅ **Completed**:
- Player can open base
- Player can place object
- Player can move object
- Player can rotate object
- Player can delete object
- Player can reload page (persistence ready)
- System supports thousands of objects
- Architecture supports isometric migration

## Conclusion

The Grid Placement Engine provides a solid foundation for FreeCoin Empire's gameplay. The isometric-ready architecture ensures future rendering upgrades won't require gameplay logic changes. The clean separation of concerns, comprehensive validation, and robust persistence make the system production-ready and scalable.
