import type { Ticket, TicketComment } from './gh-tickets'

const OWNER = 'communist-prometheus'
const REPO = 'tickets'
const BASE = `https://api.github.com/repos/${OWNER}/${REPO}`

const headers = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'Content-Type': 'application/json',
})

/**
 * Create a new ticket.
 * @param token - GitHub access token
 * @param title - Ticket title
 * @param body - Ticket description
 * @param labels - Labels to assign
 * @returns Created ticket
 */
export const createTicket = async (
  token: string,
  title: string,
  body: string,
  labels: readonly string[]
): Promise<Ticket> => {
  const res = await fetch(`${BASE}/issues`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({ title, body, labels }),
  })
  if (!res.ok) throw new Error(`Create ticket failed: ${res.status}`)
  return (await res.json()) as Ticket
}

/**
 * Fetch comments for a ticket.
 * @param token - GitHub access token
 * @param issueNumber - Issue number
 * @returns Array of comments
 */
export const getComments = async (
  token: string,
  issueNumber: number
): Promise<readonly TicketComment[]> => {
  const url = `${BASE}/issues/${issueNumber}/comments`
  const res = await fetch(url, { headers: headers(token) })
  return (await res.json()) as TicketComment[]
}
