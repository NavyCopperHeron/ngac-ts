import { Graph } from 'graphlib';
import type { Edge } from 'graphlib';
import Node from './node';

/**
 * Interface for Policy Administration Point (PAP)
 * 
 * Manages the whole graph
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
    deleteEdge(fromNodeId: number, toNodeId: number):void;
    getEdge(fromNodeId: number, toNodeId: number):Edge | undefined;
    getMainGraph(): Graph;
}
