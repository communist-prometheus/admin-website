import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ensureFreshToken } from './ensure-fresh-token'
import { fetchGitHubUser } from './fetch-github-user'
import { getInitialUser } from './get-initial-user'

vi.mock('./ensure-fresh-token', () => ({ ensureFreshToken: vi.fn() }))
vi.mock('./mint-session', () => ({ mintSession: vi.fn() }))
vi.mock('./profile-cache', () => ({ saveProfile: vi.fn() }))
vi.mock('./fetch-github-user', async importOriginal => {
  const actual = await importOriginal<typeof import('./fetch-github-user')>()
  return { ...actual, fetchGitHubUser: vi.fn() }
})

const ensureMock = vi.mocked(ensureFreshToken)
const fetchMock = vi.mocked(fetchGitHubUser)

describe('getInitialUser', () => {
  beforeEach(() => {
    ensureMock.mockReset()
    fetchMock.mockReset()
    vi.stubEnv('VITE_DEV_TOKEN', '')
  })
  afterEach(() => vi.unstubAllEnvs())

  it('stays unauthenticated with no session, even in mock mode', async () => {
    vi.stubEnv('VITE_MOCK_AUTH', 'true')
    ensureMock.mockResolvedValue(undefined)
    expect(await getInitialUser()).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns the mock user (no real fetch) when mock mode has a session', async () => {
    vi.stubEnv('VITE_MOCK_AUTH', 'true')
    ensureMock.mockResolvedValue('t')
    expect(await getInitialUser()).not.toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('fetches the real user in non-mock mode with a session', async () => {
    vi.stubEnv('VITE_MOCK_AUTH', 'false')
    ensureMock.mockResolvedValue('t')
    fetchMock.mockResolvedValue({
      username: 'andswew',
      name: 'A',
      avatar: 'x',
      accessToken: 't',
    })
    expect((await getInitialUser())?.username).toBe('andswew')
  })
})
