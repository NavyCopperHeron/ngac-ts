export default class Node {
    id: number;
    name: string;
    type: string;
    // properties: Array<Property>;
    // Examples have a 'property' variable but not sure what it does

    /**
    * Node class
    * @constructor
    * @param {number} id - Object id.
    * @param {string} name - Object name.
    * @param {string} type - Object type, out of the following: [user, object, userAttribute, objectAttribute, policyClass]
    */
    constructor(id: number, name: string, type: string) {
        this.id = id;
        this.name = name;
        this.type = type;
        //this.properties = new Array<Property>();
    }

    getId(): number { return this.id; }
    getName(): string { return this.name; }
    getType(): string { return this.type; }
    equals(other: Node): boolean {
        return this.id == other.getId() && this.name == other.getName() && this.type == other.getType();
    }
  }