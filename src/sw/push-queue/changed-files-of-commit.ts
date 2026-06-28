import { fs, REPO_DIR } from '../git/fs'
import { loadGit } from '../git/load-git'
import { collectChange, type FileChange } from './collect-change'

export type { FileChange } from './collect-change'

/**
 * Diff a commit against its first parent and return the paths it
 * added/modified/deleted with their post-commit bytes. Both trees are
 * local — the user's commit and its parent (the `depth: 1` clone tip) —
 * so this works on a shallow clone, which is why the recovery can replay
 * the edit without any ancestor older than the remote tip.
 * @param sha Commit oid (the queued user commit).
 * @returns The changed paths, ready to replay onto a fresh base.
 */
export const changedFilesOfCommit = async (
  sha: string
): Promise<ReadonlyArray<FileChange>> => {
  const git = await loadGit()
  const { commit } = await git.readCommit({ fs, dir: REPO_DIR, oid: sha })
  const parent = commit.parent[0] ?? sha
  const changes: FileChange[] = []
  await git.walk({
    fs,
    dir: REPO_DIR,
    trees: [git.TREE({ ref: parent }), git.TREE({ ref: sha })],
    map: (filepath, entries) => collectChange(changes, filepath, entries),
  })
  return changes
}
