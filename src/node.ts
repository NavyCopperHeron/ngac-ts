// Property class
class Property {
    key: string;
    value: string;

    /**
     * Property class
     * @constructor
     * @param {string} key - The key or name of the property.
     * @param {string} value - The value of the property.
     */
    constructor(key: string, value: string) {
        this.key = key;
        this.value = value;
    }
}

// Node class
export default class Node {
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
        this.properties = [];
    }

    /**
     * Retrieves the ID of the node.
     * @returns {number} The ID of the node.
     */
    getId(): number {
        return this.id;
    }

    /**
     * Retrieves the name of the node.
     * @returns {string} The name of the node.
     */
    getName(): string {
        return this.name;
    }
    
    /**
     * Retrieves the type of the node.
     * @returns {string} The type of the node.
     */
    getType(): string {
        return this.type;
    }
    
    /**
     * Retrieves the properties of the node.
     * @returns {Array<Property>} The properties of the node.
     */
    getProperties(): Array<Property> {
        return this.properties;
    }

    /**
     * Checks if a property with a specific key exists in the node.
     * @param {string} key - The key of the property to check.
     * @returns {boolean} True if the property exists, otherwise false.
     */
    hasProperty(key: string): boolean {
        return this.properties.some(property => property.key === key);
    }
    
    /**
     * Adds a new property to the node.
     * If a property with the same key exists, it is not added.
     * @param {string} key - The key of the property.
     * @param {string} value - The value of the property.
     */
    addProperty(key: string, value: string): void {
        if (!this.hasProperty(key)) {
            this.properties.push(new Property(key, value));
        }
    }
    
    /**
     * Deletes a property from the node based on the key.
     * @param {string} key - The key of the property to delete.
     */
    deleteProperty(key: string): void {
        this.properties = this.properties.filter(property => property.key !== key);
    }
    
    /**
     * Updates the value of an existing property in the node.
     * If the property does not exist, it is added as a new property.
     * @param {string} key - The key of the property to update.
     * @param {string} newValue - The new value of the property.
     */
    updateProperty(key: string, newValue: string): void {
        const property = this.properties.find(prop => prop.key === key);
        if (property) {
            property.value = newValue;
        } else {
            this.addProperty(key, newValue);
        }
    }

    equals(other: Node): boolean {
        return this.id == other.getId() && this.name == other.getName() && this.type == other.getType();
    }
}