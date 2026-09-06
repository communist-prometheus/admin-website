import { Either, ParseResult, Schema } from 'effect'
import type { ContentType } from '@/types/content'
import { ArchiveFrontmatterSchema } from './frontmatter-archive'
import { BlogFrontmatterSchema } from './frontmatter-blog'
import { MagazineFrontmatterSchema } from './frontmatter-magazine'
import { PagesFrontmatterSchema } from './frontmatter-pages'
import { PositionsFrontmatterSchema } from './frontmatter-positions'

type Result = Either.Either<void, string>

/*
 * One line per failing field (`articles: Expected ReadonlyArray<string>,
 * actual null`) instead of Effect's default dump of the whole struct type,
 * which is what an editor would otherwise see in the publish dialog.
 */
const describe = (error: ParseResult.ParseError): string => {
  const byField = new Map<string, string>()
  for (const issue of ParseResult.ArrayFormatter.formatErrorSync(error)) {
    const field = issue.path.join('.') || 'frontmatter'
    // A union (`T | undefined`) reports one issue per branch; the first is
    // the one that names the type the field should have.
    byField.set(field, byField.get(field) ?? `${field}: ${issue.message}`)
  }
  return [...byField.values()].join('; ')
}

const run = <A>(schema: Schema.Schema<A>, value: unknown): Result => {
  const parsed = Schema.decodeUnknownEither(schema)(value)
  return Either.mapBoth(parsed, {
    onLeft: describe,
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
