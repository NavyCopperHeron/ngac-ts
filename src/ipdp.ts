// interfaces.ts
export default interface IPDP {
    /**
     * Evaluates an access request.
     * @param user - The user making the access request
     * @param resource - The target resource for the access request
     * @param action - The action the user wants to perform on the resource
     * @returns A promise that resolves to an access decision ("Grant" or "Deny")
     */
    evaluateRequest(user: number, resource: number, action: string): Promise<string>;
}
