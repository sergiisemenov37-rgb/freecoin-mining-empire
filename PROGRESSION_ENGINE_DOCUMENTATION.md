# Progression Engine Documentation

## Overview

The Progression Engine is a comprehensive system that manages player progression across the entire game. It controls experience gain, level progression, empire tiers, unlocks, milestones, rewards, goals, and notifications. The system is fully configurable and designed to support years of future expansion without requiring hardcoded unlocks or mechanics.

## Architecture

### Core Systems

1. **Experience Engine** - Manages experience gain from multiple sources
2. **Level System** - Handles player level progression with rewards
3. **Tier System** - Manages empire tier progression with content unlocks
4. **Unlock Engine** - Controls unlocks for all game content
5. **Milestone System** - Tracks achievements across game metrics
6. **Reward Engine** - Distributes rewards of various types
7. **Goal Engine** - Calculates and manages dynamic objectives
8. **Notification System** - Displays progression events to players
9. **Progression Persistence** - Saves and restores progression state
10. **Progression Engine** - Central coordinator integrating all systems

### Event-Driven Design

All systems communicate via events, ensuring loose coupling and extensibility:

- `EXPERIENCE_GAINED` - Fired when experience is earned
- `LEVEL_UP` - Fired when player levels up
- `TIER_UP` - Fired when empire tiers up
- `UNLOCK_ACHIEVED` - Fired when content is unlocked
- `MILESTONE_COMPLETED` - Fired when milestone is reached
- `REWARD_GRANTED` - Fired when reward is given
- `GOAL_COMPLETED` - Fired when goal is completed
- `GOAL_UPDATED` - Fired when goal progress updates
- `NOTIFICATION_SENT` - Fired when notification is created

## Progression Flow

### 1. Experience Gain

```
Player Action → Experience Source → Multipliers → Experience Engine → XP Added
```

**Experience Sources:**
- Mining (base multiplier: 1.0x)
- Objectives (base multiplier: 1.5x)
- Achievements (base multiplier: 2.0x)
- Daily Tasks (base multiplier: 1.0x)
- Weekly Tasks (base multiplier: 2.0x)
- Battle Pass (base multiplier: 1.0x, disabled by default)
- Events (base multiplier: 1.5x, disabled by default)
- Social (base multiplier: 1.0x, disabled by default)
- Trading (base multiplier: 1.0x, disabled by default)
- Crafting (base multiplier: 1.0x, disabled by default)
- Research (base multiplier: 1.0x, disabled by default)
- Seasonal (base multiplier: 1.0x, disabled by default)
- Custom (base multiplier: 1.0x)

**Multipliers Applied:**
1. Base multiplier (source-specific)
2. Level multiplier (configurable)
3. Tier multiplier (configurable)
4. Seasonal multiplier (when applicable)

### 2. Level Calculation

```
Total XP → Formula → Required XP → Level Up → Rewards → Unlocks
```

**Experience Formulas:**
- **Linear**: `baseXP + (level * growthRate)`
- **Exponential**: `baseXP * (growthRate ^ level)` (default)
- **Logarithmic**: `baseXP * log(level + 1) * growthRate`
- **Custom**: Configurable function

**Level Rewards:**
- Currency (FreeCoin) - `level * 100`
- Experience (every 5 levels) - `level * 50`
- Hardware unlocks (at specific levels)
- Feature unlocks (at specific levels)

### 3. Tier Progression

```
Level + Empire Stats → Tier Requirements → Tier Up → Content Unlocks
```

**Tier Requirements:**
- Required Level: `tier * 10`
- Required Empire Value: `tier * 10,000`
- Required Hardware Count: `tier * 10`
- Required Power Generation: `tier * 1,000`

**Tier Names:**
1. Starter
2. Beginner
3. Apprentice
4. Journeyman
5. Expert
6. Master
7. Grandmaster
8. Legend
9. Mythic
10. Transcendent

**Tier Unlocks:**
- Buildings (Tier 2+)
- Hardware (Tier 3+)
- Districts (Tier 5+)
- Features (various tiers)

### 4. Unlock System

```
Prerequisites + Level/Tier → Unlock Check → Unlock → Content Available
```

**Unlock Types:**
- Buildings
- Hardware
- Research
- Robots
- Decorations
- Districts
- Features
- UI Elements
- Gameplay Systems
- Custom

**Unlock Chain:**
```
Root → Basic Unlocks → Intermediate Unlocks → Advanced Unlocks
```

**Visibility:**
- Unlocks become visible when prerequisites are met
- Hidden unlocks can be shown via configuration
- Auto-unlock when requirements are met (configurable)

## Unlock Architecture

### Unlock Tree Structure

The unlock system uses a tree structure to represent content dependencies:

```
Root
├── unlock_gpu_basic
│   ├── unlock_gpu_advanced (Level 5)
│   └── unlock_asic_basic (Level 10)
├── unlock_building_basic
│   └── unlock_building_advanced (Tier 2)
├── unlock_shop
│   ├── unlock_crafting (Level 5)
│   └── unlock_trading (Level 10)
└── unlock_ui_advanced (Level 2)
```

### Unlock Configuration

Each unlock has:
- **ID**: Unique identifier
- **Type**: Content category
- **Name**: Display name
- **Description**: What it unlocks
- **Item ID**: Specific item (if applicable)
- **Category**: Sub-category
- **Prerequisites**: Required unlock IDs
- **Required Level**: Minimum level (optional)
- **Required Tier**: Minimum tier (optional)
- **Auto Unlock**: Automatically unlock when requirements met
- **Visible**: Show in UI even if locked

### Unlock Dependencies

The system supports:
- **Linear chains**: A → B → C
- **Branching**: A → B, A → C
- **Convergence**: A → C, B → C
- **Complex trees**: Any combination

## Reward Pipeline

### Reward Types

1. **Currency** - FreeCoin, Premium, etc.
2. **Experience** - Direct XP gain
3. **Items** - Generic items
4. **Hardware** - Specific hardware instances
5. **Decorations** - Cosmetic items
6. **Blueprints** - Crafting recipes
7. **Titles** - Player titles
8. **Reputation** - Faction reputation
9. **Unlocks** - Content unlocks
10. **Features** - System features
11. **Custom** - Extensible custom rewards

### Reward Distribution Flow

```
Event Triggered → Reward Engine → Process Reward → Apply Effect → Notification
```

**Processing Steps:**
1. Validate reward type
2. Check requirements (if any)
3. Apply reward effect
4. Update reward history
5. Fire reward event
6. Create notification

### Reward Sources

- Level ups
- Tier ups
- Milestones
- Goals
- Achievements
- Battle Pass
- Events
- Custom

## Milestone System

### Milestone Types

- **Hardware Count** - Total hardware owned
- **Empire Value** - Total empire worth
- **Power Generation** - Power output
- **Mining Output** - Total FreeCoin mined
- **Research Count** - Research completed
- **Building Count** - Buildings owned
- **Robot Count** - Robots owned
- **District Count** - Districts owned
- **Decoration Count** - Decorations owned
- **Social Connections** - Friends/allies
- **Trade Volume** - Trading activity
- **Crafting Count** - Items crafted
- **Custom** - Extensible custom milestones

### Milestone Configuration

Each milestone has:
- **ID**: Unique identifier
- **Type**: Metric category
- **Name**: Display name
- **Description**: What it tracks
- **Target Value**: Goal to reach
- **Current Value**: Current progress
- **Category**: Sub-category
- **Rewards**: Rewards on completion
- **Unlocks**: Content unlocks
- **Repeatable**: Can be completed multiple times
- **Max Completions**: Limit for repeatable milestones

## Goal Engine

### Goal Types

- **Level** - Reach specific level
- **Tier** - Reach specific tier
- **Hardware Count** - Collect hardware
- **Empire Value** - Build empire worth
- **Mining Output** - Mine FreeCoin
- **Custom** - Extensible custom goals

### Goal Priorities

- **Critical** - Most important
- **High** - Important
- **Medium** - Normal priority
- **Low** - Optional

### Dynamic Goal Calculation

The Goal Engine automatically:
1. Generates potential goals based on current state
2. Filters out completed goals
3. Sorts by priority
4. Sets current recommended goal
5. Updates progress automatically
6. Completes when target reached

## Notification System

### Notification Types

- **Level Up** - Player reached new level
- **Tier Up** - Empire reached new tier
- **Unlock** - Content unlocked
- **Milestone** - Milestone completed
- **Reward** - Reward granted
- **Goal** - Goal completed
- **Achievement** - Achievement earned
- **System** - System messages
- **Custom** - Extensible custom notifications

### Notification Priority

- **Urgent** - Requires immediate attention
- **High** - Important
- **Medium** - Normal
- **Low** - Informational

### Notification Lifecycle

```
Event → Create Notification → Display → Mark Read → Expire → Cleanup
```

**Expiry:** 24 hours (configurable)
**Max Notifications:** 50 (configurable)

## Persistence

### State Structure

The complete progression state includes:
- Player ID
- Empire ID
- Experience state (XP, sources, overflow)
- Level state (current level, history)
- Tier state (current tier, history)
- Unlock state (unlocked IDs, visible IDs)
- Milestone state (completed IDs, values)
- Reward state (claimed rewards, pending)
- Goal state (active goals, history)
- Notification state (notifications, unread count)
- Version
- Timestamps

### Storage

- **Default**: LocalStorage
- **Extensible**: Custom storage implementations
- **Auto-save**: Configurable (default: 1 minute)
- **Version Support**: Migration system for schema changes

### Save/Load Flow

```
Save: State → Serialize → Version → Storage
Load: Storage → Parse → Version Check → Migrate → Deserialize → Restore
```

## Future Features

### Prestige System

**Concept:** Reset progression for permanent bonuses

**Implementation:**
- Prestige currency earned from total XP
- Prestige levels unlock permanent multipliers
- Prestige bonuses apply to all future progression
- Multiple prestige tiers with increasing requirements

**Architecture:**
- Extend Experience Engine with prestige tracking
- Add prestige currency to Reward Engine
- Create Prestige System as new progression layer
- Prestige bonuses as multipliers in config

### Seasonal System

**Concept:** Time-limited content with seasonal XP

**Implementation:**
- Seasonal XP pool separate from main XP
- Season-specific unlocks and rewards
- Season pass with progression tiers
- Seasonal events with bonus XP

**Architecture:**
- Extend Experience Engine with seasonal tracking
- Add seasonal XP sources
- Create Season System for season management
- Season pass as reward system extension

### Battle Pass

**Concept:** Tiered reward system with free and premium tracks

**Implementation:**
- Battle pass XP separate from main XP
- Free and premium reward tracks
- Seasonal battle passes
- Battle pass tiers with increasing requirements

**Architecture:**
- Extend Experience Engine with battle pass XP
- Create Battle Pass System
- Battle pass tiers as milestone system extension
- Premium track as reward system extension

### Alliance System

**Concept:** Group progression with shared goals

**Implementation:**
- Alliance XP shared among members
- Alliance levels and tiers
- Alliance-specific unlocks
- Shared goals and milestones

**Architecture:**
- Create Alliance Progression Engine
- Shared state management
- Alliance-specific reward distribution
- Alliance goals as goal system extension

## Configuration

### Experience Configuration

```typescript
{
  experienceSources: Map<ExperienceSource, ExperienceSourceConfig>,
  experienceFormula: ExperienceFormulaConfig,
  maxLevel: number,
  maxTier: number,
}
```

### Unlock Configuration

```typescript
{
  autoUnlock: boolean,
  showHiddenUnlocks: boolean,
}
```

### Milestone Configuration

```typescript
{
  milestoneRefreshInterval: number,
}
```

### Goal Configuration

```typescript
{
  goalUpdateInterval: number,
  maxActiveGoals: number,
}
```

### Notification Configuration

```typescript
{
  notificationExpiry: number,
  maxNotifications: number,
}
```

### Persistence Configuration

```typescript
{
  autoSave: boolean,
  autoSaveInterval: number,
  version: number,
}
```

## Developer Tools

### Progression Debugger

The Progression Debugger provides:
- **Overview Tab**: Current progress, XP editing, save/load/reset
- **Unlocks Tab**: Unlock tree visualization, all unlocks status
- **Rewards Tab**: Next level/tier rewards, reward history
- **Goals Tab**: Current goal, active goals, goal history

**Features:**
- Real-time state monitoring
- XP editing for testing
- Unlock tree visualization
- Reward preview
- Save/load state management
- Reset functionality

## Integration

### With Gameplay Systems

The Progression Engine integrates with:
- **Gameplay Engine** - Experience from objectives
- **Mining System** - Experience from mining
- **Economy System** - Currency rewards
- **Hardware System** - Hardware rewards
- **Empire System** - Empire stats for tier calculation

### Event Integration

Systems listen to progression events:
- Level up → Grant rewards, create notifications
- Tier up → Grant rewards, unlock content
- Unlock achieved → Create notifications
- Milestone completed → Grant rewards
- Goal completed → Grant rewards
- Reward granted → Create notifications

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**: Load unlock tree on demand
2. **Batch Updates**: Process multiple events together
3. **Debouncing**: Limit goal update frequency
4. **Caching**: Cache calculated values
5. **Cleanup**: Remove expired notifications periodically

### Scalability

The system is designed to support:
- **Millions of players**: Efficient state management
- **Years of content**: Extensible architecture
- **Complex unlock chains**: Tree-based structure
- **Dynamic goals**: Automatic calculation
- **Real-time updates**: Event-driven design

## Security

### State Validation

- Validate all state on load
- Check for corrupted data
- Version migration for compatibility
- Rollback on errors

### Anti-Exploit Prevention

- Server-side validation (when applicable)
- Rate limiting on XP gain
- Maximum value caps
- Audit trail for changes

## Testing

### Unit Testing

Test each system independently:
- Experience calculation formulas
- Level progression logic
- Tier requirement checks
- Unlock dependency resolution
- Reward processing
- Goal calculation
- Notification creation

### Integration Testing

Test system interactions:
- Experience → Level → Reward flow
- Level → Tier → Unlock flow
- Goal → Reward → Notification flow
- Save/Load state persistence

### End-to-End Testing

Test complete progression:
- New player to max level
- Unlock tree traversal
- Milestone completion
- Goal achievement
- State persistence

## Migration Guide

### Version 1 to Version 2

When updating the progression system:
1. Update version number in config
2. Implement migration function in ProgressionPersistence
3. Test migration with old state
4. Deploy with fallback to old version
5. Monitor for issues
6. Remove old version after validation

## Best Practices

### Adding New Unlocks

1. Define unlock in UnlockEngine
2. Set prerequisites correctly
3. Configure level/tier requirements
4. Test unlock chain
5. Add to documentation

### Adding New Rewards

1. Define reward type in RewardEngine
2. Implement processing logic
3. Add to reward configuration
4. Test reward distribution
5. Update documentation

### Adding New Milestones

1. Define milestone in MilestoneSystem
2. Set target value
3. Configure rewards
4. Test milestone completion
5. Update documentation

### Adding New Goals

1. Define goal type in GoalEngine
2. Implement value calculation
3. Configure priority
4. Test goal progression
5. Update documentation

## Troubleshooting

### Common Issues

**XP not adding:**
- Check experience source is enabled
- Verify multipliers are correct
- Check event listener is registered

**Level not increasing:**
- Verify XP formula calculation
- Check max level limit
- Ensure level up event fires

**Unlock not appearing:**
- Check prerequisites are met
- Verify level/tier requirements
- Check visibility configuration

**Reward not granted:**
- Verify reward type is supported
- Check processing logic
- Ensure event fires

**Goal not updating:**
- Check auto-update is enabled
- Verify value calculation
- Ensure update interval is correct

## Conclusion

The Progression Engine provides a robust, extensible system for managing player progression across the entire game. Its event-driven architecture, configurable design, and comprehensive feature set ensure it can support years of future expansion without requiring architectural changes.

The system is designed to be:
- **Flexible**: Everything is configurable
- **Extensible**: Easy to add new content types
- **Performant**: Optimized for scale
- **Maintainable**: Clean architecture with clear separation of concerns
- **Testable**: Each system can be tested independently
- **Documented**: Comprehensive documentation for all features
