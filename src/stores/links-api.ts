import { swFetch } from '@/composables/useSWBridge/sw-fetch'
import { parseJsonAs } from '@/validation/decode'
import { decodeResponse } from '@/validation/decode-response'
import type { FileData } from '@/validation/schemas/api-response'
import { FileDataSchema } from '@/validation/schemas/api-response'
import type { LinksDoc } from '@/validation/schemas/links'
import { LinksDocSchema } from '@/validation/schemas/links'

const LINKS_PATH = 'settings/links.json'

const EMPTY_DOC: LinksDoc = {
  groups: ['organizations', 'resources', 'friendly'],
  entries: [],
}

/**
 * Fetch the links JSON file from the SW git bridge.
 * @returns File data (content + sha) or undefined if not found.
 */
export const fetchLinksFile = async (): Promise<FileData | undefined> => {
  const res = await swFetch(
    `/api/github/file?path=${encodeURIComponent(LINKS_PATH)}`
  )
  return res.ok ? decodeResponse(FileDataSchema)(res) : undefined
}

/**
 * Parse the links document from raw JSON content.
 * @param content - Raw JSON string from the file.
 * @returns The validated document, or an empty default on parse failure.
 */
export const parseLinksDoc = (content: string): LinksDoc =>
  parseJsonAs(LinksDocSchema)(content) ?? EMPTY_DOC

/**
 * Save the links document via the SW git bridge.
 * @param doc - The full links document to write.
 * @param sha - Current file SHA for conflict detection.
 * @returns The fetch response.
 */
export const saveLinksFile = async (doc: LinksDoc, sha: string) => {
  const content = `${JSON.stringify(doc, null, 2)}\n`
  return swFetch('/api/github/file', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      path: LINKS_PATH,
      content,
      sha,
      message: 'Update links configuration',
    }),
  })
}
