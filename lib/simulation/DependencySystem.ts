/**
 * Dependency System
 * Manages entity dependencies without hardcoding
 * Objects can depend on others (e.g., GPU needs Power, Cooling)
 */

import type {
  SimulationEntity,
  EntityDependency,
  DependencyType,
  SimulationEvent,
  DependencyChangedEvent,
} from './types';
import {
  DependencyType as DepType,
  SimulationEventType,
} from './types';

/**
 * Dependency graph
 */
export interface DependencyGraph {
  nodes: Map<string, SimulationEntity>;
  edges: Map<string, Set<string>>;
  reverseEdges: Map<string, Set<string>>;
}

/**
 * Dependency resolution result
 */
export interface DependencyResolution {
  entityId: string;
  dependencyType: DependencyType;
  satisfied: boolean;
  reason: string;
}

/**
 * Dependency system class
 */
export class DependencySystem {
  private graph: DependencyGraph;

  constructor() {
    this.graph = {
      nodes: new Map(),
      edges: new Map(),
      reverseEdges: new Map(),
    };
  }

  /**
   * Add entity to dependency graph
   */
  addEntity(entity: SimulationEntity): void {
    this.graph.nodes.set(entity.id, entity);
    this.graph.edges.set(entity.id, new Set());
    this.graph.reverseEdges.set(entity.id, new Set());
  }

  /**
   * Remove entity from dependency graph
   */
  removeEntity(entityId: string): void {
    this.graph.nodes.delete(entityId);
    
    // Remove edges
    const edges = this.graph.edges.get(entityId);
    if (edges) {
      for (const dependentId of edges) {
        const reverseEdges = this.graph.reverseEdges.get(dependentId);
        if (reverseEdges) {
          reverseEdges.delete(entityId);
        }
      }
    }
    
    this.graph.edges.delete(entityId);
    this.graph.reverseEdges.delete(entityId);
  }

  /**
   * Add dependency between entities
   */
  addDependency(
    fromEntityId: string,
    toEntityId: string,
    dependencyType: DependencyType
  ): void {
    const edges = this.graph.edges.get(fromEntityId);
    if (edges) {
      edges.add(toEntityId);
    }

    const reverseEdges = this.graph.reverseEdges.get(toEntityId);
    if (reverseEdges) {
      reverseEdges.add(fromEntityId);
    }
  }

  /**
   * Remove dependency between entities
   */
  removeDependency(
    fromEntityId: string,
    toEntityId: string
  ): void {
    const edges = this.graph.edges.get(fromEntityId);
    if (edges) {
      edges.delete(toEntityId);
    }

    const reverseEdges = this.graph.reverseEdges.get(toEntityId);
    if (reverseEdges) {
      reverseEdges.delete(fromEntityId);
    }
  }

  /**
   * Get all dependencies for an entity
   */
  getDependencies(entityId: string): Set<string> {
    return this.graph.edges.get(entityId) || new Set();
  }

  /**
   * Get all entities that depend on this entity
   */
  getDependents(entityId: string): Set<string> {
    return this.graph.reverseEdges.get(entityId) || new Set();
  }

  /**
   * Resolve dependencies for an entity
   */
  resolveDependencies(
    entity: SimulationEntity
  ): DependencyResolution[] {
    const resolutions: DependencyResolution[] = [];

    for (const dep of entity.dependencies) {
      const resolution = this.resolveDependency(entity, dep);
      resolutions.push(resolution);
      
      // Update dependency satisfaction
      dep.satisfied = resolution.satisfied;
    }

    return resolutions;
  }

  /**
   * Resolve single dependency
   */
  private resolveDependency(
    entity: SimulationEntity,
    dependency: EntityDependency
  ): DependencyResolution {
    switch (dependency.type) {
      case DepType.POWER:
        return this.resolvePowerDependency(entity, dependency);
      
      case DepType.COOLING:
        return this.resolveCoolingDependency(entity, dependency);
      
      case DepType.NETWORK:
        return this.resolveNetworkDependency(entity, dependency);
      
      case DepType.MAINTENANCE:
        return this.resolveMaintenanceDependency(entity, dependency);
      
      case DepType.CUSTOM:
        return this.resolveCustomDependency(entity, dependency);
      
      default:
        return {
          entityId: entity.id,
          dependencyType: dependency.type,
          satisfied: false,
          reason: 'Unknown dependency type',
        };
    }
  }

  /**
   * Resolve power dependency
   */
  private resolvePowerDependency(
    entity: SimulationEntity,
    dependency: EntityDependency
  ): DependencyResolution {
    const satisfied = entity.powerGeneration >= entity.powerUsage;
    
    return {
      entityId: entity.id,
      dependencyType: dependency.type,
      satisfied,
      reason: satisfied 
        ? 'Power generation meets usage' 
        : `Insufficient power (${entity.powerGeneration}W < ${entity.powerUsage}W)`,
    };
  }

  /**
   * Resolve cooling dependency
   */
  private resolveCoolingDependency(
    entity: SimulationEntity,
    dependency: EntityDependency
  ): DependencyResolution {
    // Check if entity has cooling dependencies satisfied
    const coolingDep = entity.dependencies.find(d => d.type === DepType.COOLING);
    const satisfied = coolingDep?.satisfied || entity.temperature < 70;
    
    return {
      entityId: entity.id,
      dependencyType: dependency.type,
      satisfied,
      reason: satisfied 
        ? 'Cooling adequate' 
        : 'Insufficient cooling',
    };
  }

  /**
   * Resolve network dependency
   */
  private resolveNetworkDependency(
    entity: SimulationEntity,
    dependency: EntityDependency
  ): DependencyResolution {
    // For now, assume network is always available
    // In future, check for network entities
    const satisfied = true;
    
    return {
      entityId: entity.id,
      dependencyType: dependency.type,
      satisfied,
      reason: satisfied ? 'Network available' : 'Network unavailable',
    };
  }

  /**
   * Resolve maintenance dependency
   */
  private resolveMaintenanceDependency(
    entity: SimulationEntity,
    dependency: EntityDependency
  ): DependencyResolution {
    const satisfied = entity.health >= 80 && entity.durability >= 80;
    
    return {
      entityId: entity.id,
      dependencyType: dependency.type,
      satisfied,
      reason: satisfied 
        ? 'Maintenance adequate' 
        : 'Maintenance required',
    };
  }

  /**
   * Resolve custom dependency
   */
  private resolveCustomDependency(
    entity: SimulationEntity,
    dependency: EntityDependency
  ): DependencyResolution {
    // Custom dependencies are resolved by custom logic
    // For now, assume unsatisfied
    return {
      entityId: entity.id,
      dependencyType: dependency.type,
      satisfied: false,
      reason: 'Custom dependency not resolved',
    };
  }

  /**
   * Check if entity has circular dependencies
   */
  hasCircularDependencies(entityId: string): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (currentId: string): boolean => {
      visited.add(currentId);
      recursionStack.add(currentId);

      const dependencies = this.getDependencies(currentId);
      for (const depId of dependencies) {
        if (!visited.has(depId)) {
          if (hasCycle(depId)) {
            return true;
          }
        } else if (recursionStack.has(depId)) {
          return true;
        }
      }

      recursionStack.delete(currentId);
      return false;
    };

    return hasCycle(entityId);
  }

  /**
   * Get dependency chain for an entity
   */
  getDependencyChain(entityId: string): string[] {
    const chain: string[] = [];
    const visited = new Set<string>();

    const traverse = (currentId: string): void => {
      if (visited.has(currentId)) return;
      visited.add(currentId);
      chain.push(currentId);

      const dependencies = this.getDependencies(currentId);
      for (const depId of dependencies) {
        traverse(depId);
      }
    };

    traverse(entityId);
    return chain;
  }

  /**
   * Get all entities that would be affected if this entity fails
   */
  getAffectedEntities(entityId: string): string[] {
    const affected: string[] = [];
    const visited = new Set<string>();

    const traverse = (currentId: string): void => {
      if (visited.has(currentId)) return;
      visited.add(currentId);
      affected.push(currentId);

      const dependents = this.getDependents(currentId);
      for (const depId of dependents) {
        traverse(depId);
      }
    };

    traverse(entityId);
    return affected;
  }

  /**
   * Validate dependency graph
   */
  validateGraph(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for circular dependencies
    for (const entityId of this.graph.nodes.keys()) {
      if (this.hasCircularDependencies(entityId)) {
        errors.push(`Circular dependency detected for entity: ${entityId}`);
      }
    }

    // Check for orphaned dependencies
    for (const [entityId, dependencies] of this.graph.edges) {
      for (const depId of dependencies) {
        if (!this.graph.nodes.has(depId)) {
          errors.push(`Orphaned dependency: ${entityId} depends on non-existent ${depId}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Create dependency changed event
   */
  createDependencyChangedEvent(
    entityId: string,

    dependencyType: DependencyType,
    satisfied: boolean
  ): DependencyChangedEvent {
    return {
      type: SimulationEventType.DEPENDENCY_CHANGED,
      entityId,
      timestamp: Date.now(),
      dependencyType,
      satisfied,
    };
  }

  /**
   * Get graph statistics
   */
  getGraphStats(): {
    nodeCount: number;
    edgeCount: number;
    avgDependencies: number;
    maxDependencies: number;
  } {
    let totalDependencies = 0;
    let maxDependencies = 0;

    for (const [_, dependencies] of this.graph.edges) {
      const count = dependencies.size;
      totalDependencies += count;
      maxDependencies = Math.max(maxDependencies, count);
    }

    const nodeCount = this.graph.nodes.size;
    const avgDependencies = nodeCount > 0 ? totalDependencies / nodeCount : 0;

    return {
      nodeCount,
      edgeCount: totalDependencies,
      avgDependencies,
      maxDependencies,
    };
  }

  /**
   * Clear all dependencies
   */
  clear(): void {
    this.graph.nodes.clear();
    this.graph.edges.clear();
    this.graph.reverseEdges.clear();
  }
}
