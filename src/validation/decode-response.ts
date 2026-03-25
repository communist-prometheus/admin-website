import { Effect, Schema } from 'effect'

/**
 * Decode a fetch Response body through a Schema.
 * Replaces unsafe `res.json() as Promise<T>` patterns.
 * @param schema - Effect Schema to validate against
 * @returns Async decoder that parses and validates JSON
 */
export const decodeResponse =
  <A, I>(schema: Schema.Schema<A, I>) =>
  async (response: Response): Promise<A> => {
    const json: unknown = await response.json()
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
