import Association from './Association';
import PAP from './PAPImpl';
import Node from './node.ts';
import { Graph } from 'graphlib';
import type PDP from './pdp.ts';

interface evaluateRequest {
  user: number;
  resource: number;
  action: Set<String>; // e.g. read, write
}

export default class PolicyDecisionPoint implements PDP {
  memory: PAP;
  graph: Graph;

  constructor() {
    this.memory = new PAP;
    this.graph = this.memory.getMainGraph()
  }

  /**
   * BFS traversal to find reachable nodes that are source nodes of associations
   * @param user The node of the user requesting access
   * @returns A set of all associations with source nodes that are reachable from the user node
   */
  getSourceNodes(user: number): Set<Association> {
    let visited = new Set<Node>();
    let queue: Node[] = [];

    // Resolve the user ID to a Node
    const startingNode = this.memory.getNode(user);
    if (!startingNode) {
      throw new Error(`Node with ID ${user} not found`);
    }

    // Start BFS with the startingNode
    queue.push(startingNode);
    let involvedAssociations = new Set<Association>();

    visited.add(startingNode);

    while (queue.length > 0) {
      let currentNode = queue.shift()!;

      // Check for associations starting from the current node (currentNode is the source)
      let associationsStartingFromCurrent = this.memory.getAssociationsStarting(currentNode);
      associationsStartingFromCurrent.forEach(assoc => {
        involvedAssociations.add(assoc); // Add associations to the set
      });

      // Now process child nodes from assignments (current node is the parent)
      let childList = this.memory.getAssignmentsParent(currentNode.id);
      childList.forEach(child => {
        let node = this.memory.getNode(child);
        if (node && !visited.has(node)) {
          visited.add(node);
          queue.push(node); // Enqueue the child node for further processing
        }
      });
    }

    return involvedAssociations;
  }

  /**
   * 
   * @param associations Set of all associations that were reachable by the user
   * @returns A map of destination node ids of each association with its corresponding set of operations
   */
  getDestNodes(associations: Set<Association>): Map<number, Set<string>> {
    const result = new Map<number, Set<string>>();
  
    associations.forEach(association => {
      const { end, operations } = association;
      if (!result.has(end.id)) {
        result.set(end.id, new Set(operations));
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
  findObjects(targetNode: number): number[] {
    // List to store nodes with no incoming edges that have a path to targetNode
    const result: number[] = [];
    
    // Find all nodes with no incoming edges
    const nodesWithNoIncomingEdges: string[] = [];
    this.graph.nodes().forEach((nodeId) => {
      const incomingEdges = this.graph.successors(nodeId);
      if (!incomingEdges || incomingEdges.length === 0) {
        nodesWithNoIncomingEdges.push(nodeId);
      }
    });
  
    // Check if there is a path from each of those nodes to the targetNode
    nodesWithNoIncomingEdges.forEach((node) => {
      // Perform DFS or BFS to see if there's a path from 'node' to 'targetNode'
      const visited = new Set<string>();
      
      const dfs = (currentNode: string): boolean => {
        if (currentNode === String(targetNode)) return true;
        if (visited.has(currentNode)) return false;
        visited.add(currentNode);
        // Recurse over all neighbors of the current node
        const neighbors = this.graph.predecessors(currentNode) || [];
        for (const neighbor of neighbors) {
          if (dfs(neighbor)) {
            return true;
          }
        }
  
        return false;
      };
  
      // If there's a path from the node to the targetNode, add it to the result
      if (dfs(node)) {
        result.push(parseInt(node));
      }
    });
  
    return result;
  }
  // From the topmost nodes, find all policy classes associated with each node in its path
  /**
   * From the object of interest, find all policy classes associated with each node in its path
   * @param assignments An array of all assignments
   * @param objectOfInterest target object of interest
   * @param destNode the association destination node linked with the target object of interest
   * @returns Boolean indicating if the object of interest is connected to all policy classes that the destination node is connected to
   */
  findPolicyClasses(objectOfInterestId: number, destNodeId: number): [Set<number>, Set<number>] {

    // Find policy classes (nodes with no children) in the combined graph
    const policyClasses: Set<number> = new Set();
    this.graph.nodes().forEach((nodeId: string) => {
      // Check if a node has no outgoing edges (is a policy class)
      if (!this.graph.outEdges(nodeId)?.length) {
        policyClasses.add(Number(nodeId));
      }
    });

    // Recursive DFS function to find and label policy classes for each node
    const visited: Set<number> = new Set();
    const nodeLabels: Map<number, Set<number>> = new Map();

    function dfs(nodeId: number, graph: Graph): Set<number> {
      // If already visited, return the labeled nodes for this node
      if (visited.has(nodeId)) {
        return nodeLabels.get(nodeId) || new Set();
      }

      visited.add(nodeId);

      // Get the node associated with the nodeId
      const node = graph.node(nodeId.toString());
      let reachablePolicyClasses: Set<number> = new Set();

      // If this node is a policy class, label it with its own ID
      if (policyClasses.has(nodeId)) {
        reachablePolicyClasses.add(nodeId);
      }

      // Visit all the children and propagate policy class IDs upwards
      const edges = graph.outEdges(nodeId.toString()) || [];
      for (const edge of edges) {
        const targetNodeId = Number(edge.w); // Convert the target node ID to a number
        const childPolicyClasses = dfs(targetNodeId, graph);
        childPolicyClasses.forEach((id) => reachablePolicyClasses.add(id));
      }

      nodeLabels.set(nodeId, reachablePolicyClasses);
      return reachablePolicyClasses;
    }

    // Start DFS from the objectOfInterestId
    dfs(objectOfInterestId, this.graph);

    const objSet = nodeLabels.get(objectOfInterestId) || new Set();
    const destSet = nodeLabels.get(destNodeId) || new Set();

    return [objSet,destSet];
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
  async evaluateRequest(user: number, resource: number, action: string): Promise<string> {
  
    // Get all source association nodes - Assuming this is an async function
    var associations: Set<Association> = this.getSourceNodes(user);
  
    // Get a map of all destination nodes with allowable operations - Assuming this is an async function
    const destNodeIds = this.getDestNodes(associations);
  
    const allOperations: Set<string>[] = [];
    
    let objectIds: number[] = [];
    destNodeIds.forEach((set, id) => {
      const result = this.findObjects(id);
      objectIds = objectIds.concat(result);  // Append the result to objectIds array
    });
    console.log("objectids: ", objectIds)
  
    // Iterate over destination node IDs and check conditions
    for (const [endNode, operations] of destNodeIds) {
       // Assuming this is an async function
      if (objectIds.some(id => id === resource) && 
          this.findPolicyClasses(resource, endNode)) { // Assuming async function
        allOperations.push(operations);
      }
    }
  
    // Find intersection of all allowed operations
    const intersection: Set<string> = this.findIntersection(allOperations);
    console.log(intersection)
  
    // Check if the requested action is in the intersection
    if (intersection.has(action)) {
      return "Grant";
    }
  
    return "Not Granted";
  }
}

