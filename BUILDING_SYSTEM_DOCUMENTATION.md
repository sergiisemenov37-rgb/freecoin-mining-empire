# Building System Documentation

## Overview

The Building System is a major gameplay progression module that manages building construction, upgrades, expansion, and capacity. It integrates with Placement Engine, Simulation Engine, Energy System, and Progression Engine without modifying their architecture. The system is fully configurable, event-driven, and designed to support future expansion including skyscrapers, districts, and orbital stations.

## Architecture

### Core Systems

1. **Building Definitions** - Configurable building types with properties and requirements
2. **Construction System** - Manages building construction, upgrades, cancellation, pausing, resuming
3. **Expansion System** - Manages building expansion (width, height, floors, rooms, district connections)
4. **Capacity System** - Manages capacity for power, cooling, network, hardware, robots, decorations
5. **Building System** - Central coordinator integrating all subsystems
6. **Building Persistence** - Saves and restores building state with version support
7. **Building Developer Tools** - Comprehensive developer tool with inspector, queue, capacity, and expansion views

### Event-Driven Design

All systems communicate via events:
- `CONSTRUCTION_STARTED` - Fired when building construction starts
- `CONSTRUCTION_FINISHED` - Fired when building construction completes
- `CONSTRUCTION_CANCELLED` - Fired when construction is cancelled
- `CONSTRUCTION_PAUSED` - Fired when construction is paused
- `CONSTRUCTION_RESUMED` - Fired when construction is resumed
- `UPGRADE_STARTED` - Fired when building upgrade starts
- `UPGRADE_FINISHED` - Fired when building upgrade completes
- `UPGRADE_CANCELLED` - Fired when upgrade is cancelled
- `BUILDING_EXPANDED` - Fired when building is expanded
- `CAPACITY_CHANGED` - Fired when building capacity changes
- `MAINTENANCE_REQUIRED` - Fired when maintenance is required
- `MAINTENANCE_COMPLETED` - Fired when maintenance is completed
- `BUILDING_DESTROYED` - Fired when building is destroyed
- `BUILDING_MOVED` - Fired when building is moved

## Building Types

### Available Building Types

1. **Starter Room** - Basic room to begin mining empire
   - Unlock Level: 1
   - Base Power: 500W
   - Base Cooling: 300W
   - Max Hardware: 5

2. **Garage** - Garage for storing hardware and equipment
   - Unlock Level: 2
   - Base Power: 2000W
   - Base Cooling: 1500W
   - Max Hardware: 20

3. **Warehouse** - Large warehouse for mass hardware storage
   - Unlock Level: 5
   - Base Power: 5000W
   - Base Cooling: 4000W
   - Max Hardware: 100

4. **Workshop** - Workshop for hardware maintenance and upgrades
   - Unlock Level: 4
   - Base Power: 3000W
   - Base Cooling: 2500W
   - Max Hardware: 30

5. **Factory** - Factory for mass hardware production
   - Unlock Level: 10
   - Base Power: 10000W
   - Base Cooling: 8000W
   - Max Hardware: 200

6. **Data Center** - Professional data center for large-scale operations
   - Unlock Level: 15
   - Base Power: 25000W
   - Base Cooling: 20000W
   - Max Hardware: 500

7. **Mega Data Center** - Massive data center for empire-level operations
   - Unlock Level: 25
   - Base Power: 100000W
   - Base Cooling: 80000W
   - Max Hardware: 2000

8. **Research Campus** - Campus for advanced research and development
   - Unlock Level: 20
   - Base Power: 50000W
   - Base Cooling: 40000W
   - Max Hardware: 1000

9. **Orbital Facility** - Space-based facility for ultimate operations
   - Unlock Level: 50
   - Base Power: 500000W
   - Base Cooling: 400000W
   - Max Hardware: 10000

### Building Properties

Every building has:
- **Unique ID** - Identifier for the building
- **Type** - Building type
- **Level** - Current level (affects capacity)
- **Construction Time** - Time to build
- **Upgrade Time** - Time to upgrade
- **Power Capacity** - Maximum power available
- **Cooling Capacity** - Maximum cooling available
- **Network Capacity** - Maximum network bandwidth
- **Maximum Hardware** - Maximum hardware units
- **Maximum Robots** - Maximum robots
- **Maximum Decorations** - Maximum decorations
- **Maximum Floors** - Maximum floors
- **Maximum Expansion** - Maximum expansion level
- **Maintenance Cost** - Cost per tick
- **Visual Theme** - Visual appearance
- **Position** - 3D position
- **District ID** - Associated district

## Building Lifecycle

### Construction Phase

```
Start Construction → In Progress → (Pause/Resume) → Completed
```

**Construction States:**
- `NOT_STARTED` - Construction not started
- `IN_PROGRESS` - Construction in progress
- `PAUSED` - Construction paused
- `COMPLETED` - Construction completed
- `CANCELLED` - Construction cancelled

**Construction Process:**
1. Check concurrent construction limit
2. Verify building definition exists
3. Create building properties
4. Add to construction queue
5. Fire `CONSTRUCTION_STARTED` event
6. Update progress over time
7. Fire `CONSTRUCTION_FINISHED` event on completion

### Upgrade Phase

```
Start Upgrade → In Progress → (Pause/Resume) → Completed
```

**Upgrade Process:**
1. Check building is completed
2. Verify target level > current level
3. Check upgrade requirements
4. Calculate upgrade time
5. Set construction state to in progress
6. Fire `UPGRADE_STARTED` event
7. Update progress over time
8. Recalculate properties on completion
9. Fire `UPGRADE_FINISHED` event

### Expansion Phase

```
Start Expansion → In Progress → Completed → Apply Effects
```

**Expansion Process:**
1. Check building is completed
2. Verify expansion limit not reached
3. Check expansion requirements
4. Create expansion state
5. Fire `BUILDING_EXPANDED` event
6. Update progress over time
7. Apply expansion effects on completion
8. Fire `CAPACITY_CHANGED` events

### Destruction Phase

```
Destroy → Remove from Map → Fire Event → Cleanup
```

**Destruction Process:**
1. Cancel any active construction
2. Remove building from map
3. Fire `BUILDING_DESTROYED` event
4. Cleanup associated resources

## Expansion Model

### Expansion Types

1. **Width Expansion** - Expand building width
   - Effect: +5m width, +500W power, +400W cooling, +10 hardware
   - Cost: 1000 credits, 30s
   - Requirement: Level 2

2. **Height Expansion** - Expand building height
   - Effect: +5m height, +300W power, +250W cooling, +5 hardware
   - Cost: 1500 credits, 45s
   - Requirement: Level 2

3. **Floor Expansion** - Add a new floor
   - Effect: +1 floor, +1000W power, +800W cooling, +200Mbps network, +20 hardware, +5 decorations
   - Cost: 5000 credits, 60s
   - Requirement: Level 3

4. **Room Expansion** - Add a new room
   - Effect: +5 hardware, +2 decorations
   - Cost: 2000 credits, 20s
   - Requirement: Level 2

5. **District Connection** - Connect to a district
   - Effect: +1000Mbps network, +2000W power
   - Cost: 10000 credits, 120s
   - Requirement: Level 5

### Expansion Limits

- **Maximum Expansion Level** - Configurable per building type
- **Building Level Requirements** - Higher expansions require higher building levels
- **Resource Costs** - Credits and time costs increase with expansion level

### Expansion Effects

**Capacity Changes:**
- Power capacity increases
- Cooling capacity increases
- Network capacity increases
- Hardware capacity increases
- Decorations capacity increases

**Dimensional Changes:**
- Width increases
- Height increases
- Floor count increases

## Capacity System

### Capacity Types

1. **Power Capacity** - Maximum power available (W)
2. **Cooling Capacity** - Maximum cooling available (W)
3. **Network Capacity** - Maximum network bandwidth (Mbps)
4. **Hardware Capacity** - Maximum hardware units
5. **Robots Capacity** - Maximum robots
6. **Decorations Capacity** - Maximum decorations

### Capacity Calculation

```
Total Capacity = Σ Building Capacity (for completed buildings)
Used Capacity = Σ Current Usage
Available Capacity = Total Capacity - Used Capacity
```

**Usage Calculation:**
- Power Used = Hardware Count × 100W
- Cooling Used = Hardware Count × 80W
- Network Used = Hardware Count × 10Mbps
- Hardware Used = Current Hardware Count
- Robots Used = Current Robot Count
- Decorations Used = Current Decoration Count

### Capacity Utilization

```
Utilization % = (Used / Total) × 100
```

**Utilization Thresholds:**
- < 50%: Green (healthy)
- 50-75%: Yellow (warning)
- 75-90%: Orange (critical)
- > 90%: Red (overloaded)

## Integration

### With Placement Engine

- Building positions from placement
- Grid cell assignment
- Spatial queries
- Collision detection

### With Simulation Engine

- Building level affects simulation efficiency
- Hardware count affects simulation load
- Maintenance costs from simulation

### With Energy System

- Power capacity affects power grid
- Cooling capacity affects thermal system
- Building efficiency affects energy consumption

### With Progression Engine

- Building unlocks from progression
- Building levels from progression
- Building achievements from progression

### With Database

- Building state persistence
- Building history tracking
- Building analytics

## Future Features

### Skyscrapers

**Concept:** Vertical expansion with multiple floors and advanced systems

**Implementation:**
- Floor-by-floor construction
- Elevator systems
- Advanced HVAC
- Multi-level power distribution
- Vertical network cabling

**Skyscraper Properties:**
- Base Floors: 20
- Max Floors: 100
- Floor Height: 4m
- Power per Floor: 5000W
- Cooling per Floor: 4000W
- Hardware per Floor: 50

**Skyscraper Features:**
- Floor-specific capacity
- Elevator travel time
- Vertical logistics
- Floor-based zoning
- Advanced security

### Districts

**Concept:** Grouped buildings with shared infrastructure and bonuses

**Implementation:**
- District creation and management
- Building assignment to districts
- District-wide bonuses
- Shared infrastructure
- District-level upgrades

**District Types:**
- Industrial District - Production bonus
- Residential District - Robot bonus
- Commercial District - Network bonus
- Research District - Research bonus
- Mixed District - Balanced bonuses

**District Features:**
- Shared power grid
- Shared cooling system
- Shared network backbone
- District-wide maintenance
- District-level progression

### Orbital Stations

**Concept:** Space-based facilities with zero-gravity operations

**Implementation:**
- Orbital construction
- Space logistics
- Zero-gravity mechanics
- Solar power integration
- Advanced cooling (radiative)

**Orbital Station Properties:**
- Zero-gravity environment
- Solar power generation
- Radiative cooling
- Limited expansion
- High maintenance

**Orbital Station Features:**
- Solar arrays
- Radiators
- Docking bays
- Life support
- Satellite communication

### Advanced Features

**Modular Buildings:**
- Attachable modules
- Configurable layouts
- Hot-swappable components
- Modular upgrades

**Smart Buildings:**
- AI management
- Automated maintenance
- Predictive systems
- Self-optimizing

**Green Buildings:**
- Solar integration
- Rainwater harvesting
- Energy recovery
- Sustainable materials

**Underground Buildings:**
- Subterranean construction
- Geothermal cooling
- Earth sheltering
- Reduced footprint

## Configuration

### Construction Configuration

```typescript
{
  maxConcurrentConstruction: 3,
  constructionSpeedMultiplier: 1.0,
  allowInstantCompletion: true,
  instantCompletionCostMultiplier: 2.0,
}
```

### Expansion Configuration

```typescript
{
  maxExpansionLevel: 10,
  expansionSpeedMultiplier: 1.0,
}
```

### Maintenance Configuration

```typescript
{
  maintenanceInterval: 3600000, // 1 hour
  maintenanceCostMultiplier: 1.0,
}
```

### Capacity Configuration

```typescript
{
  capacityUpdateInterval: 1000,
}
```

### Performance Configuration

```typescript
{
  maxBuildings: 1000,
  incrementalUpdate: true,
  updateBatchSize: 50,
}
```

## Developer Tools

### Building Developer Tools

The Building Developer Tools provides a comprehensive interface with four tabs:

**Inspector Tab:**
- Building list with status indicators
- Building details (type, level, state, dimensions, position)
- Quick actions (new building, upgrade)
- Real-time status updates

**Queue Tab:**
- Construction queue view
- Active/paused status
- Estimated completion times
- Target levels

**Capacity Tab:**
- Total capacity overview
- Per-capacity breakdown (power, cooling, network, hardware)
- Visual progress bars
- Building-specific capacity view

**Expansion Tab:**
- Available expansions
- Expansion effects and costs
- Active expansions
- Expansion progress

## Persistence

### State Structure

The complete building state includes:
- Buildings map (all buildings with properties)
- Construction queue (active constructions)
- Expansions map (active expansions)
- Version
- Timestamps

### Storage

- **Default**: LocalStorage
- **Extensible**: Custom storage implementations
- **Auto-save**: Configurable (default: 60s)
- **Version Support**: Migration system for schema changes

## Best Practices

### Adding New Building Types

1. Define building definition in BuildingDefinitions
2. Set base properties and multipliers
3. Configure upgrade requirements
4. Set unlock conditions
5. Test construction and upgrades
6. Update documentation

### Adding New Expansion Types

1. Define expansion in ExpansionSystem
2. Set cost and effects
3. Configure requirements
4. Test expansion application
5. Update documentation

### Optimizing Performance

1. Use incremental updates
2. Batch capacity calculations
3. Cache building lookups
4. Limit concurrent constructions
5. Profile regularly

## Troubleshooting

### Common Issues

**Construction not starting:**
- Check concurrent construction limit
- Verify building definition exists
- Check position validity
- Verify unlock requirements

**Upgrade not available:**
- Check building is completed
- Verify target level > current level
- Check upgrade requirements
- Verify resources available

**Expansion not applying:**
- Check building is completed
- Verify expansion limit not reached
- Check expansion requirements
- Verify resources available

**Capacity not updating:**
- Check building is completed
- Verify capacity calculation
- Check for stale cache
- Verify event listeners registered

## Conclusion

The Building System provides a robust, extensible framework for managing building construction, upgrades, expansion, and capacity. Its event-driven architecture, configurable design, and integration with existing systems ensure it can support future expansion including skyscrapers, districts, and orbital stations. The system is designed to be:
- **Configurable**: Everything is configurable
- **Extensible**: Easy to add new building and expansion types
- **Integratable**: Works with existing systems without modification
- **Performant**: Optimized for large numbers of buildings
- **Observable**: Comprehensive events for monitoring
- **Documented**: Complete documentation for all features
