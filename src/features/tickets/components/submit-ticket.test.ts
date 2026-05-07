import { afterEach, describe, expect, it, vi } from 'vitest'
import { emptyBug } from '../templates/empty'
import type { BugTemplate } from '../templates/types'
import { submitTicket } from './submit-ticket'

const fetchMock = vi.fn()
globalThis.fetch = fetchMock as unknown as typeof fetch

const ok = (body: unknown) =>
  ({
    ok: true,
    json: async () => body,
  }) as Response

const filledBug = (): BugTemplate => ({
  ...emptyBug(),
  reproductionSteps: '1.',
  actualBehavior: 'crashed',
  expectedBehavior: 'no crash',
})

afterEach(() => fetchMock.mockReset())

describe('submitTicket', () => {
  it('returns invalid when required fields are missing', async () => {
    const result = await submitTicket({
      token: 't',
      title: 'X',
      template: emptyBug(),
      labels: ['public-website', 'bug'],
      attachments: [],
    })
    expect(result.kind).toBe('invalid')
    if (result.kind === 'invalid') {
      expect(result.missing.length).toBeGreaterThan(0)
    }
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('builds a structured body and posts to GitHub on success', async () => {
    fetchMock.mockResolvedValue(ok({ number: 42 }))
    const result = await submitTicket({
      token: 'tok',
      title: 'X',
      template: filledBug(),
      labels: ['public-website', 'bug'],
      attachments: [],
    })
    expect(result).toEqual({ kind: 'ok', issueNumber: 42 })
    const call = fetchMock.mock.calls[0] ?? []
    const init = call[1] as RequestInit
    const sent = JSON.parse(init.body as string)
    expect(sent.title).toBe('X')
    expect(sent.body).toContain('## Reproduction Steps')
    expect(sent.body).toContain('## Actual Behavior')
    expect(sent.labels).toEqual(['public-website', 'bug'])
  })

  it('returns error tag when fetch rejects', async () => {
    fetchMock.mockRejectedValue(new Error('boom'))
    const result = await submitTicket({
      token: 'tok',
      title: 'X',
      template: filledBug(),
      labels: [],
      attachments: [],
    })
    expect(result).toEqual({ kind: 'error', message: 'boom' })
  })
})
