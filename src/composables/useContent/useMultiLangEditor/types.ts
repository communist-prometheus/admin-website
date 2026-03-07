import type { ComputedRef, Ref } from 'vue'
import type { Language } from '@/types/content'

/** Cached draft for a single language version */
export interface EditorDraft {
  readonly frontmatter: Record<string, unknown>
  readonly body: string
  readonly sha: string
  readonly loaded: boolean
}

/** Reactive state shared across multi-lang editor operations */
export interface MultiLangEditorState {
  readonly currentLang: Ref<Language>
  readonly frontmatterData: Ref<Record<string, unknown>>
  readonly bodyContent: Ref<string>
  readonly loadingFile: Ref<boolean>
  readonly isDirty: ComputedRef<boolean>
}
