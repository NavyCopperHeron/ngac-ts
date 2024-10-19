import Association from './Association';
import PAP from './PAP';

interface makeDecision {
  userId: Node;
  targetId: Node;
  permissions: Array<String>; // e.g. read, write
}

class PDP {
  memory: PAP;

  constructor() {
    this.memory = new PAP;
  }

  /**
   * Recursively looks for target from all nodes on the path through association.
   * @returns permissions: Array containing all operations that the starting node has access to
   */
  collectAssociations(current: Association, target: Node, permissions: Array<String>) {
    if (current.end == target) {
      permissions.concat(current.operations);
      return permissions;
    }
    for (var a of this.memory.getAssociations(current.end)) {
      permissions = this.collectAssociations(a, target, permissions);
    }

    return permissions;
  }

  /**
   * Gets all permissions that the user node has access to
   * @returns permissions: Array containing all operations that the starting node has access to
   */
  collectPermissions(user: Node, target: Node) {
    let permissions: String[] = []; 

    for (var a of this.memory.getAssociations(user)) {
      permissions.concat(this.collectAssociations(a, target, permissions))
    }

    return permissions;
  }

  /**
   * Makes the decision whether the user has access to the target by comparing required and owned permissions
   * @returns boolean: true if permission is granted, false otherwise
   */
  makeDecision(user: Node, target: Node, permissions: Array<String>) {
    let hasOperations: String[] = this.collectPermissions(user, target);
    let decision = true;

    for (var p in permissions) {
      if (!hasOperations.includes(p)) {
        decision = false;
        break;
      }
    }

    return decision;
  }
}