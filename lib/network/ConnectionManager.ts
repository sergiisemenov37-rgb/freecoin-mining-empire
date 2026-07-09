/**
 * Connection Manager
 * Manages network connections (automatic, manual, future cable/wireless)
 * Independent from simulation, rendering, database, and placement
 */

import type {
  NetworkGraph,
  NetworkNode,
  NetworkConnection,
  ConnectionType,
  NodeId,
  NetworkConfig,
  ResourceType,
} from './types';
import {
  ConnectionType as ConnectionTypeEnum,
  ConnectionStatus,
  ResourceType as ResourceTypeEnum,
  calculateDistance,
  canConnect,
  generateConnectionId,
} from './types';

/**
 * Connection manager class
 */
export class ConnectionManager {
  private graph: NetworkGraph;
  private config: NetworkConfig;

  constructor(
    graph: NetworkGraph,
    config?: Partial<NetworkConfig>
  ) {
    this.graph = graph;
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
   * Create automatic connection between nodes
   */
  createAutomaticConnection(
    fromNodeId: NodeId,
    toNodeId: NodeId
  ): NetworkConnection | null {
    const fromNode = this.graph.nodes.get(fromNodeId);
    const toNode = this.graph.nodes.get(toNodeId);

    if (!fromNode || !toNode) {
      return null;
    }

    // Check distance
    if (!canConnect(fromNode.position, toNode.position, this.config.autoConnectDistance)) {
      return null;
    }

    // Check if connection already exists
    const connectionId = generateConnectionId(fromNodeId, toNodeId);
    if (this.graph.connections.has(connectionId)) {
      return this.graph.connections.get(connectionId)!;
    }

    // Create connection
    return this.createConnection(
      fromNodeId,
      toNodeId,
      ConnectionTypeEnum.AUTOMATIC
    );
  }

  /**
   * Create manual connection between nodes
   */
  createManualConnection(
    fromNodeId: NodeId,
    toNodeId: NodeId
  ): NetworkConnection | null {
    const fromNode = this.graph.nodes.get(fromNodeId);
    const toNode = this.graph.nodes.get(toNodeId);

    if (!fromNode || !toNode) {
      return null;
    }

    // Check distance (manual connections can be longer)
    if (!canConnect(fromNode.position, toNode.position, this.config.maxConnectionDistance)) {
      return null;
    }

    // Check if connection already exists
    const connectionId = generateConnectionId(fromNodeId, toNodeId);
    if (this.graph.connections.has(connectionId)) {
      return this.graph.connections.get(connectionId)!;
    }

    // Create connection
    return this.createConnection(
      fromNodeId,
      toNodeId,
      ConnectionTypeEnum.MANUAL
    );
  }

  /**
   * Create cable connection (future)
   */
  createCableConnection(
    fromNodeId: NodeId,
    toNodeId: NodeId,
    cableType: string
  ): NetworkConnection | null {
    // Future implementation for cable-based connections
    // For now, treat as manual connection
    return this.createManualConnection(fromNodeId, toNodeId);
  }

  /**
   * Create wireless connection (future)
   */
  createWirelessConnection(
    fromNodeId: NodeId,
    toNodeId: NodeId,
    wirelessType: string
  ): NetworkConnection | null {
    // Future implementation for wireless connections
    // For now, treat as manual connection with extended range
    const fromNode = this.graph.nodes.get(fromNodeId);
    const toNode = this.graph.nodes.get(toNodeId);

    if (!fromNode || !toNode) {
      return null;
    }

    // Wireless connections have extended range
    const wirelessRange = this.config.maxConnectionDistance * 2;
    if (!canConnect(fromNode.position, toNode.position, wirelessRange)) {
      return null;
    }

    return this.createConnection(
      fromNodeId,
      toNodeId,
      ConnectionTypeEnum.WIRELESS
    );
  }

  /**
   * Create connection
   */
  private createConnection(
    fromNodeId: NodeId,
    toNodeId: NodeId,
    type: ConnectionType
  ): NetworkConnection | null {
    const fromNode = this.graph.nodes.get(fromNodeId);
    const toNode = this.graph.nodes.get(toNodeId);

    if (!fromNode || !toNode) {
      return null;
    }

    const distance = calculateDistance(fromNode.position, toNode.position);
    const connectionId = generateConnectionId(fromNodeId, toNodeId);

    const connection: NetworkConnection = {
      id: connectionId,
      fromNodeId,
      toNodeId,
      type,
      status: ConnectionStatus.ACTIVE,
      capacities: this.getDefaultCapacities() as Map<ResourceType, number>,
      flows: this.getDefaultFlows() as Map<ResourceType, number>,
      distance,
      priority: this.calculatePriority(fromNode, toNode),
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
    const fromNode = this.graph.nodes.get(connection.fromNodeId);
    const toNode = this.graph.nodes.get(connection.toNodeId);
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
   * Auto-connect all nodes
   */
  autoConnectAll(): number {
    let connectionsCreated = 0;

    const nodes = Array.from(this.graph.nodes.values());
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const nodeA = nodes[i];
        const nodeB = nodes[j];

        if (canConnect(nodeA.position, nodeB.position, this.config.autoConnectDistance)) {
          const connection = this.createAutomaticConnection(nodeA.id, nodeB.id);
          if (connection) {
            connectionsCreated++;
          }
        }
      }
    }

    return connectionsCreated;
  }

  /**
   * Auto-connect a single node to nearby nodes
   */
  autoConnectNode(nodeId: NodeId): number {
    const node = this.graph.nodes.get(nodeId);
    if (!node) {
      return 0;
    }

    let connectionsCreated = 0;

    for (const [otherNodeId, otherNode] of this.graph.nodes) {
      if (otherNodeId === nodeId) {
        continue;
      }

      if (canConnect(node.position, otherNode.position, this.config.autoConnectDistance)) {
        const connection = this.createAutomaticConnection(nodeId, otherNodeId);
        if (connection) {
          connectionsCreated++;
        }
      }
    }

    return connectionsCreated;
  }

  /**
   * Optimize connections
   * Remove redundant connections while maintaining connectivity
   */
  optimizeConnections(): number {
    let connectionsRemoved = 0;

    // Find and remove redundant connections
    for (const connection of this.graph.connections.values()) {
      if (this.isRedundantConnection(connection)) {
        if (this.removeConnection(connection.id)) {
          connectionsRemoved++;
        }
      }
    }

    return connectionsRemoved;
  }

  /**
   * Check if connection is redundant
   */
  private isRedundantConnection(connection: NetworkConnection): boolean {
    // A connection is redundant if there's an alternative path
    const alternativePath = this.findAlternativePath(
      connection.fromNodeId,
      connection.toNodeId,
      connection.id
    );

    return alternativePath.length > 0;
  }

  /**
   * Find alternative path between nodes
   */
  private findAlternativePath(
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

      const neighbors = this.graph.adjacencyList.get(nodeId);
      if (neighbors) {
        for (const neighborId of neighbors) {
          const connectionId = generateConnectionId(nodeId, neighborId);
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
   * Calculate connection priority based on node priorities
   */
  private calculatePriority(nodeA: NetworkNode, nodeB: NetworkNode): number {
    // Higher priority nodes get higher priority connections
    return Math.min(nodeA.priority, nodeB.priority);
  }

  /**
   * Get default capacities for all resource types
   */
  private getDefaultCapacities(): Map<string, number> {
    const capacities = new Map<string, number>();
    const defaultCapacities: Record<string, number> = {
      [ResourceTypeEnum.POWER]: 1000,
      [ResourceTypeEnum.COOLING]: 5000,
      [ResourceTypeEnum.NETWORK]: 1000,
      [ResourceTypeEnum.MAINTENANCE]: 100,
      [ResourceTypeEnum.CUSTOM]: 100,
    };

    for (const [type, capacity] of Object.entries(defaultCapacities)) {
      capacities.set(type, capacity);
    }

    return capacities;
  }

  /**
   * Get default flows for all resource types
   */
  private getDefaultFlows(): Map<string, number> {
    const flows = new Map<string, number>();
    const defaultTypes = [ResourceTypeEnum.POWER, ResourceTypeEnum.COOLING, ResourceTypeEnum.NETWORK, ResourceTypeEnum.MAINTENANCE, ResourceTypeEnum.CUSTOM];

    for (const type of defaultTypes) {
      flows.set(type, 0);
    }

    return flows;
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
   * Get connection statistics
   */
  getConnectionStatistics(): {
    total: number;
    byType: Map<ConnectionType, number>;
    byStatus: Map<string, number>;
  } {
    const byType = new Map<ConnectionType, number>();
    const byStatus = new Map<string, number>();

    for (const connection of this.graph.connections.values()) {
      byType.set(connection.type, (byType.get(connection.type) || 0) + 1);
      byStatus.set(connection.status, (byStatus.get(connection.status) || 0) + 1);
    }

    return {
      total: this.graph.connections.size,
      byType,
      byStatus,
    };
  }
}
