import { deleteAndUnstage } from '../git/delete-git-file'
import { listFilesUnder } from '../git/list-files'
import { readRepoBinaryFile } from '../git/read-binary-file'
import { writeBinaryAndStage } from '../git/write-binary-file'
import { workerState } from '../state'

/**
 * Rename a blog slug folder: move all files from old to new.
 * Uses binary read/write to preserve assets (images, video).
 * @param oldSlug - Current slug
 * @param newSlug - New slug
 * @returns Number of files moved
 */
export const renameBlogSlug = async (
  oldSlug: string,
  newSlug: string
): Promise<number> => {
  const base = workerState.config?.contentPath ?? 'src/content'
  const prefix = `${base}/blog/${oldSlug}/`
  const files = await listFilesUnder(prefix.slice(0, -1))
  for (const file of files) {
    const data = await readRepoBinaryFile(file)
    const newPath = file.replace(prefix, `${base}/blog/${newSlug}/`)
    await writeBinaryAndStage(newPath, data)
    await deleteAndUnstage(file)
  }
  return files.length
}
