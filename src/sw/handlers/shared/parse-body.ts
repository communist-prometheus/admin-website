import { Effect } from 'effect'
import { ParseError } from '../../errors'

/**
 * Parse a Request body as JSON, wrapped in Effect.
 * @param request - Incoming Request
 * @returns Effect yielding parsed record
 */
export const parseBody = (
  request: Request
): Effect.Effect<Record<string, unknown>, ParseError> =>
  Effect.tryPromise({
    try: () => request.json(),
    catch: cause => new ParseError({ input: 'request body', cause }),
  })
