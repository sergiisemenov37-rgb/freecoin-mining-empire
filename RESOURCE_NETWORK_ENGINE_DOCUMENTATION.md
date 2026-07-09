# Resource Network Engine Documentation

## Overview

The Resource Network Engine simulates resource flow across the player's base. It is a generic, reusable system completely independent from simulation, rendering, database, and placement. Everything communicates using events, ensuring clean separation of concerns and future extensibility.

## Architecture

The engine follows strict event-driven architecture:

- **Network**: Core graph model and flow calculation
- **Simulation**: Independent, only receives network state via events
- **Rendering**: Independent, only displays network state via events
- **Database**: Independent, only persists network state via events
- **Placement**: Independent, only provides node positions via events

## Core Components

### 1. Resource Types (`lib/network/types.ts`)

#### Supported Resources
- **Power**: Electrical power in watts (W)
- **Cooling**: Thermal cooling in BTU/h
- **Network**: Data bandwidth in Mbps
- **Maintenance**: Maintenance coverage percentage
- **Custom**: Extensible for future resource types

#### Resource Configuration
Each resource has configurable:
- Unit of measurement
- Default capacity
- Default flow rate
- Maximum capacity
- Minimum capacity

### 2. Network Graph Model (`lib/network/NetworkGraph.ts`)

#### Graph Structure
- **Nodes**: Every placed object becomes a network node
- **Edges**: Connections between nodes
- **Adjacency Lists**: Fast neighbor lookup
- **Reverse Adjacency Lists**: Fast reverse lookup

#### Node Properties
- **ID**: Unique identifier
- **Position**: Grid coordinates
- **Type**: Object type from grid
- **Resources**: Per-resource flow data (input, output, net, capacity, utilization)
- **Priority**: Critical, High, Normal, Low
- **Status**: Active, Inactive, Disconnected, Overloaded, Failed, Maintenance
- **Capacities**: Per-resource capacity limits
- **Connections**: Set of connected node IDs
- **Load**: Current load level
- **Metadata**: Last updated timestamp, version

#### Connection Properties
- **ID**: Unique identifier
- **From/To Node IDs**: Connected nodes
- **Type**: Automatic, Manual, Cable (future), Wireless (future)
- **Status**: Active, Inactive, Broken, Overloaded, Disconnected
- **Capacities**: Per-resource capacity limits
- **Flows**: Current per-resource flow
- **Distance**: Physical distance (for cable cost)
- **Priority**: Routing priority
- **Metadata**: Last updated timestamp, version

#### Graph Operations
- Add/remove nodes
- Add/remove connections
- Get neighbors
- Get shortest path
- Calculate graph statistics (node count, connection count, degree, components, diameter)
- Check connectivity

### 3. Flow Calculator (`lib/network/FlowCalculator.ts`)

#### Flow Algorithm
Generic algorithm that works for all resource types without hardcoding:

1. **Initialization**
   - Initialize flows for all nodes
   - Set default capacities

2. **Max Flow Calculation**
   - Iterative algorithm with convergence threshold
   - Distribute flow from producers to consumers
   - Update connection flows
   - Check for convergence

3. **Flow Distribution**
   - Identify producers (solar panels, batteries)
   - Identify consumers (GPUs, cooling)
   - Sort by priority
   - Distribute flow based on capacity and demand

4. **Connection Flow Update**
   - Calculate flow through each connection
   - Update utilization metrics

5. **Bottleneck Detection**
   - Identify nodes with high utilization
   - Mark as bottlenecks

6. **Disconnected Node Detection**
   - Find nodes with no connections
   - Mark as disconnected

#### Flow State
- **Flows**: Per-node flow results
- **Total Flow**: Sum of all flows
- **Total Capacity**: Sum of all capacities
- **Utilization**: Overall network utilization
- **Bottlenecks**: Set of bottleneck node IDs
- **Disconnected Nodes**: Set of disconnected node IDs

### 4. Failure Detector (`lib/network/FailureDetector.ts`)

#### Failure Types
- **Disconnected**: Node has no connections
- **Overloaded**: Node/connection utilization exceeds threshold
- **Broken Link**: Connection is broken
- **Insufficient Capacity**: Input exceeds capacity
- **Priority Switching**: High utilization with low priority

#### Detection Process
1. **Node Failures**
   - Check for disconnected nodes
   - Check for overloaded nodes
   - Check for insufficient capacity

2. **Connection Failures**
   - Check for broken links
   - Check for overloaded connections

3. **Priority Analysis**
   - Identify nodes needing priority adjustment
   - Suggest priority switches

#### Failure Severity
- **Critical**: Immediate attention required
- **High**: Urgent attention required
- **Medium**: Attention recommended
- **Low**: Informational

### 5. Connection Manager (`lib/network/ConnectionManager.ts`)

#### Connection Types
- **Automatic**: Auto-connected within distance
- **Manual**: Manually created by user
- **Cable**: Future - cable-based connections with cost
- **Wireless**: Future - wireless connections with extended range

#### Connection Operations
- Create automatic connections
- Create manual connections
- Create cable connections (future)
- Create wireless connections (future)
- Remove connections
- Auto-connect all nodes
- Auto-connect single node
- Optimize connections (remove redundant)

#### Connection Optimization
- Identifies redundant connections
- Removes connections with alternative paths
- Maintains network connectivity

### 6. Graph Optimizer (`lib/network/GraphOptimizer.ts`)

#### Optimization Strategies

1. **Isolated Node Removal**
   - Removes nodes with no connections
   - Preserves critical nodes

2. **Redundant Connection Removal**
   - Identifies connections with alternative paths
   - Removes while maintaining connectivity

3. **Adjacency List Optimization**
   - Rebuilds adjacency lists
   - Ensures consistency

4. **Data Structure Compaction**
   - Rebuilds maps to reduce fragmentation
   - Improves memory efficiency

5. **Spatial Partitioning**
   - Divides graph into spatial cells
   - Enables fast neighbor queries
   - Reduces search complexity

6. **Incremental Update**
   - Only recalculate flows for changed nodes
   - Propagates changes to affected nodes
   - Dramatically reduces calculation time

#### Performance Metrics
- Nodes optimized
- Connections optimized
-Time saved
- Memory saved

### 7. Resource Network Engine (`lib/network/ResourceNetworkEngine.ts`)

#### Core Engine
Coordinates all components with event-driven architecture:

- **Graph Model**: Manages nodes and connections
- **Flow Calculator**: Calculates resource flows
- **Failure Detector**: Detects network failures
- **Connection Manager**: Manages connections
- **Graph Optimizer**: Optimizes performance

#### Event System
- **Node Added**: Fired when node added
- **Node Removed**: Fired when node removed
- **Node Status Changed**: Fired when node status changes
- **Connection Added**: Fired when connection added
- **Connection Removed**: Fired when connection removed
- **Connection Status Changed**: Fired when connection status changes
- **Flow Changed**: Fired when flow changes
- **Failure Detected**: Fired when failure detected
- **Failure Resolved**: Fired when failure resolved
- **Bottleneck Detected**: Fired when bottleneck detected
- **Network Recalculated**: Fired after network update

#### Update Cycle
1. Get current graph
2. Recalculate flows (incremental if enabled)
3. Detect failures
4. Fire network recalculated event
5. Clear changed sets

#### Configuration
All parameters configurable:
- Connection distances
- Flow update interval
- Flow iteration limits
- Overload/failure thresholds
- Incremental update enablement
- Graph optimization enablement
- Cache enablement

### 8. Network Visualizer (`components/network/NetworkVisualizer.tsx`)

Developer tool for visualizing network:

#### Display Features
- **Network Graph**: Canvas-based visualization
- **Flow Indicators**: Show flow values on connections
- **Capacity Indicators**: Show capacity values
- **Bottleneck Highlighting**: Color-coded bottlenecks
- **Disconnected Node Highlighting**: Color-coded disconnected nodes
- **Node Selection**: Click to inspect node details
- **Zoom/Pan**: Navigate large networks

#### Controls
- Resource type selection (Power, Cooling, Network, Maintenance)
- Display toggles (Flow, Capacity, Bottlenecks, Disconnected)
- Zoom controls
- Statistics display

## Flow Algorithm

### Algorithm Steps

```
1. Initialize Flows
   For each node:
     - Set input = 0
     - Set output = 0
     - Set net = 0
     - Set capacity from config

2. Identify Producers and Consumers
   Producers: solar_panel, battery, power_generator
   Consumers: gpu, cooling, workshop, etc.

3. Sort by Priority
   Producers: Critical → High → Normal → Low
   Consumers: Critical → High → Normal → Low

4. Distribute Flow
   For each producer:
     - Set output = capacity
     - For each consumer:
       - Calculate demand = capacity - input
       - Flow = min(remaining, demand)
       - consumer.input += flow
       - consumer.output = input * 0.9 (10% loss)
       - consumer.net = output - input

5. Update Connection Flows
   For each connection:
     - flow = min(from.output, to.capacity - to.input)
     - connection.flows[resource] = flow

6. Check Convergence
   - If change < threshold, stop
   - Otherwise, repeat

7. Identify Bottlenecks
   - Nodes with utilization >= 0.9

8. Identify Disconnected
   - Nodes with no connections
```

### Complexity Analysis

- **Time Complexity**: O(V * E * I) where V = nodes, E = connections, I = iterations
- **Space Complexity**: O(V + E)
- **With Incremental Update**: O(V_affected * E_affected * I)

## Optimization Strategy

### Incremental Recalculation

Instead of recalculating the entire network:

1. **Track Changes**
   - Changed nodes set
   - Changed connections set

2. **Propagate Changes**
   - Find neighbors of changed nodes
   - Find nodes affected by changed connections
   - Build affected nodes set

3. **Partial Recalculation**
   - Only recalculate flows for affected nodes
   - Propagate changes through network
   - Update unaffected nodes from cache

### Spatial Partitioning

Divide graph into spatial cells for faster queries:

1. **Create Partition**
   - Divide space into cells (default 50x50)
   - Assign nodes to cells based on position

2. **Query**
   - Get nodes in specific cell
   - Get nodes in neighboring cells
   - Reduce search space dramatically

3. **Complexity**
   - Without partitioning: O(V)
   - With partitioning: O(V / cell_count)

### Graph Optimization

1. **Remove Isolated Nodes**
   - Nodes with no connections
   - Non-critical priority

2. **Remove Redundant Connections**
   - Connections with alternative paths
   - Maintain connectivity

3. **Compact Data Structures**
   - Rebuild maps periodically
   - Reduce memory fragmentation

## Future Multiplayer

### Server Authority

The architecture supports future server authority:

1. **Deterministic Flow**
   - All calculations use fixed parameters
   - No randomness in core algorithm
   - Reproducible results

2. **State Synchronization**
   - Network state snapshots
   - Incremental updates only
   - Version-based change detection

3. **Conflict Resolution**
   - Server has final authority
   - Client predictions for responsiveness
   - Rollback on server correction

### Implementation Path

1. **Phase 1: Client-Only**
   - Current implementation
   - All calculation on client
   - Local persistence

2. **Phase 2: Server Validation**
   - Client calculates flow
   - Server validates state
   - Corrections sent to client

3. **Phase 3: Server Authority**
   - Server calculates flow
   - Client receives state updates
   - Client runs interpolation

4. **Phase 4: Distributed Network**
   - Multiple servers for different regions
   - Network sharding by location
   - Cross-server synchronization

## Future Cables

### Cable System

Future implementation for cable-based connections:

1. **Cable Types**
   - Standard cable: Basic capacity
   - High-capacity cable: Increased capacity
   - Fiber optic: Network-only, very high capacity
   - Power cable: Power-only, high capacity

2. **Cable Properties**
   - Capacity per resource type
   - Cost per unit distance
   - Maximum length
   - Durability
   - Maintenance requirements

3. **Cable Placement**
   - Manual placement by user
   - Auto-routing with pathfinding
   - Cable cost calculation
   - Cable management UI

4. **Integration**
   - Connection manager already supports cable type
   - Flow calculator uses cable capacities
   - Failure detector checks cable status

## Future Districts

### District System

Future implementation for district-based organization:

1. **District Types**
   - Computing district: High power, high cooling
   - Storage district: High capacity, low activity
   - Maintenance district: Centralized maintenance
   - Power district: Power generation and distribution

2. **District Properties**
   - Boundary definition
   - Resource allocation
   - Priority levels
   - Inter-district connections

3. **District Management**
   - Create/merge/split districts
   - Resource allocation per district
   - District-level optimization
   - District failure isolation

4. **Integration**
   - Graph model supports district metadata
   - Flow calculator respects district boundaries
   - Failure detector isolates district failures

## Extension Points

### Adding New Resource Types

1. Add enum value to `ResourceType` in `types.ts`
2. Add configuration to `DEFAULT_RESOURCE_CONFIGS`
3. Update flow calculator if needed
4. No changes to core engine needed

### Adding New Connection Types

1. Add enum value to `ConnectionType` in `types.ts`
2. Implement creation method in `ConnectionManager`
3. Add type-specific logic if needed
4. No changes to core engine needed

### Adding New Failure Types

1. Add enum value to `FailureType` in `types.ts`
2. Add detection logic in `FailureDetector`
3. Add event type if needed
4. No changes to core engine needed

### Adding New Optimization Strategies

1. Add method to `GraphOptimizer`
2. Implement optimization logic
3. Call from `optimizeGraph` method
4. No changes to core engine needed

## Configuration

### Default Configuration

```typescript
{
  maxConnectionDistance: 100,
  autoConnect: true,
  autoConnectDistance: 50,
  
  flowUpdateInterval: 1000,
  maxFlowIterations: 100,
  flowConvergenceThreshold: 0.001,
  
  overloadThreshold: 0.9,
  failureThreshold: 0.95,
  
  enableIncrementalUpdate: true,
  enableGraphOptimization: true,
  cacheEnabled: true,
}
```

### Runtime Updates

Configuration can be updated at runtime:
```typescript
engine.updateConfig({
  flowUpdateInterval: 500,
  overloadThreshold: 0.85,
});
```

## Testing

### Manual Testing

1. Open `/network-test` page
2. Click "Add X Nodes" to populate network
3. Click "Start" to begin network updates
4. Use visualizer to inspect network graph
5. Select resource type to view different flows
6. Toggle display options
7. Test with 10000+ nodes to verify performance

### Performance Targets

- **1000 nodes**: < 10ms per update
- **5000 nodes**: < 30ms per update
- **10000 nodes**: < 60ms per update
- **Memory**: < 50MB for 10000 nodes
- **CPU**: < 30% for 10000 nodes

### Test Scenarios

- **Cold Start**: Add nodes, start updates
- **Hot Start**: Start updates, add nodes
- **Flow Changes**: Monitor flow changes
- **Failure Detection**: Test failure scenarios
- **Optimization**: Test optimization strategies
- **Large Scale**: Test with 10000+ nodes

## Integration with Other Systems

### Simulation Integration
- Simulation engine subscribes to network events
- Updates entity state based on network flow
- No direct coupling between systems

### Grid Integration
- Grid provides node positions
- Network uses positions for connections
- Grid receives network state via events

### Rendering Integration
- Renderer subscribes to network events
- Visualizes network state
- No direct coupling between systems

## Conclusion

The Resource Network Engine provides a robust, scalable foundation for resource flow simulation in FreeCoin Empire. The strict event-driven architecture ensures complete independence from other systems, while the configurable parameters and optimization strategies enable handling of 10000+ nodes efficiently. The architecture is designed for future multiplayer, cable systems, and district management without requiring refactoring.
