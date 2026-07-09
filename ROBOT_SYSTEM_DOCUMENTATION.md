# Robot System Documentation

## Overview

The Robot System is a complete automation and robotics implementation with configurable robot types, task scheduling, AI behavior states, charging stations, and module upgrades. It features event-driven architecture, priority-based task scheduling, and support for thousands of robots. The system integrates with Buildings, Hardware, Energy, Research, and Progression engines.

## Architecture

### Core Systems

1. **Robot Definitions** - Configurable robot type definitions with stats and capabilities
2. **Robot Instances** - Robot instances with battery, experience, and modules
3. **Task System** - Task management with job types and priority scheduling
4. **Task Scheduler** - Priority-based task scheduling with multiple strategies
5. **AI State Machine** - State machine for robot AI behavior with pathfinding-ready architecture
6. **Charging Stations** - Charging stations with battery management
7. **Robot Upgrades** - Robot upgrades and module system
8. **Robot System** - Central coordinator integrating all subsystems
9. **Robot Persistence** - Saves and restores robot state with version support
10. **Robot Developer Tools** - Developer tool with robot inspector, task queue, job scheduler, and performance viewer

### Event-Driven Design

All systems communicate via events:
- `ROBOT_CREATED` - Fired when robot is created
- `ROBOT_DESTROYED` - Fired when robot is destroyed
- `ROBOT_UPGRADED` - Fired when robot is upgraded
- `ROBOT_MODULE_ADDED` - Fired when module is added
- `ROBOT_MODULE_REMOVED` - Fired when module is removed
- `ROBOT_CHARGING_STARTED` - Fired when robot starts charging
- `ROBOT_CHARGING_COMPLETED` - Fired when robot finishes charging
- `ROBOT_MAINTENANCE_REQUIRED` - Fired when robot needs maintenance
- `ROBOT_MAINTENANCE_COMPLETED` - Fired when robot maintenance is completed
- `ROBOT_STATE_CHANGED` - Fired when robot state changes
- `TASK_CREATED` - Fired when task is created
- `TASK_ASSIGNED` - Fired when task is assigned
- `TASK_STARTED` - Fired when task starts
- `TASK_COMPLETED` - Fired when task completes
- `TASK_FAILED` - Fired when task fails
- `TASK_CANCELLED` - Fired when task is cancelled
- `CHARGING_STATION_BUILT` - Fired when charging station is built
- `CHARGING_STATION_DESTROYED` - Fired when charging station is destroyed

## Robot Types

### Available Types

1. **Builder** - Construction robot for building and upgrading structures
2. **Worker** - General purpose robot for various tasks
3. **Maintenance** - Specialized robot for maintenance and repair
4. **Logistics** - Transport robot for moving resources and items
5. **Energy** - Energy management robot for power systems
6. **Cooling** - Thermal management robot for cooling systems
7. **Security** - Security robot for patrolling and monitoring
8. **Inspector** - Inspection robot for monitoring and analysis
9. **AI Supervisor** - Advanced AI robot for coordinating other robots
10. **Custom** - Custom robot types

### Robot Capabilities

Each robot type has specific capabilities:
- **Build** - Can build structures
- **Repair** - Can repair structures
- **Transport** - Can transport items
- **Recharge** - Can recharge other robots
- **Clean** - Can clean areas
- **Patrol** - Can patrol areas
- **Optimize** - Can optimize systems

## Robot Instances

### Robot Properties

Each robot instance has:
- **Unique ID** - Identifier for the robot
- **Definition ID** - Reference to robot definition
- **Name** - Display name
- **Type** - Robot type
- **Level** - Current level (1-10)
- **Experience** - Experience points
- **Efficiency** - Task efficiency (0-1)
- **Speed** - Movement speed
- **Battery Capacity** - Maximum battery (mAh)
- **Current Battery** - Current battery level
- **Carry Capacity** - Maximum carry weight (kg)
- **Power Consumption** - Power consumption (W)
- **State** - Current state
- **Current Task ID** - Currently assigned task
- **Position** - Current position (x, y, z)
- **Modules** - Installed modules
- **Charging Station ID** - Current charging station
- **Is Charging** - Whether currently charging
- **Last Maintenance Time** - Last maintenance timestamp
- **Maintenance Interval** - Time between maintenance
- **Needs Maintenance** - Whether maintenance is required
- **Tasks Completed** - Number of completed tasks
- **Tasks Failed** - Number of failed tasks
- **Total Distance** - Total distance traveled
- **Total Work Time** - Total time working

### Robot States

- **IDLE** - Robot is idle, available for tasks
- **MOVING** - Robot is moving to target
- **WORKING** - Robot is working on task
- **CHARGING** - Robot is charging
- **MAINTENANCE** - Robot is in maintenance
- **STUCK** - Robot is stuck
- **OFFLINE** - Robot is offline (battery depleted)

### Leveling System

Robots gain experience from completing tasks. When experience reaches the threshold, the robot levels up:
- **Experience Threshold** = Level × 1000
- **Level Bonus** = 10% per level to stats
- **Max Level** = 10

## Task System

### Task Types

1. **Build** - Build structures
2. **Upgrade** - Upgrade structures
3. **Repair** - Repair structures
4. **Transport** - Transport items
5. **Recharge** - Recharge robots
6. **Clean** - Clean areas
7. **Optimize** - Optimize systems
8. **Patrol** - Patrol areas
9. **Idle** - Idle task
10. **Custom** - Custom tasks

### Task Priority

1. **CRITICAL** (0) - Highest priority
2. **HIGH** (1) - High priority
3. **MEDIUM** (2) - Medium priority
4. **LOW** (3) - Low priority
5. **BACKGROUND** (4) - Background tasks

### Task States

- **PENDING** - Task is waiting to be assigned
- **ASSIGNED** - Task is assigned to a robot
- **IN_PROGRESS** - Task is being executed
- **COMPLETED** - Task is completed
- **FAILED** - Task failed
- **CANCELLED** - Task was cancelled

## Task Scheduler

### Assignment Strategies

1. **Priority** - Assign highest level robot to high priority tasks
2. **Nearest** - Assign nearest robot to task location
3. **Balanced** - Consider level, battery, and distance

### Scheduling Algorithm

```
1. Get pending tasks sorted by priority
2. Get available robots
3. For each task:
   a. Filter robots that can perform task
   b. Select robot based on strategy
   c. Assign task to robot
```

## AI State Machine

### Behavior States

1. **IDLE** - Robot is idle
2. **SEEKING_TASK** - Robot is looking for tasks
3. **MOVING_TO_TARGET** - Robot is moving to task location
4. **EXECUTING_TASK** - Robot is executing task
5. **RETURNING_TO_CHARGER** - Robot is returning to charging station
6. **CHARGING** - Robot is charging
7. **MAINTENANCE** - Robot is in maintenance
8. **STUCK** - Robot is stuck
9. **EMERGENCY** - Robot is in emergency state

### Decision Process

```
1. Check critical battery → Recharge
2. Check maintenance requirement → Maintenance
3. Check current task → Continue/Start
4. No task → Seek new task
```

### Pathfinding Architecture

The AI state machine is designed for pathfinding integration:
- **Target Position** - Included in decisions
- **Movement Actions** - Separate from task execution
- **Spatial Awareness** - Nearby robots detection
- **Environment Context** - Extensible environment data

## Charging Stations

### Station Properties

Each charging station has:
- **Unique ID** - Identifier for the station
- **Name** - Display name
- **Position** - Position (x, y, z)
- **Max Robots** - Maximum robots that can charge
- **Current Robots** - Currently charging robots
- **Charging Speed** - Charging speed (mAh/tick)
- **Charging Efficiency** - Charging efficiency (0-1)
- **Power Consumption** - Power consumption (W)
- **Building ID** - Associated building

### Charging Process

```
1. Robot requests charging
2. Find nearest available station
3. Assign robot to station
4. Charge robot at station speed × efficiency
5. When fully charged, disconnect robot
```

## Robot Upgrades and Modules

### Module Types

1. **Speed Boost** - Increases movement speed
2. **Efficiency Boost** - Increases task efficiency
3. **Battery Boost** - Increases battery capacity
4. **Carry Boost** - Increases carry capacity
5. **Sensor** - Improves detection
6. **Communication** - Enables advanced communication
7. **Navigation** - Improves pathfinding

### Module Effects

Modules apply effects to robot stats:
- **Speed** - Multiplier (e.g., 0.1 = 10% increase)
- **Efficiency** - Additive (e.g., 0.05 = 5% increase)
- **Battery Capacity** - Multiplier
- **Carry Capacity** - Multiplier

### Upgrade System

- **Robot Level** - Increases base stats
- **Module Level** - Increases module effects
- **Max Level** - 10 for robots, 3 for modules

## Integration

### With Buildings

- Robots can build and upgrade buildings
- Charging stations can be attached to buildings
- Building capacity affects robot operations

### With Hardware

- Robots can transport hardware
- Hardware efficiency affects robot performance
- Robot modules can enhance hardware

### With Energy

- Charging stations consume power
- Robot power consumption affects energy grid
- Energy robots can manage power systems

### With Research

- Robot upgrades can be unlocked via research
- Advanced robot types require research
- Module research unlocks new modules

### With Progression

- Robot level progression
- Task completion achievements
- Robot count milestones

## Configuration

### Task Scheduling Configuration

```typescript
{
  maxTasksPerRobot: 1,
  taskAssignmentStrategy: 'priority' | 'nearest' | 'balanced',
  taskTimeout: 300000, // 5 minutes
}
```

### Battery Configuration

```typescript
{
  lowBatteryThreshold: 0.3, // 30%
  criticalBatteryThreshold: 0.1, // 10%
  autoRecharge: true,
}
```

### Maintenance Configuration

```typescript
{
  maintenanceInterval: 3600000, // 1 hour
  autoMaintenance: true,
}
```

### AI Configuration

```typescript
{
  aiUpdateInterval: 1000, // 1 second
  pathfindingTimeout: 5000, // 5 seconds
}
```

### Performance Configuration

```typescript
{
  maxRobots: 10000,
  maxTasks: 100000,
  incrementalUpdate: true,
  updateBatchSize: 100,
}
```

## Developer Tools

### Robot Developer Tools

The Robot Developer Tools provides a comprehensive interface with five tabs:

**Robots Tab:**
- Robot list with state indicators
- Robot details panel
- Create new robots
- Upgrade robots
- Add modules

**Tasks Tab:**
- Task list with priority indicators
- Task details
- Create new tasks
- Cancel tasks

**Scheduler Tab:**
- Task statistics (total, pending, in progress, completed, failed, cancelled)
- Tasks by priority
- Tasks by type

**Stations Tab:**
- Charging station list
- Station details
- Create new stations
- Total capacity and usage

**Modules Tab:**
- Available modules list
- Module details
- Module effects

## Persistence

### State Structure

The complete robot state includes:
- Robot instances (all robots)
- Tasks (all tasks)
- Charging stations (all stations)
- Version
- Timestamps

### Storage

- **Default**: LocalStorage
- **Extensible**: Custom storage implementations
- **Auto-save**: Configurable (default: 60s)
- **Version Support**: Migration system for schema changes

## Best Practices

### Creating Robots

1. Choose appropriate robot type for task
2. Position near work area
3. Ensure charging station availability
4. Consider robot capabilities

### Managing Tasks

1. Use appropriate priority levels
2. Set reasonable task timeouts
3. Monitor task queue size
4. Balance task types

### Optimizing Performance

1. Use incremental updates
2. Limit robot count
3. Use efficient task assignment strategy
4. Monitor battery levels
5. Schedule regular maintenance

## Future Features

### Advanced AI

**Machine Learning:**
- Task prediction
- Optimal path learning
- Efficiency optimization
- Anomaly detection

**Collaborative AI:**
- Robot coordination
- Task sharing
- Swarm intelligence
- Multi-robot tasks

### Enhanced Robots

**Robot Types:**
- Quantum Robots - Quantum computing
- Nanobots - Micro-scale operations
- Swarm Robots - Swarm intelligence
- Exoskeletons - Human augmentation

**Robot Capabilities:**
- Self-repair
- Self-charging
- Learning
- Adaptation

### Advanced Tasks

**Task Types:**
- Research - Perform research
- Manufacturing - Manufacture items
- Exploration - Explore areas
- Defense - Defend against threats

**Task Features:**
- Task chains
- Task dependencies
- Task templates
- Task automation

### Multiplayer Support

**Multiplayer Features:**
- Robot trading
- Task sharing
- Collaborative projects
- Robot alliances

**Network Architecture:**
- Distributed task scheduling
- Synchronized robot states
- Shared charging stations
- Cooperative AI

## Troubleshooting

### Common Issues

**Robots not working:**
- Check robot is not offline
- Verify robot has battery
- Check robot is not in maintenance
- Verify task queue has tasks

**Tasks not completing:**
- Check task timeout
- Verify robot capabilities
- Check robot battery level
- Verify target position is reachable

**Charging not working:**
- Check charging station availability
- Verify station has capacity
- Check station power consumption
- Verify robot is connected to station

**AI decisions poor:**
- Check assignment strategy
- Verify battery thresholds
- Check maintenance intervals
- Review AI update interval

## Conclusion

The Robot System provides a robust, extensible framework for managing automation and robotics with configurable robot types, task scheduling, AI behavior, and charging management. Its event-driven architecture, configurable design, and integration with other engines ensure it can support thousands of robots. The system is designed to be:
- **Configurable**: Everything is configurable
- **Extensible**: Easy to add new robot types and tasks
- **Integratable**: Works with Buildings, Hardware, Energy, Research, Progression
- **Performant**: Optimized for large numbers of robots
- **Observable**: Comprehensive events for monitoring
- **Documented**: Complete documentation for all features
