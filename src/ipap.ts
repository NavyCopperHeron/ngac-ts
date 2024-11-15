import { Graph } from 'graphlib';
import Node from './node';

/**
 * Interface for Policy Administration Point (PAP)
 * 
 * Manages the main graph and policyClass nodes, ensuring dynamic updates
 * to combined graphs when the main graph changes.
 */
export default interface IPAP {
    // Node management
    addNode(node: Node, connectTo?: number, edgeAttributes?: { permission: string }): void;
    deleteNode(nodeId: number): void;
    getNode(nodeId: number): Node | undefined;
    updateNode(nodeId: number, newData: Partial<Node>): void;

    // Edge management
    addEdge(fromNodeId: number, toNodeId: number, edgeAttributes: { permission: string }): void;
    updateEdge(fromNodeId: number, toNodeId: number, newEdgeAttributes: { permission: string }): void;

    // Policy class management
    addPolicyClassNode(node: Node): void;
    connectPolicyClassNode(policyClassId: number, nodeId: number): void;
    deletePolicyClassNode(policyClassId: number): void;
    getPolicyClassNode(policyClassId: number): Node | undefined;

    // Graph operations
    createCombinedGraph(policyClassId: number): Graph;
    getMainGraph(): Graph;
}
