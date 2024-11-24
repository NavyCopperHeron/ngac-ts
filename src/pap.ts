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
import type { Edge } from 'graphlib';
/**
 * Policy Administration Point (PAP)
 * 
 * Implements the management of nodes, edges, and the directed graph.
 */
export class PolicyAdministrationPoint implements IPAP {
    private graph: Graph;

    constructor() {
        this.graph = new Graph({ directed: true });
    }

    /**
     * Adds a node to the graph. Optionally connects it to another node with an edge and attributes.
     * @param node - The node to add.
     * @param connectTo - The ID of the node to connect to (optional).
     * @param edgeAttributes - Attributes for the edge (optional).
     */
    addNode(node: Node, connectTo?: number, edgeAttributes?: { permission: string }): void {
        this.graph.setNode(node.id.toString(), node);

        if (connectTo !== undefined && edgeAttributes) {
            this.addEdge(node.id, connectTo, edgeAttributes);
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
     * Adds an edge between two nodes in the graph with attributes.
     * @param fromNodeId - The ID of the source node.
     * @param toNodeId - The ID of the target node.
     * @param edgeAttributes - Attributes for the edge.
     */
    addEdge(fromNodeId: number, toNodeId: number, edgeAttributes: { permission: string }): void {
        const fromNodeStr = fromNodeId.toString();
        const toNodeStr = toNodeId.toString();

        if (!this.graph.hasNode(fromNodeStr) || !this.graph.hasNode(toNodeStr)) {
            throw new Error(`One or both nodes (${fromNodeId}, ${toNodeId}) do not exist`);
        }

        this.graph.setEdge(fromNodeStr, toNodeStr, edgeAttributes);
    }

    /**
     * Updates the attributes of an edge between two nodes in the graph.
     * @param fromNodeId - The ID of the source node.
     * @param toNodeId - The ID of the target node.
     * @param newEdgeAttributes - New attributes for the edge.
     */
    updateEdge(fromNodeId: number, toNodeId: number, newEdgeAttributes: { permission: string }): void {
        if (!this.graph.hasEdge(fromNodeId.toString(), toNodeId.toString())) {
            throw new Error(`Edge between ${fromNodeId} and ${toNodeId} does not exist`);
        }

        this.graph.setEdge(fromNodeId.toString(), toNodeId.toString(), newEdgeAttributes);
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
     * Retrieves the main graph.
     * @returns The graph.
     */
    getMainGraph(): Graph {
        return this.graph;
    }
}