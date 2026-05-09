import { beforeEach, describe, expect, it, vi } from 'vitest'

const writeAssetMock = vi.fn(
  async (_path: string, _b64: string): Promise<void> => undefined
)
const deleteAssetMock = vi.fn(
  async (_path: string): Promise<void> => undefined
)
const stageFileMock = vi.fn(
  async (_path: string, _content: string): Promise<void> => undefined
)
const commitStagedMock = vi.fn(async (_msg: string) => ({ sha: 'deadbeef' }))

vi.mock('../useGitHubApi/write-asset', () => ({
  writeAsset: (p: string, b: string) => writeAssetMock(p, b),
}))
vi.mock('../useGitHubApi/delete-asset', () => ({
  deleteAsset: (p: string) => deleteAssetMock(p),
}))
vi.mock('../useGitHubApi/stage-file', () => ({
  stageFile: (p: string, c: string) => stageFileMock(p, c),
}))
vi.mock('../useGitHubApi/commit-staged', () => ({
  commitStaged: (m: string) => commitStagedMock(m),
}))
vi.mock('@/config/github', () => ({
  getGitHubConfig: () => ({
    contentPath: '',
    owner: 'o',
    repo: 'r',
    branch: 'main',
  }),
}))

const { transactionalSave } = await import('./transactional-save')

const pendingAsset = (name: string) => ({
  name,
  blobUrl: `blob:${name}`,
  base64: 'AA==',
  mimeType: name.endsWith('.pdf') ? 'application/pdf' : 'image/png',
  size: 1,
})

beforeEach(() => {
  writeAssetMock.mockClear()
  deleteAssetMock.mockClear()
  stageFileMock.mockClear()
  commitStagedMock.mockClear()
})

describe('transactionalSave — replace-collision regression', () => {
  it('does NOT delete a path that the same save is also writing', async () => {
    /*
     * Reproducer for the prod incident on 2026-05-07 where re-saving
     * `magazine-1-mai-2026` wiped its PDF + cover.png.
     *
     * `addAsset` schedules the existing committed path for deletion
     * via scheduleReplace AND queues new bytes in pendingAdds. With
     * same filename the target path collides — flushAdds writes,
     * then flushDeletes runs `git rm` on the same path → file gone.
     */
    const path = 'newspaper/magazine-1-mai-2026/assets/cover.png'
    await transactionalSave({
      type: 'newspaper',
      slug: 'magazine-1-mai-2026',
      articlePath: 'newspaper/magazine-1-mai-2026/index.ru.md',
      articleContent: '---\ntitle: x\n---\n',
      message: 'updated',
      pendingAdds: [pendingAsset('cover.png')],
      pendingDeletes: new Set([path]),
    })
    expect(writeAssetMock).toHaveBeenCalledWith(path, 'AA==')
    expect(deleteAssetMock).not.toHaveBeenCalledWith(path)
  })

  it('still deletes paths that are NOT being re-added', async () => {
    const orphan = 'newspaper/magazine-1-mai-2026/assets/old-illustration.jpg'
    await transactionalSave({
      type: 'newspaper',
      slug: 'magazine-1-mai-2026',
      articlePath: 'newspaper/magazine-1-mai-2026/index.ru.md',
      articleContent: '---\ntitle: x\n---\n',
      message: 'updated',
      pendingAdds: [pendingAsset('cover.png')],
      pendingDeletes: new Set([orphan]),
    })
    expect(deleteAssetMock).toHaveBeenCalledWith(orphan)
  })

  it('handles many pending adds + a colliding delete cleanly', async () => {
    const collide = 'newspaper/magazine-1-mai-2026/assets/Magazine1 (3).pdf'
    const orphan = 'newspaper/magazine-1-mai-2026/assets/notes.txt'
    await transactionalSave({
      type: 'newspaper',
      slug: 'magazine-1-mai-2026',
      articlePath: 'newspaper/magazine-1-mai-2026/index.ru.md',
      articleContent: '---\ntitle: x\n---\n',
      message: 'updated',
      pendingAdds: [
        pendingAsset('Magazine1 (3).pdf'),
        pendingAsset('cover.png'),
      ],
      pendingDeletes: new Set([collide, orphan]),
    })
    const deleted = deleteAssetMock.mock.calls.map(c => c[0])
    expect(deleted).toContain(orphan)
    expect(deleted).not.toContain(collide)
  })
})
