// Note: link Property class

class Node {
    id: number;
    name: string;
    type: string;
    properties: Array<Property>;

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
        this.properties = new Array<Property>();
    }

    getId() {}

    getName() {}
    
    getType() {}
    
    getProperties() {}
    
    hasProperty() {}
    
    addProperty() {}
    
    deleteProperty() {}
    
    updateProperty() {}
  }