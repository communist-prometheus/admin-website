import { fs, REPO_DIR } from '../git/fs'
import { writeBinaryAndStage } from '../git/io/write-binary-file'
import { loadGit } from '../git/load-git'
import { log } from '../logging/logger'
import type { FileChange } from './collect-change'

type Git = Awaited<ReturnType<typeof loadGit>>

const removeFile = async (git: Git, path: string): Promise<void> => {
  await git.remove({ fs, dir: REPO_DIR, filepath: path })
  await fs.promises
    .unlink(`${REPO_DIR}/${path}`)
    .catch((err: unknown) =>
      log(
        'warn',
        'git',
        `replay unlink ${path}: ${err instanceof Error ? err.message : String(err)}`
      )
    )
}

const applyOne = (git: Git, change: FileChange): Promise<void> =>
  'deleted' in change
    ? removeFile(git, change.path)
    : writeBinaryAndStage(change.path, change.data)

/**
 * Replay a set of {@link FileChange}s onto the current working tree and
 * stage them: deletions are removed from index + working tree, additions
 * and modifications are written + staged. Used to re-apply the user's edit
 * after re-baselining onto the remote tip.
 * @param changes Changes from {@link changedFilesOfCommit}.
 */
export const applyChanges = async (
  changes: ReadonlyArray<FileChange>
): Promise<void> => {
  const git = await loadGit()
  for (const change of changes) await applyOne(git, change)
}
