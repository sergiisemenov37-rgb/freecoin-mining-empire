/**
 * Failure Detector
 * Detects network failures and issues
 * Generic system that works for all resource types
 */

import type {
  NetworkGraph,
  NetworkNode,
  NetworkConnection,
  ResourceType,
  NetworkFailure,
  FailureType,
  NetworkConfig,
  NetworkFlowState,
} from './types';
import {
  FailureType as FailureTypeEnum,
  calculateUtilization,
} from './types';

/**
 * Failure detection result
 */
export interface FailureDetectionResult {
  failures: NetworkFailure[];
  criticalFailures: NetworkFailure[];
  warnings: NetworkFailure[];
}

/**
 * Failure detector class
 */
export class FailureDetector {
  private config: NetworkConfig;

  constructor(config?: Partial<NetworkConfig>) {
    this.config = {
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
      ...config,
    };
  }

  /**
   * Detect all failures in the network
   */
  detectFailures(
    graph: NetworkGraph,
    flowStates: Map<ResourceType, NetworkFlowState>
  ): FailureDetectionResult {
    const failures: NetworkFailure[] = [];
    const criticalFailures: NetworkFailure[] = [];
    const warnings: NetworkFailure[] = [];

    // Detect node failures
    for (const [nodeId, node] of graph.nodes) {
      const nodeFailures = this.detectNodeFailures(node, flowStates);
      for (const failure of nodeFailures) {
        failures.push(failure);
        if (failure.severity === 'critical') {
          criticalFailures.push(failure);
        } else if (failure.severity === 'high') {
          warnings.push(failure);
        }
      }
    }

    // Detect connection failures
    for (const connection of graph.connections.values()) {
      const connectionFailures = this.detectConnectionFailures(connection, flowStates);
      for (const failure of connectionFailures) {
        failures.push(failure);
        if (failure.severity === 'critical') {
          criticalFailures.push(failure);
        } else if (failure.severity === 'high') {
          warnings.push(failure);
        }
      }
    }

    return {
      failures,
      criticalFailures,
      warnings,
    };
  }

  /**
   * Detect failures for a single node
   */
  private detectNodeFailures(
    node: NetworkNode,
    flowStates: Map<ResourceType, NetworkFlowState>
  ): NetworkFailure[] {
    const failures: NetworkFailure[] = [];

    // Check for disconnected nodes
    if (node.connections.size === 0) {
      failures.push({
        type: FailureTypeEnum.DISCONNECTED,
        nodeId: node.id,
        resourceType: 'power' as ResourceType, // Default to power
        timestamp: Date.now(),
        reason: 'Node has no connections',
        severity: 'high',
      });
    }

    // Check for overloaded nodes
    for (const [resourceType, flow] of node.resources) {
      const utilization = calculateUtilization(flow.output, flow.capacity);
      
      if (utilization >= this.config.failureThreshold) {
        failures.push({
          type: FailureTypeEnum.OVERLOADED,
          nodeId: node.id,
          resourceType,
          timestamp: Date.now(),
          reason: `Resource utilization critical: ${(utilization * 100).toFixed(1)}%`,
          severity: 'critical',
        });
      } else if (utilization >= this.config.overloadThreshold) {
        failures.push({
          type: FailureTypeEnum.OVERLOADED,
          nodeId: node.id,
          resourceType,
          timestamp: Date.now(),
          reason: `Resource utilization high: ${(utilization * 100).toFixed(1)}%`,
          severity: 'medium',
        });
      }
    }

    // Check for insufficient capacity
    for (const [resourceType, flow] of node.resources) {
      if (flow.input > flow.capacity) {
        failures.push({
          type: FailureTypeEnum.INSUFFICIENT_CAPACITY,
          nodeId: node.id,
          resourceType,
          timestamp: Date.now(),
          reason: `Input exceeds capacity: ${flow.input} > ${flow.capacity}`,
          severity: 'high',
        });
      }
    }

    return failures;
  }

  /**
   * Detect failures for a single connection
   */
  private detectConnectionFailures(
    connection: NetworkConnection,
    flowStates: Map<ResourceType, NetworkFlowState>
  ): NetworkFailure[] {
    const failures: NetworkFailure[] = [];

    // Check for broken links
    if (connection.status === 'broken') {
      for (const resourceType of connection.flows.keys()) {
        failures.push({
          type: FailureTypeEnum.BROKEN_LINK,
          nodeId: connection.fromNodeId,
          connectionId: connection.id,
          resourceType,
          timestamp: Date.now(),
          reason: 'Connection is broken',
          severity: 'critical',
        });
      }
    }

    // Check for overloaded connections
    for (const [resourceType, flow] of connection.flows) {
      const capacity = connection.capacities.get(resourceType) || 0;
      const utilization = calculateUtilization(flow, capacity);

      if (utilization >= this.config.failureThreshold) {
        failures.push({
          type: FailureTypeEnum.OVERLOADED,
          nodeId: connection.fromNodeId,
          connectionId: connection.id,
          resourceType,
          timestamp: Date.now(),
          reason: `Connection utilization critical: ${(utilization * 100).toFixed(1)}%`,
          severity: 'critical',
        });
      } else if (utilization >= this.config.overloadThreshold) {
        failures.push({
          type: FailureTypeEnum.OVERLOADED,
          nodeId: connection.fromNodeId,
          connectionId: connection.id,
          resourceType,
          timestamp: Date.now(),
          reason: `Connection utilization high: ${(utilization * 100).toFixed(1)}%`,
          severity: 'medium',
        });
      }
    }

    return failures;
  }

  /**
   * Detect priority switching needs
   */
  detectPrioritySwitching(
    graph: NetworkGraph,
    flowStates: Map<ResourceType, NetworkFlowState>
  ): NetworkFailure[] {
    const failures: NetworkFailure[] = [];

    // Find nodes that need priority adjustment
    for (const [nodeId, node] of graph.nodes) {
      for (const [resourceType, flow] of node.resources) {
        const utilization = calculateUtilization(flow.output, flow.capacity);
        
        // If utilization is high and priority is low, suggest priority increase
        if (utilization >= this.config.overloadThreshold && node.priority >= 2) {
          failures.push({
            type: FailureTypeEnum.PRIORITY_SWITCH,
            nodeId: node.id,
            resourceType,
            timestamp: Date.now(),
            reason: `High utilization with low priority suggests priority increase`,
            severity: 'low',
          });
        }
      }
    }

    return failures;
  }

  /**
   * Check if node has specific failure type
   */
  hasFailureType(
    node: NetworkNode,
    failureType: FailureType,
    flowStates: Map<ResourceType, NetworkFlowState>
  ): boolean {
    const failures = this.detectNodeFailures(node, flowStates);
    return failures.some(f => f.type === failureType);
  }

  /**
   * Check if connection has specific failure type
   */
  hasConnectionFailureType(
    connection: NetworkConnection,
    failureType: FailureType,
    flowStates: Map<ResourceType, NetworkFlowState>
  ): boolean {
    const failures = this.detectConnectionFailures(connection, flowStates);
    return failures.some(f => f.type === failureType);
  }

  /**
   * Get failure severity level
   */
  getSeverityLevel(failures: NetworkFailure[]): 'none' | 'low' | 'medium' | 'high' | 'critical' {
    if (failures.length === 0) return 'none';

    const hasCritical = failures.some(f => f.severity === 'critical');
    const hasHigh = failures.some(f => f.severity === 'high');
    const hasMedium = failures.some(f => f.severity === 'medium');

    if (hasCritical) return 'critical';
    if (hasHigh) return 'high';
    if (hasMedium) return 'medium';
    return 'low';
  }

  /**
   * Get failure summary
   */
  getFailureSummary(failures: NetworkFailure[]): {
    total: number;
    byType: Map<FailureType, number>;
    bySeverity: Map<string, number>;
  } {
    const byType = new Map<FailureType, number>();
    const bySeverity = new Map<string, number>();

    for (const failure of failures) {
      byType.set(failure.type, (byType.get(failure.type) || 0) + 1);
      bySeverity.set(failure.severity, (bySeverity.get(failure.severity) || 0) + 1);
    }

    return {
      total: failures.length,
      byType,
      bySeverity,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<NetworkConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get configuration
   */
  getConfig(): NetworkConfig {
    return { ...this.config };
  }
}
