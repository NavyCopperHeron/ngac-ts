type Operation = 'read' | 'write';
type User = string;
type UserAttr = string;
type ObjAttr = string;
type ObjectNode = string;
type PolicyClass = string;

class AccessControlGraph {
    private userToUserAttr: Map<User, UserAttr[]> = new Map();
    private userAttrToObjAttr: Map<UserAttr, Map<ObjAttr, Operation>> = new Map();
    private objAttrToPolicyClass: Map<ObjAttr, PolicyClass[]> = new Map();
    private objAttrToObj: Map<ObjAttr, ObjectNode[]> = new Map();
    private objAttrToObjAttr: Map<ObjAttr, ObjAttr[]> = new Map(); // Correctly added this line
    private policyClassNodes: Set<PolicyClass> = new Set();

    // Add edges to the graph
    addUserToUserAttrEdge(user: User, userAttr: UserAttr): void {
        if (!this.userToUserAttr.has(user)) {
            this.userToUserAttr.set(user, []);
        }
        this.userToUserAttr.get(user)!.push(userAttr);
    }

    addUserAttrToObjAttrEdge(userAttr: UserAttr, objAttr: ObjAttr, operation: Operation): void {
        if (!this.userAttrToObjAttr.has(userAttr)) {
            this.userAttrToObjAttr.set(userAttr, new Map());
        }
        this.userAttrToObjAttr.get(userAttr)!.set(objAttr, operation);
    }

    addObjAttrToPolicyClassEdge(objAttr: ObjAttr, policyClass: PolicyClass): void {
        if (!this.objAttrToPolicyClass.has(objAttr)) {
            this.objAttrToPolicyClass.set(objAttr, []);
        }
        this.objAttrToPolicyClass.get(objAttr)!.push(policyClass);
    }

    addObjAttrToObjEdge(objAttr: ObjAttr, obj: ObjectNode): void {
        if (!this.objAttrToObj.has(objAttr)) {
            this.objAttrToObj.set(objAttr, []);
        }
        this.objAttrToObj.get(objAttr)!.push(obj);
    }

    // This function adds edges between object attributes
    addObjAttrToObjAttrEdge(fromObjAttr: ObjAttr, toObjAttr: ObjAttr): void {
        if (!this.objAttrToObjAttr.has(fromObjAttr)) {
            this.objAttrToObjAttr.set(fromObjAttr, []);
        }
        this.objAttrToObjAttr.get(fromObjAttr)!.push(toObjAttr);
    }

    addPolicyClassNode(policyClass: PolicyClass): void {
        this.policyClassNodes.add(policyClass);
    }

    // BFS from user to find reachable user and object attributes
    bfsFromUser(user: User): [Set<UserAttr>, Map<ObjAttr, Set<Operation>>] {
        const reachableUserAttrs: Set<UserAttr> = new Set();
        const reachableObjAttrs: Map<ObjAttr, Set<Operation>> = new Map();
        const queue: User[] = [user];

        while (queue.length > 0) {
            const currentUser = queue.shift()!;

            if (this.userToUserAttr.has(currentUser)) {
                for (const userAttr of this.userToUserAttr.get(currentUser)!) {
                    reachableUserAttrs.add(userAttr);

                    if (this.userAttrToObjAttr.has(userAttr)) {
                        for (const [objAttr, operation] of this.userAttrToObjAttr.get(userAttr)!) {
                            if (!reachableObjAttrs.has(objAttr)) {
                                reachableObjAttrs.set(objAttr, new Set());
                            }
                            reachableObjAttrs.get(objAttr)!.add(operation);
                        }
                    }
                }
            }
        }

        return [reachableUserAttrs, reachableObjAttrs];
    }

    // DFS to find objects of interest from object attributes
    dfsToFindObjectsOfInterest(objAttr: ObjAttr): Set<ObjectNode> {
        const objectsOfInterest: Set<ObjectNode> = new Set();
        const visited: Set<ObjAttr> = new Set();
        const stack: ObjAttr[] = [objAttr];

        while (stack.length > 0) {
            const currentObjAttr = stack.pop()!;

            if (visited.has(currentObjAttr)) continue;

            visited.add(currentObjAttr);

            if (this.objAttrToObj.has(currentObjAttr)) {
                for (const obj of this.objAttrToObj.get(currentObjAttr)!) {
                    objectsOfInterest.add(obj);
                }
            }

            if (this.objAttrToObjAttr.has(currentObjAttr)) {  
                for (const nextObjAttr of this.objAttrToObjAttr.get(currentObjAttr)!) {
                    stack.push(nextObjAttr);
                }
            }
        }

        return objectsOfInterest;
    }

    reviewAccess(user: User, operation: Operation): Set<ObjectNode> {
        const accessibleObjects: Set<ObjectNode> = new Set();

        //Find reachable user and object attributes
        const [reachableUserAttrs, reachableObjAttrs] = this.bfsFromUser(user);

        // Perform DFS from each reachable object attribute to collect objects of interest
        for (const [objAttr, ops] of reachableObjAttrs.entries()) {
            if (ops.has(operation)) {
                const objectsOfInterest = this.dfsToFindObjectsOfInterest(objAttr);
                for (const obj of objectsOfInterest) {
                    accessibleObjects.add(obj);
                }
            }
        }

        return accessibleObjects;
    }
}

// Test data to build graph
function buildTestGraph(): AccessControlGraph {
    const graph = new AccessControlGraph();

    // Users and user attributes
    graph.addUserToUserAttrEdge('u1', 'ua1');
    graph.addUserToUserAttrEdge('u1', 'ua2');

    // User attributes to object attributes
    graph.addUserAttrToObjAttrEdge('ua1', 'oa1', 'read');
    graph.addUserAttrToObjAttrEdge('ua2', 'oa2', 'write');

    // Object attributes to objects and policy classes
    graph.addObjAttrToObjEdge('oa1', 'o1');
    graph.addObjAttrToObjEdge('oa2', 'o2');

    graph.addObjAttrToPolicyClassEdge('oa1', 'pc1');
    graph.addObjAttrToPolicyClassEdge('oa2', 'pc2');

    // Object attribute to object attribute connections (fixing the error)
    graph.addObjAttrToObjAttrEdge('oa1', 'oa2');

    return graph;
}
// Test the algorithm
function testPReview(): void {
    const graph = buildTestGraph();

    // Test access review for user 'u1' with operation 'read'
    const accessibleReadObjects = graph.reviewAccess('u1', 'read');
    console.log("Accessible objects for 'u1' with 'read':", accessibleReadObjects);

    // Test access review for user 'u1' with operation 'write'
    const accessibleWriteObjects = graph.reviewAccess('u1', 'write');
    console.log("Accessible objects for 'u1' with 'write':", accessibleWriteObjects);
}

// Run the test
testPReview();
