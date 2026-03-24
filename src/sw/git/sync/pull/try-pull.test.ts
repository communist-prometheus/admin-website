import { describe, expect, it, vi } from 'vitest'

vi.mock('../../../logging/logger', () => ({
  log: vi.fn(),
}))

const mockPull = vi.fn()
vi.mock('./pull-repo', () => ({
  pullRepo: (...args: readonly unknown[]) => mockPull(...args),
}))

const { tryPull } = await import('./try-pull')

const config = {
  owner: 'o',
  repo: 'r',
  branch: 'main',
  token: 't',
  contentPath: 'src/content',
  corsProxy: 'https://proxy',
}

describe('tryPull', () => {
  it('returns true on successful pull', async () => {
    mockPull.mockResolvedValueOnce(undefined)
    expect(await tryPull(config)).toBe(true)
  })

  it('returns false on pull failure (force push)', async () => {
    mockPull.mockRejectedValueOnce(new Error('not fast-forward'))
    expect(await tryPull(config)).toBe(false)
  })
})
