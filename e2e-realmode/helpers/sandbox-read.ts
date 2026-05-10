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

interface ContentsResponse {
  readonly content?: string
  readonly encoding?: string
  readonly download_url?: string | null
}

const fetchViaDownloadUrl = async (
  url: string
): Promise<Uint8Array | undefined> => {
  const res = await fetch(url, { headers: apiHeaders() })
  if (!res.ok) {
    throw new Error(
      `readBinary download ${url}: ${res.status} ${res.statusText}`
    )
  }
  return new Uint8Array(await res.arrayBuffer())
}

/**
 * Read a file's bytes from the sandbox branch (PNG / PDF covers,
 * binary assets). Returns undefined when the file is missing so
 * tests can assert presence/absence with the same call.
 *
 * The Contents API encodes files <1 MB inline as base64; bigger
 * files come back with `encoding: "none"` and an empty `content`,
 * pointing to `download_url` for the raw bytes. We try inline first
 * and fall back to the download URL — that covers per-lang covers
 * (typically >1 MB after mupdf renders the magazine front).
 * @param path - Repo-relative path
 * @returns File bytes, or undefined when missing
 */
export const readBinary = async (
  path: string
): Promise<Uint8Array | undefined> => {
  const res = await fetch(contentsUrl(path), { headers: apiHeaders() })
  if (res.status === 404) return undefined
  if (!res.ok) {
    throw new Error(`readBinary ${path}: ${res.status} ${res.statusText}`)
  }
  const data = (await res.json()) as ContentsResponse
  const isInline =
    data.encoding === 'base64' && typeof data.content === 'string'
  if (isInline) {
    return new Uint8Array(Buffer.from(data.content ?? '', 'base64'))
  }
  if (data.download_url) {
    return fetchViaDownloadUrl(data.download_url)
  }
  throw new Error(
    `readBinary ${path}: encoding="${data.encoding}" with no download_url`
  )
}
