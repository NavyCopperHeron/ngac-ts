import { Graph } from 'graphlib';
import type { IPIP } from './ipip'; // Update the path as needed
import Node from './node'; // Update the path as needed

/**
 * PolicyInformationPoint class implements IPIP
 * 
 * Manages policyClass nodes separately and connects them to nodes in a main graph.
 * Provides functionality to create a combined graph for each policyClass node with its connected nodes.
 */
export class PolicyInformationPoint implements IPIP {
    private policyClassNodes: Map<number, Node> = new Map(); // Stores policyClass nodes by their ID
    private graph: Graph = new Graph(); // Main graph for non-policyClass nodes
    private policyClassConnections: Map<number, string[]> = new Map(); // Maps policyClass node ID to connected graph node IDs

    /**
     * Adds a node to the PIP. If it's a policyClass node, stores it separately;
     * otherwise, adds it to the main graph.
     * @param node - The node to add.
     */
    addNode(node: Node): void {
        if (node.type === 'policyClass') {
            this.policyClassNodes.set(node.id, node);
            this.policyClassConnections.set(node.id, []);
        } else {
            this.graph.setNode(node.id.toString(), node);
        }
    }

    /**
     * Connects a policyClass node to a node in the main graph.
     * @param policyClassId - The ID of the policyClass node.
     * @param nodeId - The ID of the node in the main graph to connect to.
     */
    connectPolicyClassNode(policyClassId: number, nodeId: number): void {
        if (this.policyClassNodes.has(policyClassId) && this.graph.hasNode(nodeId.toString())) {
            const connections = this.policyClassConnections.get(policyClassId) || [];
            connections.push(nodeId.toString());
            this.policyClassConnections.set(policyClassId, connections);
        } else {
            throw new Error(`Either policyClass node ${policyClassId} or graph node ${nodeId} does not exist.`);
        }
    }

    /**
     * Creates a combined graph for a specific policyClass node.
     * @param policyClassId - The ID of the policyClass node.
     * @returns A new Graph combining the policyClass node and its connected nodes.
     */
    createCombinedGraph(policyClassId: number): Graph {
        const combinedGraph = new Graph();
        const policyClassNode = this.policyClassNodes.get(policyClassId);

        if (!policyClassNode) {
            throw new Error(`Policy class node with ID ${policyClassId} not found`);
        }

        // Add the policyClass node to the combined graph
        combinedGraph.setNode(policyClassNode.id.toString(), policyClassNode);

        // Add connected nodes and edges to the combined graph
        const connectedNodeIds = this.policyClassConnections.get(policyClassId) || [];
        for (const nodeId of connectedNodeIds) {
            const connectedNode = this.graph.node(nodeId);
            if (connectedNode) {
                combinedGraph.setNode(nodeId, connectedNode);
                combinedGraph.setEdge(policyClassNode.id.toString(), nodeId); // Create edge from policyClass to connected nodes
            }
        }

        return combinedGraph;
    }

    /**
     * Retrieves all policyClass nodes.
     * @returns An array of policyClass nodes.
     */
    getAllPolicyClassNodes(): Node[] {
        return Array.from(this.policyClassNodes.values());
    }

    /**
     * Retrieves all nodes in the main graph.
     * @returns An array of nodes in the main graph.
     */
    getAllGraphNodes(): Node[] {
        return this.graph.nodes().map(nodeId => this.graph.node(nodeId));
    }
}


