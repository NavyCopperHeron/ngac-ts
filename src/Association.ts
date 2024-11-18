import Node from './Node';

export default class Association {
  start: Node;
  end: Node;
  operations: Set<string>;

  /**
    * Association class
    * @constructor
    * @param {Node} start - Source node.
    * @param {Node} end - Target node.
    * @param {Array<string>} operations - Set containing permitted operations: e.g. ['read', 'write']
    */
  constructor(start: Node, end: Node, operations: Set<string>) {
    this.start = start;
    this.end = end;
    this.operations = operations;
  }

  getStart() { return this.start; }
  getEnd() { return this.end; }
  getOperations() { return this.operations; }
  equals(other: Association): boolean {
    return this.start.equals(other.getStart()) && 
           this.end.equals(other.getEnd()) && 
           this.operations == other.getOperations();
  }
}