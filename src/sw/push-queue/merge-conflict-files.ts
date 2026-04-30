import { fs, REPO_DIR } from '../git/fs'
import { loadGit } from '../git/load-git'

export { filesFromError } from './files-from-error'

/**
 * Inspect the working tree for entries with conflict markers
 * (statusMatrix rows where head/workdir/stage diverge). Used as
 * a fallback when the merge error omits the filepaths list.
 * @returns Paths of files that currently carry conflict markers.
 */
export const filesFromStatus = async (): Promise<ReadonlyArray<string>> => {
  const git = await loadGit()
  const matrix = await git.statusMatrix({ fs, dir: REPO_DIR })
  return matrix
    .filter(row => row[1] !== row[2] && row[2] !== row[3])
    .map(row => row[0])
}
