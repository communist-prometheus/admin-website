import type { Role } from '@/types/role'
import { setOrgAdmins } from './org-admin-cache'
import type {
  OrgInvitation,
  OrgMember,
  OrgMembersPayload,
} from './org-members-types'

const MOCK_MEMBERS: readonly OrgMember[] = [
  { login: 'alice-admin', orgRole: 'admin', appRole: 'admin' },
  { login: 'bob-chief', orgRole: 'member', appRole: 'chief-editor' },
  { login: 'carol-edit', orgRole: 'member', appRole: 'editor' },
  { login: 'dave-none', orgRole: 'member' },
]

const MOCK_INVITES: readonly OrgInvitation[] = [
  { id: 99, email: 'pending@example.com', role: 'editor' },
]

/**
 * Build the mock-mode payload used by `/api/github/org-members`.
 * Populates the org-admin cache so resolveRole() keeps working.
 *
 * @returns mock members + invitations
 */
export const mockOrgMembers = (): OrgMembersPayload => {
  setOrgAdmins(['alice-admin'])
  return { members: MOCK_MEMBERS, invitations: MOCK_INVITES }
}

/**
 * Resolve a mock user's role for enforcement in mock/E2E mode, where
 * there is no CF worker / KV to query. The default E2E identity
 * (`test-user`, from {@link getMockUser}) is the admin actor; the named
 * members back the Settings → Members UI fixtures.
 * @param username - Current user's login (config.username).
 * @returns The mock role, or undefined.
 */
export const mockRoleFor = (
  username: string | undefined
): Role | undefined =>
  username === 'test-user'
    ? 'admin'
    : MOCK_MEMBERS.find(m => m.login === username)?.appRole
