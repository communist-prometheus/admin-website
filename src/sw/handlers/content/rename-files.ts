import { Effect } from 'effect'
import { renameNestedSlug } from '../file/rename/blog-slug'
import { renameFlatSlug } from '../file/rename/flat-slug'
import { isNested } from './base'

/**
 * Rename files for a content type between slugs.
 * @param type - Content type
 * @param oldSlug - Current slug
 * @param newSlug - Target slug
 * @returns Effect yielding renamed file count
 */
export const renameFiles = (type: string, oldSlug: string, newSlug: string) =>
  Effect.tryPromise(() =>
    isNested(type)
      ? renameNestedSlug(type, oldSlug, newSlug)
      : renameFlatSlug(type, oldSlug, newSlug)
  )
