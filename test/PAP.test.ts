import { expect, test } from "bun:test";
import PolicyAdministrationPoint from "../src/PAPImpl";
import Node from "../src/Node";
import { Graph } from "graphlib";
// written by Cline
test("PAP - Node Management", () => {
    const pap = new PolicyAdministrationPoint();
    const node1 = new Node(1, "user1", "user");
    const node2 = new Node(2, "object1", "object");

    // Test addNode
    pap.addNode(node1);
    expect(pap.getNode(1)).toBeDefined();
    expect(pap.getNode(1)?.name).toBe("user1");

    // Test adding nodes and edge separately
    pap.addNode(node2);
    pap.addEdge(1, 2, new Set(["read"]));
    expect(pap.getNode(2)).toBeDefined();
    const edge = pap.getEdge(1, 2);
    expect(edge).toBeDefined();

    // Test updateNode
    pap.updateNode(1, { name: "updatedUser" });
    expect(pap.getNode(1)?.name).toBe("updatedUser");

    // Test deleteNode
    pap.deleteNode(1);
    expect(pap.getNode(1)).toBeUndefined();
});

test("PAP - Graph Structure", () => {
    const pap = new PolicyAdministrationPoint();
    
    // Create a sample policy graph
    const pc = new Node(1, "pc1", "policyClass");
    const ua = new Node(2, "ua1", "userAttribute");
    const oa = new Node(3, "oa1", "objectAttribute");
    const user = new Node(4, "user1", "user");
    const obj = new Node(5, "object1", "object");

    // Add nodes
    pap.addNode(pc);
    pap.addNode(ua);
    pap.addNode(oa);
    pap.addNode(user);
    pap.addNode(obj);

    // Create assignments
    pap.createAssignment(pc, ua);
    pap.createAssignment(pc, oa);
    pap.createAssignment(ua, user);
    pap.createAssignment(oa, obj);

    // Create association
    pap.createAssociation(ua, oa, new Set(["read", "write"]));

    // Test graph structure
    const graph = pap.getMainGraph();
    expect(graph).toBeDefined();
    expect(graph instanceof Graph).toBe(true);

    // Verify nodes in graph
    expect(graph.node("1")).toBeDefined();
    expect(graph.node("2")).toBeDefined();
    expect(graph.node("3")).toBeDefined();
    expect(graph.node("4")).toBeDefined();
    expect(graph.node("5")).toBeDefined();

    // Verify node properties
    const graphPc = graph.node("1");
    expect(graphPc.name).toBe("pc1");
    expect(graphPc.type).toBe("policyClass");

    // Test graph connectivity
    expect(graph.hasNode("1")).toBe(true);
    expect(graph.hasNode("2")).toBe(true);
    expect(graph.hasNode("3")).toBe(true);
    expect(graph.hasNode("4")).toBe(true);
    expect(graph.hasNode("5")).toBe(true);

    // Test assignments in graph structure
    const assignments = pap.getAllAssignments();
    expect(assignments.length).toBe(4);

    // Test associations in graph structure
    const associations = pap.getAllAssociations();
    expect(associations.length).toBe(1);

    // Test graph visualization data
    const nodes = graph.nodes();
    const edges = graph.edges();
    
    // Verify all nodes are present
    expect(nodes.length).toBe(5);
    expect(nodes).toContain("1");
    expect(nodes).toContain("2");
    expect(nodes).toContain("3");
    expect(nodes).toContain("4");
    expect(nodes).toContain("5");

    // Verify edges represent assignments and associations
    expect(edges.length).toBe(5); 
    
    // Check edge properties
    edges.forEach(edge => {
        expect(edge.v).toBeDefined(); // source node
        expect(edge.w).toBeDefined(); // target node
    });
});

test("PAP - Edge Management", () => {
    const pap = new PolicyAdministrationPoint();
    const node1 = new Node(1, "user1", "user");
    const node2 = new Node(2, "object1", "object");

    pap.addNode(node1);
    pap.addNode(node2);

    // Test addEdge
    pap.addEdge(1, 2, new Set(["write"]));
    const edge = pap.getEdge(1, 2);
    expect(edge).toBeDefined();

    // Test updateEdge
    pap.updateEdge(1, 2, new Set(["read"]));
    const updatedEdge = pap.getEdge(1, 2);
    expect(updatedEdge).toBeDefined();

    // Test deleteEdge
    pap.deleteEdge(1, 2);
    expect(pap.getEdge(1, 2)).toBeUndefined();
});

test("PAP - Assignment Management", () => {
    const pap = new PolicyAdministrationPoint();
    const parent = new Node(1, "userAttr1", "userAttribute");
    const child = new Node(2, "user1", "user");

    pap.addNode(parent);
    pap.addNode(child);

    // Test createAssignment
    const assignment = pap.createAssignment(parent, child);
    expect(assignment).toBeDefined();
    expect(pap.getAllAssignments().length).toBe(1);

    // Test duplicate assignment
    const duplicateAssignment = pap.createAssignment(parent, child);
    expect(duplicateAssignment).toBeNull();
    expect(pap.getAllAssignments().length).toBe(1);

    // Test getAssignmentsParent
    const parentAssignments = pap.getAssignmentsParent(parent);
    expect(parentAssignments.length).toBe(1);
    expect(parentAssignments[0].getChild().equals(child)).toBe(true);

    // Test getAssignmentsChild
    const childAssignments = pap.getAssignmentsChild(child);
    expect(childAssignments.length).toBe(1);
    expect(childAssignments[0].getParent().equals(parent)).toBe(true);
});

test("PAP - Association Management", () => {
    const pap = new PolicyAdministrationPoint();
    const userAttr = new Node(1, "userAttr1", "userAttribute");
    const objAttr = new Node(2, "objAttr1", "objectAttribute");

    pap.addNode(userAttr);
    pap.addNode(objAttr);

    // Test createAssociation
    const operations = new Set(["read", "write"]);
    const association = pap.createAssociation(userAttr, objAttr, operations);
    expect(association).toBeDefined();
    expect(pap.getAllAssociations().length).toBe(1);

    // Test duplicate association
    const duplicateAssociation = pap.createAssociation(userAttr, objAttr, operations);
    expect(duplicateAssociation).toBeNull();
    expect(pap.getAllAssociations().length).toBe(1);

    // Test getAssociationsStarting
    const startingAssociations = pap.getAssociationsStarting(userAttr);
    expect(startingAssociations.length).toBe(1);
    expect(startingAssociations[0].getEnd().equals(objAttr)).toBe(true);

    // Test getAssociationsEnding
    const endingAssociations = pap.getAssociationsEnding(objAttr);
    expect(endingAssociations.length).toBe(1);
    expect(endingAssociations[0].getStart().equals(userAttr)).toBe(true);
});
