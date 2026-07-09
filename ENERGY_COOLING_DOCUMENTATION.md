# Energy & Cooling System Documentation

## Overview

The Energy & Cooling System is a strategic gameplay module that manages power generation, storage, consumption, heat management, and cooling. It integrates with existing systems (Placement Engine, Simulation Engine, Resource Network, Hardware System, Progression Engine) to provide realistic energy and thermal management for 10000+ hardware objects.

## Architecture

### Core Systems

1. **Power System** - Manages power generation, storage, consumption, and priorities
2. **Thermal System** - Manages heat generation, transfer, and cooling
3. **Energy System** - Central coordinator integrating power and thermal systems
4. **Energy Persistence** - Saves and restores energy state
5. **Energy Overlay** - Developer visualization tool

### Event-Driven Design

All systems communicate via events:
- `POWER_LOST` - Fired when hardware loses power
- `POWER_RESTORED` - Fired when power is restored
- `OVERHEATED` - Fired when hardware overheats
- `COOLED_DOWN` - Fired when hardware cools down
- `BATTERY_CHARGED` - Fired when battery is fully charged
- `BATTERY_EMPTY` - Fired when battery is depleted
- `GENERATOR_STARTED` - Fired when generator starts
- `GENERATOR_STOPPED` - Fired when generator stops
- `EMERGENCY_SHUTDOWN` - Fired when emergency shutdown triggers
- `EMERGENCY_COOLING` - Fired when emergency cooling activates

## Power Algorithm

### Power Generation

```
Total Generation = Σ (Source Output × Source Efficiency)
```

**Power Sources:**
- Grid - External grid connection
- Solar - Solar panels (future)
- Wind - Wind turbines (future)
- Nuclear - Nuclear reactor (future)
- Geothermal - Geothermal (future)
- Hydro - Hydroelectric (future)
- Battery - Battery discharge
- Generator - Backup generator

**Source Efficiency:**
- Grid: 0.95 (5% transmission loss)
- Solar: 0.85 (15% conversion loss)
- Wind: 0.90 (10% conversion loss)
- Nuclear: 0.98 (2% conversion loss)
- Battery: 0.90 (10% discharge loss)
- Generator: 0.85 (15% conversion loss)

### Power Consumption

```
Total Consumption = Σ Consumer Current Consumption
```

**Power Consumers:**
- Hardware devices (GPUs, ASICs, CPUs)
- Cooling systems (fans, pumps)
- Network equipment
- Auxiliary systems

**Consumer Priority Levels:**
1. **Critical** - Essential systems (never cut)
2. **High** - Important systems
3. **Medium** - Normal operations
4. **Low** - Non-essential
5. **Reserve** - Only when surplus

### Power Balancing

```
Surplus = Total Generation - Total Consumption
Deficit = Total Consumption - Total Generation
```

**Balancing Logic:**
1. Calculate total generation and consumption
2. If surplus exists, charge batteries
3. If deficit exists, discharge batteries
4. If deficit exceeds threshold, trigger outage timer
5. If outage timer expires, cut power by priority
6. If deficit resolved, restore power

### Power Outage

**Outage Trigger:**
```
Deficit > Max Power Deficit (1000W) for > Outage Threshold (5000ms)
```

**Power Cutoff Sequence:**
1. Reserve priority consumers
2. Low priority consumers
3. Medium priority consumers
4. High priority consumers
5. Critical priority consumers (never cut)

**Power Restoration Sequence:**
1. Critical priority consumers
2. High priority consumers
3. Medium priority consumers
4. Low priority consumers
5. Reserve priority consumers

### Battery Management

**Charging:**
```
Charge Amount = Min(
  Capacity - Current Charge,
  Max Charge Rate × Time Interval
) × Efficiency
```

**Discharging:**
```
Discharge Amount = Min(
  Current Charge,
  Max Discharge Rate × Time Interval
) × Efficiency
```

**Reserve Batteries:**
 Only discharge when charge level < Reserve Threshold (20%)

**Battery States:**
- Idle - Neither charging nor discharging
- Charging - Receiving surplus power
- Discharging - Providing power during deficit

### Power Efficiency

```
Power Efficiency = Power Received / Power Required
```

**Factors Affecting Efficiency:**
- Source efficiency
- Transmission losses
- Voltage stability
- Cable quality

## Heat Algorithm

### Heat Generation

```
Total Heat Generation = Σ Heat Source Current Generation
```

**Heat Sources:**
- Computation - Heat from processing
- Power - Heat from power conversion
- Environment - Ambient heat
- Equipment - Equipment heat

**Heat Generation Formula:**
```
Heat Generation = Base Generation × Load Factor
```

**Load Factor:**
- Idle: 0.2
- Low: 0.5
- Medium: 0.75
- High: 1.0

### Heat Transfer

**Heat Transfer Types:**
1. **Conduction** - Direct contact transfer
2. **Convection** - Air/fluid circulation
3. **Radiation** - Electromagnetic emission
4. **Liquid** - Future liquid cooling

**Heat Transfer Rate:**
```
Transfer Rate = k × A × (T_hot - T_cold) / d
```
Where:
- k = Thermal conductivity
- A = Surface area
- T_hot = Hot temperature
- T_cold = Cold temperature
- d = Distance

### Temperature Calculation

```
Temperature Change = Net Heat × Thermal Mass Factor
Net Heat = Heat Generation - Cooling
```

**Thermal Mass Factor:**
- Small hardware: 0.01
- Medium hardware: 0.005
- Large hardware: 0.002

**Natural Cooling:**
```
Natural Cooling Rate = (Temperature - Ambient) × 0.001
```

### Cooling Coverage

**Coverage Calculation:**
```
Distance = √((x1-x2)² + (y1-y2)² + (z1-z2)²)
Coverage Efficiency = 1 - (Distance / Coverage Radius)
```

**Cooling Received:**
```
Cooling Received = Σ (Cooling Capacity × Efficiency × Coverage Efficiency)
```

**Cooling Types:**
- Passive - Heatsinks (efficiency: 0.6)
- Active Air - Fans (efficiency: 0.8)
- Liquid - Future (efficiency: 0.95)
- Phase Change - Future (efficiency: 0.98)

### Thermal Balance

```
Heat Surplus = Total Heat Generation - Total Cooling Capacity
```

**Balancing Logic:**
1. Calculate total heat generation
2. Calculate total cooling capacity
3. Apply cooling coverage to heat sources
4. Update temperatures based on net heat
5. Check for overheating thresholds
6. Trigger emergency cooling if needed
7. Trigger emergency shutdown if critical

### Overheating

**Overheating Threshold:**
```
Temperature >= Overheating Threshold (75°C)
```

**Emergency Cooling Threshold:**
```
Temperature >= Emergency Cooling Threshold (80°C)
```

**Emergency Shutdown Threshold:**
```
Temperature >= Emergency Shutdown Threshold (90°C)
```

**Overheating Effects:**
- Reduced efficiency
- Performance throttling
- Potential damage
- Emergency shutdown

### Thermal Recovery

**Recovery Rate:**
```
Temperature Decrease = Thermal Recovery Rate (0.5°C/s)
```

**Recovery Conditions:**
- Emergency shutdown active
- All temperatures below threshold
- Emergency cooling active

**Recovery Steps:**
1. Shut down overheating hardware
2. Activate emergency cooling
3. Monitor temperature decrease
4. Restore when cooled below threshold
5. Deactivate emergency cooling
6. Resume normal operation

## Hardware Efficiency Calculation

### Efficiency Formula

```
Overall Efficiency = (Power + Cooling + Simulation + Network) / 4
```

**Component Efficiencies:**
- **Power Efficiency** - Power received / power required
- **Cooling Efficiency** - Based on temperature ratio
- **Simulation Efficiency** - From Simulation Engine
- **Network Efficiency** - From Resource Network

### Cooling Efficiency Calculation

```
Temperature Ratio = (Temperature - Ambient) / (Max Temperature - Ambient)
Cooling Efficiency = Max(0, 1 - Temperature Ratio)
```

**Efficiency Impact:**
- 100% efficiency: Full performance
- 75% efficiency: 25% performance reduction
- 50% efficiency: 50% performance reduction
- 25% efficiency: 75% performance reduction
- 0% efficiency: No operation

### Critical Failure

If any component efficiency is 0:
```
Overall Efficiency ×= 0.5
```

This ensures that missing critical resources significantly impact overall performance.

## Optimization Strategy

### Incremental Updates

**Batch Processing:**
- Process hardware in batches of 100
- Only update changed objects
- Skip idle/unchanged objects

**Update Intervals:**
- Power balance: 100ms
- Thermal update: 100ms
- Efficiency calculation: 100ms

### Spatial Partitioning

**Grid-Based Optimization:**
- Divide space into grid cells
- Only calculate cooling within cell
- Cache cooling coverage per cell

**Cell Size:**
- Default: 10m × 10m
- Adjustable based on hardware density

### Priority-Based Processing

**Update Order:**
1. Critical systems (every tick)
2. High priority systems (every 2 ticks)
3. Medium priority systems (every 4 ticks)
4. Low priority systems (every 8 ticks)

### Lazy Evaluation

**Calculate on Demand:**
- Only calculate efficiency when needed
- Cache results until state changes
- Invalidate cache on state change

### Memory Optimization

**Object Pooling:**
- Reuse event objects
- Pool temporary calculations
- Minimize allocations

**Data Structures:**
- Use Maps for O(1) lookups
- Use Sets for membership tests
- Use typed arrays for numeric data

## Performance

### Scalability

**Target: 10000+ Hardware Objects**

**Optimizations:**
- Incremental updates only
- Spatial partitioning
- Batch processing
- Priority-based updates
- Lazy evaluation
- Object pooling

### Benchmarks

**Expected Performance:**
- 1000 objects: <1ms per update
- 5000 objects: <5ms per update
- 10000 objects: <10ms per update

**Memory Usage:**
- 1000 objects: ~10MB
- 5000 objects: ~50MB
- 10000 objects: ~100MB

## Integration

### With Placement Engine

- Hardware positions from placement
- Grid cell assignment
- Spatial queries

### With Simulation Engine

- Simulation efficiency from engine
- Load factors for heat generation
- Performance metrics

### With Resource Network

- Network efficiency from engine
- Bandwidth allocation
- Connection status

### With Hardware System

- Hardware specifications
- Power requirements
- Cooling requirements

### With Progression Engine

- Unlock energy features
- Progression from efficiency
- Milestones for energy management

## Future Features

### Renewable Energy

**Solar Power:**
- Day/night cycle
- Weather effects
- Panel efficiency degradation
- Battery storage integration

**Wind Power:**
- Wind speed variability
- Turbine efficiency curves
- Seasonal patterns
- Grid synchronization

**Geothermal:**
- Constant baseline power
- Well depth factors
- Thermal efficiency
- Long-term stability

**Hydroelectric:**
- Water flow rates
- Seasonal variations
- Turbine efficiency
- Environmental impact

### Nuclear Power

**Reactor Types:**
- Pressurized Water Reactor (PWR)
- Boiling Water Reactor (BWR)
- Advanced Gas-cooled Reactor (AGR)
- Molten Salt Reactor (MSR)

**Nuclear Mechanics:**
- Fuel rod management
- Control rod positioning
- Coolant flow control
- Waste heat utilization

**Safety Systems:**
- Automatic shutdown (SCRAM)
- Emergency cooling
- Containment protocols
- Radiation monitoring

**Integration:**
- High baseline generation
- Low variable output
- Complex safety requirements
- Long-term fuel management

### Liquid Cooling

**Cooling Types:**
- Water cooling
- Oil cooling
- Dielectric fluid cooling
- Two-phase cooling

**Liquid Cooling Mechanics:**
- Pump flow rates
- Radiator efficiency
- Fluid temperature
- Pressure management

**Advantages:**
- Higher heat transfer efficiency
- Better temperature control
- Lower noise
- Higher overclocking potential

**Challenges:**
- Leak risk
- Maintenance complexity
- Pump failure points
- Fluid degradation

**Implementation:**
- Liquid cooling systems
- Cooling loops
- Radiator arrays
- Reservoir management

### Advanced Features

**Smart Grid:**
- Dynamic load balancing
- Predictive management
- Demand response
- Grid synchronization

**Energy Storage:**
- Advanced battery chemistries
- Flywheel storage
- Compressed air storage
- Thermal energy storage

**Heat Recovery:**
- Waste heat utilization
- Cogeneration systems
- Heat exchangers
- Thermal storage

**AI Integration:**
- Predictive maintenance
- Optimization algorithms
- Anomaly detection
- Automated balancing

## Configuration

### Power System Configuration

```typescript
{
  maxPowerDeficit: 1000,        // Max deficit before outage (W)
  outageThreshold: 5000,       // Time in deficit before outage (ms)
  reserveBatteryThreshold: 0.2, // Battery level to trigger reserve (0-1)
  autoBalance: true,          // Auto-balance power
  balanceInterval: 100,       // Balance check interval (ms)
}
```

### Thermal System Configuration

```typescript
{
  maxTemperature: 85,          // Max safe temperature (°C)
  overheatingThreshold: 75,   // Temp to trigger emergency (°C)
  emergencyCoolingThreshold: 80, // Temp to trigger emergency cooling (°C)
  thermalRecoveryRate: 0.5,   // Recovery rate (°C/s)
  emergencyShutdownThreshold: 90, // Temp to trigger shutdown (°C)
}
```

### Cooling System Configuration

```typescript
{
  coolingEfficiencyBase: 0.8,  // Base cooling efficiency (0-1)
  passiveCoolingMultiplier: 1.0, // Passive cooling multiplier
  activeCoolingMultiplier: 1.5,  // Active cooling multiplier
}
```

### Performance Configuration

```typescript
{
  maxHardwareObjects: 10000,   // Max hardware objects supported
  incrementalUpdate: true,    // Use incremental updates
  updateBatchSize: 100,      // Batch size for updates
}
```

## Developer Tools

### Energy Overlay

The Energy Overlay provides:
- **Power Tab**: Grid status, power sources, consumers, batteries
- **Thermal Tab**: Thermal status, heat map, cooling systems
- **Hardware Tab**: Hardware efficiency, component breakdown

**Features:**
- Real-time monitoring
- Color-coded status
- Temperature visualization
- Efficiency breakdown
- Battery charge levels

## Persistence

### State Structure

The complete energy state includes:
- Power grid state (generation, consumption, surplus, deficit)
- Power sources (output, efficiency, online status)
- Power consumers (consumption, priority, powered status)
- Batteries (charge, charge/discharge rates)
- Thermal state (ambient temp, heat generation, cooling capacity)
- Heat sources (temperature, generation, overheating status)
- Cooling systems (capacity, efficiency, active status)
- Hardware states (efficiency, temperature, emergency status)
- Hardware requirements (power, cooling, simulation, network)
- Version
- Timestamps

### Storage

- **Default**: LocalStorage
- **Extensible**: Custom storage implementations
- **Auto-save**: Configurable (default: 60s)
- **Version Support**: Migration system for schema changes

## Best Practices

### Adding Power Sources

1. Define source configuration
2. Set output and efficiency
3. Add to power system
4. Monitor generation
5. Handle online/offline transitions

### Adding Heat Sources

1. Define heat source configuration
2. Set generation and temperature limits
3. Add to thermal system
4. Set position for coverage
5. Monitor overheating

### Adding Cooling Systems

1. Define cooling configuration
2. Set capacity and coverage radius
3. Add to thermal system
4. Set position for coverage
5. Monitor efficiency

### Optimizing Performance

1. Use incremental updates
2. Implement spatial partitioning
3. Batch process objects
4. Cache calculations
5. Profile regularly

## Troubleshooting

### Common Issues

**Power not reaching hardware:**
- Check power source is online
- Verify consumer priority
- Check for grid outage
- Verify battery status

**Overheating issues:**
- Check cooling system is active
- Verify cooling coverage
- Increase cooling capacity
- Reduce heat generation

**Low efficiency:**
- Check all component efficiencies
- Verify power delivery
- Verify cooling coverage
- Check simulation/network status

**Performance issues:**
- Reduce update frequency
- Increase batch size
- Enable incremental updates
- Profile bottlenecks

## Conclusion

The Energy & Cooling System provides a robust, realistic simulation of power and thermal management. Its event-driven architecture, configurable design, and optimization strategies ensure it can scale to 10000+ hardware objects while maintaining performance. The system is designed to be:
- **Realistic**: Physics-based calculations
- **Scalable**: Optimized for large numbers of objects
- **Extensible**: Easy to add new energy sources and cooling types
- **Performant**: Incremental updates and spatial partitioning
- **Integratable**: Works with existing systems
- **Observable**: Comprehensive events for monitoring
