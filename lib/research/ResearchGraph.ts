/**
 * Research Graph
 * Tree-based research graph with dependencies and node management
 * Supports unlimited categories and 1000+ technologies
 */

import type {
  ResearchNode,
  ResearchCategory,
  ResearchNodeState,
} from './types';
import {
  ResearchNodeState as ResearchNodeStateEnum,
} from './types';

/**
 * Research graph class
 */
export class ResearchGraph {
  private nodes: Map<string, ResearchNode>;
  private categoryMap: Map<ResearchCategory, Set<string>>;

  constructor() {
    this.nodes = new Map();
    this.categoryMap = new Map();
  }

  /**
   * Add research node
   */
  addNode(node: ResearchNode): void {
    this.nodes.set(node.id, node);
    
    // Add to category map
    if (!this.categoryMap.has(node.category)) {
      this.categoryMap.set(node.category, new Set());
    }
    this.categoryMap.get(node.category)!.add(node.id);
  }

  /**
   * Remove research node
   */
  removeNode(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    // Remove from category map
    this.categoryMap.get(node.category)?.delete(nodeId);
    
    // Remove node
    this.nodes.delete(nodeId);
  }

  /**
   * Get research node
   */
  getNode(nodeId: string): ResearchNode | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * Get all research nodes
   */
  getAllNodes(): ResearchNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Get nodes by category
   */
  getNodesByCategory(category: ResearchCategory): ResearchNode[] {
    const nodeIds = this.categoryMap.get(category);
    if (!nodeIds) return [];

    return Array.from(nodeIds)
      .map(id => this.nodes.get(id))
      .filter((node): node is ResearchNode => node !== undefined);
  }

  /**
   * Get nodes by state
   */
  getNodesByState(state: ResearchNodeState): ResearchNode[] {
    return Array.from(this.nodes.values()).filter(node => node.state === state);
  }

  /**
   * Get available nodes (dependencies met)
   */
  getAvailableNodes(): ResearchNode[] {
    return Array.from(this.nodes.values()).filter(node => {
      if (node.state !== ResearchNodeStateEnum.LOCKED) return false;
      return this.areDependenciesMet(node);
    });
  }

  /**
   * Check if dependencies are met
   */
  areDependenciesMet(node: ResearchNode): boolean {
    for (const depId of node.dependencies) {
      const depNode = this.nodes.get(depId);
      if (!depNode || depNode.state !== ResearchNodeStateEnum.COMPLETED) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get dependent nodes (nodes that depend on this node)
   */
  getDependentNodes(nodeId: string): ResearchNode[] {
    return Array.from(this.nodes.values()).filter(node =>
      node.dependencies.includes(nodeId)
    );
  }

  /**
   * Get research tree (root nodes and their children)
   */
  getResearchTree(): ResearchTreeNode[] {
    const rootNodes = this.getRootNodes();
    return rootNodes.map(node => this.buildTreeNode(node));
  }

  /**
   * Get root nodes (nodes with no dependencies)
   */
  private getRootNodes(): ResearchNode[] {
    return Array.from(this.nodes.values()).filter(node => 
      node.dependencies.length === 0
    );
  }

  /**
   * Build tree node structure
   */
  private buildTreeNode(node: ResearchNode): ResearchTreeNode {
    const children = this.getDependentNodes(node.id)
      .filter(child => this.areDependenciesMet(child))
      .map(child => this.buildTreeNode(child));

    return {
      node,
      children,
    };
  }

  /**
   * Update node state
   */
  updateNodeState(nodeId: string, state: ResearchNodeState): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    node.state = state;
    node.updatedAt = Date.now();

    // Update dependent nodes
    if (state === ResearchNodeStateEnum.COMPLETED) {
      this.updateDependentNodes(nodeId);
    }
  }

  /**
   * Update dependent nodes when a node is completed
   */
  private updateDependentNodes(nodeId: string): void {
    const dependents = this.getDependentNodes(nodeId);
    
    for (const dependent of dependents) {
      if (dependent.state === ResearchNodeStateEnum.LOCKED && this.areDependenciesMet(dependent)) {
        dependent.state = ResearchNodeStateEnum.AVAILABLE;
        dependent.updatedAt = Date.now();
      }
    }
  }

  /**
   * Update node progress
   */
  updateNodeProgress(nodeId: string, progress: number): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    node.progress = Math.max(0, Math.min(1, progress));
    node.updatedAt = Date.now();
  }

  /**
   * Get research path (shortest path to target node)
   */
  getResearchPath(targetNodeId: string): string[] {
    const targetNode = this.nodes.get(targetNodeId);
    if (!targetNode) return [];

    const path: string[] = [targetNodeId];
    const visited = new Set<string>();

    let currentNode = targetNode;
    while (currentNode.dependencies.length > 0 && !visited.has(currentNode.id)) {
      visited.add(currentNode.id);
      
      // Find first unvisited dependency
      for (const depId of currentNode.dependencies) {
        const depNode = this.nodes.get(depId);
        if (depNode && !visited.has(depId)) {
          path.unshift(depId);
          currentNode = depNode;
          break;
        }
      }
    }

    return path;
  }

  /**
   * Get state
   */
  getState(): Map<string, ResearchNode> {
    return new Map(this.nodes);
  }

  /**
   * Set state
   */
  setState(state: Map<string, ResearchNode>): void {
    this.nodes = new Map(state);
    
    // Rebuild category map
    this.categoryMap.clear();
    for (const node of this.nodes.values()) {
      if (!this.categoryMap.has(node.category)) {
        this.categoryMap.set(node.category, new Set());
      }
      this.categoryMap.get(node.category)!.add(node.id);
    }
  }

  /**
   * Reset research graph
   */
  reset(): void {
    this.nodes.clear();
    this.categoryMap.clear();
  }

  /**
   * Get node count
   */
  getNodeCount(): number {
    return this.nodes.size;
  }

  /**
   * Get completed node count
   */
  getCompletedNodeCount(): number {
    return this.getNodesByState(ResearchNodeStateEnum.COMPLETED).length;
  }

  /**
   * Get available node count
   */
  getAvailableNodeCount(): number {
    return this.getAvailableNodes().length;
  }
}

/**
 * Research tree node interface
 */
export interface ResearchTreeNode {
  node: ResearchNode;
  children: ResearchTreeNode[];
}
