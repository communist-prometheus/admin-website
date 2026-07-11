import { Either, Schema } from 'effect'
import type { ContentType } from '@/types/content'
import { ArchiveFrontmatterSchema } from './frontmatter-archive'
import { BlogFrontmatterSchema } from './frontmatter-blog'
import { MagazineFrontmatterSchema } from './frontmatter-magazine'
import { PagesFrontmatterSchema } from './frontmatter-pages'
import { PositionsFrontmatterSchema } from './frontmatter-positions'

type Result = Either.Either<void, string>

const run = <A>(schema: Schema.Schema<A>, value: unknown): Result => {
  const parsed = Schema.decodeUnknownEither(schema)(value)
  return Either.mapBoth(parsed, {
    onLeft: e => e.message,
    onRight: () => undefined,
  })
}

/**
 * Validate the frontmatter for a given content type.
 *
 * @param type the content type whose schema should apply
 * @param value the frontmatter object to validate
 * @returns Right(void) when valid, Left(message) listing all errors
 */
export const validateFrontmatter = (
  type: ContentType,
  value: unknown
): Result => {
  if (type === 'blog') return run(BlogFrontmatterSchema, value)
  if (type === 'positions') return run(PositionsFrontmatterSchema, value)
  if (type === 'magazine') return run(MagazineFrontmatterSchema, value)
  if (type === 'pages') return run(PagesFrontmatterSchema, value)
  if (type === 'archive') return run(ArchiveFrontmatterSchema, value)
  return Either.right(undefined)
}
