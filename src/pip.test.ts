import { PolicyInformationPoint } from "./PIPImpl";
import { Graph, json as graphlibJson } from "graphlib";

const graph = new Graph({ directed: true });
graph.setNode("1", { name: "UserNode", type: "user" });
graph.setNode("2", { name: "ResourceNode", type: "object" });
graph.setEdge("1", "2", { permission: "read" });

const graphJson = JSON.stringify(graphlibJson.write(graph));

const pip = new PolicyInformationPoint();
pip.storeGraph(graphJson);

const retrievedGraph = pip.retrieveGraph();
console.log("Retrieved Nodes:", retrievedGraph.nodes());
console.log("Retrieved Edges:", retrievedGraph.edges());

console.log("Stored JSON:", pip.retrieveGraphAsJson());
