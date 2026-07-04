import { afterEach, describe, expect, it, vi } from 'vitest'
import { syncContentAccess } from './sync-content-access'

interface Call {
  readonly method: string
  readonly url: string
  readonly body?: string
}

const REPO =
  'https://api.github.com/repos/communist-prometheus/public-website-content'
const COLLAB = (login: string) => `${REPO}/collaborators/${login}`

const stubFetch = (
  route: (call: Call) => Response
): { readonly calls: Call[] } => {
  const calls: Call[] = []
  vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
    const call = {
      method: init?.method ?? 'GET',
      url,
      body: init?.body as string | undefined,
    }
    calls.push(call)
    return route(call)
  })
  return { calls }
}

const created = (): Response => new Response('{}', { status: 201 })
const noContent = (): Response => new Response(null, { status: 204 })
const notFound = (): Response => new Response('not found', { status: 404 })
const forbidden = (): Response => new Response('forbidden', { status: 403 })

describe('syncContentAccess', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('editor: PUT collaborator on the content repo with push permission', async () => {
    const { calls } = stubFetch(() => created())
    await syncContentAccess('tok', 'alice', 'editor')
    expect(calls).toHaveLength(1)
    expect(calls[0]?.method).toBe('PUT')
    expect(calls[0]?.url).toBe(COLLAB('alice'))
    expect(JSON.parse(calls[0]?.body ?? '{}')).toEqual({ permission: 'push' })
  })

  it('chief-editor: same PUT collaborator with push permission', async () => {
    const { calls } = stubFetch(() => created())
    await syncContentAccess('tok', 'alice', 'chief-editor')
    expect(calls[0]?.method).toBe('PUT')
    expect(JSON.parse(calls[0]?.body ?? '{}')).toEqual({ permission: 'push' })
  })

  it('admin: PUT collaborator too (admins commit through the same UI)', async () => {
    const { calls } = stubFetch(() => noContent())
    await syncContentAccess('tok', 'alice', 'admin')
    expect(calls[0]?.method).toBe('PUT')
  })

  it('none: DELETE the collaborator record', async () => {
    const { calls } = stubFetch(() => noContent())
    await syncContentAccess('tok', 'alice', 'none')
    expect(calls[0]?.method).toBe('DELETE')
    expect(calls[0]?.url).toBe(COLLAB('alice'))
  })

  it('accepts DELETE 404 (login was not a collaborator)', async () => {
    stubFetch(() => notFound())
    await expect(
      syncContentAccess('tok', 'alice', 'none')
    ).resolves.toBeUndefined()
  })

  it('throws when PUT collaborator is rejected (surfaces GitHub message)', async () => {
    stubFetch(() => forbidden())
    await expect(syncContentAccess('tok', 'alice', 'editor')).rejects.toThrow(
      /grant content push: 403/
    )
  })

  it('throws when a non-404 DELETE fails (real removal failure)', async () => {
    stubFetch(() => forbidden())
    await expect(syncContentAccess('tok', 'alice', 'none')).rejects.toThrow(
      /revoke content access: 403/
    )
  })

  it('sends Bearer + User-Agent + accept headers on both PUT and DELETE', async () => {
    let seen: RequestInit | undefined
    vi.stubGlobal('fetch', async (_url: string, init?: RequestInit) => {
      seen = init
      return noContent()
    })
    await syncContentAccess('secret-tok', 'alice', 'editor')
    const headers = seen?.headers as Record<string, string>
    expect(headers['Authorization']).toBe('Bearer secret-tok')
    expect(headers['User-Agent']).toBe('prometheus-admin')
    expect(headers['Accept']).toBe('application/vnd.github+json')
  })
})
