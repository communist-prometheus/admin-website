import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import type { AssetItem } from '../useGitHubApi/asset-types'
import { createAddAsset } from './add-asset'
import type { AssetState } from './state'
import type { PendingAsset } from './types'

vi.mock('./create-blob-url', () => ({
  createBlobUrl: (_b: string, type: string) =>
    `blob:${type}-${Math.random()}`,
}))
vi.mock('./file-to-base64', () => ({
  fileToBase64: async (f: File) => `b64:${f.name}:${f.size}`,
}))

const makeState = (
  committed: readonly AssetItem[] = [],
  pending: readonly PendingAsset[] = [],
  deletes: ReadonlySet<string> = new Set()
): AssetState => ({
  committed: ref(committed),
  pendingAdds: ref(pending),
  pendingDeletes: ref(deletes),
  coverPath: ref(undefined),
  resolvedUrls: ref(new Map()),
  loading: ref(false),
})

const pendingOf = (name: string): PendingAsset => ({
  name,
  base64: `b64-${name}`,
  mimeType: 'image/png',
  blobUrl: `blob:${name}-old`,
})

const file = (name: string, bytes = 'x'): File =>
  new File([bytes], name, { type: 'image/png' })

describe('createAddAsset', () => {
  beforeEach(() => {
    vi.stubGlobal('URL', {
      ...URL,
      revokeObjectURL: vi.fn(),
    })
  })

  it('appends a new asset when nothing collides', async () => {
    const state = makeState()
    await createAddAsset(state)(file('a.png'))
    expect(state.pendingAdds.value).toHaveLength(1)
    expect(state.pendingAdds.value[0]?.name).toBe('a.png')
    expect(state.pendingDeletes.value.size).toBe(0)
  })

  it('replaces a same-name pending entry with the new bytes', async () => {
    const state = makeState([], [pendingOf('a.png')])
    await createAddAsset(state)(file('a.png', 'new'))
    expect(state.pendingAdds.value).toHaveLength(1)
    expect(state.pendingAdds.value[0]?.base64).toBe('b64:a.png:3')
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:a.png-old')
  })

  it('schedules a same-name committed asset for deletion', async () => {
    const committed: AssetItem = {
      path: 'blog/x/assets/a.png',
      name: 'a.png',
      mimeType: 'image/png',
    }
    const state = makeState([committed])
    await createAddAsset(state)(file('a.png'))
    expect(state.pendingDeletes.value.has('blog/x/assets/a.png')).toBe(true)
  })

  it('is idempotent: re-adding the same name does not grow pendingDeletes', async () => {
    const committed: AssetItem = {
      path: 'blog/x/assets/a.png',
      name: 'a.png',
      mimeType: 'image/png',
    }
    const state = makeState([committed])
    const add = createAddAsset(state)
    await add(file('a.png'))
    await add(file('a.png', 'newer'))
    expect(state.pendingDeletes.value.size).toBe(1)
    expect(state.pendingAdds.value).toHaveLength(1)
  })

  it('keeps unrelated pending entries when replacing one name', async () => {
    const state = makeState([], [pendingOf('a.png'), pendingOf('b.png')])
    await createAddAsset(state)(file('a.png', 'new'))
    expect(state.pendingAdds.value.map(p => p.name).sort()).toEqual([
      'a.png',
      'b.png',
    ])
  })
})
