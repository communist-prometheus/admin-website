import { afterEach, describe, expect, it, vi } from 'vitest'
import { resolveCommitIdentity } from './identity'
import { withTokenIdentity } from './token-identity'

const userResponse = (body: unknown, status = 200): void => {
  vi.stubGlobal(
    'fetch',
    async () => new Response(JSON.stringify(body), { status })
  )
}

afterEach(() => vi.unstubAllGlobals())

describe('resolveCommitIdentity', () => {
  it('builds the modern id-prefixed noreply email from /user', async () => {
    userResponse({ login: 'andswew', id: 281177217, name: 'Andrew' })
    expect(await resolveCommitIdentity('tok-A')).toEqual({
      name: 'Andrew',
      email: '281177217+andswew@users.noreply.github.com',
    })
  })

  it('falls back to login when the profile name is empty', async () => {
    userResponse({ login: 'undeadliner', id: 42, name: '' })
    expect(await resolveCommitIdentity('tok-B')).toEqual({
      name: 'undeadliner',
      email: '42+undeadliner@users.noreply.github.com',
    })
  })

  it('uses the legacy noreply form when id is absent', async () => {
    userResponse({ login: 'legacyuser' })
    expect(await resolveCommitIdentity('tok-C')).toEqual({
      name: 'legacyuser',
      email: 'legacyuser@users.noreply.github.com',
    })
  })

  it('returns undefined on a non-ok response (keeps the caller falling back)', async () => {
    userResponse({ message: 'Bad credentials' }, 401)
    expect(await resolveCommitIdentity('tok-D')).toBeUndefined()
  })

  it('caches per token — a second call issues no request', async () => {
    let calls = 0
    vi.stubGlobal('fetch', async () => {
      calls += 1
      return new Response(JSON.stringify({ login: 'x', id: 1 }), {
        status: 200,
      })
    })
    await resolveCommitIdentity('tok-E')
    await resolveCommitIdentity('tok-E')
    expect(calls).toBe(1)
  })
})

describe('withTokenIdentity', () => {
  it('overrides authorName/authorEmail with the token-derived identity', async () => {
    userResponse({ login: 'andswew', id: 281177217, name: 'Andrew' })
    const out = await withTokenIdentity({
      token: 'tok-F',
      owner: 'o',
      authorName: 'undeadliner',
      authorEmail: 'undeadliner@users.noreply.github.com',
    })
    expect(out.authorName).toBe('Andrew')
    expect(out.authorEmail).toBe('281177217+andswew@users.noreply.github.com')
    expect(out.owner).toBe('o')
  })

  it('leaves the config untouched when identity cannot be resolved', async () => {
    userResponse({}, 403)
    const config = {
      token: 'tok-G',
      authorName: 'kept',
      authorEmail: 'kept@example.com',
    }
    expect(await withTokenIdentity(config)).toEqual(config)
  })
})
