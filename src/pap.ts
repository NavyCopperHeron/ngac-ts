import Association from './Association';
import Assignment from './Assignment';
import Node from './Node';

/**
 * Stores and returns stored data
 */

export default class PAP {

  assignments: Array<Assignment>;
  associations: Array<Association>;

  constructor() {
    this.assignments = new Array<Assignment>();
    this.associations = new Array<Association>();
  }

  createAssignment(parent: Node, child: Node) {
    var assign = new Assignment(parent, child);
    for (const a of this.getAssignmentsParent(parent)) {
      // If this assignment already exists
      if (a.equals(assign)) {
        return null;
      }
    }
    this.assignments.push(assign);
    return assign;
  }

  createAssociation(start: Node, end: Node, operations: Set<string>) {
    var assoc = new Association(start, end, operations);
    for (const a of this.getAssociationsStarting(start)) {
      // If this association already exists
      if (a.equals(assoc)) {
        return null;
      }
    }
    this.associations.push(assoc);
    return assoc;
  }

  getAssociationsStarting(start: Node) {
    let all: Association[] = [];
    for (const a of this.associations) {
      if (start.equals(a.getStart())) {
        all.push(a);
      }
    }
    return all;
  }

  getAssociationsEnding(end: Node) {
    let all: Association[] = [];
    for (const a of this.associations) {
      if (end.equals(a.getEnd())) {
        all.push(a);
      }
    }
    return all;
  }

  getAssignmentsParent(parent: Node) {
    let all: Assignment[] = [];
    for (const a of this.assignments) {
      if (parent.equals(a.getParent())) {
        all.push(a);
      }
    }
    return all;
  }

  getAssignmentsChild(child: Node) {
    let all: Assignment[] = [];
    for (const a of this.assignments) {
      if (child.equals(a.getChild())) {
        all.push(a);
      }
    }
    return all;
  }

  getAllAssociations() { return this.associations; }
  getAllAssignments() { return this.assignments; }
}