import { ghHeaders, type SandboxConfig } from './sandbox-config'

const API = 'https://api.github.com'

const ok = async (res: Response, ctx: string): Promise<unknown> => {
  if (res.ok) return res.json()
  const body = await res.text()
  throw new Error(`${ctx}: ${res.status} ${res.statusText} — ${body}`)
}

/**
 * Read repo metadata. Returns undefined when the repo does not exist.
 * @param cfg - Sandbox config
 * @returns Repo info object or undefined on 404
 */
export const getRepo = async (
  cfg: SandboxConfig
): Promise<Record<string, unknown> | undefined> => {
  const res = await fetch(`${API}/repos/${cfg.owner}/${cfg.repo}`, {
    headers: ghHeaders(cfg.token),
  })
  if (res.status === 404) return undefined
  return (await ok(res, 'getRepo')) as Record<string, unknown>
}

const isAuthUser = async (cfg: SandboxConfig): Promise<boolean> => {
  const res = await fetch(`${API}/user`, { headers: ghHeaders(cfg.token) })
  const me = (await ok(res, 'getAuthUser')) as { login: string }
  return me.login.toLowerCase() === cfg.owner.toLowerCase()
}

/**
 * Create the sandbox repo as public. `auto_init: true` is mandatory:
 * GitHub's Git Data API rejects blob/tree/commit calls on empty repos
 * with 404 (no refs to anchor to). The auto-init commit becomes the
 * parent of our baseline commit.
 *
 * Routes to `/orgs/{owner}/repos` when `owner` is an org and to
 * `/user/repos` when it matches the authenticated user. The PAT
 * decides which is which.
 * @param cfg - Sandbox config
 */
export const createRepo = async (cfg: SandboxConfig): Promise<void> => {
  const userOwned = await isAuthUser(cfg)
  const url = userOwned
    ? `${API}/user/repos`
    : `${API}/orgs/${cfg.owner}/repos`
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...ghHeaders(cfg.token), 'content-type': 'application/json' },
    body: JSON.stringify({
      name: cfg.repo,
      private: false,
      auto_init: true,
      description:
        'admin-website real-mode E2E sandbox — every suite resets it.',
    }),
  })
  await ok(res, 'createRepo')
}

interface BlobOut {
  readonly path: string
  readonly sha: string
}

/**
 * Upload a single file as a Git blob.
 * @param cfg - Sandbox config
 * @param path - Repo-relative path
 * @param content - File contents (utf8)
 * @returns `{ path, sha }` for inclusion in a tree
 */
export const createBlob = async (
  cfg: SandboxConfig,
  path: string,
  content: string
): Promise<BlobOut> => {
  const res = await fetch(`${API}/repos/${cfg.owner}/${cfg.repo}/git/blobs`, {
    method: 'POST',
    headers: { ...ghHeaders(cfg.token), 'content-type': 'application/json' },
    body: JSON.stringify({
      content: Buffer.from(content, 'utf8').toString('base64'),
      encoding: 'base64',
    }),
  })
  const data = (await ok(res, `createBlob ${path}`)) as { sha: string }
  return { path, sha: data.sha }
}

/**
 * Create a Git tree from the given blobs.
 * @param cfg - Sandbox config
 * @param blobs - Array of `{ path, sha }`
 * @returns Tree SHA
 */
export const createTree = async (
  cfg: SandboxConfig,
  blobs: readonly BlobOut[]
): Promise<string> => {
  const tree = blobs.map(b => ({
    path: b.path,
    mode: '100644',
    type: 'blob',
    sha: b.sha,
  }))
  const res = await fetch(`${API}/repos/${cfg.owner}/${cfg.repo}/git/trees`, {
    method: 'POST',
    headers: { ...ghHeaders(cfg.token), 'content-type': 'application/json' },
    body: JSON.stringify({ tree }),
  })
  const data = (await ok(res, 'createTree')) as { sha: string }
  return data.sha
}

/**
 * Create a Git commit pointing at the given tree.
 * @param cfg - Sandbox config
 * @param treeSha - Root tree SHA
 * @param message - Commit message
 * @param parents - Parent commit SHAs
 * @returns Commit SHA
 */
export const createCommit = async (
  cfg: SandboxConfig,
  treeSha: string,
  message: string,
  parents: readonly string[]
): Promise<string> => {
  const res = await fetch(
    `${API}/repos/${cfg.owner}/${cfg.repo}/git/commits`,
    {
      method: 'POST',
      headers: {
        ...ghHeaders(cfg.token),
        'content-type': 'application/json',
      },
      body: JSON.stringify({ message, tree: treeSha, parents }),
    }
  )
  const data = (await ok(res, 'createCommit')) as { sha: string }
  return data.sha
}

interface RefOut {
  readonly object: { readonly sha: string }
}

/**
 * Read a ref's current SHA. Returns undefined on 404.
 * @param cfg - Sandbox config
 * @param ref - Ref path (e.g. `heads/main`)
 * @returns SHA the ref points at, or undefined
 */
export const getRef = async (
  cfg: SandboxConfig,
  ref: string
): Promise<string | undefined> => {
  const res = await fetch(
    `${API}/repos/${cfg.owner}/${cfg.repo}/git/ref/${ref}`,
    { headers: ghHeaders(cfg.token) }
  )
  if (res.status === 404) return undefined
  const data = (await ok(res, `getRef ${ref}`)) as RefOut
  return data.object.sha
}

/**
 * Create a ref pointing at a SHA.
 * @param cfg - Sandbox config
 * @param ref - Full ref name (e.g. `refs/heads/main` or `refs/tags/baseline`)
 * @param sha - Target commit SHA
 */
export const createRef = async (
  cfg: SandboxConfig,
  ref: string,
  sha: string
): Promise<void> => {
  const res = await fetch(`${API}/repos/${cfg.owner}/${cfg.repo}/git/refs`, {
    method: 'POST',
    headers: { ...ghHeaders(cfg.token), 'content-type': 'application/json' },
    body: JSON.stringify({ ref, sha }),
  })
  await ok(res, `createRef ${ref}`)
}

/**
 * Force-update an existing ref to a SHA.
 * @param cfg - Sandbox config
 * @param ref - Ref path (e.g. `heads/main`)
 * @param sha - Target SHA
 */
export const updateRef = async (
  cfg: SandboxConfig,
  ref: string,
  sha: string
): Promise<void> => {
  const res = await fetch(
    `${API}/repos/${cfg.owner}/${cfg.repo}/git/refs/${ref}`,
    {
      method: 'PATCH',
      headers: {
        ...ghHeaders(cfg.token),
        'content-type': 'application/json',
      },
      body: JSON.stringify({ sha, force: true }),
    }
  )
  await ok(res, `updateRef ${ref}`)
}
