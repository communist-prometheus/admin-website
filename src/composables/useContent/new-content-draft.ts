import type { CreateContentData } from '@/components/CreateContentDialog/helpers'

const KEY = 'new_content_draft'

/**
 * Store draft data from create dialog for the edit page.
 * @param data - Form data from create dialog
 */
export const setNewContentDraft = (data: CreateContentData): void => {
  sessionStorage.setItem(KEY, JSON.stringify(data))
}

/**
 * Load and clear draft data on the edit page.
 * @returns Draft data or undefined if none
 */
export const consumeNewContentDraft = (): CreateContentData | undefined => {
  const raw = sessionStorage.getItem(KEY)
  if (!raw) return undefined
  sessionStorage.removeItem(KEY)
  try {
    return JSON.parse(raw) as CreateContentData
  } catch {
    return undefined
  }
}
