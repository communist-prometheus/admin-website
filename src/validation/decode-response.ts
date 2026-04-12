import { Effect, Schema } from 'effect'

const extractErrorMessage = (json: unknown, status: number): string => {
  if (json && typeof json === 'object' && 'error' in json) {
    const err = (json as { error: unknown }).error
    if (typeof err === 'string' && err.length > 0) return err
  }
  return `Request failed with status ${status}`
}

/**
 * Decode a fetch Response body through a Schema.
 * Throws a readable Error on non-OK responses using the server's
 * `{ error }` payload when present, instead of leaking a cryptic
 * Schema decode error for a missing success field.
 * @param schema - Effect Schema to validate against
 * @returns Async decoder that parses and validates JSON
 */
export const decodeResponse =
  <A, I>(schema: Schema.Schema<A, I>) =>
  async (response: Response): Promise<A> => {
    const json: unknown = await response.json()
    if (!response.ok) {
      throw new Error(extractErrorMessage(json, response.status))
    }
    return Schema.decodeUnknownSync(schema)(json)
  }

/**
 * Decode a fetch Response body through a Schema inside
 * an Effect pipeline. Wraps JSON parsing and schema
 * validation in Effect.tryPromise.
 * @param schema - Effect Schema to validate against
 * @returns Effect-wrapped decoder for Response
 */
export const decodeResponseEffect =
  <A, I>(schema: Schema.Schema<A, I>) =>
  (response: Response): Effect.Effect<A, Error> =>
    Effect.tryPromise({
      try: async () => {
        const json: unknown = await response.json()
        return Schema.decodeUnknownSync(schema)(json)
      },
      catch: e => new Error(String(e)),
    })
