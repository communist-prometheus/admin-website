import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import type { Language } from '@/types/content'
import { createSwitchLanguage } from './switch-language'
import type { EditorDraft, MultiLangEditorState } from './types'

const mkState = (
  fm: Record<string, unknown>,
  body: string
): MultiLangEditorState => ({
  currentLang: ref<Language>('en'),
  frontmatterData: ref(fm),
  bodyContent: ref(body),
  loadingFile: ref(false),
  isDirty: undefined,
})

const blogFm = {
  title: 'Hello',
  description: 'desc',
  category: 'news',
  lang: 'en',
}

describe('createSwitchLanguage — entity-level metadata', () => {
  it('keeps frontmatter when target lang has no file and no cache', async () => {
    const cache = new Map<Language, EditorDraft>()
    const state = mkState({ ...blogFm }, '# body')
    const fileSha = ref('sha-en')
    const loadFn = vi.fn(async (_path: string) => undefined)

    const switchLang = createSwitchLanguage(cache, state, fileSha, loadFn)
    await switchLang('it')

    expect(state.currentLang.value).toBe('it')
    expect(loadFn).not.toHaveBeenCalled()
    expect(state.frontmatterData.value['title']).toBe('Hello')
    expect(state.frontmatterData.value['description']).toBe('desc')
    expect(state.frontmatterData.value['category']).toBe('news')
    expect(state.frontmatterData.value['lang']).toBe('it')
  })

  it('still loads from path when one is provided (existing-file path)', async () => {
    const cache = new Map<Language, EditorDraft>()
    const state = mkState({ ...blogFm }, '# body')
    const fileSha = ref('sha-en')
    const loadFn = vi.fn(async (_path: string) => undefined)

    const switchLang = createSwitchLanguage(cache, state, fileSha, loadFn)
    await switchLang('ru', 'blog/x/index.ru.md')

    expect(loadFn).toHaveBeenCalledWith('blog/x/index.ru.md')
  })

  it('clears body when target lang has no file (fresh translation)', async () => {
    const cache = new Map<Language, EditorDraft>()
    const state = mkState({ ...blogFm }, '# en body')
    const fileSha = ref('sha-en')
    const loadFn = vi.fn(async (_path: string) => undefined)

    const switchLang = createSwitchLanguage(cache, state, fileSha, loadFn)
    await switchLang('it')

    expect(state.bodyContent.value).toBe('')
    expect(fileSha.value).toBe('')
  })
})
