import { expect, test } from "bun:test";
import { PolicyInformationPoint } from "./pip.ts";
import Node from './node';
import { Graph } from 'graphlib';
test("create new example", () => {
  // Example usage:
  const pip = new PolicyInformationPoint();
  // Initialize the graph
  const graph = new Graph();
  // Add policyClass node
  const policyClassNode = new Node(1, "PolicyClass1", "policyClass");
  pip.addNode(policyClassNode);

  // Add some regular nodes to the main graph
  const nodeA = new Node(2, "UserNode", "user");
  const nodeB = new Node(3, "ObjectNode", "object");
  const nodeC = new Node(4, "ObjectAttributeNode", "objectAttribute");
  pip.addNode(nodeA);
  pip.addNode(nodeC);

  // Add nodes to the graph
  graph.setNode(nodeA.id.toString(), nodeA);
  graph.setNode(nodeB.id.toString(), nodeB);
  graph.setNode(nodeC.id.toString(), nodeC);

  // Add an edge between nodeA and nodeB
  graph.setEdge(nodeB.id.toString(), nodeC.id.toString());

  // Connect policyClass node to regular graph nodes
  pip.connectPolicyClassNode(1, 2); // Connect PolicyClass1 to UserNode
  pip.connectPolicyClassNode(1, 4); // Connect PolicyClass1 to ObjectNode

  // Create a combined graph for PolicyClass1
  const combinedGraph = pip.createCombinedGraph(1);

  // Display nodes in the combined graph
  console.log("Combined Graph Nodes:", combinedGraph.nodes().map(id => combinedGraph.node(id)));
});