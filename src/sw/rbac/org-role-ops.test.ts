import { afterEach, describe, expect, it, vi } from 'vitest'
import { applyRole } from './org-role-ops'

interface Call {
  readonly url: string
  readonly method: string
}

const stubFetch = (response: () => Response) => {
  const calls: Call[] = []
  vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
    calls.push({ url, method: init.method ?? 'GET' })
    return response()
  })
  return calls
}

describe('applyRole', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('promotes a direct org member to editor by PUTing the editor team', async () => {
    const calls = stubFetch(() => new Response('{}', { status: 200 }))
    await applyRole('owner', 'tok', { login: 'alice', role: 'editor' })

    const editorPut = calls.find(
      c => c.method === 'PUT' && c.url.includes('/teams/editors/memberships/')
    )
    expect(editorPut).toBeDefined()
  })

  it('throws when the org-membership PUT fails', async () => {
    vi.stubGlobal('fetch', async (url: string) =>
      url.includes('/memberships/') && !url.includes('/teams/')
        ? new Response('forbidden', { status: 403 })
        : new Response('{}', { status: 200 })
    )
    await expect(
      applyRole('owner', 'tok', { login: 'bob', role: 'admin' })
    ).rejects.toThrow(/403|forbidden|membership/i)
  })

  it('throws when adding to the target team fails', async () => {
    vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
      const method = init.method ?? 'GET'
      const isTeamPut = method === 'PUT' && url.includes('/teams/')
      return isTeamPut
        ? new Response('forbidden', { status: 403 })
        : new Response('{}', { status: 200 })
    })
    await expect(
      applyRole('owner', 'tok', { login: 'bob', role: 'editor' })
    ).rejects.toThrow(/403|forbidden|team/i)
  })

  it('ignores 404 from clearReservedTeams (user was not in those teams)', async () => {
    vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
      const method = init.method ?? 'GET'
      const isTeamDelete = method === 'DELETE' && url.includes('/teams/')
      return isTeamDelete
        ? new Response('not found', { status: 404 })
        : new Response('{}', { status: 200 })
    })
    await expect(
      applyRole('owner', 'tok', { login: 'bob', role: 'editor' })
    ).resolves.toBeUndefined()
  })
})
