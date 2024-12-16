import { Graph } from "graphlib";

/**
 * Policy Information Point (PIP) Interface
 * 
 * The PIP only stores and retrieves a directed graph in JSON format.
 */
export default interface PIP {
    // Store a graph as JSON
    storeGraph(graphJson: string): void;

    // Retrieve the stored graph as a Graph object
    retrieveGraph(): Graph;

    // Retrieve the stored graph as JSON
    retrieveGraphAsJson(): string;
}
