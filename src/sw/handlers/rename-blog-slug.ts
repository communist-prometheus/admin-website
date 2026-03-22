import { deleteAndUnstage } from '../git/delete-git-file'
import { listFilesUnder } from '../git/list-files'
import { readRepoBinaryFile } from '../git/read-binary-file'
import { writeBinaryAndStage } from '../git/write-binary-file'
import { contentBase } from './content-base'

/**
 * Rename a nested content slug folder: move all files from old to new.
 * Uses binary read/write to preserve assets (images, video).
 * Works for blog, positions, and pages (all folder-based types).
 * @param type - Content type
 * @param oldSlug - Current slug
 * @param newSlug - New slug
 * @returns Number of files moved
 */
export const renameNestedSlug = async (
  type: string,
  oldSlug: string,
  newSlug: string
): Promise<number> => {
  const base = contentBase(type)
  const prefix = `${base}/${oldSlug}/`
  const files = await listFilesUnder(prefix.slice(0, -1))
  for (const file of files) {
    const data = await readRepoBinaryFile(file)
    const newPath = file.replace(prefix, `${base}/${newSlug}/`)
    await writeBinaryAndStage(newPath, data)
    await deleteAndUnstage(file)
  }
  return files.length
}

/** @deprecated Use renameNestedSlug instead */
export const renameBlogSlug = (
  oldSlug: string,
  newSlug: string
): Promise<number> => renameNestedSlug('blog', oldSlug, newSlug)
