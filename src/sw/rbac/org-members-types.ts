/** A GitHub organisation member as surfaced to the client. */
export interface OrgMember {
  readonly login: string
  readonly orgRole: 'admin' | 'member'
}
