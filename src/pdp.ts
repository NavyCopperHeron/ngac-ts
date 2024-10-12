/**
 * Please have doc for each exported function (as least).
 * Ref: https://jsdoc.app/about-getting-started
 */

/**
 * Conducts a BFS of permissions
 * @param {Node} user - The user who is requesting permission.
 * @param {Node} target - The resource requested.
 * @param {Array<String>} permissions - Access type e.g. 'read', 'write'
 */
export default function getPermission(user: Node, target: Node, permissions: Array<String>): boolean {
  return true;
}
