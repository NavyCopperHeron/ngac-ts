import Association from './Association';
import Assignment from './Assignment';
import PAP from './pap';
import Node from './Node';

interface makeDecision {
  userId: Node;
  targetId: Node;
  permissions: Set<String>; // e.g. read, write
}

class PDP {
  memory: PAP;

  constructor() {
    this.memory = new PAP;
  }

  /**
   * BFS traversal to find reachable nodes that are source nodes of associations
   * @param user The node of the user requesting access
   * @returns A set of all associations with source nodes that are reachable from the user node
   */
  getSourceNodes(user: Node): Set<Association> {
    let visited = new Set<Node>();
    let queue: Node[] = [user];
    let startingNodes = new Set<Node>();
    let involvedAssociations = new Set<Association>(); 

    visited.add(user);

    while (queue.length > 0) {
      let currentNode = queue.shift()!;

      // Check for associations starting from the current node (currentNode is the source)
      let associationsStartingFromCurrent = this.memory.getAssociationsStarting(currentNode);
      associationsStartingFromCurrent.forEach(assoc => {
        startingNodes.add(assoc.getStart());
        involvedAssociations.add(assoc);
      });

      // Now process child nodes from assignments (current node is the parent)
      let assignmentsForCurrent = this.memory.getAssignmentsParent(currentNode);
      assignmentsForCurrent.forEach(assign => {
        let childNode = assign.getChild();
        if (!visited.has(childNode)) {
          visited.add(childNode);
          queue.push(childNode);
        }
      });
    }

    return involvedAssociations;
  }

  /**
   * 
   * @param associations Set of all associations that were reachable by the user
   * @returns A map of destination nodes of each association with its corresponding set of operations
   */
  getDestNodes(associations: Set<Association>): Map<Node, Set<string>> {
    const result = new Map<Node, Set<string>>();
  
    associations.forEach(association => {
      const { end, operations } = association;
      if (!result.has(end)) {
        result.set(end, new Set(operations));
      }
    });
  
    return result;
  }

  /**
   * Find all objects of interest from the given association destnodes (i.e. the topmost connected parent node)
   * @param assignments An array of all assignments
   * @param startingNode The node to start searching from (i.e. association destination node)
   * @returns An array of object of interest nodes
   */
  findObjects(assignments: Assignment[], startingNode: Node): Node[] {
    const reverseGraph: Map<Node, Node[]> = new Map();
  
    // Build the reverse graph
    for (const assignment of assignments) {
      if (!reverseGraph.has(assignment.child)) {
        reverseGraph.set(assignment.child, []);
      }
      reverseGraph.get(assignment.child)?.push(assignment.parent);
    }
  
    // Perform reverse BFS starting from the starting node
    const visited: Set<Node> = new Set();
    const queue: Node[] = [startingNode];
    visited.add(startingNode);
  
    while (queue.length > 0) {
      const currentNode = queue.shift()!;
      const parents = reverseGraph.get(currentNode) || [];
      for (const parent of parents) {
        if (!visited.has(parent)) {
          visited.add(parent);
          queue.push(parent);
        }
      }
    }
  
    // Identify topmost nodes (objects of interest) - nodes that are not visited during reverse BFS
    const objectsOfInterest: Node[] = [];
    reverseGraph.forEach((_, node) => {
      if (!visited.has(node)) {
        objectsOfInterest.push(node);
      }
    });
  
    return objectsOfInterest;
  }

  // From the topmost nodes, find all policy classes associated with each node in its path
  /**
   * From the object of interest, find all policy classes associated with each node in its path
   * @param assignments An array of all assignments
   * @param objectOfInterest target object of interest
   * @param destNode the association destination node linked with the target object of interest
   * @returns Boolean indicating if the object of interest is connected to all policy classes that the destination node is connected to
   */
  findPolicyClasses(assignments: Assignment[], objectOfInterest: Node, destNode: Node): Boolean {
    const graph: Map<Node, Node[]> = new Map();
  
    // Build the graph (from parent to children)
    for (const assignment of assignments) {
      if (!graph.has(assignment.parent)) {
        graph.set(assignment.parent, []);
      }
      graph.get(assignment.parent)?.push(assignment.child);
    }
  
    // Find policy classes (nodes with no children)
    const policyClasses: Set<Node> = new Set();
    for (const [parent, children] of graph.entries()) {
      if (children.length === 0) {
        policyClasses.add(parent);
      }
    }
  
    // Recursive DFS function to find and label policy classes for each node
    const visited: Set<Node> = new Set();
    const nodeLabels: Map<Node, Set<number>> = new Map(); // Store the policy class IDs for each node
  
    function dfs(node: Node): Set<number> {
      // If already visited, return the labeled nodes for this node
      if (visited.has(node)) {
        return nodeLabels.get(node) || new Set();
      }
  
      visited.add(node);
  
      // If this node is a policy class, label it with its own ID
      let reachablePolicyClasses: Set<number> = new Set();
      if (policyClasses.has(node)) {
        reachablePolicyClasses.add(node.id);
      }
  
      // Visit all the children and propagate policy class IDs upwards
      const children = graph.get(node) || [];
      for (const child of children) {
        const childPolicyClasses = dfs(child);
        childPolicyClasses.forEach((id) => reachablePolicyClasses.add(id));
      }
  
      nodeLabels.set(node, reachablePolicyClasses);
      return reachablePolicyClasses;
    }
  
    dfs(objectOfInterest);

    const objSet = nodeLabels.get(objectOfInterest) || new Set();
    const destSet = nodeLabels.get(destNode) || new Set();
    if ([...destSet].every(item => objSet.has(item))) {
      // If the object of interest contains all policy classes containing dest node
      return true;
    }

    return false;
  }

  /**
   * 
   * @param allOperations An array of sets of the operations provided by each policy class
   * @returns The intersection of all of the sets
   */
  findIntersection(allOperations: Set<string>[]): Set<string> {
    if (allOperations.length === 0) return new Set();

    let intersection = new Set(allOperations[0]);

    for (let i = 1; i < allOperations.length; i++) {
      intersection = new Set(
        [...intersection].filter(item => allOperations[i].has(item)) // Keep only the elements that are in both sets
      );
    }

    return intersection;
  }

  /**
   * Calculate access rights for the user
   * @param user Node of the user requesting access
   * @param target Target object of interest node
   * @param permissions Set of operations that are requested
   * @returns Boolean of whether access is granted or not
   */
  calculateAccess(user: Node, target: Node, permissions: Set<string>): Boolean {
    const accessibleObjects: Set<string> = new Set();
    const assignments: Array<Assignment> = this.memory.getAllAssignments();

    // Get all source association nodes
    const associations = this.getSourceNodes(user);

    // Get a map of all destination nodes with allowable operations
    const destNodeOperations = this.getDestNodes(associations);

    const objectsOfInterest: Map<Node, Node[]> = new Map();
    const allOperations: Set<string>[] = [];

    destNodeOperations.forEach((operations, endNode) => {
      const objects: Node[] = this.findObjects(assignments, endNode)

      if (objects.some(node => node.id === target.id) && 
          this.findPolicyClasses(assignments, target, endNode)) {
        allOperations.push(operations);
      }
    });
    
    const intersection: Set<string> = this.findIntersection(allOperations);
    if ([...permissions].every(item => intersection.has(item))) {
      return true;
    }

    return false;
  }
}