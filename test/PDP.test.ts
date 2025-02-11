import { expect, test, describe, beforeEach } from "bun:test";
import {PolicyDecisionPoint} from '../src/PDPImpl';
import {Node} from '../src/node';
//wriiten by cursor
describe('PolicyDecisionPoint', () => {
  let pdp: PolicyDecisionPoint;

  beforeEach(() => {
    pdp = new PolicyDecisionPoint();
  });

  test('getSourceNodes - should return associations reachable from user node', () => {
    // Setup: Create a simple graph with known associations
    const pap = pdp.memory;
    
    // Create nodes
    const user = new Node(1, "user1", "user");
    const group = new Node(2, "group1", "userAttribute");
    const resource = new Node(3, "resource1", "object");
    
    // Add nodes to PAP
    pap.addNode(user);
    pap.addNode(group);
    pap.addNode(resource);
    
    // Create assignment (user -> group)
    pap.createAssignment(user, group);
    
    // Create association (group -> resource with read permission)
    pap.createAssociation(group, resource, new Set(['read']));

    const associations = pdp.getSourceNodes(2);
    expect(associations.size).toBe(1);
  });

  test('getSourceNodes - should throw error for non-existent user', () => {
    expect(() => pdp.getSourceNodes(999)).toThrow();
  });

  test('evaluateRequest - should grant access when user has permission', async () => {
    // Setup: Create a simple access control scenario
    const pap = pdp.memory;
    
    // Create nodes
    const user = new Node(1, "user1", "user");
    const group = new Node(2, "group1", "userAttribute");
    const resourceAttr = new Node(3, "resourceAttribute", "objectAttribute");
    const resource = new Node(4, "resource1", "object");
    const policyClass = new Node(5, "pc1", "policyClass");
    
    // Add nodes
    pap.addNode(user);
    pap.addNode(group);
    pap.addNode(resource);
    pap.addNode(resourceAttr);
    pap.addNode(policyClass);
    
    // Create assignments
    pap.createAssignment(user, group);  // user -> group
    pap.createAssignment(group, policyClass);  // group -> policyClass
    pap.createAssignment(resource, policyClass);  // resource -> policy class
    
    // Create association with read permission
    pap.createAssociation(group, resource, new Set(['read']));
    const result = await pdp.evaluateRequest(1, 4, 'read');
    expect(result).toBe('Grant');
  });

  test('evaluateRequest - should deny access when user lacks permission', async () => {
    // Setup: Create a scenario where user doesn't have required permission
    const pap = pdp.memory;
    
    const user = new Node(1, "user1", "user");
    const resource = new Node(2, "resource1", "object");
    const policyClass = new Node(3, "pc1", "policyClass");
    
    pap.addNode(user);
    pap.addNode(resource);
    pap.addNode(policyClass);
    
    pap.createAssignment(policyClass, resource);

    const result = await pdp.evaluateRequest(1, 2, 'write');
    expect(result).toBe('Not Granted');
  });


  test('findIntersection - should return intersection of operation sets', () => {
    const set1 = new Set(['read', 'write']);
    const set2 = new Set(['read', 'execute']);
    const set3 = new Set(['read', 'delete']);

    const result = pdp.findIntersection([set1, set2, set3]);
    expect(Array.from(result)).toEqual(['read']);
  });

  test('findIntersection - should return empty set for no common operations', () => {
    const set1 = new Set(['write']);
    const set2 = new Set(['read']);

    const result = pdp.findIntersection([set1, set2]);
    expect(result.size).toBe(0);
  });
});
