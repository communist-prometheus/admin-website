import type { RoleAssignment } from './role-map'

const ASSIGNMENTS: readonly RoleAssignment[] = [
  'editor',
  'chief-editor',
  'admin',
  'none',
]

/**
 * Narrow an untrusted request value to a valid RoleAssignment without
 * casting — returns undefined for anything else.
 * @param v - The `role` field from the request body.
 * @returns The assignment, or undefined when invalid.
 */
export const toAssignment = (v: unknown): RoleAssignment | undefined =>
  typeof v === 'string' ? ASSIGNMENTS.find(a => a === v) : undefined
