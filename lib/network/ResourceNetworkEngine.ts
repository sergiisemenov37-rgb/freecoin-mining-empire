/**
 * Resource Network Engine
 * Core engine coordinating all network components
 * Event-driven architecture independent from simulation, rendering, database, and placement
 */

import type {
  NetworkGraph,
  NetworkNode,
  NetworkConnection,
  ResourceType,
  NetworkConfig,
  NetworkEvent,
  NetworkEventListener,
  NetworkFlowState,
  NetworkFailure,
  NodeId,
} from './types';
import {
  NetworkEventType,
  DEFAULT_NETWORK_CONFIG,
} from './types';
import { NetworkGraphModel } from './NetworkGraph';
import { FlowCalculator } from './FlowCalculator';
import { FailureDetector } from './FailureDetector';
import { ConnectionManager } from './ConnectionManager';

/**
 * Resource network engine class
 */
export class ResourceNetworkEngine {
  private graphModel: NetworkGraphModel;
  private flowCalculator: FlowCalculator;
  private failureDetector: FailureDetector;
  private connectionManager: ConnectionManager;
  
  private config: NetworkConfig;
  private eventListeners: Map<NetworkEventType, Set<NetworkEventListener>>;
  
  private flowStates: Map<ResourceType, NetworkFlowState>;
  private failures: NetworkFailure[];
  
  private isRunning: boolean = false;
  private updateInterval: NodeJS.Timeout | null = null;
  
  // Incremental update optimization
  private changedNodes: Set<NodeId> = new Set();
  private changedConnections: Set<string> = new Set();
  private lastUpdateTime: number = 0;

  constructor(config?: Partial<NetworkConfig>) {
    this.config = { ...DEFAULT_NETWORK_CONFIG, ...config };
    
    this.graphModel = new NetworkGraphModel({
      maxConnectionDistance: this.config.maxConnectionDistance,
      autoConnect: this.config.autoConnect,
      autoConnectDistance: this.config.autoConnectDistance,
    });
    
    this.flowCalculator = new FlowCalculator(this.config);
    this.failureDetector = new FailureDetector(this.config);
    this.connectionManager = new ConnectionManager(this.graphModel.getGraph(), this.config);
    
    this.eventListeners = new Map();
    this.flowStates = new Map();
    this.failures = [];
  }

  /**
   * Start network engine
   */
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastUpdateTime = Date.now();
    
    this.updateInterval = setInterval(() => {
      this.update();
    }, this.config.flowUpdateInterval);
  }

  /**
   * Stop network engine
   */
  stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Single update cycle
   */
  update(): void {
    const startTime = performance.now();
    
    // Get current graph
    const graph = this.graphModel.getGraph();
    
    // Recalculate flows (incremental if enabled)
    if (this.config.enableIncrementalUpdate && this.changedNodes.size > 0) {
      this.incrementalFlowUpdate(graph);
    } else {
      this.fullFlowUpdate(graph);
    }
    
    // Detect failures
    this.detectFailures(graph);
    
    // Fire network recalculated event
    this.fireEvent({
      type: NetworkEventType.NETWORK_RECALCULATED,
      timestamp: Date.now(),
      nodeCount: graph.nodes.size,
      connectionCount: graph.connections.size,
      calculationTime: performance.now() - startTime,
    } as any);
    
    // Clear changed sets
    this.changedNodes.clear();
    this.changedConnections.clear();
    this.lastUpdateTime = Date.now();
  }

  /**
   * Full flow update
   */
  private fullFlowUpdate(graph: NetworkGraph): void {
    this.flowStates = this.flowCalculator.calculateAllFlows(graph);
  }

  /**
   * Incremental flow update (only changed nodes)
   */
  private incrementalFlowUpdate(graph: NetworkGraph): void {
    // For now, do full update
    // Future: implement true incremental update
    this.fullFlowUpdate(graph);
  }

  /**
   * Detect failures
   */
  private detectFailures(graph: NetworkGraph): void {
    const result = this.failureDetector.detectFailures(graph, this.flowStates);
    this.failures = result.failures;
    
    // Fire failure events
    for (const failure of result.failures) {
      this.fireEvent({
        type: NetworkEventType.FAILURE_DETECTED,
        timestamp: Date.now(),
        failure,
      } as any);
    }
  }

  /**
   * Add node to network
   */
  addNode(node: NetworkNode): void {
    this.graphModel.addNode(node);
    this.changedNodes.add(node.id);
    
    this.fireEvent({
      type: NetworkEventType.NODE_ADDED,
      timestamp: Date.now(),
      nodeId: node.id,
      nodeType: node.type,
    } as any);
  }

  /**
   * Remove node from network
   */
  removeNode(nodeId: NodeId): void {
    this.graphModel.removeNode(nodeId);
    this.changedNodes.delete(nodeId);
    
    this.fireEvent({
      type: NetworkEventType.NODE_REMOVED,
      timestamp: Date.now(),
      nodeId,
    } as any);
  }

  /**
   * Add connection
   */
  addConnection(
    fromNodeId: NodeId,
    toNodeId: NodeId,
    type: 'automatic' | 'manual' = 'automatic'
  ): NetworkConnection | null {
    const connection = this.connectionManager.createManualConnection(fromNodeId, toNodeId);
    if (connection) {
      this.changedConnections.add(connection.id);
      this.changedNodes.add(fromNodeId);
      this.changedNodes.add(toNodeId);
      
      this.fireEvent({
        type: NetworkEventType.CONNECTION_ADDED,
        timestamp: Date.now(),
        connectionId: connection.id,
        fromNodeId,
        toNodeId,
      } as any);
    }
    return connection;
  }

  /**
   * Remove connection
   */
  removeConnection(connectionId: string): boolean {
    const success = this.connectionManager.removeConnection(connectionId);
    if (success) {
      this.changedConnections.delete(connectionId);
      
      this.fireEvent({
        type: NetworkEventType.CONNECTION_REMOVED,
        timestamp: Date.now(),
        connectionId,
      } as any);
    }
    return success;
  }

  /**
   * Get node
   */
  getNode(nodeId: NodeId): NetworkNode | null {
    return this.graphModel.getNode(nodeId);
  }

  /**
   * Get all nodes
   */
  getAllNodes(): NetworkNode[] {
    return this.graphModel.getAllNodes();
  }

  /**
   * Get connection
   */
  getConnection(connectionId: string): NetworkConnection | null {
    return this.graphModel.getConnection(connectionId);
  }

  /**
   * Get all connections
   */
  getAllConnections(): NetworkConnection[] {
    return this.graphModel.getAllConnections();
  }

  /**
   * Get flow state for resource type
   */
  getFlowState(resourceType: ResourceType): NetworkFlowState | null {
    return this.flowStates.get(resourceType) || null;
  }

  /**
   * Get all flow states
   */
  getAllFlowStates(): Map<ResourceType, NetworkFlowState> {
    return new Map(this.flowStates);
  }

  /**
   * Get failures
   */
  getFailures(): NetworkFailure[] {
    return [...this.failures];
  }

  /**
   * Get graph statistics
   */
  getStatistics() {
    return this.graphModel.getStatistics();
  }

  /**
   * Register event listener
   */
  on(eventType: NetworkEventType, listener: NetworkEventListener): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(listener);
  }

  /**
   * Unregister event listener
   */
  off(eventType: NetworkEventType, listener: NetworkEventListener): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Fire event to listeners
   */
  private fireEvent(event: NetworkEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      for (const listener of listeners) {
        listener(event);
      }
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<NetworkConfig>): void {
    this.config = { ...this.config, ...config };
    
    this.graphModel.updateConfig({
      maxConnectionDistance: this.config.maxConnectionDistance,
      autoConnect: this.config.autoConnect,
      autoConnectDistance: this.config.autoConnectDistance,
    });
    
    this.flowCalculator.updateConfig(this.config);
    this.failureDetector.updateConfig(this.config);
    this.connectionManager.updateConfig(this.config);
  }

  /**
   * Get configuration
   */
  getConfig(): NetworkConfig {
    return { ...this.config };
  }

  /**
   * Check if engine is running
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Clear network
   */
  clear(): void {
    this.graphModel.clear();
    this.flowStates.clear();
    this.failures = [];
    this.changedNodes.clear();
    this.changedConnections.clear();
  }

  /**
   * Serialize network state
   */
  serialize(): string {
    const graph = this.graphModel.getGraph();
    
    const nodes = Array.from(graph.nodes.values()).map(node => ({
      id: node.id,
      position: node.position,
      type: node.type,
      resources: Array.from(node.resources.entries()),
      priority: node.priority,
      status: node.status,
      capacities: Array.from(node.capacities.entries()),
      connections: Array.from(node.connections),
      load: node.load,
      lastUpdated: node.lastUpdated,
      version: node.version,
    }));

    const connections = Array.from(graph.connections.values()).map(conn => ({
      id: conn.id,
      fromNodeId: conn.fromNodeId,
      toNodeId: conn.toNodeId,
      type: conn.type,
      status: conn.status,
      capacities: Array.from(conn.capacities.entries()),
      flows: Array.from(conn.flows.entries()),
      distance: conn.distance,
      priority: conn.priority,
      lastUpdated: conn.lastUpdated,
      version: conn.version,
    }));

    return JSON.stringify({
      config: this.config,
      nodes,
      connections,
    });
  }

  /**
   * Deserialize network state
   */
  static deserialize(data: string): ResourceNetworkEngine {
    const parsed = JSON.parse(data);
    const engine = new ResourceNetworkEngine(parsed.config);
    
    // Restore nodes
    for (const nodeData of parsed.nodes) {
      const node: NetworkNode = {
        id: nodeData.id,
        position: nodeData.position,
        type: nodeData.type,
        resources: new Map(nodeData.resources),
        priority: nodeData.priority,
        status: nodeData.status,
        capacities: new Map(nodeData.capacities),
        connections: new Set(nodeData.connections),
        load: nodeData.load,
        lastUpdated: nodeData.lastUpdated,
        version: nodeData.version,
      };
      engine.addNode(node);
    }
    
    // Restore connections
    for (const connData of parsed.connections) {
      const connection: NetworkConnection = {
        id: connData.id,
        fromNodeId: connData.fromNodeId,
        toNodeId: connData.toNodeId,
        type: connData.type,
        status: connData.status,
        capacities: new Map(connData.capacities),
        flows: new Map(connData.flows),
        distance: connData.distance,
        priority: connData.priority,
        lastUpdated: connData.lastUpdated,
        version: connData.version,
      };
      engine.graphModel.getGraph().connections.set(connection.id, connection);
    }
    
    return engine;
  }

  /**
   * Get graph model
   */
  getGraphModel(): NetworkGraphModel {
    return this.graphModel;
  }

  /**
   * Get flow calculator
   */
  getFlowCalculator(): FlowCalculator {
    return this.flowCalculator;
  }

  /**
   * Get failure detector
   */
  getFailureDetector(): FailureDetector {
    return this.failureDetector;
  }

  /**
   * Get connection manager
   */
  getConnectionManager(): ConnectionManager {
    return this.connectionManager;
  }
}
