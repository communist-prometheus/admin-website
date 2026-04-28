import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import type { Language } from '@/types/content'
import { createIsDirty } from './dirty-check'
import { setLoadedDraft } from './set-loaded-draft'
import { createSwitchLanguage } from './switch-language'
import type { EditorDraft, MultiLangEditorState } from './types'

const mkState = (
  fm: Record<string, unknown>,
  body: string,
  lang: Language = 'en'
): MultiLangEditorState => ({
  currentLang: ref<Language>(lang),
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

describe('isDirty after switch to fresh language', () => {
  it('stays clean when nothing was edited', async () => {
    const cache = new Map<Language, EditorDraft>()
    const originalCache = new Map<Language, EditorDraft>()
    const state = mkState({ ...blogFm }, '# en body')
    const fileSha = ref('sha-en')
    const saveVersion = ref(0)
    setLoadedDraft(cache, originalCache, 'en', blogFm, '# en body', 'sha-en')

    const switchLang = createSwitchLanguage(
      cache,
      originalCache,
      state,
      fileSha,
      vi.fn(async () => undefined)
    )
    await switchLang('it')

    const isDirty = createIsDirty(
      cache,
      originalCache,
      state,
      fileSha,
      saveVersion
    )
    expect(isDirty.value).toBe(false)
  })
})
