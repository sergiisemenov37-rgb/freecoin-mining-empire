/**
 * Simulation Pipeline
 * Executes simulation stages in sequence
 * Each stage is independent and can be optimized separately
 */

import type {
  SimulationEntity,
  SimulationConfig,
  PipelineContext,
  PipelineResult,
  PipelineStage,
  SimulationEvent,
  TemperatureChangedEvent,
  PowerChangedEvent,
  EfficiencyChangedEvent,
} from './types';
import {
  PipelineStage as StageEnum,
  SimulationEventType,
  normalizeTemperature,
  normalizeDurability,
  calculateEfficiency,
} from './types';

/**
 * Pipeline stage handler
 */
type StageHandler = (context: PipelineContext) => PipelineResult;

/**
 * Simulation pipeline class
 */
export class SimulationPipeline {
  private stages: Map<PipelineStage, StageHandler>;
  private events: SimulationEvent[] = [];

  constructor() {
    this.stages = new Map();
    this.registerStages();
  }

  /**
   * Register all pipeline stages
   */
  private registerStages(): void {
    this.stages.set(StageEnum.POWER, this.powerStage.bind(this));
    this.stages.set(StageEnum.HEAT, this.heatStage.bind(this));
    this.stages.set(StageEnum.EFFICIENCY, this.efficiencyStage.bind(this));
    this.stages.set(StageEnum.DURABILITY, this.durabilityStage.bind(this));
    this.stages.set(StageEnum.STATUS, this.statusStage.bind(this));
    this.stages.set(StageEnum.EVENTS, this.eventsStage.bind(this));
  }

  /**
   * Execute all pipeline stages for an entity
   */
  execute(
    entity: SimulationEntity,
    deltaTime: number,
    config: SimulationConfig
  ): PipelineResult[] {
    const context: PipelineContext = {
      entity,
      deltaTime,
      config,
      results: [],
    };

    const results: PipelineResult[] = [];

    // Execute stages in order
    for (const [stage, handler] of this.stages) {
      const result = handler(context);
      context.results.push(result);
      results.push(result);
    }

    return results;
  }

  /**
   * Power stage
   * Calculate power usage and generation
   */
  private powerStage(context: PipelineContext): PipelineResult {
    const { entity, deltaTime, config } = context;
    const oldPowerUsage = entity.powerUsage;
    const oldPowerGeneration = entity.powerGeneration;

    // Calculate power based on state and efficiency
    const efficiency = calculateEfficiency(entity, config);
    
    // Base power usage varies by entity type
    const basePowerUsage = this.getBasePowerUsage(entity.type);
    entity.powerUsage = basePowerUsage * efficiency;

    // Power generation (for batteries, solar panels, etc.)
    const basePowerGeneration = this.getBasePowerGeneration(entity.type);
    entity.powerGeneration = basePowerGeneration * efficiency;

    // Check for power dependency satisfaction
    this.checkPowerDependency(entity);

    const changes: Record<string, unknown> = {
      powerUsage: entity.powerUsage,
      powerGeneration: entity.powerGeneration,
    };

    // Generate event if power changed significantly
    if (Math.abs(entity.powerUsage - oldPowerUsage) > 10) {
      this.events.push({
        type: SimulationEventType.POWER_CHANGED,
        entityId: entity.id,
        timestamp: Date.now(),
        oldPowerUsage,
        newPowerUsage: entity.powerUsage,
        oldPowerGeneration,
        newPowerGeneration: entity.powerGeneration,
      } as any);
    }

    return {
      stage: StageEnum.POWER,
      entityId: entity.id,
      success: true,
      changes,
      timestamp: Date.now(),
    };
  }

  /**
   * Heat stage
   * Calculate temperature changes
   */
  private heatStage(context: PipelineContext): PipelineResult {
    const { entity, deltaTime, config } = context;
    const oldTemperature = entity.temperature;

    // Calculate heat generation based on power usage
    const heatGeneration = entity.powerUsage * 0.1;
    
    // Calculate cooling based on cooling dependencies
    const cooling = this.getCoolingAmount(entity);

    // Apply temperature change
    const temperatureChange = (heatGeneration - cooling) * (deltaTime / 1000);
    entity.temperature = normalizeTemperature(entity.temperature + temperatureChange);

    // Natural cooling towards ambient
    const ambientTemp = 25;
    const coolingRate = config.temperature.coolingRate * (deltaTime / 1000);
    if (entity.temperature > ambientTemp) {
      entity.temperature = normalizeTemperature(
        entity.temperature - coolingRate
      );
    }

    const changes: Record<string, unknown> = {
      temperature: entity.temperature,
    };

    // Generate event if temperature changed significantly
    if (Math.abs(entity.temperature - oldTemperature) > 5) {
      this.events.push({
        type: SimulationEventType.TEMPERATURE_CHANGED,
        entityId: entity.id,
        timestamp: Date.now(),
        oldTemperature,
        newTemperature: entity.temperature,
      } as any);
    }

    return {
      stage: StageEnum.HEAT,
      entityId: entity.id,
      success: true,
      changes,
      timestamp: Date.now(),
    };
  }

  /**
   * Efficiency stage
   * Calculate efficiency based on state and conditions
   */
  private efficiencyStage(context: PipelineContext): PipelineResult {
    const { entity, config } = context;
    const oldEfficiency = entity.efficiency;

    // Calculate efficiency based on state
    entity.efficiency = calculateEfficiency(entity, config);

    // Reduce efficiency if overheated
    if (entity.temperature > config.temperature.warning) {
      const overheatingFactor = (entity.temperature - config.temperature.warning) / 
                                (config.temperature.critical - config.temperature.warning);
      entity.efficiency *= (1 - overheatingFactor * 0.5);
    }

    // Reduce efficiency if durability is low
    if (entity.durability < 50) {
      const durabilityFactor = entity.durability / 50;
      entity.efficiency *= durabilityFactor;
    }

    const changes: Record<string, unknown> = {
      efficiency: entity.efficiency,
    };

    // Generate event if efficiency changed significantly
    if (Math.abs(entity.efficiency - oldEfficiency) > 0.1) {
      this.events.push({
        type: SimulationEventType.EFFICIENCY_CHANGED,
        entityId: entity.id,
        timestamp: Date.now(),
        oldEfficiency,
        newEfficiency: entity.efficiency,
      } as any);
    }

    return {
      stage: StageEnum.EFFICIENCY,
      entityId: entity.id,
      success: true,
      changes,
      timestamp: Date.now(),
    };
  }

  /**
   * Durability stage
   * Calculate durability decay and repair
   */
  private durabilityStage(context: PipelineContext): PipelineResult {
    const { entity, deltaTime, config } = context;
    const oldDurability = entity.durability;

    if (entity.state === 'repairing') {
      // Repair durability
      const repairAmount = config.durability.repairRate * (deltaTime / 1000);
      entity.durability = normalizeDurability(entity.durability + repairAmount);
      
      // Repair health
      entity.health = Math.min(100, entity.health + repairAmount);
    } else {
      // Decay durability based on state
      let decayRate = config.durability.decayRate;
      
      if (entity.state === 'overloaded') {
        decayRate *= 2;
      } else if (entity.state === 'overheated') {
        decayRate *= 3;
      }

      const decayAmount = decayRate * (deltaTime / 1000);
      entity.durability = normalizeDurability(entity.durability - decayAmount);
    }

    const changes: Record<string, unknown> = {
      durability: entity.durability,
      health: entity.health,
    };

    return {
      stage: StageEnum.DURABILITY,
      entityId: entity.id,
      success: true,
      changes,
      timestamp: Date.now(),
    };
  }

  /**
   * Status stage
   * Update entity status flags
   */
  private statusStage(context: PipelineContext): PipelineResult {
    const { entity, config } = context;

    entity.status.running = entity.state === 'running';
    entity.status.needsRepair = entity.health < 100 || entity.durability < 100;
    entity.status.needsPower = entity.powerUsage > entity.powerGeneration;
    entity.status.needsCooling = entity.temperature > config.temperature.warning;

    const changes: Record<string, unknown> = {
      status: entity.status,
    };

    return {
      stage: StageEnum.STATUS,
      entityId: entity.id,
      success: true,
      changes,
      timestamp: Date.now(),
    };
  }

  /**
   * Events stage
   * Collect and return generated events
   */
  private eventsStage(context: PipelineContext): PipelineResult {
    const { entity } = context;

    const changes: Record<string, unknown> = {
      eventCount: this.events.length,
    };

    return {
      stage: StageEnum.EVENTS,
      entityId: entity.id,
      success: true,
      changes,
      timestamp: Date.now(),
    };
  }

  /**
   * Get generated events and clear buffer
   */
  getEvents(): SimulationEvent[] {
    const events = [...this.events];
    this.events = [];
    return events;
  }

  /**
   * Get base power usage for entity type
   */
  private getBasePowerUsage(type: string): number {
    const powerUsageMap: Record<string, number> = {
      gpu: 150,
      battery: 5,
      solar_panel: 0,
      cooling: 50,
      workshop: 100,
      decoration: 10,
      robot_station: 200,
    };
    return powerUsageMap[type] || 50;
  }

  /**
   * Get base power generation for entity type
   */
  private getBasePowerGeneration(type: string): number {
    const powerGenMap: Record<string, number> = {
      gpu: 0,
      battery: 50,
      solar_panel: 100,
      cooling: 0,
      workshop: 0,
      decoration: 0,
      robot_station: 0,
    };
    return powerGenMap[type] || 0;
  }

  /**
   * Check power dependency satisfaction
   */
  private checkPowerDependency(entity: SimulationEntity): void {
    const powerDep = entity.dependencies.find(d => d.type === 'power');
    if (powerDep) {
      powerDep.satisfied = entity.powerGeneration >= entity.powerUsage;
    }
  }

  /**
   * Get cooling amount from dependencies
   */
  private getCoolingAmount(entity: SimulationEntity): number {
    const coolingDep = entity.dependencies.find(d => d.type === 'cooling');
    if (coolingDep && coolingDep.satisfied) {
      return 20; // Base cooling amount
    }
    return 5; // Natural cooling
  }

  /**
   * Execute stage for multiple entities (batch processing)
   */
  executeBatch(
    entities: SimulationEntity[],
    deltaTime: number,
    config: SimulationConfig
  ): Map<string, PipelineResult[]> {
    const results = new Map<string, PipelineResult[]>();

    for (const entity of entities) {
      const entityResults = this.execute(entity, deltaTime, config);
      results.set(entity.id, entityResults);
    }

    return results;
  }

  /**
   * Get stage by name
   */
  getStage(stage: PipelineStage): StageHandler | undefined {
    return this.stages.get(stage);
  }

  /**
   * Get all registered stages
   */
  getAllStages(): PipelineStage[] {
    return Array.from(this.stages.keys());
  }
}
