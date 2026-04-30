import { fs, REPO_DIR } from '../git/fs'
import { loadGit } from '../git/load-git'

/**
 * Apply a manually-merged file content to the working tree and
 * stage it. Used by the visual merge UI when the user has
 * produced the final content themselves.
 * @param file Path of the file relative to repo root.
 * @param content Resolved text content to write.
 * @returns Resolves once the file is staged.
 */
export const writeResolvedContent = async (
  file: string,
  content: string
): Promise<void> => {
  const path = `${REPO_DIR}/${file}`
  await fs.promises.writeFile(path, content, 'utf8')
  const git = await loadGit()
  await git.add({ fs, dir: REPO_DIR, filepath: file })
}
