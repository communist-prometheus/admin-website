import { swFetch } from '@/composables/useSWBridge/sw-fetch'

const isObject = (x: unknown): x is Record<string, unknown> =>
  x !== null && typeof x === 'object'

const extractContent = (body: unknown): string | undefined => {
  const content = isObject(body) ? body['content'] : undefined
  return typeof content === 'string' ? content : undefined
}

/**
 * Read the current working-tree content of a file via the SW
 * file API. Returns the raw text including any merge markers.
 * @param path Repo-relative file path.
 * @returns Raw file content, or undefined when the SW reports an error.
 */
export const fetchFileContent = async (
  path: string
): Promise<string | undefined> => {
  const res = await swFetch(
    `/api/github/file?path=${encodeURIComponent(path)}`
  )
  return res.ok ? extractContent(await res.json()) : undefined
}
