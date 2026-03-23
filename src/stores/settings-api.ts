import { swFetch } from '@/composables/useSWBridge/sw-fetch'
import type { LanguageEntry } from './settings'

const LANGUAGES_PATH = 'settings/languages.json'

interface FileData {
  readonly content: string
  readonly sha: string
}

/**
 * Fetch the languages JSON file from the SW.
 * @returns File data or undefined if not found
 */
export const fetchLanguagesFile = async (): Promise<FileData | undefined> => {
  const res = await swFetch(
    `/api/github/file?path=${encodeURIComponent(LANGUAGES_PATH)}`
  )
  if (!res.ok) return undefined
  return res.json() as Promise<FileData>
}

/**
 * Parse language entries from JSON content.
 * @param content - Raw JSON string
 * @returns Parsed language entries
 */
export const parseLanguages = (content: string): readonly LanguageEntry[] => {
  try {
    return JSON.parse(content) as readonly LanguageEntry[]
  } catch {
    return []
  }
}

/**
 * Save languages file via SW API.
 * @param entries - Language entries to save
 * @param sha - Current file SHA for conflict detection
 * @returns Fetch response
 */
export const saveLanguagesFile = async (
  entries: readonly LanguageEntry[],
  sha: string
) => {
  const content = `${JSON.stringify(entries, null, 2)}\n`
  return swFetch('/api/github/file', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      path: LANGUAGES_PATH,
      content,
      sha,
      message: 'Update languages configuration',
    }),
  })
}
