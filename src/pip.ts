import { Graph, json as graphlibJson } from "graphlib";
import type IPIP  from './ipip';

export class PolicyInformationPoint implements IPIP {
    private graphJson: string = "";

    /**
     * Store the graph in JSON format.
     * @param graphJson - The JSON string representing the graph.
     */
    storeGraph(graphJson: string): void {
        this.graphJson = graphJson;
    }

    /**
     * Retrieve the stored graph as a Graph object.
     * @returns A Graph object constructed from the stored JSON.
     */
    retrieveGraph(): Graph {
        if (!this.graphJson) {
            throw new Error("No graph is stored.");
        }
        const parsedData = JSON.parse(this.graphJson);
        return graphlibJson.read(parsedData);
    }

    /**
     * Retrieve the stored graph as a JSON string.
     * @returns The stored graph JSON string.
     */
    retrieveGraphAsJson(): string {
        if (!this.graphJson) {
            throw new Error("No graph is stored.");
        }
        return this.graphJson;
    }
}
