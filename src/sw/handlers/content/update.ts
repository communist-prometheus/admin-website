import { Effect, pipe } from 'effect'
import { ValidationError } from '../../errors'
import { errorResponse } from '../shared/json-response'
import { parseBody } from '../shared/parse-body'
import { isValidUpdate } from './update-body'
import { writeUpdateBody } from './write-body'

/**
 * Handle POST /api/github/content — create or update.
 *
 * @param request incoming Request
 * @returns JSON response with success and path
 */
export const handleContentUpdate = (request: Request): Promise<Response> =>
  pipe(
    parseBody(request),
    Effect.filterOrFail(
      isValidUpdate,
      () => new ValidationError({ message: 'Missing required fields' })
    ),
    Effect.flatMap(writeUpdateBody),
    Effect.catchTag('ForbiddenError', e =>
      Effect.succeed(errorResponse(e.message, 403))
    ),
    Effect.catchTag('ValidationError', e =>
      Effect.succeed(errorResponse(e.message, 400))
    ),
    Effect.catchAll(e => Effect.succeed(errorResponse(String(e), 500))),
    Effect.runPromise
  )
