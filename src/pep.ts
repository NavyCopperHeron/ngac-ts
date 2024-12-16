/**
 * Policy Enforcement Point (PEP) External Interface
 * 
 * Defines the methods for external entities to request access to resources.
 */
export default interface PEP {
    /**
     * Requests access to a resource.
     * @param user - The user requesting access
     * @param resource - The resource to which access is requested
     * @param action - The action the user intends to perform (e.g., "read", "write")
     * @returns A promise that resolves to an access decision (e.g., "Access granted" or "Access denied")
     */
    requestAccess(user: number, resource: number, action: string): Promise<string>;
}
