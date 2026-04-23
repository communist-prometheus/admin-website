/** Identity + org role for a GitHub organisation member. */
export interface OrgMember {
  readonly login: string
  readonly orgRole: 'admin' | 'member'
  readonly appRole?: 'admin' | 'chief-editor' | 'editor'
  readonly avatarUrl?: string
  readonly name?: string
}

/** A pending organisation invitation. */
export interface OrgInvitation {
  readonly id: number
  readonly login?: string
  readonly email?: string
  readonly role: 'admin' | 'chief-editor' | 'editor'
  readonly inviter?: string
}

/** Payload returned by GET /api/github/org-members. */
export interface OrgMembersPayload {
  readonly members: readonly OrgMember[]
  readonly invitations: readonly OrgInvitation[]
}

/** Payload accepted by the invite endpoint. */
export interface InviteRequest {
  readonly email?: string
  readonly login?: string
  readonly role: 'admin' | 'chief-editor' | 'editor'
}
