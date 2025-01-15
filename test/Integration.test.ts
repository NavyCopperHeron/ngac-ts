import { expect, test, describe } from "bun:test";
import { PolicyEnforcementPoint } from "../src/PEPImpl";
import { PolicyInformationPoint } from "../src/PIPImpl";
import PolicyDecisionPoint from "../src/PDPImpl";
import Node from "../src/Node";

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
        pap.createAssociation(developers, codeRepo, new Set(["read", "write"]));
        console.log("Association: ", pap.getAllAssociations())
        
        // Store graph in PIP
        const graphJson = JSON.stringify(pap.getMainGraph());
        pip.storeGraph(graphJson);
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


    /**
     *  The test case is in the paper 'Linear Time Algorithms to Restrict Insider Access using Multi-Policy Access Control Systems'
    */
    test('NGAC workflow - test case in paper', async () => {
        // Initialize components
        const pdp = new PolicyDecisionPoint();
        const pep = new PolicyEnforcementPoint(pdp);
        const pip = new PolicyInformationPoint();

        // Create nodes
        const u1 = new Node(1, "u1", "user");
        const ua1 = new Node(2, "ua1", "userAttribute");
        const ua2 = new Node(3, "ua2", "userAttribute");
        const o1 = new Node(4, "o1", "object");
        const o2 = new Node(5, "o2", "object");
        const o3 = new Node(6, "o3", "object");
        const oa1 = new Node(7, "oa1", "objectAttribute");
        const oa2 = new Node(8, "oa2", "objectAttribute");
        const oa3 = new Node(9, "oa3", "objectAttribute");
        const oa4 = new Node(10, "oa4", "objectAttribute");
        const oa5 = new Node(11, "oa5", "objectAttribute");
        const pc1 = new Node(12, "pc1", "policyClass");
        const pc2 = new Node(13, "pc2", "policyClass");

        // Setup PAP
        const pap = pdp.memory;
        pap.addNode(u1);
        pap.addNode(ua1);
        pap.addNode(ua2);
        pap.addNode(o1);
        pap.addNode(o2);
        pap.addNode(o3);
        pap.addNode(oa1);
        pap.addNode(oa2);
        pap.addNode(oa3);
        pap.addNode(oa4);
        pap.addNode(oa5);
        pap.addNode(pc1);
        pap.addNode(pc2);


        // Create assignments
        pap.createAssignment(u1, ua1);
        pap.createAssignment(ua1, ua2);
        pap.createAssignment(o1, oa1);
        pap.createAssignment(o2, oa2);
        pap.createAssignment(o3, oa3);
        pap.createAssignment(o2, oa5);
        //pap.createAssignment(oa3, oa5);
        pap.createAssignment(oa2, oa1);
        pap.createAssignment(oa5, oa4);
        pap.createAssignment(ua2, pc1);
        pap.createAssignment(oa4, pc1);
        pap.createAssignment(oa1, pc2);
        //pap.createAssignment(oa3, pc2);


        // Create association
        pap.createAssociation(ua1, oa1, new Set(["read"]));
        pap.createAssociation(ua2, oa4, new Set(["read"]));

        const graphJson = JSON.stringify(pap.getMainGraph());
        pip.storeGraph(graphJson);

        const result1 = await pep.requestAccess(1, 4, "read");
        const result2 = await pep.requestAccess(1, 5, "read");
        const result3 = await pep.requestAccess(1, 6, "read");
        // Verify access is granted
        expect(result1).toBe("Access granted to 4");
        expect(result2).toBe("Access granted to 5");
        expect(result3).toBe("Access denied to 6");

    });

});