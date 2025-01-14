import Node from './node.ts';

export default class Assignment {
    parent: Node;
    child: Node;
    
    /**
    * Association class
    * @constructor
    * @param {Node} parent - Parent node.
    * @param {Node} child - Child node.
    */
    constructor(parent: Node, child: Node) {
        this.parent = parent;
        this.child = child;
    }

    getParent(): Node { return this.parent}
    getChild(): Node { return this.child}
    equals(other: Assignment): boolean {
        return this.child.equals(other.getChild()) && this.parent.equals(other.getParent());
    }
}