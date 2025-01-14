import Association from './Association';
import Assignment from './Assignment';

import { Graph } from 'graphlib';
import type PAP from './pap.ts';
import Node from './node.ts';
import type { Edge } from 'graphlib';
/**
 * Policy Administration Point (PAP)
 * 
 * Implements the management of nodes, edges, and the directed graph.
 */
export default class PolicyAdministrationPoint implements PAP {
    private graph: Graph;
    private assignments: Array<Assignment>;
    private associations: Array<Association>;
  
    constructor() {
        this.graph = new Graph({ directed: true });
        this.assignments = new Array<Assignment>();
        this.associations = new Array<Association>();
    }

    /**
     * Adds a node to the graph. Optionally connects it to another node with an edge and attributes.
     * @param node - The node to add.
     * @param connectTo - The ID of the node to connect to (optional).
     * @param edgeAttributes - Attributes for the edge (optional).
     */
    addNode(node: Node): void {
        if (!this.graph.hasNode(node.id.toString())) {
            this.graph.setNode(node.id.toString(), node);
        }
    }

    /**
     * Deletes a node and all nodes and edges connected to it.
     * @param nodeId - The ID of the node to delete.
     */
    deleteNode(nodeId: number): void {
        const nodeIdStr = nodeId.toString();

        if (!this.graph.hasNode(nodeIdStr)) {
            throw new Error(`Node with ID ${nodeId} does not exist`);
        }

        // Collect all connected nodes and edges
        const connectedEdges = this.graph.nodeEdges(nodeIdStr) || [];

        for (const edge of connectedEdges) {
            const targetNodeId = edge.v === nodeIdStr ? edge.w : edge.v;
            this.deleteEdge(Number(edge.v), Number(edge.w));
            if (this.graph.hasNode(targetNodeId)) {
                this.graph.removeNode(targetNodeId);
            }
        }

        // Remove the node itself
        this.graph.removeNode(nodeIdStr);
    }

    /**
     * Retrieves a node from the graph.
     * @param nodeId - The ID of the node to retrieve.
     * @returns The node, or undefined if it does not exist.
     */
    getNode(nodeId: number): Node | undefined {
        return this.graph.node(nodeId.toString());
    }

    /**
     * Updates a node in the graph.
     * @param nodeId - The ID of the node to update.
     * @param newData - The updated data for the node.
     */
    updateNode(nodeId: number, newData: Partial<Node>): void {
        const existingNode = this.getNode(nodeId);
        if (!existingNode) {
            throw new Error(`Node with ID ${nodeId} does not exist`);
        }

        const updatedNode = { ...existingNode, ...newData };
        this.graph.setNode(nodeId.toString(), updatedNode);
    }

    /**
     * Deletes an edge between two nodes.
     * @param fromNodeId - The ID of the source node.
     * @param toNodeId - The ID of the target node.
     */
    deleteEdge(fromNodeId: number, toNodeId: number): void {
        this.graph.removeEdge(fromNodeId.toString(), toNodeId.toString());
    }

    /**
     * Retrieves an edge between two nodes.
     * @param fromNodeId - The ID of the source node.
     * @param toNodeId - The ID of the target node.
     * @returns The edge, or undefined if it does not exist.
     */
    getEdge(fromNodeId: number, toNodeId: number): Edge | undefined {
        return this.graph.edge(fromNodeId.toString(), toNodeId.toString());
    }

    /**
     * Adds an edge between two nodes in the graph with attributes.
     * @param fromNodeId - The ID of the source node.
     * @param toNodeId - The ID of the target node.
     * @param operations - Set of operations for the edge.
     */
    addEdge(fromNodeId: number, toNodeId: number, operations?: Set<string>): void {
        const fromNodeStr = fromNodeId.toString();
        const toNodeStr = toNodeId.toString();

        if (!this.graph.hasNode(fromNodeStr) || !this.graph.hasNode(toNodeStr)) {
            throw new Error(`One or both nodes (${fromNodeId}, ${toNodeId}) do not exist`);
        }

        this.graph.setEdge(fromNodeStr, toNodeStr, operations);
    }

    /**
     * Updates the attributes of an edge between two nodes in the graph.
     * @param fromNodeId - The ID of the source node.
     * @param toNodeId - The ID of the target node.
     * @param operations - New set of operations for the edge.
     */
    updateEdge(fromNodeId: number, toNodeId: number, operations: Set<string>): void {
        if (!this.graph.hasEdge(fromNodeId.toString(), toNodeId.toString())) {
            throw new Error(`Edge between ${fromNodeId} and ${toNodeId} does not exist`);
        }

        this.graph.setEdge(fromNodeId.toString(), toNodeId.toString(), operations);
    }

    /**
     * Retrieves the main graph.
     * @returns The graph.
     */
    getMainGraph(): Graph {
        return this.graph;
    }
  
    createAssignment(parent: Node, child: Node) {
        var assign = new Assignment(parent, child);
        this.addEdge(child.id, parent.id);
        for (const a of this.getAssignmentsParent(parent.id)) {
          // If this assignment already exists
          if (a == child.id) {
            return null;
          }
        }
        this.assignments.push(assign);
        return assign;
      }
    
      createAssociation(start: Node, end: Node, operations: Set<string>) {
        var assoc = new Association(start, end, operations);
        this.addEdge(start.id, end.id, operations);
        for (const a of this.getAssociationsStarting(start)) {
          // If this association already exists
          if (a.equals(assoc)) {
            return null;
          }
        }
        this.associations.push(assoc);
        return assoc;
      }
    
      getAssociationsStarting(start: Node) {
        let all: Association[] = [];
        for (const a of this.associations) {
          if (start.equals(a.getStart())) {
            all.push(a);
          }
        }
        return all;
      }
    
      getAssociationsEnding(end: Node) {
        let all: Association[] = [];
        for (const a of this.associations) {
          if (end.equals(a.getEnd())) {
            all.push(a);
          }
        }
        return all;
      }
    
      getAssignmentsParent(parent: number): number[] {
        const parentNode = this.getNode(parent);
        let all: number[] = [];
        for (const a of this.assignments) {
          if (parentNode && parentNode.equals(a.getParent())) {
            all.push(a.child.id);
          }
        }
        return all;
      }
    
      getAssignmentsChild(child: number): number[] {
        const childNode = this.getNode(child);
        let all: number[] = [];
        console.log('all assigns: ', this.assignments)
        console.log('childnode: ', childNode)
        for (const a of this.assignments) {
          if (childNode && childNode.equals(a.getChild())) {
            all.push(a.parent.id);
          }
        }
        return all;
      }
    
      getAllAssociations() { return this.associations; }
      getAllAssignments() { return this.assignments; }
}
