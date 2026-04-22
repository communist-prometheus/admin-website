import { Effect, pipe } from 'effect'
import type { ContentType } from '@/types/content'
import { isContentType } from '@/types/content'
import { writeAndStage } from '../../git/io/write-file'
import { commitAndPush } from '../../git/remote/commit-and-push'
import { assertPermission } from '../../rbac/permission-check'
import { serializeFrontmatter } from '../shared/frontmatter'
import { jsonResponse } from '../shared/json-response'
import { newFilePath } from './base'
import { resolveContentPath } from './resolve-path'
import type { UpdateBody } from './update-body'
import { validateUpdateBody } from './validate-update'

/**
 * Validate → authorize → stage → commit → push pipeline for an
 * already-parsed UpdateBody. Split out of update.ts for file-size
 * budget.
 *
 * @param b parsed update body
 * @returns Effect returning a JSON response with the written path
 */
export const writeUpdateBody = (b: UpdateBody) =>
  pipe(
    validateUpdateBody(b),
    Effect.flatMap(() =>
      assertPermission(
        'update',
        isContentType(b.type) ? (b.type as ContentType) : 'blog',
        String(b.frontmatter['author'] ?? '')
      )
    ),
    Effect.flatMap(() =>
      Effect.promise(() => resolveContentPath(b.type, b.slug, b.lang))
    ),
    Effect.map(p => p ?? newFilePath(b.type, b.slug, b.lang)),
    Effect.tap(path =>
      Effect.tryPromise(() =>
        writeAndStage(path, serializeFrontmatter(b.frontmatter, b.body))
      )
    ),
    Effect.tap(() => Effect.tryPromise(() => commitAndPush(b.message))),
    Effect.map(path => jsonResponse({ success: true, path }))
  )
