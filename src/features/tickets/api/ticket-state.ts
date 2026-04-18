const OWNER = 'communist-prometheus'
const REPO = 'tickets'
const BASE = `https://api.github.com/repos/${OWNER}/${REPO}`

const headers = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'Content-Type': 'application/json',
})

/**
 * Close or reopen a ticket.
 * @param token - GitHub access token
 * @param issueNumber - Issue number
 * @param state - New state
 */
export const setTicketState = async (
  token: string,
  issueNumber: number,
  state: 'open' | 'closed'
): Promise<void> => {
  await fetch(`${BASE}/issues/${issueNumber}`, {
    method: 'PATCH',
    headers: headers(token),
    body: JSON.stringify({ state }),
  })
}
