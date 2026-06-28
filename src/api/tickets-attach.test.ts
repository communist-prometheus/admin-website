import type { Context } from 'hono'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Env } from './app'

const mockRequireOrgMember = vi.fn()
const mockDoWrite = vi.fn()
vi.mock('./tickets-attach-write', () => ({
  requireOrgMember: (...a: readonly unknown[]) => mockRequireOrgMember(...a),
  doWrite: (...a: readonly unknown[]) => mockDoWrite(...a),
}))

const { ticketsAttach } = await import('./tickets-attach')

interface CtxOpts {
  readonly origin?: string
  readonly auth?: string
  readonly service?: string
  readonly body?: unknown
}

const makeCtx = (o: CtxOpts): Context<{ Bindings: Env }> => {
  const headers: Record<string, string | undefined> = {
    Origin: o.origin,
    Authorization: o.auth,
  }
  const ctx = {
    req: {
      header: (n: string) => headers[n],
      json: async () => o.body ?? {},
    },
    env: { GITHUB_CLIENT_SECRET: 's', TICKETS_TOKEN: o.service },
  }
  return ctx as unknown as Context<{ Bindings: Env }>
}

const validBody = {
  path: 'attachments/abc123/shot.png',
  content: 'eA==',
  message: 'm',
}
const good = {
  origin: 'https://admin.comprom.org',
  auth: 'Bearer usertoken',
  service: 'svc',
  body: validBody,
}

describe('ticketsAttach gates', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireOrgMember.mockResolvedValue(undefined)
    mockDoWrite.mockResolvedValue(new Response('ok'))
  })

  it('rejects a foreign Origin and never authorizes or writes', async () => {
    const res = await ticketsAttach(
      makeCtx({ ...good, origin: 'https://evil.com' })
    )
    expect(res.status).toBe(403)
    expect(mockRequireOrgMember).not.toHaveBeenCalled()
    expect(mockDoWrite).not.toHaveBeenCalled()
  })

  it('rejects a missing bearer token', async () => {
    const res = await ticketsAttach(makeCtx({ ...good, auth: undefined }))
    expect(res.status).toBe(403)
    expect(mockDoWrite).not.toHaveBeenCalled()
  })

  it('returns 503 when the service token is absent', async () => {
    const res = await ticketsAttach(makeCtx({ ...good, service: undefined }))
    expect(res.status).toBe(503)
    expect(mockDoWrite).not.toHaveBeenCalled()
  })

  it('rejects a path outside attachments/ before any upstream call', async () => {
    const res = await ticketsAttach(
      makeCtx({
        ...good,
        body: { ...validBody, path: 'settings/secrets.json' },
      })
    )
    expect(res.status).toBe(403)
    expect(mockRequireOrgMember).not.toHaveBeenCalled()
    expect(mockDoWrite).not.toHaveBeenCalled()
  })

  it('rejects a non-member and never writes', async () => {
    mockRequireOrgMember.mockResolvedValue(
      new Response('no', { status: 403 })
    )
    const res = await ticketsAttach(makeCtx(good))
    expect(res.status).toBe(403)
    expect(mockRequireOrgMember).toHaveBeenCalledWith('usertoken')
    expect(mockDoWrite).not.toHaveBeenCalled()
  })

  it('writes via the service token for an authorized member', async () => {
    await ticketsAttach(makeCtx(good))
    expect(mockDoWrite).toHaveBeenCalledWith('svc', validBody)
  })
})
