/**
 * Network Graph Model
 * Manages network nodes and connections
 * Independent from simulation, rendering, database, and placement
 */

import type {
  NetworkNode,
  NetworkConnection,
  NetworkGraph,
  NodeId,
  GraphStatistics,
  ResourceType,
  ConnectionType,
  NodePriority,
  NodeStatus,
  ConnectionStatus,
  ResourceFlow,
} from './types';
import {
  DEFAULT_RESOURCE_CONFIGS,
  calculateDistance,
  canConnect,
  generateConnectionId,
  parseConnectionId,
} from './types';

/**
 * Network graph class
 */
export class NetworkGraphModel {
  private graph: NetworkGraph;
  private config: {
    maxConnectionDistance: number;
    autoConnect: boolean;
    autoConnectDistance: number;
  };

  constructor(config?: {
    maxConnectionDistance?: number;
    autoConnect?: boolean;
    autoConnectDistance?: number;
  }) {
    this.config = {
      maxConnectionDistance: config?.maxConnectionDistance || 100,
      autoConnect: config?.autoConnect !== undefined ? config.autoConnect : true,
      autoConnectDistance: config?.autoConnectDistance || 50,
    };

    this.graph = {
      nodes: new Map(),
      connections: new Map(),
      adjacencyList: new Map(),
      reverseAdjacencyList: new Map(),
    };
  }

  /**
   * Add node to graph
   */
  addNode(node: NetworkNode): void {
    this.graph.nodes.set(node.id, node);
    this.graph.adjacencyList.set(node.id, new Set());
    this.graph.reverseAdjacencyList.set(node.id, new Set());

    // Auto-connect if enabled
    if (this.config.autoConnect) {
      this.autoConnectNode(node);
    }
  }

  /**
   * Remove node from graph
   */
  removeNode(nodeId: NodeId): void {
    // Remove all connections to/from this node
    const connections = this.getConnectionsForNode(nodeId);
    for (const connectionId of connections) {
      this.removeConnection(connectionId);
    }

    // Remove node
    this.graph.nodes.delete(nodeId);
    this.graph.adjacencyList.delete(nodeId);
    this.graph.reverseAdjacencyList.delete(nodeId);
  }

  /**
   * Get node by ID
   */
  getNode(nodeId: NodeId): NetworkNode | null {
    return this.graph.nodes.get(nodeId) || null;
  }

  /**
   * Get all nodes
   */
  getAllNodes(): NetworkNode[] {
    return Array.from(this.graph.nodes.values());
  }

  /**
   * Add connection between nodes
   */
  addConnection(
    fromNodeId: NodeId,
    toNodeId: NodeId,
    type: ConnectionType = 'automatic' as ConnectionType
  ): NetworkConnection | null {
    const fromNode = this.getNode(fromNodeId);
    const toNode = this.getNode(toNodeId);

    if (!fromNode || !toNode) {
      return null;
    }

    // Check if connection already exists
    const connectionId = generateConnectionId(fromNodeId, toNodeId);
    if (this.graph.connections.has(connectionId)) {
      return this.graph.connections.get(connectionId)!;
    }

    // Check distance
    const distance = calculateDistance(fromNode.position, toNode.position);
    if (distance > this.config.maxConnectionDistance) {
      return null;
    }

    // Create connection
    const connection: NetworkConnection = {
      id: connectionId,
      fromNodeId,
      toNodeId,
      type,
      status: 'active' as ConnectionStatus,
      capacities: this.getDefaultCapacities(),
      flows: this.getDefaultFlows(),
      distance,
      priority: 0,
      lastUpdated: Date.now(),
      version: 0,
    };

    this.graph.connections.set(connectionId, connection);
    this.graph.adjacencyList.get(fromNodeId)!.add(toNodeId);
    this.graph.reverseAdjacencyList.get(toNodeId)!.add(fromNodeId);

    // Update node connections
    fromNode.connections.add(toNodeId);
    toNode.connections.add(fromNodeId);

    return connection;
  }

  /**
   * Remove connection
   */
  removeConnection(connectionId: string): boolean {
    const connection = this.graph.connections.get(connectionId);
    if (!connection) {
      return false;
    }

    // Update adjacency lists
    this.graph.adjacencyList.get(connection.fromNodeId)?.delete(connection.toNodeId);
    this.graph.reverseAdjacencyList.get(connection.toNodeId)?.delete(connection.fromNodeId);

    // Update node connections
    const fromNode = this.getNode(connection.fromNodeId);
    const toNode = this.getNode(connection.toNodeId);
    if (fromNode) {
      fromNode.connections.delete(connection.toNodeId);
    }
    if (toNode) {
      toNode.connections.delete(connection.fromNodeId);
    }

    // Remove connection
    this.graph.connections.delete(connectionId);

    return true;
  }

  /**
   * Get connection by ID
   */
  getConnection(connectionId: string): NetworkConnection | null {
    return this.graph.connections.get(connectionId) || null;
  }

  /**
   * Get all connections
   */
  getAllConnections(): NetworkConnection[] {
    return Array.from(this.graph.connections.values());
  }

  /**
   * Get connections for a node
   */
  getConnectionsForNode(nodeId: NodeId): string[] {
    const connections: string[] = [];

    // Outgoing connections
    const outgoing = this.graph.adjacencyList.get(nodeId);
    if (outgoing) {
      for (const toNodeId of outgoing) {
        connections.push(generateConnectionId(nodeId, toNodeId));
      }
    }

    // Incoming connections
    const incoming = this.graph.reverseAdjacencyList.get(nodeId);
    if (incoming) {
      for (const fromNodeId of incoming) {
        connections.push(generateConnectionId(fromNodeId, nodeId));
      }
    }

    return connections;
  }

  /**
   * Get neighbors of a node
   */
  getNeighbors(nodeId: NodeId): Set<NodeId> {
    const neighbors = new Set<NodeId>();
    const outgoing = this.graph.adjacencyList.get(nodeId);
    const incoming = this.graph.reverseAdjacencyList.get(nodeId);

    if (outgoing) {
      for (const neighborId of outgoing) {
        neighbors.add(neighborId);
      }
    }

    if (incoming) {
      for (const neighborId of incoming) {
        neighbors.add(neighborId);
      }
    }

    return neighbors;
  }

  /**
   * Auto-connect node to nearby nodes
   */
  private autoConnectNode(node: NetworkNode): void {
    for (const [otherNodeId, otherNode] of this.graph.nodes) {
      if (otherNodeId === node.id) {
        continue;
      }

      if (canConnect(node.position, otherNode.position, this.config.autoConnectDistance)) {
        this.addConnection(node.id, otherNodeId, 'automatic' as ConnectionType);
      }
    }
  }

  /**
   * Get default capacities for all resource types
   */
  private getDefaultCapacities(): Map<ResourceType, number> {
    const capacities = new Map<ResourceType, number>();
    for (const [type, config] of Object.entries(DEFAULT_RESOURCE_CONFIGS)) {
      capacities.set(type as ResourceType, config.defaultCapacity);
    }
    return capacities;
  }

  /**
   * Get default flows for all resource types
   */
  private getDefaultFlows(): Map<ResourceType, number> {
    const flows = new Map<ResourceType, number>();
    for (const type of Object.keys(DEFAULT_RESOURCE_CONFIGS)) {
      flows.set(type as ResourceType, 0);
    }
    return flows;
  }

  /**
   * Get graph statistics
   */
  getStatistics(): GraphStatistics {
    const nodeCount = this.graph.nodes.size;
    const connectionCount = this.graph.connections.size;

    let totalDegree = 0;
    let maxDegree = 0;

    for (const [nodeId, neighbors] of this.graph.adjacencyList) {
      const degree = neighbors.size + (this.graph.reverseAdjacencyList.get(nodeId)?.size || 0);
      totalDegree += degree;
      maxDegree = Math.max(maxDegree, degree);
    }

    const averageDegree = nodeCount > 0 ? totalDegree / nodeCount : 0;
    const connectedComponents = this.countConnectedComponents();
    const diameter = this.calculateDiameter();

    return {
      nodeCount,
      connectionCount,
      averageDegree,
      maxDegree,
      connectedComponents,
      diameter,
    };
  }

  /**
   * Count connected components
   */
  private countConnectedComponents(): number {
    const visited = new Set<NodeId>();
    let components = 0;

    for (const nodeId of this.graph.nodes.keys()) {
      if (!visited.has(nodeId)) {
        this.bfs(nodeId, visited);
        components++;
      }
    }

    return components;
  }

  /**
   * BFS traversal
   */
  private bfs(startNodeId: NodeId, visited: Set<NodeId>): void {
    const queue: NodeId[] = [startNodeId];
    visited.add(startNodeId);

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const neighbors = this.graph.adjacencyList.get(currentId);

      if (neighbors) {
        for (const neighborId of neighbors) {
          if (!visited.has(neighborId)) {
            visited.add(neighborId);
            queue.push(neighborId);
          }
        }
      }
    }
  }

  /**
   * Calculate graph diameter
   */
  private calculateDiameter(): number {
    if (this.graph.nodes.size === 0) return 0;

    let maxDistance = 0;

    for (const startNodeId of this.graph.nodes.keys()) {
      const distances = this.calculateShortestPaths(startNodeId);
      for (const distance of distances.values()) {
        maxDistance = Math.max(maxDistance, distance);
      }
    }

    return maxDistance;
  }

  /**
   * Calculate shortest paths from a node using BFS
   */
  private calculateShortestPaths(startNodeId: NodeId): Map<NodeId, number> {
    const distances = new Map<NodeId, number>();
    const visited = new Set<NodeId>();
    const queue: NodeId[] = [startNodeId];

    distances.set(startNodeId, 0);
    visited.add(startNodeId);

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const currentDistance = distances.get(currentId)!;
      const neighbors = this.graph.adjacencyList.get(currentId);

      if (neighbors) {
        for (const neighborId of neighbors) {
          if (!visited.has(neighborId)) {
            visited.add(neighborId);
            distances.set(neighborId, currentDistance + 1);
            queue.push(neighborId);
          }
        }
      }
    }

    return distances;
  }

  /**
   * Check if graph is connected
   */
  isConnected(): boolean {
    return this.countConnectedComponents() === 1;
  }

  /**
   * Get shortest path between nodes
   */
  getShortestPath(fromNodeId: NodeId, toNodeId: NodeId): NodeId[] {
    const distances = this.calculateShortestPaths(fromNodeId);
    const distance = distances.get(toNodeId);

    if (distance === undefined || distance === 0) {
      return [];
    }

    // Reconstruct path
    const path: NodeId[] = [toNodeId];
    let currentId = toNodeId;

    while (currentId !== fromNodeId) {
      const neighbors = this.graph.reverseAdjacencyList.get(currentId);
      if (!neighbors) break;

      let found = false;
      for (const neighborId of neighbors) {
        const neighborDistance = distances.get(neighborId);
        if (neighborDistance === distance - path.length + 1) {
          path.unshift(neighborId);
          currentId = neighborId;
          found = true;
          break;
        }
      }

      if (!found) break;
    }

    return path;
  }

  /**
   * Clear graph
   */
  clear(): void {
    this.graph.nodes.clear();
    this.graph.connections.clear();
    this.graph.adjacencyList.clear();
    this.graph.reverseAdjacencyList.clear();
  }

  /**
   * Get graph
   */
  getGraph(): NetworkGraph {
    return {
      nodes: new Map(this.graph.nodes),
      connections: new Map(this.graph.connections),
      adjacencyList: new Map(this.graph.adjacencyList),
      reverseAdjacencyList: new Map(this.graph.reverseAdjacencyList),
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: {
    maxConnectionDistance?: number;
    autoConnect?: boolean;
    autoConnectDistance?: number;
  }): void {
    this.config = { ...this.config, ...config };
  }
}
