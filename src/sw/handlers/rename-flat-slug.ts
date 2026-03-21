import { deleteAndUnstage } from '../git/delete-git-file'
import { listFilesUnder } from '../git/list-files'
import { readRepoFile } from '../git/read-file'
import { writeAndStage } from '../git/write-file'
import { contentBase } from './content-base'

/**
 * Rename a flat slug: rename all `{old}.*.md` to `{new}.*.md`.
 * @param type - Content type (pages, positions)
 * @param oldSlug - Current slug
 * @param newSlug - New slug
 * @returns Number of files renamed
 */
export const renameFlatSlug = async (
  type: string,
  oldSlug: string,
  newSlug: string
): Promise<number> => {
  const dir = contentBase(type)
  const all = await listFilesUnder(dir)
  const matching = all.filter(f => {
    const name = f.split('/').pop() ?? ''
    return name.startsWith(`${oldSlug}.`) && name.endsWith('.md')
  })
  for (const file of matching) {
    const content = await readRepoFile(file)
    const name = file.split('/').pop() ?? ''
    const newName = name.replace(`${oldSlug}.`, `${newSlug}.`)
    const newPath = `${dir}/${newName}`
    await writeAndStage(newPath, content)
    await deleteAndUnstage(file)
  }
  return matching.length
}
