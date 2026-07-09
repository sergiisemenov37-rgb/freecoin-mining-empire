# Research System Documentation

## Overview

The Research System is a complete technology tree implementation with unlimited categories, configurable costs, dependencies, and support for 1000+ technologies. It features tree-based research graph, research points as a resource, research queue with time calculation, research laboratories with speed modifiers, and full integration with the Progression Engine for unlocks.

## Architecture

### Core Systems

1. **Research Graph** - Tree-based research graph with dependencies and node management
2. **Research Points** - Research points as a resource with earning and spending
3. **Research Queue** - Research queue with time calculation and parallel research support
4. **Research Laboratories** - Research laboratories with speed modifiers
5. **Research System** - Central coordinator integrating all subsystems
6. **Research Persistence** - Saves and restores research state with version support
7. **Research Developer Tools** - Developer tool with tree visualization

### Event-Driven Design

All systems communicate via events:
- `RESEARCH_STARTED` - Fired when research starts
- `RESEARCH_FINISHED` - Fired when research completes
- `RESEARCH_CANCELLED` - Fired when research is cancelled
- `RESEARCH_PAUSED` - Fired when research is paused
- `RESEARCH_RESUMED` - Fired when research is resumed
- `POINTS_EARNED` - Fired when research points are earned
- `POINTS_SPENT` - Fired when research points are spent
- `LABORATORY_BUILT` - Fired when laboratory is built
- `LABORATORY_UPGRADED` - Fired when laboratory is upgraded
- `LABORATORY_DESTROYED` - Fired when laboratory is destroyed
- `UNLOCK_GRANTED` - Fired when an unlock is granted
- `CATEGORY_UNLOCKED` - Fired when a category is unlocked

## Research Categories

### Available Categories

1. **Hardware** - Hardware technologies and improvements
2. **Mining** - Mining efficiency and algorithms
3. **Energy** - Power generation and efficiency
4. **Network** - Network bandwidth and protocols
5. **Automation** - Automation and robotics
6. **AI** - Artificial intelligence and machine learning
7. **Materials** - Advanced materials and alloys
8. **Construction** - Building and construction technologies
9. **Defense** - Security and defense systems
10. **Exploration** - Exploration and discovery
11. **Custom** - Custom categories

### Category Benefits

Categories allow for:
- Organized technology tree
- Category-specific laboratory bonuses
- Targeted research focus
- Flexible expansion

## Research Graph

### Node Structure

Each research node has:
- **Unique ID** - Identifier for the node
- **Name** - Display name
- **Description** - Detailed description
- **Category** - Research category
- **Dependencies** - IDs of prerequisite nodes
- **Required Level** - Required player level (optional)
- **Required Tier** - Required empire tier (optional)
- **Cost** - Research points and resources
- **Research Time** - Base time to research
- **State** - Current state (locked, available, in progress, completed)
- **Progress** - Research progress (0-1)
- **Unlocks** - Unlock IDs granted on completion
- **Rewards** - Research rewards
- **Position** - Visual position for tree visualization

### Node States

- **LOCKED** - Dependencies not met
- **AVAILABLE** - Dependencies met, can start research
- **IN_PROGRESS** - Currently being researched
- **COMPLETED** - Research finished

### Dependency System

```
Node A → Node B → Node C
         ↓
      Node D
```

**Dependency Rules:**
- All dependencies must be completed before node becomes available
- Dependencies can be multiple (AND logic)
- Dependencies form a directed acyclic graph (DAG)
- Circular dependencies are not allowed

### Tree Visualization

The research tree is visualized as:
- Root nodes (no dependencies)
- Child nodes (depend on parent)
- Expandable/collapsible branches
- Color-coded states
- Position-based layout

## Research Points

### Point System

Research points are a resource earned from:
- **Mining** - Points from mining operations
- **Buildings** - Points from research buildings
- **Achievements** - Points from achievements
- **Quests** - Points from quests
- **Events** - Points from special events
- **Laboratories** - Points from laboratory generation

### Point Calculation

```
Total Points = Earned Points
Available Points = Total Points - Spent Points
```

**Earning:**
```
Earned Points = Base Points × Multiplier
```

**Spending:**
```
Spent Points = Sum of Research Costs
```

### Point Sources

Each source has:
- **Source Type** - Type of source
- **Source ID** - Identifier for the source
- **Amount** - Points earned
- **Timestamp** - When earned

## Research Queue

### Queue Management

The research queue supports:
- **Multiple items** - Up to configurable limit
- **Priority** - Order of research
- **Pause/Resume** - Control research progress
- **Cancellation** - Cancel with refund
- **Time calculation** - Based on speed modifiers

### Time Calculation

```
Actual Time = Base Time / (Base Speed × Speed Multiplier × Laboratory Bonus)
```

**Speed Modifiers:**
- Base research speed (configurable)
- Research speed multiplier (configurable)
- Laboratory speed bonus (per laboratory)
- Category bonus (per category)

### Parallel Research

Future support for:
- Multiple concurrent research
- Laboratory parallel capacity
- Priority-based scheduling

## Research Laboratories

### Laboratory Properties

Each laboratory has:
- **Unique ID** - Identifier
- **Name** - Display name
- **Level** - Current level
- **Max Level** - Maximum level
- **Base Speed Multiplier** - Base speed bonus
- **Current Speed Multiplier** - Current speed bonus
- **Max Parallel Research** - Parallel research capacity
- **Category Bonus** - Category-specific bonuses
- **Building ID** - Associated building

### Laboratory Effects

**Speed Bonus:**
```
Total Speed Multiplier = 1 + Σ (Laboratory Speed - 1)
```

**Parallel Bonus:**
```
Total Parallel Research = Base Parallel + Σ (Laboratory Parallel - 1)
```

**Category Bonus:**
```
Category Bonus = Σ Laboratory Category Bonus
```

### Laboratory Upgrades

Upgrading a laboratory:
- Increases level
- Increases speed multiplier
- May increase parallel capacity
- Improves category bonuses

## Integration

### With Progression Engine

Research integrates with progression through:
- **Unlock Grants** - Research grants unlocks
- **Unlock Events** - Fired on research completion
- **Progression Triggers** - Research triggers progression
- **Achievement Integration** - Research achievements

### Unlock System

When research completes:
1. Fire `UNLOCK_GRANTED` event for each unlock
2. Progression Engine receives event
3. Unlock is granted to player
4. New content becomes available

## Configuration

### Research Points Configuration

```typescript
{
  basePointsPerTick: 1,
  pointsMultiplier: 1.0,
}
```

### Research Time Configuration

```typescript
{
  baseResearchSpeed: 1.0,
  researchSpeedMultiplier: 1.0,
}
```

### Queue Configuration

```typescript
{
  maxQueueSize: 10,
  maxParallelResearch: 1,
}
```

### Laboratory Configuration

```typescript
{
  laboratorySpeedBonus: 0.2,
  laboratoryParallelBonus: 1,
}
```

### Performance Configuration

```typescript
{
  maxNodes: 1000,
  maxLaboratories: 100,
  incrementalUpdate: true,
  updateBatchSize: 50,
}
```

## Developer Tools

### Research Developer Tools

The Research Developer Tools provides a comprehensive interface with four tabs:

**Tree Tab:**
- Research tree visualization
- Expandable/collapsible nodes
- Color-coded states
- Node details panel
- Start/cancel research actions

**Queue Tab:**
- Research queue view
- Active/paused status
- Estimated completion times
- Priority display

**Points Tab:**
- Total points
- Available points
- Spent points
- Earned points

**Labs Tab:**
- Laboratory list
- Laboratory details
- Upgrade actions
- Total bonuses display

## Persistence

### State Structure

The complete research state includes:
- Research graph (all nodes)
- Research points (total, available, spent, earned)
- Research queue (active research)
- Laboratories (all laboratories)
- Version
- Timestamps

### Storage

- **Default**: LocalStorage
- **Extensible**: Custom storage implementations
- **Auto-save**: Configurable (default: 60s)
- **Version Support**: Migration system for schema changes

## Best Practices

### Adding Research Nodes

1. Define node with dependencies
2. Set cost and research time
3. Configure unlocks and rewards
4. Add to research graph
5. Test dependency resolution
6. Update documentation

### Adding Research Categories

1. Add category to enum
2. Update category map
3. Configure category bonuses
4. Update laboratory system
5. Update documentation

### Optimizing Performance

1. Use incremental updates
2. Batch node operations
3. Cache tree calculations
4. Limit queue size
5. Profile regularly

## Future Features

### Advanced Research

**Collaborative Research:**
- Multi-empire research projects
- Shared research costs
- Distributed research time
- Collaborative bonuses

**Research Specialization:**
- Empire research focus
- Category specialization
- Specialization bonuses
- Focus switching

**Research Trading:**
- Trade research nodes
- Share completed research
- Research alliances
- Technology transfer

### Enhanced Laboratories

**Laboratory Types:**
- Basic Laboratory - General research
- Specialized Laboratory - Category bonus
- Advanced Laboratory - Higher speed
- Quantum Laboratory - Quantum research

**Laboratory Modules:**
- Speed modules - Increase speed
- Parallel modules - Increase parallel capacity
- Category modules - Category bonuses
- Efficiency modules - Reduce costs

### AI Research

**AI-Assisted Research:**
- AI research suggestions
- Auto-research optimization
- Predictive research paths
- AI-generated research nodes

**Machine Learning:**
- Research pattern learning
- Optimal path calculation
- Cost prediction
- Time estimation

### Research Events

**Random Events:**
- Research breakthroughs
- Research setbacks
- Discovery events
- Research anomalies

**Seasonal Events:**
- Seasonal research bonuses
- Limited-time research
- Event-specific nodes
- Seasonal categories

### Research Customization

**Custom Nodes:**
- Player-created nodes
- Community nodes
- Mod support
- Custom categories

**Research Mods:**
- Custom research trees
- Alternative dependencies
- Custom costs
- Mod integration

## Troubleshooting

### Common Issues

**Research not starting:**
- Check points are sufficient
- Verify node is available
- Check queue size limit
- Verify dependencies are met

**Research not completing:**
- Check queue is not paused
- Verify speed multiplier
- Check laboratory status
- Verify time calculation

**Dependencies not resolving:**
- Check dependency IDs are correct
- Verify prerequisite nodes are completed
- Check for circular dependencies
- Verify node state updates

**Points not earning:**
- Check point sources are active
- Verify multiplier is correct
- Check auto-earning is enabled
- Verify point calculation

## Conclusion

The Research System provides a robust, extensible framework for managing technology trees with unlimited categories, configurable costs, and dependencies. Its event-driven architecture, configurable design, and integration with the Progression Engine ensure it can support 1000+ technologies. The system is designed to be:
- **Configurable**: Everything is configurable
- **Extensible**: Easy to add new nodes and categories
- **Integratable**: Works with Progression Engine
- **Performant**: Optimized for large numbers of nodes
- **Observable**: Comprehensive events for monitoring
- **Documented**: Complete documentation for all features
