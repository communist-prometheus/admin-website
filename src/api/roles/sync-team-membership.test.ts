import { afterEach, describe, expect, it, vi } from 'vitest'
import { syncTeamMembership } from './sync-team-membership'

interface Call {
  readonly method: string
  readonly url: string
}

const ORG = 'communist-prometheus'
const EDITORS = `https://api.github.com/orgs/${ORG}/teams/editors/memberships/alice`
const CHIEFS = `https://api.github.com/orgs/${ORG}/teams/chief-editors/memberships/alice`

const stubFetch = (
  route: (call: Call) => Response
): { readonly calls: Call[] } => {
  const calls: Call[] = []
  vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
    const method = init?.method ?? 'GET'
    calls.push({ method, url })
    return route({ method, url })
  })
  return { calls }
}

const ok = (): Response => new Response('{}', { status: 200 })
const noContent = (): Response => new Response(null, { status: 204 })
const notFound = (): Response => new Response('not found', { status: 404 })
const forbidden = (): Response => new Response('forbidden', { status: 403 })

describe('syncTeamMembership', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('editor: PUT editors membership + DELETE from chief-editors', async () => {
    const { calls } = stubFetch(call =>
      call.method === 'PUT' ? ok() : noContent()
    )
    await syncTeamMembership('tok', 'alice', 'editor')
    expect(calls).toContainEqual({ method: 'PUT', url: EDITORS })
    expect(calls).toContainEqual({ method: 'DELETE', url: CHIEFS })
    /* No stray operations. */
    expect(calls.length).toBe(2)
  })

  it('chief-editor: PUT chief-editors membership + DELETE from editors', async () => {
    const { calls } = stubFetch(call =>
      call.method === 'PUT' ? ok() : noContent()
    )
    await syncTeamMembership('tok', 'alice', 'chief-editor')
    expect(calls).toContainEqual({ method: 'PUT', url: CHIEFS })
    expect(calls).toContainEqual({ method: 'DELETE', url: EDITORS })
    expect(calls.length).toBe(2)
  })

  it('admin: DELETE from both teams (admins are org-level, no team)', async () => {
    const { calls } = stubFetch(() => noContent())
    await syncTeamMembership('tok', 'alice', 'admin')
    const methods = calls.map(c => c.method)
    expect(methods).toEqual(['DELETE', 'DELETE'])
    expect(new Set(calls.map(c => c.url))).toEqual(new Set([EDITORS, CHIEFS]))
  })

  it('none: DELETE from both teams', async () => {
    const { calls } = stubFetch(() => noContent())
    await syncTeamMembership('tok', 'alice', 'none')
    expect(calls.length).toBe(2)
    expect(calls.every(c => c.method === 'DELETE')).toBe(true)
  })

  it('accepts 404 on DELETE (login was not a member of that team)', async () => {
    stubFetch(call => (call.method === 'PUT' ? ok() : notFound()))
    await expect(
      syncTeamMembership('tok', 'alice', 'editor')
    ).resolves.toBeUndefined()
  })

  it('throws when PUT is rejected (surfaces GitHub message)', async () => {
    stubFetch(call => (call.method === 'PUT' ? forbidden() : noContent()))
    await expect(
      syncTeamMembership('tok', 'alice', 'editor')
    ).rejects.toThrow(/add to team editors: 403/)
  })

  it('throws when a non-404 DELETE fails (real removal failure)', async () => {
    stubFetch(() => forbidden())
    await expect(syncTeamMembership('tok', 'alice', 'none')).rejects.toThrow(
      /remove from team/
    )
  })

  it('sends admin:org-scoped Bearer + User-Agent + accept header', async () => {
    let seen: RequestInit | undefined
    vi.stubGlobal('fetch', async (_url: string, init?: RequestInit) => {
      seen = init
      return noContent()
    })
    await syncTeamMembership('secret-tok', 'alice', 'none')
    const headers = seen?.headers as Record<string, string>
    expect(headers['Authorization']).toBe('Bearer secret-tok')
    expect(headers['Accept']).toBe('application/vnd.github+json')
    expect(headers['User-Agent']).toBe('prometheus-admin')
  })

  it('PUT body sets team role to "member" (not maintainer)', async () => {
    let putBody: string | undefined
    vi.stubGlobal('fetch', async (_url: string, init?: RequestInit) => {
      if (init?.method === 'PUT') putBody = init.body as string
      return init?.method === 'PUT' ? ok() : noContent()
    })
    await syncTeamMembership('tok', 'alice', 'editor')
    expect(putBody).toBeDefined()
    expect(JSON.parse(putBody as string)).toEqual({ role: 'member' })
  })
})
