import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchGitHubUser, GitHubAuthError } from './fetch-github-user'

const fetchMock = vi.fn()
const ghUser = { login: 'andswew', name: 'A', avatar_url: 'x' }

beforeEach(() => vi.stubGlobal('fetch', fetchMock))
afterEach(() => {
  vi.unstubAllGlobals()
  fetchMock.mockReset()
})

describe('fetchGitHubUser', () => {
  it('maps a 200 response to a User carrying the token', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(ghUser), { status: 200 })
    )
    expect(await fetchGitHubUser('tok')).toEqual({
      username: 'andswew',
      name: 'A',
      avatar: 'x',
      accessToken: 'tok',
    })
  })

  it('throws GitHubAuthError on 401 (dead token)', async () => {
    fetchMock.mockResolvedValue(new Response('', { status: 401 }))
    await expect(fetchGitHubUser('tok')).rejects.toBeInstanceOf(
      GitHubAuthError
    )
  })

  it('throws GitHubAuthError on 403', async () => {
    fetchMock.mockResolvedValue(new Response('', { status: 403 }))
    await expect(fetchGitHubUser('tok')).rejects.toBeInstanceOf(
      GitHubAuthError
    )
  })

  it('throws a non-auth error on 500 (transient)', async () => {
    fetchMock.mockResolvedValue(new Response('', { status: 500 }))
    const error = await fetchGitHubUser('tok').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(Error)
    expect(error).not.toBeInstanceOf(GitHubAuthError)
  })
})
