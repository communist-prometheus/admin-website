import { Effect, pipe } from 'effect'
import { computeBlobSha } from '../../git/blob-sha'
import { readRepoFile } from '../../git/io/read-file'
import { parseFrontmatter } from '../shared/frontmatter'
import { parseSlugFromPath } from '../shared/parse-slug'

/**
 * Build a ContentItem Effect from a file path.
 * Reads the file, parses frontmatter, and computes blob SHA.
 * @param type - Content type (blog, pages, positions)
 * @param filepath - Repo-relative file path
 * @returns Effect yielding a ContentItem record
 */
export const buildItem = (type: string, filepath: string) =>
  pipe(
    Effect.promise(() => readRepoFile(filepath)),
    Effect.flatMap(raw =>
      pipe(
        Effect.promise(() => computeBlobSha(raw)),
        Effect.map(sha => ({
          ...parseFrontmatter(raw),
          type,
          slug: parseSlugFromPath(filepath),
          path: filepath,
          sha,
        }))
      )
    )
  )
