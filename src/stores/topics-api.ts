import { swFetch } from '@/composables/useSWBridge/sw-fetch'
import { parseJsonAs } from '@/validation/decode'
import { decodeResponse } from '@/validation/decode-response'
import type { FileData } from '@/validation/schemas/api-response'
import { FileDataSchema } from '@/validation/schemas/api-response'
import type { TopicEntry } from '@/validation/schemas/topics'
import { TopicArraySchema } from '@/validation/schemas/topics'

const TOPICS_PATH = 'settings/topics.json'

/**
 * Fetch the topics JSON file from the SW.
 * @returns File data or undefined if not found
 */
export const fetchTopicsFile = async (): Promise<FileData | undefined> => {
  const res = await swFetch(
    `/api/github/file?path=${encodeURIComponent(TOPICS_PATH)}`
  )
  return res.ok ? decodeResponse(FileDataSchema)(res) : undefined
}

/**
 * Parse topic entries from JSON content.
 * @param content - Raw JSON string
 * @returns Parsed topic entries
 */
export const parseTopics = (content: string): readonly TopicEntry[] =>
  parseJsonAs(TopicArraySchema)(content) ?? []

/**
 * Save topics file via SW API.
 * @param entries - Topic entries to save
 * @param sha - Current file SHA for conflict detection
 * @returns Fetch response
 */
export const saveTopicsFile = async (
  entries: readonly TopicEntry[],
  sha: string
) => {
  const content = `${JSON.stringify(entries, null, 2)}\n`
  return swFetch('/api/github/file', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      path: TOPICS_PATH,
      content,
      sha,
      message: 'Update topics configuration',
    }),
  })
}
