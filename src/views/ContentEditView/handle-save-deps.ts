import type { ComputedRef, Ref } from 'vue'
import type { TrackDeploy } from '@/composables/useDeployStatus/deploy-context'
import type { ContentType, Language } from '@/types/content'

/** Dependencies injected into the save handler. */
export interface HandleSaveDeps {
  readonly hasAssets: ComputedRef<boolean>
  readonly blogSave: (message: string) => Promise<string>
  readonly buildPath: (lang: Language) => string
  readonly currentLang: Ref<Language>
  readonly saveCurrentLanguage: (
    path: string,
    message: string
  ) => Promise<void>
  readonly reloadContent: () => Promise<void>
  readonly title: ComputedRef<string>
  readonly contentType: ComputedRef<ContentType>
  readonly frontmatter: () => Record<string, unknown>
  readonly contentTypeName: ComputedRef<string>
  readonly track?: TrackDeploy
  readonly onError?: (msg: string) => void
}
