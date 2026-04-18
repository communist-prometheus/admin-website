import { describe, expect, it, vi } from 'vitest'
import { computed, ref } from 'vue'
import type { Language } from '@/types/content'
import { createInitEditor } from './useEditPageInit'

const makeDeps = (available: readonly Language[]) => {
  const reset = vi.fn<() => void>()
  const loadContent = vi.fn<() => Promise<void>>().mockResolvedValue()
  const loadLanguageVersion = vi
    .fn<(path: string) => Promise<void>>()
    .mockResolvedValue()
  const currentLang = ref<Language>('en')
  const availableLanguages = computed(() => new Set<Language>(available))
  const buildPath = (lang: Language): string =>
    `blog/my-slug/index.${lang}.md`
  return {
    reset,
    loadContent,
    availableLanguages,
    currentLang,
    loadLanguageVersion,
    buildPath,
    frontmatterData: ref<Record<string, unknown>>({}),
    bodyContent: ref(''),
  }
}

describe('createInitEditor', () => {
  it('loads the first available language', async () => {
    const deps = makeDeps(['en', 'ru'])
    await createInitEditor(deps)()
    expect(deps.loadLanguageVersion).toHaveBeenCalledWith(
      'blog/my-slug/index.en.md'
    )
    expect(deps.currentLang.value).toBe('en')
  })

  it('prefers en when en is in the available set', async () => {
    const deps = makeDeps(['ru', 'en'])
    await createInitEditor(deps)()
    expect(deps.loadLanguageVersion).toHaveBeenCalledWith(
      'blog/my-slug/index.en.md'
    )
  })

  it('falls back to the first non-en language when en is missing', async () => {
    const deps = makeDeps(['ru', 'it'])
    await createInitEditor(deps)()
    expect(deps.loadLanguageVersion).toHaveBeenCalledWith(
      'blog/my-slug/index.ru.md'
    )
  })

  // Regression: the previous implementation skipped loadLanguageVersion
  // when availableLanguages was empty — which happens right after the
  // create-content flow navigates to the edit page before the pinia
  // content store has refreshed. Skipping the load left frontmatterData
  // as {} and the next save wiped every frontmatter field.
  it('still calls loadLanguageVersion when availableLanguages is empty', async () => {
    const deps = makeDeps([])
    await createInitEditor(deps)()
    expect(deps.loadLanguageVersion).toHaveBeenCalledTimes(1)
    expect(deps.loadLanguageVersion).toHaveBeenCalledWith(
      'blog/my-slug/index.en.md'
    )
    expect(deps.currentLang.value).toBe('en')
  })

  it('calls reset and loadContent before loading the language', async () => {
    const deps = makeDeps(['en'])
    await createInitEditor(deps)()
    expect(deps.reset).toHaveBeenCalledOnce()
    expect(deps.loadContent).toHaveBeenCalledOnce()
    const resetOrder = deps.reset.mock.invocationCallOrder[0] ?? 0
    const loadOrder =
      deps.loadLanguageVersion.mock.invocationCallOrder[0] ?? 0
    expect(resetOrder).toBeLessThan(loadOrder)
  })
})
