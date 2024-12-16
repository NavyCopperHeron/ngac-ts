import { expect, test } from "bun:test";
import { PolicyEnforcementPoint } from "./PEPImpl";
import type IPDP  from './PDP';
// Mock PDP implementation
class MockPDP implements IPDP {
    async evaluateRequest(user: number, resource: number, action: string): Promise<string> {
        if (user === 1 && resource === 100 && action === "read") {
            return "Grant";
        } else {
            return "Deny";
        }
    }
}

// Define the test
test("PolicyEnforcementPoint - request access", async () => {
    const mockPDP = new MockPDP();
    const pep = new PolicyEnforcementPoint(mockPDP);

    // Test access requests
    const decision1 = await pep.requestAccess(1, 100, "read"); // Expected to be granted
    const decision2 = await pep.requestAccess(2, 100, "write"); // Expected to be denied

    // Validate the decisions
    expect(decision1).toBe("Access granted to 100");
    expect(decision2).toBe("Access denied to 100");
});
