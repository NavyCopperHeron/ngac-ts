import { Graph } from 'graphlib';
import type { Edge } from 'graphlib';
import Node from './node.ts';
import Association from './Association';
import Assignment from './Assignment';
/**
 * Interface for Policy Administration Point (PAP)
 * 
 * Manages the whole graph
 */
export default interface PAP {
    // Node management
    addNode(node: Node, connectTo?: number, operations?: Set<string>): void;
    deleteNode(nodeId: number): void;
    getNode(nodeId: number): Node | undefined;
    updateNode(nodeId: number, newData: Partial<Node>): void;

    // Edge management
    addEdge(fromNodeId: number, toNodeId: number, operations?: Set<string>): void;
    updateEdge(fromNodeId: number, toNodeId: number, operations: Set<string>): void;
    deleteEdge(fromNodeId: number, toNodeId: number):void;
    getEdge(fromNodeId: number, toNodeId: number):Edge | undefined;
    getMainGraph(): Graph;
    
    getAllAssociations():Array<Association>;
    getAllAssignments():Array<Assignment>;
    createAssignment(parent: Node, child: Node):any;
    createAssociation(start: Node, end: Node, operations: Set<string>):any;
    getAssociationsStarting(start: Node):Association[];
    getAssociationsEnding(end: Node):Association[];
    getAssignmentsParent(parent: number):number[];
    getAssignmentsChild(child: number):number[];
}