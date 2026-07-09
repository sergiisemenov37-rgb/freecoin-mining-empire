/**
 * Resource Network Engine Types
 * Core types for resource flow simulation
 * Completely independent from simulation, rendering, database, and placement
 */

// ============================================
// RESOURCE TYPES
// ============================================

/**
 * Resource type
 */
export enum ResourceType {
  POWER = 'power',
  COOLING = 'cooling',
  NETWORK = 'network',
  MAINTENANCE = 'maintenance',
  CUSTOM = 'custom',
}

/**
 * Resource configuration
 */
export interface ResourceConfig {
  type: ResourceType;
  unit: string;
  defaultCapacity: number;
  defaultFlowRate: number;
  maxCapacity: number;
  minCapacity: number;
}

/**
 * Default resource configurations
 */
export const DEFAULT_RESOURCE_CONFIGS: Record<ResourceType, ResourceConfig> = {
  [ResourceType.POWER]: {
    type: ResourceType.POWER,
    unit: 'W',
    defaultCapacity: 1000,
    defaultFlowRate: 100,
    maxCapacity: 10000,
    minCapacity: 10,
  },
  [ResourceType.COOLING]: {
    type: ResourceType.COOLING,
    unit: 'BTU/h',
    defaultCapacity: 5000,
    defaultFlowRate: 500,
    maxCapacity: 50000,
    minCapacity: 100,
  },
  [ResourceType.NETWORK]: {
    type: ResourceType.NETWORK,
    unit: 'Mbps',
    defaultCapacity: 1000,
    defaultFlowRate: 100,
    maxCapacity: 10000,
    minCapacity: 10,
  },
  [ResourceType.MAINTENANCE]: {
    type: ResourceType.MAINTENANCE,
    unit: '%',
    defaultCapacity: 100,
    defaultFlowRate: 10,
    maxCapacity: 100,
    minCapacity: 1,
  },
  [ResourceType.CUSTOM]: {
    type: ResourceType.CUSTOM,
    unit: 'units',
    defaultCapacity: 100,
    defaultFlowRate: 10,
    maxCapacity: 1000,
    minCapacity: 1,
  },
};

// ============================================
// NETWORK NODE
// ============================================

/**
 * Node ID
 */
export type NodeId = string;

/**
 * Node priority
 */
export enum NodePriority {
  CRITICAL = 0,
  HIGH = 1,
  NORMAL = 2,
  LOW = 3,
}

/**
 * Node status
 */
export enum NodeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISCONNECTED = 'disconnected',
  OVERLOADED = 'overloaded',
  FAILED = 'failed',
  MAINTENANCE = 'maintenance',
}

/**
 * Resource flow at node
 */
export interface ResourceFlow {
  input: number;
  output: number;
  net: number;
  capacity: number;
  utilization: number;
}

/**
 * Network node
 * Every placed object becomes a network node
 */
export interface NetworkNode {
  id: NodeId;
  position: { x: number; y: number };
  type: string; // Object type from grid
  
  // Resource-specific data
  resources: Map<ResourceType, ResourceFlow>;
  
  // Node properties
  priority: NodePriority;
  status: NodeStatus;
  
  // Capacity per resource type
  capacities: Map<ResourceType, number>;
  
  // Connections
  connections: Set<NodeId>;
  
  // Load tracking
  load: number;
  
  // Metadata
  lastUpdated: number;
  version: number;
}

// ============================================
// CONNECTIONS
// ============================================

/**
 * Connection type
 */
export enum ConnectionType {
  AUTOMATIC = 'automatic',
  MANUAL = 'manual',
  CABLE = 'cable', // Future
  WIRELESS = 'wireless', // Future
}

/**
 * Connection status
 */
export enum ConnectionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BROKEN = 'broken',
  OVERLOADED = 'overloaded',
  DISCONNECTED = 'disconnected',
}

/**
 * Connection between nodes
 */
export interface NetworkConnection {
  id: string;
  fromNodeId: NodeId;
  toNodeId: NodeId;
  type: ConnectionType;
  status: ConnectionStatus;
  
  // Resource-specific capacity
  capacities: Map<ResourceType, number>;
  
  // Current flow per resource
  flows: Map<ResourceType, number>;
  
  // Distance (for cable cost calculation)
  distance: number;
  
  // Priority (for routing)
  priority: number;
  
  // Metadata
  lastUpdated: number;
  version: number;
}

// ============================================
// FLOW ALGORITHM
// ============================================

/**
 * Flow calculation result
 */
export interface FlowResult {
  nodeId: NodeId;
  resourceType: ResourceType;
  input: number;
  output: number;
  net: number;
  capacity: number;
  utilization: number;
  bottlenecks: NodeId[];
  disconnected: boolean;
}

/**
 * Network flow state
 */
export interface NetworkFlowState {
  flows: Map<string, FlowResult>;
  totalFlow: number;
  totalCapacity: number;
  utilization: number;
  bottlenecks: Set<NodeId>;
  disconnectedNodes: Set<NodeId>;
}

// ============================================
// FAILURES
// ============================================

/**
 * Failure type
 */
export enum FailureType {
  DISCONNECTED = 'disconnected',
  OVERLOADED = 'overloaded',
  BROKEN_LINK = 'broken_link',
  INSUFFICIENT_CAPACITY = 'insufficient_capacity',
  PRIORITY_SWITCH = 'priority_switch',
}

/**
 * Failure event
 */
export interface NetworkFailure {
  type: FailureType;
  nodeId: NodeId;
  connectionId?: string;
  resourceType: ResourceType;
  timestamp: number;
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// ============================================
// EVENTS
// ============================================

/**
 * Network event types
 */
export enum NetworkEventType {
  NODE_ADDED = 'node_added',
  NODE_REMOVED = 'node_removed',
  NODE_STATUS_CHANGED = 'node_status_changed',
  CONNECTION_ADDED = 'connection_added',
  CONNECTION_REMOVED = 'connection_removed',
  CONNECTION_STATUS_CHANGED = 'connection_status_changed',
  FLOW_CHANGED = 'flow_changed',
  FAILURE_DETECTED = 'failure_detected',
  FAILURE_RESOLVED = 'failure_resolved',
  BOTTLENECK_DETECTED = 'bottleneck_detected',
  NETWORK_RECALCULATED = 'network_recalculated',
}

/**
 * Base network event
 */
export interface NetworkEvent {
  type: NetworkEventType;
  timestamp: number;
}

/**
 * Node added event
 */
export interface NodeAddedEvent extends NetworkEvent {
  type: NetworkEventType.NODE_ADDED;
  nodeId: NodeId;
  nodeType: string;
}

/**
 * Node removed event
 */
export interface NodeRemovedEvent extends NetworkEvent {
  type: NetworkEventType.NODE_REMOVED;
  nodeId: NodeId;
}

/**
 * Node status changed event
 */
export interface NodeStatusChangedEvent extends NetworkEvent {
  type: NetworkEventType.NODE_STATUS_CHANGED;
  nodeId: NodeId;
  oldStatus: NodeStatus;
  newStatus: NodeStatus;
}

/**
 * Connection added event
 */
export interface ConnectionAddedEvent extends NetworkEvent {
  type: NetworkEventType.CONNECTION_ADDED;
  connectionId: string;
  fromNodeId: NodeId;
  toNodeId: NodeId;
}

/**
 * Connection removed event
 */
export interface ConnectionRemovedEvent extends NetworkEvent {
  type: NetworkEventType.CONNECTION_REMOVED;
  connectionId: string;
}

/**
 * Connection status changed event
 */
export interface ConnectionStatusChangedEvent extends NetworkEvent {
  type: NetworkEventType.CONNECTION_STATUS_CHANGED;
  connectionId: string;
  oldStatus: ConnectionStatus;
  newStatus: ConnectionStatus;
}

/**
 * Flow changed event
 */
export interface FlowChangedEvent extends NetworkEvent {
  type: NetworkEventType.FLOW_CHANGED;
  nodeId: NodeId;
  resourceType: ResourceType;
  oldFlow: number;
  newFlow: number;
}

/**
 * Failure detected event
 */
export interface FailureDetectedEvent extends NetworkEvent {
  type: NetworkEventType.FAILURE_DETECTED;
  failure: NetworkFailure;
}

/**
 * Failure resolved event
 */
export interface FailureResolvedEvent extends NetworkEvent {
  type: NetworkEventType.FAILURE_RESOLVED;
  nodeId: NodeId;
  resourceType: ResourceType;
  failureType: FailureType;
}

/**
 * Bottleneck detected event
 */
export interface BottleneckDetectedEvent extends NetworkEvent {
  type: NetworkEventType.BOTTLENECK_DETECTED;
  nodeId: NodeId;
  resourceType: ResourceType;
  utilization: number;
}

/**
 * Network recalculated event
 */
export interface NetworkRecalculatedEvent extends NetworkEvent {
  type: NetworkEventType.NETWORK_RECALCULATED;
  nodeCount: number;
  connectionCount: number;
  calculationTime: number;
}

/**
 * Event listener type
 */
export type NetworkEventListener = (event: NetworkEvent) => void;

// ============================================
// GRAPH MODEL
// ============================================

/**
 * Network graph
 */
export interface NetworkGraph {
  nodes: Map<NodeId, NetworkNode>;
  connections: Map<string, NetworkConnection>;
  adjacencyList: Map<NodeId, Set<NodeId>>;
  reverseAdjacencyList: Map<NodeId, Set<NodeId>>;
}

/**
 * Graph statistics
 */
export interface GraphStatistics {
  nodeCount: number;
  connectionCount: number;
  averageDegree: number;
  maxDegree: number;
  connectedComponents: number;
  diameter: number;
}

// ============================================
// CONFIGURATION
// ============================================

/**
 * Network configuration
 */
export interface NetworkConfig {
  // Connection settings
  maxConnectionDistance: number;
  autoConnect: boolean;
  autoConnectDistance: number;
  
  // Flow settings
  flowUpdateInterval: number;
  maxFlowIterations: number;
  flowConvergenceThreshold: number;
  
  // Failure settings
  overloadThreshold: number;
  failureThreshold: number;
  
  // Optimization settings
  enableIncrementalUpdate: boolean;
  enableGraphOptimization: boolean;
  cacheEnabled: boolean;
}

/**
 * Default network configuration
 */
export const DEFAULT_NETWORK_CONFIG: NetworkConfig = {
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
};

// ============================================
// UTILITIES
// ============================================

/**
 * Calculate distance between two nodes
 */
export function calculateDistance(
  nodeA: { x: number; y: number },
  nodeB: { x: number; y: number }
): number {
  const dx = nodeA.x - nodeB.x;
  const dy = nodeA.y - nodeB.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if nodes are within connection distance
 */
export function canConnect(
  nodeA: { x: number; y: number },
  nodeB: { x: number; y: number },
  maxDistance: number
): boolean {
  return calculateDistance(nodeA, nodeB) <= maxDistance;
}

/**
 * Calculate utilization
 */
export function calculateUtilization(flow: number, capacity: number): number {
  if (capacity <= 0) return 1;
  return Math.min(1, flow / capacity);
}

/**
 * Check if node is overloaded
 */
export function isOverloaded(node: NetworkNode, config: NetworkConfig): boolean {
  for (const [resourceType, flow] of node.resources) {
    const utilization = calculateUtilization(flow.output, flow.capacity);
    if (utilization >= config.overloadThreshold) {
      return true;
    }
  }
  return false;
}

/**
 * Check if connection is overloaded
 */
export function isConnectionOverloaded(
  connection: NetworkConnection,
  config: NetworkConfig
): boolean {
  for (const [resourceType, flow] of connection.flows) {
    const capacity = connection.capacities.get(resourceType) || 0;
    const utilization = calculateUtilization(flow, capacity);
    if (utilization >= config.overloadThreshold) {
      return true;
    }
  }
  return false;
}

/**
 * Generate connection ID
 */
export function generateConnectionId(fromNodeId: NodeId, toNodeId: NodeId): string {
  return `${fromNodeId}-${toNodeId}`;
}

/**
 * Parse connection ID
 */
export function parseConnectionId(connectionId: string): { from: NodeId; to: NodeId } {
  const [from, to] = connectionId.split('-');
  return { from, to };
}
