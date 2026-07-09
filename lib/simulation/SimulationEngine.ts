/**
 * Simulation Engine
 * Core simulation engine with configurable tick system
 * Completely independent from rendering
 * Supports 5000+ entities with incremental updates
 */

import type {
  SimulationEntity,
  SimulationConfig,
  SimulationState,
  SimulationEvent,
  SimulationEventListener,
  SimulationMetrics,
  EntityId,
  TickRate,
  SimulationTickEvent,
} from './types';
import {
  TickRate as TickRateEnum,
  SimulationEventType,
  DEFAULT_SIMULATION_CONFIG,
  EntityState,
} from './types';
import { StateMachine } from './StateMachine';
import { SimulationPipeline } from './Pipeline';
import { DependencySystem } from './DependencySystem';

/**
 * Simulation engine class
 */
export class SimulationEngine {
  private state: SimulationState;
  private config: SimulationConfig;
  private stateMachine: StateMachine;
  private pipeline: SimulationPipeline;
  private dependencySystem: DependencySystem;
  
  private eventListeners: Map<SimulationEventType, Set<SimulationEventListener>>;
  private tickInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  
  // Performance tracking
  private metrics: SimulationMetrics;
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private lastFpsUpdate: number = 0;
  
  // Incremental update optimization
  private changedEntities: Set<EntityId> = new Set();
  private entityVersions: Map<EntityId, number> = new Map();

  constructor(config?: Partial<SimulationConfig>) {
    this.config = { ...DEFAULT_SIMULATION_CONFIG, ...config };
    this.state = {
      entities: new Map(),
      config: this.config,
      tickNumber: 0,
      lastTickTime: 0,
      isRunning: false,
    };
    
    this.stateMachine = new StateMachine();
    this.pipeline = new SimulationPipeline();
    this.dependencySystem = new DependencySystem();
    
    this.eventListeners = new Map();
    
    this.metrics = {
      fps: 0,
      tickRate: this.config.tickRate,
      activeEntities: 0,
      changedEntities: 0,
      updateTime: 0,
      totalTime: 0,
      memoryUsage: 0,
    };
  }

  /**
   * Start simulation
   */
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.state.isRunning = true;
    this.lastFrameTime = performance.now();
    
    this.tickInterval = setInterval(() => {
      this.tick();
    }, this.config.tickRate);
  }

  /**
   * Stop simulation
   */
  stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    this.state.isRunning = false;
    
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  /**
   * Single simulation tick
   */
  tick(): void {
    const startTime = performance.now();
    const deltaTime = startTime - this.state.lastTickTime;
    
    this.state.tickNumber++;
    this.state.lastTickTime = startTime;
    
    // Update metrics
    this.updateMetrics(startTime, deltaTime);
    
    // Process entities (incremental update optimization)
    this.processEntities(deltaTime);
    
    // Fire tick event
    this.fireEvent({
      type: SimulationEventType.SIMULATION_TICK,
      timestamp: Date.now(),
      tickNumber: this.state.tickNumber,
      deltaTime,
      activeEntities: this.state.entities.size,
      changedEntities: this.changedEntities.size,
    } as any);
    
    // Clear changed entities for next tick
    this.changedEntities.clear();
    
    const endTime = performance.now();
    this.metrics.updateTime = endTime - startTime;
  }

  /**
   * Process all entities with incremental update optimization
   */
  private processEntities(deltaTime: number): void {
    const entities = Array.from(this.state.entities.values());
    
    // Only process entities that have changed or are active
    const entitiesToProcess = this.getEntitiesToProcess(entities);
    
    for (const entity of entitiesToProcess) {
      this.processEntity(entity, deltaTime);
    }
  }

  /**
   * Get entities that need processing
   * Incremental update optimization
   */
  private getEntitiesToProcess(entities: SimulationEntity[]): SimulationEntity[] {
    // Always process entities that changed in previous tick
    const changed = entities.filter(e => this.changedEntities.has(e.id));
    
    // Process active entities (running, overloaded, overheated)
    const active = entities.filter(e => 
      !this.changedEntities.has(e.id) && 
      (e.state === 'running' || e.state === 'overloaded' || e.state === 'overheated')
    );
    
    // Process entities with unsatisfied dependencies
    const dependent = entities.filter(e =>
      !this.changedEntities.has(e.id) &&
      !active.includes(e) &&
      e.dependencies.some(d => !d.satisfied)
    );
    
    return [...changed, ...active, ...dependent];
  }

  /**
   * Process single entity
   */
  private processEntity(entity: SimulationEntity, deltaTime: number): void {
    const oldVersion = entity.version;
    
    // Resolve dependencies
    this.dependencySystem.resolveDependencies(entity);
    
    // Execute pipeline
    const results = this.pipeline.execute(entity, deltaTime, this.config);
    
    // Update state machine
    const newState = this.stateMachine.determineNextState(entity, this.config);
    if (newState !== entity.state) {
      const transition = this.stateMachine.transition(
        entity,
        newState,
        this.stateMachine.getTransitionReason(entity, this.config, newState)
      );
      
      // Fire state changed event
      this.fireEvent({
        type: SimulationEventType.STATE_CHANGED,
        entityId: entity.id,
        timestamp: Date.now(),
        oldState: transition.from,
        newState: transition.to,
      } as any);
      
      // Check for failure/recovery
      if (newState === EntityState.BROKEN) {
        this.fireEvent({
          type: SimulationEventType.OBJECT_FAILED,
          entityId: entity.id,
          timestamp: Date.now(),
          failureReason: transition.reason,
          previousState: transition.from,
        } as any);
      } else if (transition.from === EntityState.BROKEN) {
        this.fireEvent({
          type: SimulationEventType.OBJECT_RECOVERED,
          entityId: entity.id,
          timestamp: Date.now(),
          recoveryReason: transition.reason,
          previousState: transition.from,
          newState: transition.to,
        } as any);
      }
    }
    
    // Update status
    this.stateMachine.updateStatus(entity, this.config);
    
    // Increment version and mark as changed
    entity.version++;
    entity.lastUpdated = Date.now();
    
    if (entity.version !== oldVersion) {
      this.changedEntities.add(entity.id);
      this.entityVersions.set(entity.id, entity.version);
    }
    
    // Fire pipeline events
    const pipelineEvents = this.pipeline.getEvents();
    for (const event of pipelineEvents) {
      this.fireEvent(event);
    }
  }

  /**
   * Add entity to simulation
   */
  addEntity(entity: SimulationEntity): void {
    this.state.entities.set(entity.id, entity);
    this.dependencySystem.addEntity(entity);
    this.entityVersions.set(entity.id, entity.version);
    this.changedEntities.add(entity.id);
  }

  /**
   * Remove entity from simulation
   */
  removeEntity(entityId: string): void {
    this.state.entities.delete(entityId);
    this.dependencySystem.removeEntity(entityId);
    this.entityVersions.delete(entityId);
    this.changedEntities.delete(entityId);
  }

  /**
   * Get entity by ID
   */
  getEntity(entityId: string): SimulationEntity | null {
    return this.state.entities.get(entityId) || null;
  }

  /**
   * Get all entities
   */
  getAllEntities(): SimulationEntity[] {
    return Array.from(this.state.entities.values());
  }

  /**
   * Update simulation configuration
   */
  updateConfig(config: Partial<SimulationConfig>): void {
    this.config = { ...this.config, ...config };
    this.state.config = this.config;
    this.metrics.tickRate = this.config.tickRate;
    
    // Restart simulation with new tick rate if running
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  /**
   * Set tick rate
   */
  setTickRate(tickRate: TickRate): void {
    this.updateConfig({ tickRate });
  }

  /**
   * Register event listener
   */
  on(eventType: SimulationEventType, listener: SimulationEventListener): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(listener);
  }

  /**
   * Unregister event listener
   */
  off(eventType: SimulationEventType, listener: SimulationEventListener): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Fire event to listeners
   */
  private fireEvent(event: SimulationEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      for (const listener of listeners) {
        listener(event);
      }
    }
  }

  /**
   * Update performance metrics
   */
  private updateMetrics(currentTime: number, deltaTime: number): void {
    this.frameCount++;
    
    // Update FPS every second
    if (currentTime - this.lastFpsUpdate >= 1000) {
      this.metrics.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFpsUpdate = currentTime;
      
      // Update memory usage (if available)
      if ((performance as any).memory) {
        this.metrics.memoryUsage = (performance as any).memory.usedJSHeapSize / 1024 / 1024;
      }
    }
    
    this.metrics.activeEntities = this.state.entities.size;
    this.metrics.changedEntities = this.changedEntities.size;
    this.metrics.totalTime = deltaTime;
  }

  /**
   * Get current metrics
   */
  getMetrics(): SimulationMetrics {
    return { ...this.metrics };
  }

  /**
   * Get simulation state
   */
  getState(): SimulationState {
    return {
      ...this.state,
      entities: new Map(this.state.entities),
    };
  }

  /**
   * Check if simulation is running
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Get tick number
   */
  getTickNumber(): number {
    return this.state.tickNumber;
  }

  /**
   * Reset simulation
   */
  reset(): void {
    this.stop();
    this.state.entities.clear();
    this.state.tickNumber = 0;
    this.state.lastTickTime = 0;
    this.changedEntities.clear();
    this.entityVersions.clear();
    this.dependencySystem.clear();
    
    this.metrics = {
      fps: 0,
      tickRate: this.config.tickRate,
      activeEntities: 0,
      changedEntities: 0,
      updateTime: 0,
      totalTime: 0,
      memoryUsage: 0,
    };
  }

  /**
   * Serialize simulation state for persistence
   */
  serialize(): string {
    const entities = Array.from(this.state.entities.values()).map(e => ({
      id: e.id,
      type: e.type,
      state: e.state,
      status: e.status,
      temperature: e.temperature,
      powerUsage: e.powerUsage,
      powerGeneration: e.powerGeneration,
      efficiency: e.efficiency,
      durability: e.durability,
      health: e.health,
      dependencies: e.dependencies,
      customProperties: e.customProperties,
      lastUpdated: e.lastUpdated,
      version: e.version,
    }));

    return JSON.stringify({
      config: this.config,
      tickNumber: this.state.tickNumber,
      entities,
    });
  }

  /**
   * Deserialize simulation state
   */
  static deserialize(data: string): SimulationEngine {
    const parsed = JSON.parse(data);
    const engine = new SimulationEngine(parsed.config);
    
    engine.state.tickNumber = parsed.tickNumber;
    
    for (const entityData of parsed.entities) {
      const entity: SimulationEntity = {
        ...entityData,
        dependencies: entityData.dependencies || [],
        customProperties: entityData.customProperties || {},
      };
      engine.addEntity(entity);
    }
    
    return engine;
  }

  /**
   * Get dependency system
   */
  getDependencySystem(): DependencySystem {
    return this.dependencySystem;
  }

  /**
   * Get state machine
   */
  getStateMachine(): StateMachine {
    return this.stateMachine;
  }

  /**
   * Get pipeline
   */
  getPipeline(): SimulationPipeline {
    return this.pipeline;
  }
}
