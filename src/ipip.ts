import { Graph } from 'graphlib';
import Node from './node'; // Adjust the path accordingly

/**
 * Interface for the Policy Information Point (PIP)
 * 
 * The PIP manages policyClass nodes, connects them to nodes in the main graph,
 * and provides functionality to combine each policyClass node with its connections to create new graphs.
 */
export interface IPIP {
    /**
     * Adds a node to the PIP. Adds to the main graph or stores separately if it is a policyClass node.
     * @param node - The node to add.
     */
    addNode(node: Node): void;

    /**
     * Connects a policyClass node to a node in the main graph.
     * @param policyClassId - The ID of the policyClass node.
     * @param nodeId - The ID of the node in the main graph to connect to.
     */
    connectPolicyClassNode(policyClassId: number, nodeId: number): void;

    /**
     * Creates a combined graph for a specific policyClass node.
     * The combined graph includes the policyClass node and its connected nodes from the main graph.
     * @param policyClassId - The ID of the policyClass node to combine with its connections.
     * @returns A new Graph instance combining the policyClass node and its connected nodes.
     */
    createCombinedGraph(policyClassId: number): Graph;

    /**
     * Retrieves all policyClass nodes stored in the PIP.
     * @returns An array of policyClass nodes.
     */
    getAllPolicyClassNodes(): Node[];

    /**
     * Retrieves all nodes in the main graph.
     * @returns An array of nodes in the main graph.
     */
    getAllGraphNodes(): Node[];
}
