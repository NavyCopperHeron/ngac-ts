export default class Association {
  start: Node;
  end: Node;
  operations: Array<String>;

  /**
    * Association class
    * @constructor
    * @param {Node} start - Source node.
    * @param {Node} end - Target node.
    * @param {Array<String>} operations - Array containing permitted operations: e.g. ['read', 'write']
    */
  constructor(start: Node, end: Node, operations: Array<String>) {
    this.start = start;
    this.end = end;
    this.operations = new Array<String>();
  }
}