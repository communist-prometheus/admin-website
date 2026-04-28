import { API, ghJson } from './github-api'

interface SearchUsersResponse {
  readonly total_count: number
  readonly items: readonly { readonly login: string; readonly id: number }[]
}

/**
 * Look up a GitHub user by their public email address. Returns
 * undefined when no public match exists — emails set to private
 * by the user are not indexed by GitHub's search.
 *
 * @param email - Email to search
 * @param token - OAuth bearer
 * @returns Resolved login + id, or undefined when no match
 */
export const resolveEmailToUser = async (
  email: string,
  token: string
): Promise<{ readonly login: string; readonly id: number } | undefined> => {
  const url = `${API}/search/users?q=${encodeURIComponent(`${email} in:email`)}`
  const r = await ghJson<SearchUsersResponse>(url, token).catch(
    () => undefined
  )
  return r && r.total_count > 0 && r.items[0] ? r.items[0] : undefined
}
