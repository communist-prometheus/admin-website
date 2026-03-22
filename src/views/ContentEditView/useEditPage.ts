import { createBlogSave } from './blog-save'
import { createPageState } from './page-state'

/**
 * Wire up the content edit page state.
 * @param type - Content type string
 * @param slug - Content slug
 * @returns Page state and handlers
 */
export const useEditPage = (type: string, slug: string) => {
  const state = createPageState(type, slug)
  const { editor, assets } = state

  const blogSave = createBlogSave({
    assets,
    frontmatter: () => editor.frontmatterData.value,
    body: () => editor.bodyContent.value,
    buildPath: () => state.buildPath(editor.currentLang.value),
    markSaved: editor.markSaved,
    type,
    slug,
  })

  return { ...state, blogSave }
}
