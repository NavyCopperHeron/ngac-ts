import type IPEP  from './pep.ts';
import type IPDP  from './pdp.ts';
/**
 * PolicyEnforcementPoint class
 * 
 * This class implements the IPEP interface, managing access requests
 * by forwarding them to the PDP and returning the PDP's access decision.
 */
export class PolicyEnforcementPoint implements IPEP {
    constructor(private pdp: IPDP) {}

    /**
     * Requests access to a resource by passing the request to the PDP.
     * @param user - The user requesting access
     * @param resource - The resource the user wishes to access
     * @param action - The action the user intends to perform on the resource
     * @returns A promise that resolves to the PDP's access decision
     */
    async requestAccess(user: number, resource: number, action: string): Promise<string> {
        const decision = await this.pdp.evaluateRequest(user, resource, action);
        return decision === "Grant" 
            ? `Access granted to ${resource}`
            : `Access denied to ${resource}`;
    }
}
