import type { WalkerEntry } from 'isomorphic-git'
import { fs, REPO_DIR } from '../git/fs'
import { loadGit } from '../git/load-git'

/** A single path changed by a commit, ready to replay onto a new base. */
export type FileChange =
  | { readonly path: string; readonly data: Uint8Array }
  | { readonly path: string; readonly deleted: true }

const isBlob = async (entry: WalkerEntry | null): Promise<boolean> =>
  entry !== null && (await entry.type()) === 'blob'

const readChange = async (path: string, oid: string): Promise<FileChange> => {
  const git = await loadGit()
  const { blob } = await git.readBlob({ fs, dir: REPO_DIR, oid })
  return { path, data: blob }
}

const modifiedChange = async (
  path: string,
  base: WalkerEntry | null,
  head: WalkerEntry
): Promise<FileChange | undefined> => {
  const headOid = await head.oid()
  const baseOid = (await isBlob(base)) ? await base?.oid() : undefined
  return headOid === baseOid ? undefined : readChange(path, headOid)
}

const changeFor = async (
  path: string,
  base: WalkerEntry | null,
  head: WalkerEntry | null
): Promise<FileChange | undefined> => {
  const deleted = head === null && (await isBlob(base))
  const modifiable = head !== null && (await isBlob(head))
  return deleted
    ? { path, deleted: true }
    : modifiable && head !== null
      ? modifiedChange(path, base, head)
      : undefined
}

/**
 * Map one `git.walk` entry pair (parent tree vs commit tree) into a
 * {@link FileChange} and push it into `out`. Blobs only: unchanged blobs
 * and tree (directory) entries yield nothing; a blob dropped between
 * parent and commit is a deletion; a new/modified blob carries its
 * post-commit bytes. The walk's reducer ignores the return value.
 * @param out Accumulator the walk fills as a side effect.
 * @param filepath Repo-relative path of the entry.
 * @param pair `[parentEntry, commitEntry]` — either may be null.
 */
export const collectChange = async (
  out: FileChange[],
  filepath: string,
  pair: ReadonlyArray<WalkerEntry | null>
): Promise<void> => {
  const change =
    filepath === '.'
      ? undefined
      : await changeFor(filepath, pair[0] ?? null, pair[1] ?? null)
  void (change ? out.push(change) : undefined)
}
