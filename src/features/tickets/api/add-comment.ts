import type { TicketComment } from './gh-tickets'

const OWNER = 'communist-prometheus'
const REPO = 'tickets'
const BASE = `https://api.github.com/repos/${OWNER}/${REPO}`

const headers = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'Content-Type': 'application/json',
})

/**
 * Add a comment to a ticket.
 * @param token - GitHub access token
 * @param issueNumber - Issue number
 * @param body - Comment text
 * @returns Created comment
 */
export const addComment = async (
  token: string,
  issueNumber: number,
  body: string
): Promise<TicketComment> => {
  const url = `${BASE}/issues/${issueNumber}/comments`
  const res = await fetch(url, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({ body }),
  })
  return (await res.json()) as TicketComment
}
