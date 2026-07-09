# Simulation Engine Documentation

## Overview

The Simulation Engine is the core system that drives every gameplay mechanic in FreeCoin Empire. It is completely independent from rendering - the renderer only displays simulation state. The engine is designed to scale to 5000+ entities with incremental update optimizations and supports configurable tick rates for future server authority.

## Architecture

The simulation engine follows strict separation of concerns:

- **Simulation**: Core engine managing entities and state
- **Rendering**: Completely independent, only displays simulation state
- **Persistence**: Save/load simulation state
- **Configuration**: All values configurable, no hardcoding
- **Interaction**: Event-driven communication between systems

## Core Components

### 1. Simulation Entity (`lib/simulation/types.ts`)

Every placed object becomes a simulation entity with the following properties:

#### Core Properties
- **ID**: Unique entity identifier
- **Type**: Entity type (GPU, Battery, Solar Panel, etc.)
- **State**: Current state (Idle, Running, Overloaded, Overheated, Broken, Repairing, Disabled)
- **Status**: Status flags (running, disabled, needsRepair, needsPower, needsCooling)

#### Physical Properties
- **Temperature**: Current temperature (0-100°C)
- **Power Usage**: Power consumption in watts
- **Power Generation**: Power generation in watts
- **Efficiency**: Current efficiency multiplier (0-1)
- **Durability**: Current durability (0-100)
- **Health**: Current health (0-100)

#### Dependencies
- **Dependencies**: Array of entity dependencies (Power, Cooling, Network, Maintenance, Custom)
- **Custom Properties**: Extensible key-value storage for future properties

#### Metadata
- **Last Updated**: Timestamp of last update
- **Version**: Incremental version for change tracking

### 2. State Machine (`lib/simulation/StateMachine.ts`)

Manages entity state transitions with flexible rules:

#### States
- **Idle**: Entity is idle, not processing
- **Running**: Entity is operational and processing
- **Overloaded**: Entity is consuming excessive power
- **Overheated**: Entity temperature is critical
- **Broken**: Entity has failed and cannot operate
- **Repairing**: Entity is being repaired
- **Disabled**: Entity is manually disabled

#### Transition Logic
State transitions are determined by:
- Health and durability thresholds
- Temperature thresholds
- Power consumption vs generation
- Manual disable/enable
- Repair completion

#### Events
- **StateChanged**: Fired when entity changes state
- **ObjectFailed**: Fired when entity enters broken state
- **ObjectRecovered**: Fired when entity recovers from broken state

### 3. Simulation Pipeline (`lib/simulation/Pipeline.ts`)

Executes simulation stages in sequence, each stage independent:

#### Pipeline Stages

1. **Power Stage**
   - Calculate power usage based on entity type and efficiency
   - Calculate power generation (for batteries, solar panels)
   - Check power dependency satisfaction
   - Fire PowerChanged events

2. **Heat Stage**
   - Calculate heat generation based on power usage
   - Calculate cooling from dependencies
   - Apply temperature changes
   - Apply natural cooling towards ambient
   - Fire TemperatureChanged events

3. **Efficiency Stage**
   - Calculate base efficiency based on state
   - Reduce efficiency if overheated
   - Reduce efficiency if durability is low
   - Fire EfficiencyChanged events

4. **Durability Stage**
   - Decay durability based on state
   - Accelerated decay for overloaded/overheated states
   - Repair durability if in repairing state
   - Repair health if in repairing state

5. **Status Stage**
   - Update status flags based on state and conditions
   - Set running, needsRepair, needsPower, needsCooling flags

6. **Events Stage**
   - Collect and return all generated events
   - Clear event buffer for next tick

### 4. Dependency System (`lib/simulation/DependencySystem.ts`)

Manages entity dependencies without hardcoding:

#### Dependency Types
- **Power**: Entity requires sufficient power
- **Cooling**: Entity requires cooling
- **Network**: Entity requires network connectivity
- **Maintenance**: Entity requires maintenance
- **Custom**: Custom dependency types

#### Dependency Graph
- Directed graph of entity dependencies
- Circular dependency detection
- Dependency chain traversal
- Affected entity calculation (cascade failures)

#### Resolution
- Power: Check generation vs usage
- Cooling: Check temperature and cooling dependencies
- Network: Always satisfied (future implementation)
- Maintenance: Check health and durability
- Custom: Resolved by custom logic

### 5. Simulation Engine (`lib/simulation/SimulationEngine.ts`)

Core engine coordinating all components:

#### Tick System
- Configurable tick rates (1s, 5s, 10s)
- Automatic tick execution via setInterval
- Manual tick execution for testing
- Tick number tracking

#### Entity Management
- Add/remove entities
- Get entity by ID
- Get all entities
- Entity version tracking

#### Incremental Update Optimization
- Only process changed entities
- Process active entities (running, overloaded, overheated)
- Process entities with unsatisfied dependencies
- Version-based change detection
- Supports 5000+ entities efficiently

#### Event System
- Event listener registration
- Event firing to listeners
- Event types: TemperatureChanged, PowerChanged, StateChanged, ObjectFailed, ObjectRecovered, SimulationTick, DependencyChanged, EfficiencyChanged

#### Performance Metrics
- FPS tracking
- Tick rate tracking
- Active entity count
- Changed entity count
- Update time tracking
- Memory usage tracking

#### Configuration
- Fully configurable simulation parameters
- Runtime configuration updates
- Tick rate changes
- Threshold adjustments

### 6. Debug Overlay (`components/simulation/DebugOverlay.tsx`)

Developer tool for monitoring simulation:

#### Display Metrics
- FPS
- Tick rate
- Tick number
- Active entities
- Changed entities
- Update time
- Total time
- Memory usage

#### Controls
- Start/Stop simulation
- Reset simulation
- Tick rate selection (1s, 5s, 10s)

#### Entity Inspection
- Entity list with state indicators
- Detailed entity view
- Real-time property monitoring
- Color-coded status indicators

## Simulation Flow

### Single Tick Execution

```
1. Tick Start
   ├─ Increment tick number
   ├─ Calculate delta time
   └─ Update metrics

2. Entity Processing (Incremental)
   ├─ Get entities to process
   │  ├─ Changed entities (from previous tick)
   │  ├─ Active entities (running, overloaded, overheated)
   │  └─ Entities with unsatisfied dependencies
   │
   └─ For each entity:
      ├─ Resolve dependencies
      ├─ Execute pipeline stages
      │  ├─ Power stage
      │  ├─ Heat stage
      │  ├─ Efficiency stage
      │  ├─ Durability stage
      │  ├─ Status stage
      │  └─ Events stage
      ├─ Update state machine
      ├─ Update status
      ├─ Increment version
      └─ Fire events

3. Tick End
   ├─ Fire SimulationTick event
   ├─ Clear changed entities
   └─ Calculate update time
```

### State Machine Flow

```
Entity Condition Check
        ↓
   Is Broken? ──Yes──→ Broken State
        ↓ No
   Is Disabled? ──Yes──→ Disabled State
        ↓ No
   Is Repairing? ──Yes──→ Check Repair Complete
                      ↓ Yes → Idle State
                      ↓ No → Repairing State
        ↓ No
   Is Overheated? ──Yes──→ Overheated State
        ↓ No
   Is Overloaded? ──Yes──→ Overloaded State
        ↓ No
   Needs Repair? ──Yes──→ Repairing State
        ↓ No
   Is Operational? ──Yes──→ Running State
        ↓ No
   Default → Idle State
```

## Performance Strategy

### Incremental Update Optimization

The engine uses several strategies to handle 5000+ entities:

1. **Change Tracking**
   - Entities have version numbers
   - Only entities with changed versions are processed
   - Changed entities set is cleared after each tick

2. **Active Entity Processing**
   - Only process entities in active states (running, overloaded, overheated)
   - Idle entities are skipped unless changed
   - Reduces unnecessary calculations

3. **Dependency-Based Processing**
   - Entities with unsatisfied dependencies are always processed
   - Ensures dependency resolution is timely
   - Prevents stale dependency states

4. **Batch Processing**
   - Pipeline supports batch entity processing
   - Reduces function call overhead
   - Enables future parallelization

### Memory Efficiency

- Map-based entity storage for O(1) lookups
- Entity snapshots for persistence (not full state)
- Event buffer cleared after each tick
- Version tracking uses simple integers

### CPU Efficiency

- Early exit in pipeline stages
- Minimal calculations per entity
- No unnecessary object allocations
- Efficient event generation

## Future Multiplayer

### Server Authority

The architecture is designed for future server authority:

1. **Deterministic Simulation**
   - All calculations use delta time
   - No random number generation in core logic
   - Configurable tick rates for synchronization

2. **State Synchronization**
   - Entity snapshots for network transmission
   - Version-based change detection
   - Incremental updates only

3. **Conflict Resolution**
   - Server has final authority on state
   - Client predictions for responsiveness
   - Rollback on server correction

### Implementation Path

1. **Phase 1: Client-Only**
   - Current implementation
   - All simulation runs on client
   - Local persistence

2. **Phase 2: Server Validation**
   - Client runs simulation
   - Server validates state
   - Corrections sent to client

3. **Phase 3: Server Authority**
   - Server runs simulation
   - Client receives state updates
   - Client runs interpolation

4. **Phase 4: Distributed Simulation**
   - Multiple servers for different regions
   - Entity sharding by location
   - Cross-server synchronization

## Extension Points

### Adding New Entity Types

1. Add enum value to `EntityType` in `types.ts`
2. Add base power usage/generation in `Pipeline.ts`
3. Add custom properties if needed
4. No changes to core engine needed

### Adding New States

1. Add enum value to `EntityState` in `types.ts`
2. Add transition logic in `StateMachine.ts`
3. Add state-specific behavior in `Pipeline.ts`
4. Update debug overlay if needed

### Adding New Pipeline Stages

1. Add enum value to `PipelineStage` in `types.ts`
2. Implement stage handler in `Pipeline.ts`
3. Register stage in pipeline constructor
4. Add stage-specific events if needed

### Adding New Dependency Types

1. Add enum value to `DependencyType` in `types.ts`
2. Implement resolution logic in `DependencySystem.ts`
3. Add dependency checking in `Pipeline.ts`
4. No changes to core engine needed

### Adding New Events

1. Add enum value to `SimulationEventType` in `types.ts`
2. Define event interface
3. Fire event in appropriate method
4. Register listeners in application

## Configuration

### Default Configuration

```typescript
{
  tickRate: 1000, // 1 second
  
  temperature: {
    normal: 50,
    warning: 70,
    critical: 85,
    max: 100,
    coolingRate: 5,
    heatingRate: 3,
  },
  
  power: {
    normal: 100,
    warning: 150,
    critical: 200,
    max: 250,
  },
  
  durability: {
    max: 100,
    decayRate: 0.1,
    repairRate: 1,
  },
  
  efficiency: {
    normal: 1.0,
    degraded: 0.7,
    critical: 0.4,
  },
  
  stateTransitions: {
    idleToRunning: 0,
    runningToOverloaded: 0.8,
    overloadedToOverheated: 0.9,
    overheatedToBroken: 0.95,
    brokenToRepairing: 0,
    repairingToIdle: 100,
  },
}
```

### Runtime Updates

Configuration can be updated at runtime:
```typescript
engine.updateConfig({
  tickRate: 5000,
  temperature: {
    ...config.temperature,
    critical: 90,
  },
});
```

## Testing

### Manual Testing

1. Open `/simulation-test` page
2. Click "Add X Entities" to populate simulation
3. Click "Start" to begin simulation
4. Watch debug overlay for performance metrics
5. Select entities to view detailed state
6. Adjust tick rate to test different frequencies
7. Test with 5000+ entities to verify performance

### Performance Targets

- **5000 entities**: < 16ms per tick (60 FPS)
- **10000 entities**: < 33ms per tick (30 FPS)
- **Memory**: < 100MB for 5000 entities
- **CPU**: < 50% for 5000 entities

### Test Scenarios

- **Cold Start**: Add entities, start simulation
- **Hot Start**: Start simulation, add entities
- **State Transitions**: Monitor state changes
- **Dependency Failures**: Test dependency resolution
- **Tick Rate Changes**: Test different tick rates
- **Large Scale**: Test with 10000+ entities

## Integration with Grid System

The simulation engine integrates with the grid placement system:

1. **Entity Creation**
   - Grid placed objects become simulation entities
   - Entity ID matches grid object ID
   - Entity type matches grid object type

2. **State Synchronization**
   - Simulation state drives grid rendering
   - Grid only displays simulation state
   - No simulation logic in grid system

3. **Dependency Mapping**
   - Grid position determines spatial dependencies
   - Adjacent objects can have dependencies
   - Dependency system manages relationships

## Conclusion

The Simulation Engine provides a robust, scalable foundation for FreeCoin Empire's gameplay. The strict separation from rendering, configurable parameters, and incremental update optimization ensure the engine can handle thousands of entities while maintaining performance. The architecture is designed for future multiplayer and server authority without requiring refactoring.
