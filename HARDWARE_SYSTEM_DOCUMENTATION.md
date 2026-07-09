# Hardware System Documentation

## Overview

The Hardware System is the first real gameplay content in FreeCoin Empire. It manages unique hardware instances that integrate with the Placement, Simulation, and Network engines via events. Every hardware object is unique with its own properties, rarity, manufacturer, firmware, and maintenance status.

## Architecture

The hardware system follows strict event-driven architecture:

- **Hardware**: Core hardware instance management
- **Placement**: Receives hardware placement events
- **Simulation**: Receives hardware property events
- **Network**: Receives hardware capacity events
- **Database**: Persists hardware instances

## Core Components

### 1. Hardware Types (`lib/hardware/types.ts`)

#### Hardware Categories
- **GPU**: Graphics processing units for mining
- **ASIC**: Application-specific integrated circuits
- **CPU Cluster**: General computing clusters
- **Battery**: Energy storage systems
- **Generator**: Power generation systems
- **Solar Panel**: Renewable energy generation
- **Cooling Unit**: Heat dissipation systems
- **Network Device**: Network infrastructure
- **Robot Station**: Automation systems

#### Hardware Instance Properties
Every hardware instance is unique with:

**Identification**
- **ID**: Unique identifier (e.g., HW-abc123-xyz789)
- **Serial Number**: Manufacturer serial number (e.g., SN-GPU-NVIDIA-ABC123)

**Hardware Type**
- **Category**: Hardware category
- **Type**: Specific hardware model
- **Manufacturer**: Brand/manufacturer
- **Model**: Model name

**Rarity and Quality**
- **Rarity**: Common, Uncommon, Rare, Epic, Legendary, Mythic
- **Quality**: Poor, Fair, Good, Excellent, Perfect

**Firmware**
- **Version**: Major.Minor.Patch.Build
- **Compatibility**: Future gameplay hooks

**Physical Properties**
- **Health**: Current health (0-100)
- **Durability**: Current durability (0-100)
- **Efficiency**: Performance multiplier
- **Power Consumption**: Power usage in watts
- **Power Generation**: Power generation in watts
- **Heat Generation**: Heat output
- **Cooling Capacity**: Cooling capacity

**Maintenance**
- **Status**: Excellent, Good, Needs Maintenance, Critical, Broken
- **Last Maintenance Date**: Timestamp of last maintenance

**Installation**
- **Installation Date**: When installed
- **Installed Position**: Grid coordinates

**Ownership**
- **Owner ID**: Player identifier

**Configuration**
- **Custom Properties**: Extensible key-value storage

#### Rarity System
Each rarity level has multipliers affecting:
- **Efficiency**: Performance boost
- **Durability**: Durability boost
- **Power Consumption**: Power usage reduction
- **Power Generation**: Power generation boost

**Rarity Multipliers**
- Common: 1.0x (baseline)
- Uncommon: 1.1x efficiency, 1.15x durability
- Rare: 1.25x efficiency, 1.3x durability
- Epic: 1.5x efficiency, 1.5x durability
- Legendary: 1.75x efficiency, 1.75x durability
- Mythic: 2.0x efficiency, 2.0x durability

#### Quality System
Quality affects final stats:
- Poor: 0.8x modifier
- Fair: 0.9x modifier
- Good: 1.0x modifier (baseline)
- Excellent: 1.1x modifier
- Perfect: 1.2x modifier

#### Manufacturer System
Manufacturers have:
- **Reputation**: Brand reputation score
- **Supported Categories**: Hardware types they produce
- **Quality Modifier**: Quality influence
- **Efficiency Modifier**: Efficiency influence
- **Durability Modifier**: Durability influence

**Default Manufacturers**
- Generic: Baseline stats
- Nvidia: GPU/CPU specialist, +15% efficiency
- AMD: GPU/CPU specialist, +10% efficiency
- Intel: CPU/Network specialist, +12% efficiency
- Tesla: Battery/Solar specialist, +20% efficiency
- Bitmain: ASIC specialist, +10% efficiency
- Caterpillar: Generator specialist, +20% durability
- SunPower: Solar specialist, +15% efficiency
- Noctua: Cooling specialist, +15% durability
- Cisco: Network specialist, +10% durability
- Boston Dynamics: Robot specialist, +20% efficiency

#### Firmware System
Firmware versioning follows semantic versioning:
- **Major**: Major version
- **Minor**: Minor version
- **Patch**: Patch version
- **Build**: Build number

Firmware affects future gameplay:
- Compatibility with features
- Performance optimizations
- Security patches
- Feature unlocks

#### Maintenance Status System
Status calculated from health and durability:
- **Excellent**: Average ≥ 90%
- **Good**: Average ≥ 70%
- **Needs Maintenance**: Average ≥ 50%
- **Critical**: Average ≥ 20%
- **Broken**: Average < 20%

### 2. Hardware Definitions (`lib/hardware/definitions.ts`)

#### Definition Structure
Each hardware type has:
- **Type**: Hardware type enum
- **Category**: Hardware category
- **Name**: Display name
- **Description**: Description text

**Base Stats**
- **Power Consumption**: Base power usage
- **Power Generation**: Base power generation
- **Heat Generation**: Base heat output
- **Cooling Capacity**: Base cooling capacity
- **Efficiency**: Base efficiency
- **Durability**: Base durability

**Rarity Multipliers**
- Per-rarity stat multipliers

**Manufacturer Support**
- List of supported manufacturers

**Firmware Requirements**
- Minimum firmware version

**Placement Requirements**
- Grid size (width x height)

**Network Requirements**
- Network capacity
- Power capacity
- Cooling capacity

#### Hardware Types Defined
- **4 GPU models**: Basic, Standard, Advanced, Premium
- **4 ASIC models**: Basic, Standard, Advanced, Premium
- **4 CPU Cluster models**: Small, Medium, Large, Huge
- **4 Battery models**: Small, Medium, Large, Huge
- **3 Generator models**: Diesel, Gas, Nuclear
- **3 Solar Panel models**: Basic, Standard, Advanced
- **3 Cooling Unit models**: Fan, Liquid, Phase Change
- **3 Network Device models**: Router, Switch, Firewall
- **3 Robot Station models**: Basic, Standard, Advanced

### 3. Hardware Factory (`lib/hardware/HardwareFactory.ts`)

#### Factory Operations
- **Create Instance**: Generate unique hardware instance
- **Roll Rarity**: Random rarity based on probabilities
- **Roll Quality**: Random quality based on probabilities
- **Select Manufacturer**: Choose compatible manufacturer
- **Calculate Stats**: Apply rarity, quality, and manufacturer modifiers

#### Stat Calculation
```
Final Efficiency = Base Efficiency × Rarity Multiplier × Manufacturer Modifier × Quality Modifier
Final Durability = Base Durability × Rarity Multiplier × Manufacturer Modifier × Quality Modifier
Final Power Consumption = Base Power Consumption × Rarity Multiplier
Final Power Generation = Base Power Generation × Rarity Multiplier
```

### 4. Hardware Manager (`lib/hardware/HardwareManager.ts`)

#### Manager Operations
- **Create Instance**: Create and register hardware instance
- **Destroy Instance**: Remove hardware instance
- **Update Instance**: Modify instance properties
- **Install Instance**: Install at grid position
- **Remove Instance**: Remove from grid position
- **Perform Maintenance**: Restore health and durability
- **Update Firmware**: Update firmware version

#### Event Integration
The manager integrates with other engines via events:

**Simulation Engine Integration**
- Creates simulation entity for hardware
- Maps hardware properties to simulation entity
- Subscribes to simulation events
- Updates hardware based on simulation state

**Network Engine Integration**
- Creates network node for hardware
- Sets node capacities based on hardware
- Subscribes to network events
- Updates hardware based on network state

**Placement Engine Integration**
- Places hardware on grid
- Sets grid tile properties
- Subscribes to placement events
- Updates hardware based on placement changes

#### Event Types
- **Instance Created**: Fired when instance created
- **Instance Destroyed**: Fired when instance destroyed
- **Instance Updated**: Fired when instance updated
- **Instance Installed**: Fired when instance installed
- **Instance Removed**: Fired when instance removed
- **Maintenance Performed**: Fired when maintenance performed
- **Firmware Updated**: Fired when firmware updated
- **Health Changed**: Fired when health changes
- **Durability Changed**: Fired when durability changes
- **Efficiency Changed**: Fired when efficiency changes

### 5. Hardware Persistence (`lib/hardware/HardwarePersistence.ts`)

#### Persistence Operations
- **Save Instance**: Save single instance to database
- **Save Instances**: Save multiple instances (batched)
- **Save All**: Save all instances
- **Load Instance**: Load single instance from database
- **Load Instances By Owner**: Load instances for specific owner
- **Delete Instance**: Delete instance from database

#### Auto-Save
- Configurable auto-save interval (default 30 seconds)
- Pending save tracking
- Batch saving for performance
- Force save option

### 6. Hardware Inspector (`components/hardware/HardwareInspector.tsx`)

#### Inspector Features
- **Instance List**: Display all hardware instances
- **Search**: Search by ID, serial number, manufacturer, model
- **Filtering**: Filter by category, rarity, maintenance status
- **Instance Details**: Display all instance properties
- **Actions**: Perform maintenance, update firmware
- **Color Coding**: Rarity and quality color indicators

## Hardware Lifecycle

### Creation
1. Hardware factory creates instance from definition
2. Rarity and quality are rolled
3. Manufacturer is selected
4. Stats are calculated with modifiers
5. Unique ID and serial number are generated
6. Firmware version is set
7. Instance is registered with manager
8. Instance created event is fired
9. Integration with other engines is triggered

### Installation
1. Instance is installed at grid position
2. Installation date is set
3. Instance installed event is fired
4. Placement engine is notified
5. Network engine is notified
6. Simulation engine is notified

### Operation
1. Hardware operates in simulation engine
2. Properties change over time (health, durability)
3. Events are fired for property changes
4. Network flow affects hardware
5. Maintenance status is recalculated

### Maintenance
1. Maintenance is performed on instance
2. Health and durability are restored
3. Last maintenance date is updated
4. Maintenance performed event is fired
5. Simulation engine is notified

### Firmware Update
1. Firmware is updated on instance
2. New version is set
3. Firmware updated event is fired
4. Simulation engine is notified
5. Future gameplay hooks are activated

### Destruction
1. Instance is destroyed
2. Instance destroyed event is fired
3. Integration with other engines is removed
4. Instance is removed from database

## Instance Model

### Uniqueness
Every hardware instance is unique:
- Unique ID (timestamp + random)
- Unique serial number (category + manufacturer + random)
- Unique combination of rarity, quality, manufacturer
- Unique firmware version
- Unique installation date and position
- Unique configuration

### Scalability
The architecture supports millions of instances:
- Map-based storage for O(1) lookups
- Event-driven integration prevents tight coupling
- Batch persistence for performance
- Incremental updates for simulation
- Spatial partitioning for network

### Extensibility
The instance model is extensible:
- Custom properties for future features
- Configurable rarity multipliers
- Configurable manufacturer modifiers
- Extensible firmware system
- Custom event types

## Future Upgrades

### Upgrade System Architecture
The hardware system is designed for future upgrades:

1. **Upgrade Slots**
   - Each hardware type has upgrade slots
   - Slots can accept upgrade modules
   - Upgrades modify base stats

2. **Upgrade Modules**
   - Cooling upgrades: Improve heat dissipation
   - Power upgrades: Improve efficiency
   - Capacity upgrades: Increase capacity
   - Special upgrades: Unique abilities

3. **Upgrade Compatibility**
   - Firmware version requirements
   - Manufacturer compatibility
   - Rarity requirements

4. **Upgrade Persistence**
   - Upgrades stored in instance configuration
   - Upgrade history tracked
   - Upgrade events fired

### Implementation Path
1. Define upgrade slot types
2. Create upgrade module definitions
3. Implement upgrade application logic
4. Add upgrade UI
5. Integrate with economy system

## Future Crafting

### Crafting System Architecture
The hardware system supports future crafting:

1. **Crafting Recipes**
   - Recipes for each hardware type
   - Required materials and components
   - Crafting time
   - Crafting success rate

2. **Crafting Quality**
   - Quality affects crafting outcome
   - Rarity affects material requirements
   - Manufacturer affects crafting bonuses

3. **Crafting Integration**
   - Crafting creates hardware instances
   - Crafting events fired
   - Inventory integration
   - Economy integration

### Implementation Path
1. Define crafting recipes
2. Implement crafting logic
3. Add crafting UI
4. Integrate with inventory
5. Integrate with economy

## Future Repairs

### Repair System Architecture
The hardware system supports future repairs:

1. **Repair Types**
   - Basic repair: Restore health/durability
   - Advanced repair: Improve quality
   - Component repair: Replace components
   - Overhaul: Complete restoration

2. **Repair Costs**
   - Material costs
   - Time costs
   - Skill requirements
   - Tool requirements

3. **Repair Integration**
   - Repair affects instance properties
   - Repair events fired
   - Inventory integration
   - Economy integration

### Implementation Path
1. Define repair types and costs
2. Implement repair logic
3. Add repair UI
4. Integrate with inventory
5. Integrate with economy

## Future Trading

### Trading System Architecture
The hardware system supports future trading:

1. **Marketplace**
   - List hardware for sale
   - Browse hardware listings
   - Buy and sell hardware
   - Trading history

2. **Pricing**
   - Base price from definition
   - Rarity multiplier
   - Quality multiplier
   - Market demand
   - Manufacturer reputation

3. **Trading Integration**
   - Trading events fired
   - Ownership transfer
   - Database updates
   - Economy integration

### Implementation Path
1. Define marketplace structure
2. Implement trading logic
3. Add marketplace UI
4. Integrate with economy
5. Integrate with database

## Future Collection System

### Collection System Architecture
The hardware system supports future collection:

1. **Collection Goals**
   - Collect all hardware types
   - Collect all rarities
   - Collect all manufacturers
   - Special collections

2. **Collection Rewards**
   - Achievement unlocks
   - Bonus multipliers
   - Special hardware
   - Cosmetic rewards

3. **Collection Integration**
   - Collection tracking
   - Achievement events fired
   - Progress persistence
   - Reward distribution

### Implementation Path
1. Define collection goals
2. Implement collection tracking
3. Add collection UI
4. Integrate with achievements
5. Implement reward system

## Performance

### Scalability Targets
- **1000 instances**: < 10ms for operations
- **10000 instances**: < 50ms for operations
- **100000 instances**: < 500ms for operations
- **1000000 instances**: < 5s for operations

### Optimization Strategies
- Map-based storage for O(1) lookups
- Batch persistence operations
- Event-driven integration prevents tight coupling
- Incremental simulation updates
- Spatial partitioning for network

### Memory Efficiency
- Instance data: ~500 bytes per instance
- 10000 instances: ~5MB
- 100000 instances: ~50MB
- 1000000 instances: ~500MB

## Configuration

### Default Configuration
```typescript
{
  idPrefix: 'HW',
  serialNumberFormat: 'SN-{category}-{manufacturer}-{random}',
  defaultManufacturer: 'Generic',
  
  rarityProbabilities: {
    common: 0.6,
    uncommon: 0.25,
    rare: 0.1,
    epic: 0.04,
    legendary: 0.009,
    mythic: 0.001,
  },
  
  qualityProbabilities: {
    poor: 0.1,
    fair: 0.2,
    good: 0.4,
    excellent: 0.25,
    perfect: 0.05,
  },
  
  maintenanceThresholds: {
    excellent: 90,
    good: 70,
    needsMaintenance: 50,
    critical: 20,
  },
  
  defaultFirmwareVersion: {
    major: 1,
    minor: 0,
    patch: 0,
    build: 0,
  },
  
  enableSimulationIntegration: true,
  enableNetworkIntegration: true,
  enablePlacementIntegration: true,
}
```

### Runtime Updates
Configuration can be updated at runtime:
```typescript
manager.updateConfig({
  rarityProbabilities: {
    ...config.rarityProbabilities,
    mythic: 0.002, // Increase mythic chance
  },
});
```

## Testing

### Manual Testing
1. Open `/hardware-test` page
2. Click "Add X Instances" to populate hardware
3. Use inspector to view and filter instances
4. Select instance to view details
5. Perform maintenance or update firmware
6. Test with 10000+ instances to verify performance

### Performance Targets
- **1000 instances**: < 10ms for operations
- **10000 instances**: < 50ms for operations
- **Memory**: < 10MB for 10000 instances

### Test Scenarios
- **Cold Start**: Add instances, test operations
- **Hot Start**: Test operations with existing instances
- **Filtering**: Test search and filter performance
- **Persistence**: Test save/load operations
- **Large Scale**: Test with 10000+ instances

## Integration with Other Systems

### Placement Engine Integration
- Hardware provides grid size requirements
- Placement provides installation positions
- Events: InstanceInstalled, InstanceRemoved

### Simulation Engine Integration
- Hardware provides physical properties
- Simulation provides state changes
- Events: HealthChanged, DurabilityChanged, EfficiencyChanged

### Network Engine Integration
- Hardware provides capacity requirements
- Network provides flow state
- Events: InstanceCreated, InstanceDestroyed

### Database Integration
- Hardware provides instance data
- Database provides persistence
- Batch operations for performance

## Conclusion

The Hardware System provides a robust, scalable foundation for the first real gameplay content in FreeCoin Empire. The strict event-driven architecture ensures complete independence from other systems, while the configurable parameters and unique instance model enable handling of millions of hardware instances efficiently. The architecture is designed for future upgrades, crafting, repairs, trading, and collection systems without requiring refactoring.
