import { apiHeaders, cfg, GH_API } from './sandbox-config'

interface FileEntry {
  readonly name: string
  readonly path: string
  readonly type: string
  readonly sha: string
}

const contentsUrl = (path: string): string =>
  `${GH_API}/repos/${cfg.owner}/${cfg.repo}/contents/${path}?ref=${cfg.branch}`

/**
 * Read a single file's raw text from the sandbox branch.
 * @param path - Repo-relative path
 * @returns File contents, or undefined when missing
 */
export const readFile = async (path: string): Promise<string | undefined> => {
  const res = await fetch(contentsUrl(path), { headers: apiHeaders() })
  if (res.status === 404) return undefined
  if (!res.ok) {
    throw new Error(`readFile ${path}: ${res.status} ${res.statusText}`)
  }
  const data = (await res.json()) as { content: string; encoding: string }
  return Buffer.from(data.content, data.encoding as BufferEncoding).toString(
    'utf8'
  )
}

/**
 * List directory entries on the sandbox branch.
 * @param path - Directory path
 * @returns File entries (empty for missing dirs)
 */
export const listDir = async (
  path: string
): Promise<readonly FileEntry[]> => {
  const res = await fetch(contentsUrl(path), { headers: apiHeaders() })
  if (res.status === 404) return []
  if (!res.ok) {
    throw new Error(`listDir ${path}: ${res.status} ${res.statusText}`)
  }
  return (await res.json()) as readonly FileEntry[]
}
