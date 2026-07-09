/**
 * Simulation State Machine
 * Manages entity state transitions
 * Independent from rendering and simulation pipeline
 */

import type {
  SimulationEntity,
  EntityState,
  SimulationConfig,
  SimulationEvent,
  StateChangedEvent,
  ObjectFailedEvent,
  ObjectRecoveredEvent,
} from './types';
import {
  EntityState as StateEnum,
  SimulationEventType,
  isEntityValid,
  isEntityOperational,
  needsCooling,
  needsPower,
} from './types';

/**
 * State transition result
 */
export interface StateTransition {
  from: EntityState;
  to: EntityState;
  reason: string;
  timestamp: number;
}

/**
 * State machine class
 */
export class StateMachine {
  /**
   * Determine next state based on entity condition
   */
  determineNextState(
    entity: SimulationEntity,
    config: SimulationConfig
  ): EntityState {
    // Check if entity is broken
    if (entity.health <= 0 || entity.durability <= 0) {
      return StateEnum.BROKEN;
    }

    // Check if entity is disabled
    if (entity.status.disabled) {
      return StateEnum.DISABLED;
    }

    // Check if entity is repairing
    if (entity.state === StateEnum.REPAIRING) {
      if (entity.health >= 100 && entity.durability >= 100) {
        return StateEnum.IDLE;
      }
      return StateEnum.REPAIRING;
    }

    // Check if entity is overheated
    if (entity.temperature >= config.temperature.critical) {
      return StateEnum.OVERHEATED;
    }

    // Check if entity is overloaded
    if (entity.powerUsage > config.power.critical) {
      return StateEnum.OVERLOADED;
    }

    // Check if entity needs repair
    if (entity.status.needsRepair) {
      return StateEnum.REPAIRING;
    }

    // Check if entity can run
    if (isEntityOperational(entity)) {
      return StateEnum.RUNNING;
    }

    // Default to idle
    return StateEnum.IDLE;
  }

  /**
   * Transition entity to new state
   */
  transition(
    entity: SimulationEntity,
    newState: EntityState,
    reason: string
  ): StateTransition {
    const oldState = entity.state;
    entity.state = newState;

    return {
      from: oldState,
      to: newState,
      reason,
      timestamp: Date.now(),
    };
  }

  /**
   * Check if transition is valid
   */
  isValidTransition(from: EntityState, to: EntityState): boolean {
    // All transitions are valid in this flexible system
    // Specific rules can be added here if needed
    return true;
  }

  /**
   * Get transition reason
   */
  getTransitionReason(
    entity: SimulationEntity,
    config: SimulationConfig,
    newState: EntityState
  ): string {
    switch (newState) {
      case StateEnum.BROKEN:
        if (entity.health <= 0) return 'Health depleted';
        if (entity.durability <= 0) return 'Durability depleted';
        return 'Critical failure';

      case StateEnum.DISABLED:
        return 'Manually disabled';

      case StateEnum.REPAIRING:
        if (entity.status.needsRepair) return 'Repair required';
        return 'Initiating repair';

      case StateEnum.OVERHEATED:
        return `Temperature critical (${entity.temperature.toFixed(1)}°C)`;

      case StateEnum.OVERLOADED:
        return `Power overload (${entity.powerUsage.toFixed(1)}W)`;

      case StateEnum.RUNNING:
        return 'Operational';

      case StateEnum.IDLE:
        return 'Idle';

      default:
        return 'Unknown reason';
    }
  }

  /**
   * Create state changed event
   */
  createStateChangedEvent(
    entityId: string,
    oldState: EntityState,
    newState: EntityState,
    reason: string
  ): StateChangedEvent {
    return {
      type: SimulationEventType.STATE_CHANGED,
      entityId,
      timestamp: Date.now(),
      oldState,
      newState,
    };
  }

  /**
   * Create object failed event
   */
  createObjectFailedEvent(
    entityId: string,
    previousState: EntityState,
    reason: string
  ): ObjectFailedEvent {
    return {
      type: SimulationEventType.OBJECT_FAILED,
      entityId,
      timestamp: Date.now(),
      failureReason: reason,
      previousState,
    };
  }

  /**
   * Create object recovered event
   */
  createObjectRecoveredEvent(
    entityId: string,
    previousState: EntityState,
    newState: EntityState,
    reason: string
  ): ObjectRecoveredEvent {
    return {
      type: SimulationEventType.OBJECT_RECOVERED,
      entityId,
      timestamp: Date.now(),
      recoveryReason: reason,
      previousState,
      newState,
    };
  }

  /**
   * Update entity status based on state
   */
  updateStatus(entity: SimulationEntity, config: SimulationConfig): void {
    entity.status.running = entity.state === StateEnum.RUNNING;
    entity.status.needsRepair = entity.health < 100 || entity.durability < 100;
    entity.status.needsPower = needsPower(entity, config);
    entity.status.needsCooling = needsCooling(entity, config);
  }

  /**
   * Get all possible transitions from current state
   */
  getPossibleTransitions(currentState: EntityState): EntityState[] {
    const allStates = Object.values(StateEnum);
    return allStates.filter(state => state !== currentState);
  }

  /**
   * Check if entity can transition to target state
   */
  canTransitionTo(entity: SimulationEntity, targetState: EntityState): boolean {
    // Broken entities can only transition to repairing
    if (entity.state === StateEnum.BROKEN) {
      return targetState === StateEnum.REPAIRING;
    }

    // Repairing entities can only transition to idle when complete
    if (entity.state === StateEnum.REPAIRING) {
      return targetState === StateEnum.IDLE;
    }

    // All other transitions are valid
    return true;
  }
}
