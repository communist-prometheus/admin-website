import { swFetch } from '@/composables/useSWBridge/sw-fetch'
import { parseJsonAs } from '@/validation/decode'
import { decodeResponse } from '@/validation/decode-response'
import type { FileData } from '@/validation/schemas/api-response'
import { FileDataSchema } from '@/validation/schemas/api-response'
import type { LabelEntry } from '@/validation/schemas/labels'
import { LabelArraySchema } from '@/validation/schemas/labels'

const LABELS_PATH = 'settings/labels.json'

/**
 * Fetch the labels JSON file from the SW.
 * @returns File data or undefined if not found
 */
export const fetchLabelsFile = async (): Promise<FileData | undefined> => {
  const res = await swFetch(
    `/api/github/file?path=${encodeURIComponent(LABELS_PATH)}`
  )
  if (!res.ok) return undefined
  return decodeResponse(FileDataSchema)(res)
}

/**
 * Parse label entries from JSON content.
 * @param content - Raw JSON string
 * @returns Parsed label entries
 */
export const parseLabels = (content: string): readonly LabelEntry[] =>
  parseJsonAs(LabelArraySchema)(content) ?? []

/**
 * Save labels file via SW API.
 * @param entries - Label entries to save
 * @param sha - Current file SHA for conflict detection
 * @returns Fetch response
 */
export const saveLabelsFile = async (
  entries: readonly LabelEntry[],
  sha: string
) => {
  const content = `${JSON.stringify(entries, null, 2)}\n`
  return swFetch('/api/github/file', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      path: LABELS_PATH,
      content,
      sha,
      message: 'Update labels configuration',
    }),
  })
}
