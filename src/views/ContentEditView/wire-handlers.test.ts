import { afterEach, describe, expect, it, vi } from 'vitest'
import * as draftStash from '@/composables/useContent/new-content-draft'
import * as renameApi from '@/composables/useGitHubApi/rename-content'
import { makeRename } from './wire-handlers'

const mockNavigate = vi.fn<(url: string) => void>()

afterEach(() => {
  mockNavigate.mockReset()
  vi.restoreAllMocks()
})

describe('makeRename — saved content path', () => {
  it('calls renameContent and navigates to the new slug URL', async () => {
    const apiSpy = vi
      .spyOn(renameApi, 'renameContent')
      .mockResolvedValue({ success: true, count: 1 })
    const rename = makeRename('blog', 'old-slug', {
      isUnsaved: () => false,
      navigate: mockNavigate,
    })
    await rename('new-slug')
    expect(apiSpy).toHaveBeenCalledWith('blog', 'old-slug', 'new-slug')
    expect(mockNavigate).toHaveBeenCalledWith('/content/blog/edit/new-slug')
  })
})

describe('makeRename — unsaved magazine path (regression for create→rename→save flow)', () => {
  /*
   * The user-reported bug: creating a magazine, renaming the slug
   * BEFORE first save, then clicking Save fails with
   * "No files found for magazine/<old-slug>" because
   * `renameContent` calls the SW BFF which expects the source
   * directory to exist on disk.
   *
   * The fix is "local rename" when the content has never been
   * persisted: re-stash the in-flight draft under the new slug so
   * the next mount reads it, and navigate to the new URL — without
   * hitting the SW.
   */
  it('skips renameContent and re-stashes the draft under the new slug', async () => {
    const apiSpy = vi.spyOn(renameApi, 'renameContent')
    const stashSpy = vi.spyOn(draftStash, 'setNewContentDraft')
    const draft = {
      slug: 'old-slug',
      lang: 'ru' as const,
      title: 'Test',
      description: 'desc',
    }
    const rename = makeRename('magazine', 'old-slug', {
      isUnsaved: () => true,
      currentDraft: () => draft,
      navigate: mockNavigate,
    })
    await rename('renamed-slug')
    expect(
      apiSpy,
      'SW rename must NOT fire on unsaved content'
    ).not.toHaveBeenCalled()
    expect(stashSpy).toHaveBeenCalledWith({ ...draft, slug: 'renamed-slug' })
    expect(mockNavigate).toHaveBeenCalledWith(
      '/content/magazine/edit/renamed-slug'
    )
  })

  it('still navigates to the new URL even when no draft is available', async () => {
    const apiSpy = vi.spyOn(renameApi, 'renameContent')
    const stashSpy = vi.spyOn(draftStash, 'setNewContentDraft')
    const rename = makeRename('magazine', 'old-slug', {
      isUnsaved: () => true,
      currentDraft: () => undefined,
      navigate: mockNavigate,
    })
    await rename('renamed-slug')
    expect(apiSpy).not.toHaveBeenCalled()
    expect(stashSpy).not.toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith(
      '/content/magazine/edit/renamed-slug'
    )
  })
})
