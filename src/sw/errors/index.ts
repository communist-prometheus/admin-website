import { Data } from 'effect'

/** Git clone/pull/push operation failed. */
export class GitError extends Data.TaggedError('GitError')<{
  readonly operation: string
  readonly cause: unknown
}> {}

/** File system read/write/delete failed. */
export class IOError extends Data.TaggedError('IOError')<{
  readonly path: string
  readonly cause: unknown
}> {}

/** Resource not found (file, path, config). */
export class NotFoundError extends Data.TaggedError('NotFoundError')<{
  readonly resource: string
}> {}

/** SW config is missing (not initialized). */
export class ConfigMissingError extends Data.TaggedError(
  'ConfigMissingError'
)<Record<string, never>> {}

/** Request validation failed. */
export class ValidationError extends Data.TaggedError('ValidationError')<{
  readonly message: string
}> {}

/** JSON/frontmatter parse failed. */
export class ParseError extends Data.TaggedError('ParseError')<{
  readonly input: string
  readonly cause: unknown
}> {}

/** Action forbidden by role-based access control. */
export class ForbiddenError extends Data.TaggedError('ForbiddenError')<{
  readonly message: string
}> {}
