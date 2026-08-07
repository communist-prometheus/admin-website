import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { FileChange } from '../../push-queue/collect-change'
import { workerState } from '../../state/state'
import { loadGit } from './../load-git'
import { changedFilesBetween } from './changed-files-between'
import { restPush } from './rest-push'

vi.mock('./../load-git', () => ({ loadGit: vi.fn() }))
vi.mock('./changed-files-between', () => ({ changedFilesBetween: vi.fn() }))
vi.mock('../fs', () => ({ fs: {}, REPO_DIR: '/repo' }))
vi.mock('../../logging/logger', () => ({ log: vi.fn() }))
vi.mock('../../state/state', () => ({
  workerState: { commitSha: 'HEADSHA' },
}))

const config = {
  owner: 'o',
  repo: 'r',
  branch: 'develop',
  contentPath: '',
  corsProxy: '',
  token: 'tok',
}

const localCommit = {
  commit: {
    message: 'note: edit',
    tree: 'BASETREE',
    author: { name: 'Ed', email: 'ed@x.org', timestamp: 1_700_000_000 },
  },
}

interface Call {
  readonly url: string
  readonly method: string
  readonly body: unknown
}

const routeReply = (url: string): Record<string, unknown> =>
  url.endsWith('/git/ref/heads/develop')
    ? { object: { sha: 'REMOTE' } }
    : url.endsWith('/git/blobs')
      ? { sha: 'BLOB' }
      : url.endsWith('/git/trees')
        ? { sha: 'NEWTREE' }
        : url.endsWith('/git/commits')
          ? { sha: 'NEWCOMMIT' }
          : {}

const stubFetch = (patch: () => Response): Call[] => {
  const calls: Call[] = []
  vi.stubGlobal('fetch', async (url: string, init: RequestInit = {}) => {
    const method = init.method ?? 'GET'
    calls.push({
      url,
      method,
      body: init.body ? JSON.parse(String(init.body)) : undefined,
    })
    return method === 'PATCH'
      ? patch()
      : new Response(JSON.stringify(routeReply(url)), { status: 200 })
  })
  return calls
}

const okPatch = (): Response => new Response('{}', { status: 200 })

beforeEach(() => {
  workerState.commitSha = 'HEADSHA'
  vi.mocked(loadGit).mockResolvedValue({
    readCommit: vi.fn(async ({ oid }: { oid: string }) =>
      oid === 'MISSING' ? Promise.reject(new Error('not found')) : localCommit
    ),
  } as unknown as Awaited<ReturnType<typeof loadGit>>)
})

afterEach(() => vi.unstubAllGlobals())

describe('restPush', () => {
  it('creates blob → tree → commit → ref update with fast-forward safety', async () => {
    const changes: FileChange[] = [
      { path: 'blog/a.md', data: new Uint8Array([104, 105]) },
      { path: 'blog/old.md', deleted: true },
    ]
    vi.mocked(changedFilesBetween).mockResolvedValue(changes)
    const calls = stubFetch(okPatch)

    await restPush(config)

    const steps = calls.map(c => `${c.method} ${c.url.split('/git/')[1]}`)
    expect(steps).toEqual([
      'GET ref/heads/develop',
      'POST blobs',
      'POST trees',
      'POST commits',
      'PATCH refs/heads/develop',
    ])
    const tree = calls.find(c => c.url.endsWith('/git/trees'))?.body
    expect(tree).toMatchObject({
      base_tree: 'BASETREE',
      tree: [
        { path: 'blog/a.md', sha: 'BLOB', type: 'blob' },
        { path: 'blog/old.md', sha: null, type: 'blob' },
      ],
    })
    const commit = calls.find(c => c.url.endsWith('/git/commits'))?.body
    expect(commit).toMatchObject({ tree: 'NEWTREE', parents: ['REMOTE'] })
    const ref = calls.find(c => c.method === 'PATCH')?.body
    expect(ref).toEqual({ sha: 'NEWCOMMIT', force: false })
    expect(workerState.commitSha).toBe('NEWCOMMIT')
  })

  it('is a no-op when the local commit is identical to the remote', async () => {
    vi.mocked(changedFilesBetween).mockResolvedValue([])
    const calls = stubFetch(okPatch)

    await restPush(config)

    expect(calls.map(c => c.method)).toEqual(['GET'])
    expect(workerState.commitSha).toBe('HEADSHA')
  })

  it('raises a non-fast-forward when the remote tip is not in the local clone', async () => {
    vi.mocked(loadGit).mockResolvedValue({
      readCommit: vi.fn(async ({ oid }: { oid: string }) =>
        oid === 'REMOTE'
          ? Promise.reject(new Error('object not found'))
          : localCommit
      ),
    } as unknown as Awaited<ReturnType<typeof loadGit>>)
    stubFetch(okPatch)

    await expect(restPush(config)).rejects.toThrow(/not a fast-forward/i)
  })

  it('surfaces a 422 fast-forward rejection so recovery can merge', async () => {
    vi.mocked(changedFilesBetween).mockResolvedValue([
      { path: 'blog/a.md', data: new Uint8Array([1]) },
    ])
    stubFetch(
      () =>
        new Response('{"message":"Update is not a fast forward"}', {
          status: 422,
        })
    )

    await expect(restPush(config)).rejects.toThrow(/not a fast forward/i)
  })
})
