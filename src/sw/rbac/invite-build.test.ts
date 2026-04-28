import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildInvite } from './invite-build'

const okJson = (body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })

const stubGitHub = (route: (url: string) => Response): void => {
  vi.stubGlobal('fetch', async (url: string) => route(url))
}

const teamLookupOk = (url: string): Response | undefined => {
  if (url.includes('/orgs/owner/teams')) {
    return okJson([
      { id: 11, slug: 'editors' },
      { id: 22, slug: 'chief-editors' },
    ])
  }
  return undefined
}

describe('buildInvite by email', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('resolves a public email to invitee_id', async () => {
    stubGitHub(url => {
      const team = teamLookupOk(url)
      if (team) return team
      if (url.includes('/search/users?q=')) {
        return okJson({
          total_count: 1,
          items: [{ login: 'alice', id: 4242 }],
        })
      }
      return okJson({})
    })
    const out = await buildInvite('owner', 'tok', {
      email: 'alice@example.com',
      role: 'editor',
    })
    expect(out['invitee_id']).toBe(4242)
    expect(out['email']).toBeUndefined()
  })

  it('rejects when no GitHub user has the email public', async () => {
    stubGitHub(url => {
      const team = teamLookupOk(url)
      if (team) return team
      if (url.includes('/search/users?q=')) {
        return okJson({ total_count: 0, items: [] })
      }
      return okJson({})
    })
    await expect(
      buildInvite('owner', 'tok', {
        email: 'nobody@example.com',
        role: 'editor',
      })
    ).rejects.toThrow(/No GitHub account/)
  })
})
