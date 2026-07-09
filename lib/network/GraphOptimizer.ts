/**
 * Graph Optimizer
 * Optimizes network graph for performance with 10000+ nodes
 * Implements incremental recalculation and graph optimization algorithms
 */

import type {
  NetworkGraph,
  NetworkNode,
  NetworkConnection,
  NodeId,
  ResourceType,
  NetworkConfig,
} from './types';

/**
 * Optimization result
 */
export interface OptimizationResult {
  nodesOptimized: number;
  connectionsOptimized: number;
  timeSaved: number;
  memorySaved: number;
}

/**
 * Graph optimizer class
 */
export class GraphOptimizer {
  private config: NetworkConfig;
  private cache: Map<string, any>;
  private lastOptimizationTime: number;

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
    
    this.cache = new Map();
    this.lastOptimizationTime = 0;
  }

  /**
   * Optimize graph for performance
   */
  optimizeGraph(graph: NetworkGraph): OptimizationResult {
    const startTime = performance.now();
    
    let nodesOptimized = 0;
    let connectionsOptimized = 0;

    if (this.config.enableGraphOptimization) {
      // Remove isolated nodes (no connections)
      nodesOptimized += this.removeIsolatedNodes(graph);
      
      // Remove redundant connections
      connectionsOptimized += this.removeRedundantConnections(graph);
      
      // Optimize adjacency lists
      this.optimizeAdjacencyLists(graph);
      
      // Compact data structures
      this.compactDataStructures(graph);
    }

    if (this.config.cacheEnabled) {
      // Update cache
      this.updateCache(graph);
    }

    const endTime = performance.now();
    this.lastOptimizationTime = endTime - startTime;

    return {
      nodesOptimized,
      connectionsOptimized,
      timeSaved: this.lastOptimizationTime,
      memorySaved: this.estimateMemorySaved(nodesOptimized, connectionsOptimized),
    };
  }

  /**
   * Remove isolated nodes
   */
  private removeIsolatedNodes(graph: NetworkGraph): number {
    let removed = 0;

    for (const [nodeId, node] of graph.nodes) {
      const hasConnections = node.connections.size > 0;
      
      // Only remove if node has no connections and is not critical
      if (!hasConnections && node.priority > 0) {
        graph.nodes.delete(nodeId);
        graph.adjacencyList.delete(nodeId);
        graph.reverseAdjacencyList.delete(nodeId);
        removed++;
      }
    }

    return removed;
  }

  /**
   * Remove redundant connections
   */
  private removeRedundantConnections(graph: NetworkGraph): number {
    let removed = 0;

    for (const connection of graph.connections.values()) {
      if (this.isRedundantConnection(graph, connection)) {
        graph.connections.delete(connection.id);
        graph.adjacencyList.get(connection.fromNodeId)?.delete(connection.toNodeId);
        graph.reverseAdjacencyList.get(connection.toNodeId)?.delete(connection.fromNodeId);
        removed++;
      }
    }

    return removed;
  }

  /**
   * Check if connection is redundant
   */
  private isRedundantConnection(
    graph: NetworkGraph,
    connection: NetworkConnection
  ): boolean {
    // Check if there's an alternative path
    const alternativePath = this.findAlternativePath(
      graph,
      connection.fromNodeId,
      connection.toNodeId,
      connection.id
    );

    return alternativePath.length > 0 && alternativePath.length < 5;
  }

  /**
   * Find alternative path
   */
  private findAlternativePath(
    graph: NetworkGraph,
    fromNodeId: NodeId,
    toNodeId: NodeId,
    excludeConnectionId: string
  ): NodeId[] {
    const visited = new Set<NodeId>();
    const queue: Array<{ nodeId: NodeId; path: NodeId[] }> = [
      { nodeId: fromNodeId, path: [fromNodeId] },
    ];

    while (queue.length > 0) {
      const { nodeId, path } = queue.shift()!;

      if (nodeId === toNodeId && path.length > 1) {
        return path;
      }

      if (visited.has(nodeId)) {
        continue;
      }

      visited.add(nodeId);

      const neighbors = graph.adjacencyList.get(nodeId);
      if (neighbors) {
        for (const neighborId of neighbors) {
          const connectionId = `${nodeId}-${neighborId}`;
          if (connectionId !== excludeConnectionId) {
            queue.push({
              nodeId: neighborId,
              path: [...path, neighborId],
            });
          }
        }
      }
    }

    return [];
  }

  /**
   * Optimize adjacency lists
   */
  private optimizeAdjacencyLists(graph: NetworkGraph): void {
    // Rebuild adjacency lists to ensure consistency
    const newAdjacencyList = new Map<NodeId, Set<NodeId>>();
    const newReverseAdjacencyList = new Map<NodeId, Set<NodeId>>();

    for (const connection of graph.connections.values()) {
      if (!newAdjacencyList.has(connection.fromNodeId)) {
        newAdjacencyList.set(connection.fromNodeId, new Set());
      }
      newAdjacencyList.get(connection.fromNodeId)!.add(connection.toNodeId);

      if (!newReverseAdjacencyList.has(connection.toNodeId)) {
        newReverseAdjacencyList.set(connection.toNodeId, new Set());
      }
      newReverseAdjacencyList.get(connection.toNodeId)!.add(connection.fromNodeId);
    }

    graph.adjacencyList = newAdjacencyList;
    graph.reverseAdjacencyList = newReverseAdjacencyList;
  }

  /**
   * Compact data structures
   */
  private compactDataStructures(graph: NetworkGraph): void {
    // Rebuild maps to reduce memory fragmentation
    const newNodes = new Map(graph.nodes);
    const newConnections = new Map(graph.connections);
    
    graph.nodes = newNodes;
    graph.connections = newConnections;
  }

  /**
   * Update cache
   */
  private updateCache(graph: NetworkGraph): void {
    // Cache frequently accessed data
    this.cache.set('nodeCount', graph.nodes.size);
    this.cache.set('connectionCount', graph.connections.size);
    this.cache.set('lastUpdate', Date.now());
  }

  /**
   * Estimate memory saved
   */
  private estimateMemorySaved(nodes: number, connections: number): number {
    // Rough estimate: ~200 bytes per node, ~100 bytes per connection
    return (nodes * 200 + connections * 100) / 1024; // KB
  }

  /**
   * Get cached value
   */
  getCached(key: string): any {
    return this.cache.get(key);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Incremental flow update
   * Only recalculate flows for changed nodes
   */
  incrementalFlowUpdate(
    graph: NetworkGraph,
    changedNodes: Set<NodeId>,
    changedConnections: Set<string>
  ): Set<NodeId> {
    const affectedNodes = new Set<NodeId>();

    // Find all nodes affected by changed nodes
    for (const changedNodeId of changedNodes) {
      const neighbors = graph.adjacencyList.get(changedNodeId);
      const reverseNeighbors = graph.reverseAdjacencyList.get(changedNodeId);

      if (neighbors) {
        for (const neighborId of neighbors) {
          affectedNodes.add(neighborId);
        }
      }

      if (reverseNeighbors) {
        for (const neighborId of reverseNeighbors) {
          affectedNodes.add(neighborId);
        }
      }

      affectedNodes.add(changedNodeId);
    }

    // Find all nodes affected by changed connections
    for (const connectionId of changedConnections) {
      const [fromNodeId, toNodeId] = connectionId.split('-');
      affectedNodes.add(fromNodeId);
      affectedNodes.add(toNodeId);
    }

    return affectedNodes;
  }

  /**
   * Spatial partitioning for large graphs
   * Divides graph into spatial cells for faster neighbor queries
   */
  createSpatialPartition(
    graph: NetworkGraph,
    cellSize: number = 50
  ): Map<string, Set<NodeId>> {
    const partition = new Map<string, Set<NodeId>>();

    for (const [nodeId, node] of graph.nodes) {
      const cellX = Math.floor(node.position.x / cellSize);
      const cellY = Math.floor(node.position.y / cellSize);
      const cellKey = `${cellX},${cellY}`;

      if (!partition.has(cellKey)) {
        partition.set(cellKey, new Set());
      }
      partition.get(cellKey)!.add(nodeId);
    }

    return partition;
  }

  /**
   * Get nodes in spatial cell
   */
  getNodesInCell(
    partition: Map<string, Set<NodeId>>,
    x: number,
    y: number,
    cellSize: number = 50
  ): Set<NodeId> {
    const cellX = Math.floor(x / cellSize);
    const cellY = Math.floor(y / cellSize);
    const cellKey = `${cellX},${cellY}`;

    return partition.get(cellKey) || new Set();
  }

  /**
   * Get neighboring cells
   */
  getNeighboringCells(
    x: number,
    y: number,
    cellSize: number = 50
  ): string[] {
    const cellX = Math.floor(x / cellSize);
    const cellY = Math.floor(y / cellSize);

    const neighbors: string[] = [];

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        neighbors.push(`${cellX + dx},${cellY + dy}`);
      }
    }

    return neighbors;
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

  /**
   * Get last optimization time
   */
  getLastOptimizationTime(): number {
    return this.lastOptimizationTime;
  }
}
