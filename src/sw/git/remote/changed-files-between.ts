import {
  collectChange,
  type FileChange,
} from '../../push-queue/collect-change'
import { fs, REPO_DIR } from '../fs'
import { loadGit } from '../load-git'

/**
 * Diff two local trees and return the paths that differ, each carrying
 * its `headRef`-side bytes (or a deletion marker). Unlike
 * {@link changedFilesOfCommit} (which diffs a commit against its own
 * parent), this compares two arbitrary refs — used by the REST push to
 * compute the cumulative change set from the current remote tip to the
 * local HEAD, so a linear stack of local commits replays as one commit.
 * Both refs must be present in the local (shallow) clone.
 * @param baseRef Oid/ref of the base tree (e.g. the remote branch tip).
 * @param headRef Oid/ref of the target tree (e.g. local HEAD).
 * @returns The changed paths with their post-change bytes.
 */
export const changedFilesBetween = async (
  baseRef: string,
  headRef: string
): Promise<ReadonlyArray<FileChange>> => {
  const git = await loadGit()
  const changes: FileChange[] = []
  await git.walk({
    fs,
    dir: REPO_DIR,
    trees: [git.TREE({ ref: baseRef }), git.TREE({ ref: headRef })],
    map: (filepath, entries) => collectChange(changes, filepath, entries),
  })
  return changes
}
