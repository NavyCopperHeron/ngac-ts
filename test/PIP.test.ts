import { describe, expect, test } from "bun:test";
import { PolicyInformationPoint } from "../src/PIPImpl";
import { Graph, json as graphlibJson } from "graphlib";

describe("PolicyInformationPoint", () => {
  test("should correctly store and retrieve a graph", () => {

    const graph = new Graph({ directed: true });
    graph.setNode("1", { name: "UserNode", type: "user" });
    graph.setNode("2", { name: "ResourceNode", type: "object" });
    graph.setEdge("1", "2", { permission: "read" });

    const graphJson = JSON.stringify(graphlibJson.write(graph));

    const pip = new PolicyInformationPoint();
    pip.storeGraph(graphJson);


    const retrievedGraph = pip.retrieveGraph();

    expect(retrievedGraph.nodes()).toEqual(graph.nodes());
    expect(retrievedGraph.edges()).toEqual(graph.edges());

    expect(pip.retrieveGraphAsJson()).toEqual(graphJson);
  });
});
