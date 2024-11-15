import { expect, test } from "bun:test";
import { PolicyAdministrationPoint } from "./pap";
import Node from "./node";

test("PAP - Manage policyClass nodes and edges", () => {
    const pap = new PolicyAdministrationPoint();

    // Add nodes and a policy class
    const userNode = new Node(1, "UserNode", "user");
    const resourceNode = new Node(2, "ResourceNode", "object");
    const policyClassNode = new Node(3, "PolicyClass1", "policyClass");
    const objectAttributeNode = new Node(4, "ObjectAttributeNode", "objectAttribute");

    pap.addNode(userNode);
    pap.addNode(resourceNode);
    pap.addNode(objectAttributeNode);

    // Add edge and policy class
    pap.addEdge(4, 2); // ObjectAttributeNode -> ResourceNode
    pap.addPolicyClassNode(policyClassNode);

    // Connect policy class node to other nodes
    pap.connectPolicyClassNode(3, 1);
    pap.connectPolicyClassNode(3, 4);

    // Verify combined graph
    const combinedGraph = pap.createCombinedGraph(3);

    // Check nodes
    expect(combinedGraph.hasNode("1")).toBe(true); // UserNode
    expect(combinedGraph.hasNode("2")).toBe(true); // ResourceNode
    expect(combinedGraph.hasNode("3")).toBe(true); // PolicyClassNode
    expect(combinedGraph.hasNode("4")).toBe(true); // ObjectAttributeNode

    // Check edges
    expect(combinedGraph.hasEdge("4", "2")).toBe(true); // ObjectAttributeNode -> ResourceNode
});
