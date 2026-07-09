/**
 * Flow Calculator
 * Calculates resource flow across the network
 * Generic algorithm that works for all resource types
 */

import type {
  NetworkGraph,
  NetworkNode,
  NetworkConnection,
  ResourceType,
  FlowResult,
  NetworkFlowState,
  NetworkConfig,
} from './types';
import {
  calculateUtilization,
  DEFAULT_RESOURCE_CONFIGS,
} from './types';

/**
 * Flow calculator class
 */
export class FlowCalculator {
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
   * Calculate flow for a specific resource type
   */
  calculateFlow(
    graph: NetworkGraph,
    resourceType: ResourceType
  ): NetworkFlowState {
    const flows = new Map<string, FlowResult>();
    const bottlenecks = new Set<string>();
    const disconnectedNodes = new Set<string>();

    // Initialize flows for all nodes
    for (const [nodeId, node] of graph.nodes) {
      const resourceFlow = node.resources.get(resourceType);
      if (!resourceFlow) {
        // Initialize if not exists
        const config = DEFAULT_RESOURCE_CONFIGS[resourceType];
        node.resources.set(resourceType, {
          input: 0,
          output: 0,
          net: 0,
          capacity: config.defaultCapacity,
          utilization: 0,
        });
      }

      flows.set(nodeId, {
        nodeId,
        resourceType,
        input: 0,
        output: 0,
        net: 0,
        capacity: node.resources.get(resourceType)!.capacity,
        utilization: 0,
        bottlenecks: [],
        disconnected: false,
      });
    }

    // Calculate flow using max-flow algorithm
    this.calculateMaxFlow(graph, resourceType, flows, bottlenecks);

    // Identify disconnected nodes
    this.identifyDisconnectedNodes(graph, flows, disconnectedNodes);

    // Calculate total flow and capacity
    let totalFlow = 0;
    let totalCapacity = 0;

    for (const flow of flows.values()) {
      totalFlow += flow.output;
      totalCapacity += flow.capacity;
    }

    const utilization = totalCapacity > 0 ? totalFlow / totalCapacity : 0;

    return {
      flows,
      totalFlow,
      totalCapacity,
      utilization,
      bottlenecks,
      disconnectedNodes,
    };
  }

  /**
   * Calculate max flow using iterative algorithm
   */
  private calculateMaxFlow(
    graph: NetworkGraph,
    resourceType: ResourceType,
    flows: Map<string, FlowResult>,
    bottlenecks: Set<string>
  ): void {
    const iterations = this.config.maxFlowIterations;
    const threshold = this.config.flowConvergenceThreshold;

    let previousTotalFlow = 0;
    let converged = false;

    for (let i = 0; i < iterations && !converged; i++) {
      // Reset flows for this iteration
      for (const flow of flows.values()) {
        flow.input = 0;
        flow.output = 0;
        flow.net = 0;
      }

      // Calculate flow from producers to consumers
      this.distributeFlow(graph, resourceType, flows);

      // Update connection flows
      this.updateConnectionFlows(graph, resourceType, flows);

      // Check for convergence
      let totalFlow = 0;
      for (const flow of flows.values()) {
        totalFlow += flow.output;
      }

      const change = Math.abs(totalFlow - previousTotalFlow);
      if (change < threshold) {
        converged = true;
      }

      previousTotalFlow = totalFlow;
    }

    // Identify bottlenecks
    this.identifyBottlenecks(flows, bottlenecks);
  }

  /**
   * Distribute flow from producers to consumers
   */
  private distributeFlow(
    graph: NetworkGraph,
    resourceType: ResourceType,
    flows: Map<string, FlowResult>
  ): void {
    // Find producers (nodes with positive net output)
    const producers: string[] = [];
    const consumers: string[] = [];

    for (const [nodeId, node] of graph.nodes) {
      const resourceFlow = node.resources.get(resourceType);
      if (!resourceFlow) continue;

      // Assume producers generate resources (solar panels, batteries)
      // Consumers consume resources (GPUs, cooling)
      if (this.isProducer(node.type)) {
        producers.push(nodeId);
      } else {
        consumers.push(nodeId);
      }
    }

    // Sort by priority
    producers.sort((a, b) => {
      const nodeA = graph.nodes.get(a)!;
      const nodeB = graph.nodes.get(b)!;
      return nodeA.priority - nodeB.priority;
    });

    consumers.sort((a, b) => {
      const nodeA = graph.nodes.get(a)!;
      const nodeB = graph.nodes.get(b)!;
      return nodeA.priority - nodeB.priority;
    });

    // Distribute flow from producers to consumers
    for (const producerId of producers) {
      const producerFlow = flows.get(producerId)!;
      const producerNode = graph.nodes.get(producerId)!;
      const resourceFlow = producerNode.resources.get(resourceType)!;

      // Producer output is based on capacity
      producerFlow.output = resourceFlow.capacity;
      producerFlow.net = producerFlow.output;

      // Distribute to consumers
      let remainingFlow = producerFlow.output;

      for (const consumerId of consumers) {
        if (remainingFlow <= 0) break;

        const consumerFlow = flows.get(consumerId)!;
        const consumerNode = graph.nodes.get(consumerId)!;
        const consumerResourceFlow = consumerNode.resources.get(resourceType)!;

        // Check if connected
        if (!this.isConnected(graph, producerId, consumerId)) {
          continue;
        }

        // Calculate demand
        const demand = consumerResourceFlow.capacity - consumerFlow.input;
        const flowAmount = Math.min(remainingFlow, demand);

        consumerFlow.input += flowAmount;
        consumerFlow.output = consumerFlow.input * 0.9; // 10% loss
        consumerFlow.net = consumerFlow.output - consumerFlow.input;

        remainingFlow -= flowAmount;
      }
    }
  }

  /**
   * Update connection flows
   */
  private updateConnectionFlows(
    graph: NetworkGraph,
    resourceType: ResourceType,
    flows: Map<string, FlowResult>
  ): void {
    for (const connection of graph.connections.values()) {
      const fromFlow = flows.get(connection.fromNodeId);
      const toFlow = flows.get(connection.toNodeId);

      if (!fromFlow || !toFlow) continue;

      // Calculate flow through connection
      const flowAmount = Math.min(fromFlow.output, toFlow.capacity - toFlow.input);
      connection.flows.set(resourceType, flowAmount);

      // Update utilization
      const capacity = connection.capacities.get(resourceType) || 0;
      const utilization = calculateUtilization(flowAmount, capacity);
    }
  }

  /**
   * Check if two nodes are connected
   */
  private isConnected(
    graph: NetworkGraph,
    fromNodeId: string,
    toNodeId: string
  ): boolean {
    const neighbors = graph.adjacencyList.get(fromNodeId);
    return neighbors?.has(toNodeId) || false;
  }

  /**
   * Identify bottlenecks
   */
  private identifyBottlenecks(
    flows: Map<string, FlowResult>,
    bottlenecks: Set<string>
  ): void {
    for (const [nodeId, flow] of flows) {
      if (flow.utilization >= this.config.overloadThreshold) {
        bottlenecks.add(nodeId);
        flow.bottlenecks.push(nodeId);
      }
    }
  }

  /**
   * Identify disconnected nodes
   */
  private identifyDisconnectedNodes(
    graph: NetworkGraph,
    flows: Map<string, FlowResult>,
    disconnectedNodes: Set<string>
  ): void {
    // Find nodes with no connections
    for (const [nodeId, node] of graph.nodes) {
      const neighbors = graph.adjacencyList.get(nodeId);
      const reverseNeighbors = graph.reverseAdjacencyList.get(nodeId);

      if ((!neighbors || neighbors.size === 0) && 
          (!reverseNeighbors || reverseNeighbors.size === 0)) {
        disconnectedNodes.add(nodeId);
        const flow = flows.get(nodeId);
        if (flow) {
          flow.disconnected = true;
        }
      }
    }
  }

  /**
   * Check if node is a producer
   */
  private isProducer(nodeType: string): boolean {
    const producers = ['solar_panel', 'battery', 'power_generator'];
    return producers.includes(nodeType);
  }

  /**
   * Calculate flow for all resource types
   */
  calculateAllFlows(graph: NetworkGraph): Map<ResourceType, NetworkFlowState> {
    const allFlows = new Map<ResourceType, NetworkFlowState>();

    for (const resourceType of Object.keys(DEFAULT_RESOURCE_CONFIGS)) {
      const flowState = this.calculateFlow(graph, resourceType as ResourceType);
      allFlows.set(resourceType as ResourceType, flowState);
    }

    return allFlows;
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
