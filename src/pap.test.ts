import { expect, test } from "bun:test";
import { PolicyAdministrationPoint } from "./pap";
import Node from "./node";

test("PAP - Delete node with connected nodes and edges", () => {
    const pap = new PolicyAdministrationPoint();

    // Add nodes
    const node1 = new Node(1, "UserNode", "user");
    const node2 = new Node(2, "ResourceNode", "object");
    const node3 = new Node(3, "AttributeNode", "attribute");

    pap.addNode(node1);
    pap.addNode(node2);
    pap.addNode(node3);

    // Add edges
    pap.addEdge(1, 2, { permission: "read" });
    pap.addEdge(3, 2, { permission: "write" });

    // Verify initial state
    expect(pap.getMainGraph().nodes().length).toBe(3);

    // Delete a node and verify graph state
    pap.deleteNode(2);
    expect(pap.getMainGraph().nodes().length).toBe(0);
    expect(pap.getMainGraph().hasNode("2")).toBe(false);
    expect(pap.getMainGraph().edges().length).toBe(0);
});
