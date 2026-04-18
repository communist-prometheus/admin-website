import { Effect } from 'effect'
import type { ContentType } from '@/types/content'
import { ForbiddenError } from '../errors'
import { workerState } from '../state/state'
import { checkContentAccess } from './check-content-access'
import { resolveRole } from './resolve-role'

type Action = 'create' | 'update' | 'delete' | 'rename'

/**
 * Check if the current user has permission for an action.
 * @param action - The mutation action
 * @param contentType - The content type being acted on
 * @param authorUsername - Author of the content
 * @returns Effect that fails with ForbiddenError if denied
 */
export const assertPermission = (
  action: Action,
  contentType: ContentType,
  authorUsername?: string
): Effect.Effect<void, ForbiddenError> =>
  Effect.gen(function* () {
    const username = workerState.config?.username
    if (!username) {
      return yield* new ForbiddenError({ message: 'Not authenticated' })
    }
    const role = resolveRole(username)
    if (!role) {
      return yield* new ForbiddenError({ message: 'No role assigned' })
    }
    const err = checkContentAccess(
      role,
      action,
      contentType,
      username,
      authorUsername
    )
    if (err) {
      return yield* new ForbiddenError({ message: err })
    }
  })
