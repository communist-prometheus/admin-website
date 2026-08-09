/** Git author identity for a commit. */
export interface CommitIdentity {
  readonly name: string
  readonly email: string
}

// Truthiness rejects the empty reference that `typeof x === 'object'`
// admits; the predicate narrows to a real object for the compiler.
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && Boolean(value)

const field = (value: unknown, key: string): unknown =>
  isRecord(value) && key in value ? value[key] : undefined

// GitHub attributes by author email; the id-prefixed noreply form links
// for any account age, the legacy form only for pre-2017 accounts.
const noreplyEmail = (id: unknown, login: string): string =>
  typeof id === 'number'
    ? `${id}+${login}@users.noreply.github.com`
    : `${login}@users.noreply.github.com`

const displayName = (user: unknown, login: string): string => {
  const name = field(user, 'name')
  return typeof name === 'string' && name.length > 0 ? name : login
}

/**
 * Map a GitHub `/user` payload to a commit identity.
 * @param user - Parsed `/user` response
 * @returns Identity, or undefined when the payload lacks a login
 */
export const identityFrom = (user: unknown): CommitIdentity | undefined => {
  const login = field(user, 'login')
  return typeof login === 'string'
    ? {
        name: displayName(user, login),
        email: noreplyEmail(field(user, 'id'), login),
      }
    : undefined
}
