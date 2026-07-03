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

  /*
   * We used to pre-resolve the email against /search/users?q=<email>+in:email
   * to convert it into an `invitee_id`. That endpoint only sees PUBLIC
   * emails, so every ProtonMail / noreply address short-circuited with a
   * "No GitHub account is associated with..." error the receiver could not
   * fix without exposing their private address. GitHub's own invitation
   * endpoint accepts `{email}` and matches it against every verified email
   * (including private ones); pass it through and let GitHub do the match.
   */
  it('passes the email straight through to the invitation payload', async () => {
    /* No fetch stub for /search/users — the resolver is gone. teams only. */
    stubGitHub(url => teamLookupOk(url) ?? okJson({}))
    const out = await buildInvite('owner', 'tok', {
      email: 'anyone@proton.me',
      role: 'editor',
    })
    expect(out['email']).toBe('anyone@proton.me')
    expect(out['invitee_id']).toBeUndefined()
    expect(out['role']).toBe('direct_member')
    expect(out['team_ids']).toEqual([11])
  })

  it('assigns team_ids by role and maps admin → admin', async () => {
    stubGitHub(url => teamLookupOk(url) ?? okJson({}))
    const admin = await buildInvite('owner', 'tok', {
      email: 'boss@example.com',
      role: 'admin',
    })
    expect(admin['role']).toBe('admin')
    /* Admins are org-wide; no team is attached. */
    expect(admin['team_ids']).toEqual([])

    const chief = await buildInvite('owner', 'tok', {
      email: 'chief@example.com',
      role: 'chief-editor',
    })
    expect(chief['role']).toBe('direct_member')
    expect(chief['team_ids']).toEqual([22])
  })
})

describe('buildInvite by login', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('resolves a username to invitee_id via /users/{login}', async () => {
    stubGitHub(url => {
      const team = teamLookupOk(url)
      if (team) return team
      if (url.includes('/users/mallory')) {
        return okJson({ id: 7777, login: 'mallory' })
      }
      return okJson({})
    })
    const out = await buildInvite('owner', 'tok', {
      login: 'mallory',
      role: 'editor',
    })
    expect(out['invitee_id']).toBe(7777)
    expect(out['email']).toBeUndefined()
  })
})
