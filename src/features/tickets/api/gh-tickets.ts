const OWNER = 'communist-prometheus'
const REPO = 'tickets'
const BASE = `https://api.github.com/repos/${OWNER}/${REPO}`

const headers = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
})

/** Ticket from GitHub Issues API */
export interface Ticket {
  readonly number: number
  readonly title: string
  readonly body: string
  readonly state: 'open' | 'closed'
  readonly labels: readonly { readonly name: string }[]
  readonly user: { readonly login: string }
  readonly created_at: string
  readonly comments: number
}

/** Comment from GitHub Issues API */
export interface TicketComment {
  readonly id: number
  readonly body: string
  readonly user: { readonly login: string }
  readonly created_at: string
}

/**
 * List tickets (issues) from the tickets repo.
 * @param token - GitHub access token
 * @param state - Filter by state
 * @returns Array of tickets
 */
export const listTickets = async (
  token: string,
  state: 'open' | 'closed' | 'all' = 'open'
): Promise<readonly Ticket[]> => {
  const url = `${BASE}/issues?state=${state}&per_page=50`
  const res = await fetch(url, { headers: headers(token) })
  return (await res.json()) as Ticket[]
}
