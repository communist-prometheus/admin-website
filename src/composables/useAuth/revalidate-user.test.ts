import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { User } from '@/types/user'
import { getCachedUser } from './cached-user'
import { ensureFreshToken } from './ensure-fresh-token'
import { fetchGitHubUser, GitHubAuthError } from './fetch-github-user'
import { revalidateUser } from './revalidate-user'

vi.mock('./ensure-fresh-token', () => ({ ensureFreshToken: vi.fn() }))
vi.mock('./cached-user', () => ({ getCachedUser: vi.fn() }))
vi.mock('./profile-cache', () => ({ saveProfile: vi.fn() }))
vi.mock('./fetch-github-user', async importOriginal => {
  const actual = await importOriginal<typeof import('./fetch-github-user')>()
  return { ...actual, fetchGitHubUser: vi.fn() }
})

const ensureMock = vi.mocked(ensureFreshToken)
const fetchMock = vi.mocked(fetchGitHubUser)
const cachedMock = vi.mocked(getCachedUser)

const user = (name: string): User => ({
  username: name,
  name,
  avatar: 'a',
  accessToken: 't',
})

describe('revalidateUser', () => {
  beforeEach(() => {
    ensureMock.mockReset()
    fetchMock.mockReset()
    cachedMock.mockReset()
  })

  it('returns undefined when the session is dead', async () => {
    ensureMock.mockResolvedValue(undefined)
    expect(await revalidateUser()).toBeUndefined()
  })

  it('returns the fresh user on success', async () => {
    ensureMock.mockResolvedValue('t')
    fetchMock.mockResolvedValue(user('fresh'))
    expect((await revalidateUser())?.username).toBe('fresh')
  })

  it('logs out (undefined) on an auth failure', async () => {
    ensureMock.mockResolvedValue('t')
    fetchMock.mockRejectedValue(new GitHubAuthError('401'))
    expect(await revalidateUser()).toBeUndefined()
    expect(cachedMock).not.toHaveBeenCalled()
  })

  it('keeps the cached user on a transient failure', async () => {
    ensureMock.mockResolvedValue('t')
    fetchMock.mockRejectedValue(new Error('network'))
    cachedMock.mockReturnValue(user('cached'))
    expect((await revalidateUser())?.username).toBe('cached')
  })
})
