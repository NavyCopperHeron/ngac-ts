import { PolicyEnforcementPoint } from "../src/PEPImpl";
import type PDP  from "../src/pdp";
import { expect, test, beforeEach, it, jest } from "bun:test";
//writing by Copilot
test("PolicyEnforcementPoint", () => {
  let pep: PolicyEnforcementPoint;
  let pdp: PDP;

beforeEach(() => {
    // Mock the IPDP implementation
    pdp = {
        evaluateRequest: jest.fn().mockResolvedValue("Grant"),
    };

    // Create a new instance of PolicyEnforcementPoint
    pep = new PolicyEnforcementPoint(pdp);
});

  it("should grant access when PDP returns 'Grant'", async () => {
    // Arrange
    const user = 123;
    const resource = 456;
    const action = "read";

    // Act
    const result = await pep.requestAccess(user, resource, action);

    // Assert
    expect(result).toBe(`Access granted to ${resource}`);
    expect(pdp.evaluateRequest).toHaveBeenCalledWith(user, resource, action);
  });

it("should deny access when PDP returns 'Deny'", async () => {
    // Arrange
    const user = 123;
    const resource = 456;
    const action = "write";
    pdp.evaluateRequest = jest.fn().mockResolvedValue("Deny");

    // Act
    const result = await pep.requestAccess(user, resource, action);

    // Assert
    expect(result).toBe(`Access denied to ${resource}`);
    expect(pdp.evaluateRequest).toHaveBeenCalledWith(user, resource, action);
});
});