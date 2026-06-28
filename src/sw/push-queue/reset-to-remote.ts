import { fs, REPO_DIR } from '../git/fs'
import { loadGit } from '../git/load-git'
import type { buildAuthOpts } from '../git/remote/build-auth-opts'

type AuthOpts = ReturnType<typeof buildAuthOpts>

/**
 * Fetch the remote, hard-reset the local branch onto its tip, materialise
 * that tip into the working tree, and return the remote tip oid. The basis
 * for the reset-onto-remote replay recovery.
 * @param opts Auth/transport options from {@link buildAuthOpts}.
 * @param branch Branch to fetch + reset onto.
 * @returns The remote tip oid the branch now points at.
 */
export const resetToRemote = async (
  opts: AuthOpts,
  branch: string
): Promise<string> => {
  const git = await loadGit()
  await git.fetch({ ...opts, ref: branch, singleBranch: true })
  const remote = await git.resolveRef({
    fs,
    dir: REPO_DIR,
    ref: `refs/remotes/origin/${branch}`,
  })
  await git.writeRef({
    fs,
    dir: REPO_DIR,
    ref: `refs/heads/${branch}`,
    value: remote,
    force: true,
  })
  await git.checkout({ fs, dir: REPO_DIR, ref: branch, force: true })
  return remote
}
