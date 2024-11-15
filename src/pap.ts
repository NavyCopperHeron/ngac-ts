// import Association from './Association';

// /**
//  * Stores and returns stored data
//  */

// export default class PAP {

//   createAssociation(start: Node, end: Node, operations: Array<String>) {}

//   getAssociations(start: Node) {
//     let associations: Association[] = [];
//     return associations;
//   }

// }

import { Graph } from 'graphlib';
import type IPAP from './ipap';
import Node from './node';

/**
 * PolicyAdministrationPoint class
 * 
 * Manages nodes, their relationships, and dynamically updates combined graphs.
 * Edges in the graph represent relationships and include permissions (read/write).
 */
export class PolicyAdministrationPoint {
  private graph: Graph = new Graph({ directed: true });
  private policyClassNodes: Map<number, Node> = new Map();
  private policyClassConnections: Map<number, string[]> = new Map();

  addNode(node: Node): void {
      this.graph.setNode(node.id.toString(), node);
  }

  addEdge(fromNodeId: number, toNodeId: number, edgeAttributes?: { permission: string }): void {
      if (!this.graph.hasNode(fromNodeId.toString()) || !this.graph.hasNode(toNodeId.toString())) {
          throw new Error(`One or both nodes (${fromNodeId}, ${toNodeId}) do not exist`);
      }
      this.graph.setEdge(fromNodeId.toString(), toNodeId.toString(), edgeAttributes || {});
  }

  addPolicyClassNode(node: Node): void {
      if (node.type !== "policyClass") {
          throw new Error("Node type must be 'policyClass'");
      }
      this.policyClassNodes.set(node.id, node);
      this.policyClassConnections.set(node.id, []);
  }

  connectPolicyClassNode(policyClassId: number, nodeId: number): void {
      if (!this.policyClassNodes.has(policyClassId)) {
          throw new Error(`PolicyClass node with ID ${policyClassId} does not exist`);
      }
      if (!this.graph.hasNode(nodeId.toString())) {
          throw new Error(`Node with ID ${nodeId} does not exist`);
      }

      const connections = this.policyClassConnections.get(policyClassId) || [];
      if (!connections.includes(nodeId.toString())) {
          connections.push(nodeId.toString());
          this.policyClassConnections.set(policyClassId, connections);
      }
  }

  createCombinedGraph(policyClassId: number): Graph {
      const combinedGraph = new Graph({ directed: true });
      const policyClassNode = this.policyClassNodes.get(policyClassId);

      if (!policyClassNode) {
          throw new Error(`PolicyClass node with ID ${policyClassId} not found`);
      }

      // Add the policyClass node to the combined graph
      combinedGraph.setNode(policyClassNode.id.toString(), policyClassNode);

      // Track visited nodes and perform a breadth-first traversal
      const visited = new Set<string>();
      const queue = [...(this.policyClassConnections.get(policyClassId) || [])];

      while (queue.length > 0) {
          const currentNodeId = queue.shift()!;
          if (visited.has(currentNodeId)) {
              continue;
          }
          visited.add(currentNodeId);

          // Add the node to the combined graph
          const currentNode = this.graph.node(currentNodeId);
          if (currentNode) {
              combinedGraph.setNode(currentNodeId, currentNode);
          }

          // Add edges from the main graph
          const edges = this.graph.outEdges(currentNodeId) || [];
          for (const edge of edges) {
              const targetNodeId = edge.w;
              const edgeAttributes = this.graph.edge(edge);

              if (!visited.has(targetNodeId)) {
                  queue.push(targetNodeId);
              }

              combinedGraph.setEdge(edge.v, edge.w, edgeAttributes);
          }
      }

      return combinedGraph;
  }

  getMainGraph(): Graph {
      return this.graph;
  }
}