import { expect, test, describe } from "bun:test";
import { PolicyEnforcementPoint } from "./PEPImpl";
import { PolicyInformationPoint } from "./PIPImpl";
import PolicyDecisionPoint from "./PDPImpl";
import Node from "./node.ts";

describe('NGAC Integration Tests', () => {
    test('complete NGAC workflow - should grant access when properly configured', async () => {
        // Initialize components
        const pdp = new PolicyDecisionPoint();
        const pep = new PolicyEnforcementPoint(pdp);
        const pip = new PolicyInformationPoint();

        // Create nodes
        const alice = new Node(1, "Alice", "user");
        const developers = new Node(2, "Developers", "userAttribute");
        const codeRepo = new Node(3, "CodeRepo", "objectAttribute");
        const sourceCode = new Node(4, "SourceCode", "object");
        const projectPC = new Node(5, "ProjectPC", "policyClass");

        // Setup PAP with the nodes
        const pap = pdp.memory;
        pap.addNode(alice);
        pap.addNode(developers);
        pap.addNode(codeRepo);
        pap.addNode(sourceCode);
        pap.addNode(projectPC);

        // Create assignments
        console.log("Creating assignments...");
        pap.createAssignment(alice, developers); // Alice is a developer
        pap.createAssignment(codeRepo, projectPC); // CodeRepo is under ProjectPC
        pap.createAssignment(sourceCode, codeRepo); // SourceCode is in CodeRepo

        // Create association
        console.log("Creating association...");
        pap.createAssociation(developers, codeRepo, new Set(["read", "write"]));
        console.log("Association: ", pap.getAllAssociations())
        
        // Store graph in PIP
        const graphJson = JSON.stringify(pap.getMainGraph());
        pip.storeGraph(graphJson);
        // Add these debug logs after storing the graph
        console.log("Stored graph:", graphJson);
        const retrievedGraph = pip.retrieveGraphAsJson();
        console.log("Retrieved graph:", retrievedGraph);
        // Test access request through PEP
        console.log("Testing access request...");
        console.log("Association2: ", pdp.memory.getAllAssociations())
        const result = await pep.requestAccess(1, 4, "read"); // Alice trying to read SourceCode

        // Verify access is granted
        expect(result).toBe("Access granted to 4");
    });

    test('NGAC workflow - should deny access when permissions are missing', async () => {
        const pdp = new PolicyDecisionPoint();
        const pep = new PolicyEnforcementPoint(pdp);
        const pip = new PolicyInformationPoint();

        // Create nodes
        const bob = new Node(1, "Bob", "user");
        const managers = new Node(2, "Managers", "userAttribute");
        const secretDocs = new Node(3, "SecretDocs", "objectAttribute");
        const document = new Node(4, "Document", "object");
        const securityPC = new Node(5, "SecurityPC", "policyClass");

        // Setup PAP
        const pap = pdp.memory;
        pap.addNode(bob);
        pap.addNode(managers);
        pap.addNode(secretDocs);
        pap.addNode(document);
        pap.addNode(securityPC);

        // Create assignments
        pap.createAssignment(bob, managers);
        pap.createAssignment(secretDocs, securityPC);
        pap.createAssignment(document, secretDocs);

        // Note: Deliberately not creating an association that would grant access

        // Store graph in PIP
        const graphJson = JSON.stringify(pap.getMainGraph());
        pip.storeGraph(graphJson);

        // Test access request
        const result = await pep.requestAccess(1, 4, "read");

        // Verify access is denied
        expect(result).toBe("Access denied to 4");
    });
});