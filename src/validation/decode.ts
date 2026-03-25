import { Either, Schema } from 'effect'

/**
 * Decode unknown data through a Schema, returning
 * the typed result or undefined on failure.
 * @param schema - Effect Schema to validate against
 * @returns Decoder function for unknown input
 */
export const decodeOrUndefined =
  <A, I>(schema: Schema.Schema<A, I>) =>
  (input: unknown): A | undefined => {
    const result = Schema.decodeUnknownEither(schema)(input)
    return Either.isRight(result) ? result.right : undefined
  }

/**
 * Decode unknown data through a Schema, returning
 * the typed result or a fallback on failure.
 * @param schema - Effect Schema to validate against
 * @param fallback - Value to return on decode failure
 * @returns Decoder function for unknown input
 */
export const decodeOrDefault =
  <A, I>(schema: Schema.Schema<A, I>, fallback: A) =>
  (input: unknown): A => {
    const result = Schema.decodeUnknownEither(schema)(input)
    return Either.isRight(result) ? result.right : fallback
  }

/**
 * Parse JSON string and decode through Schema.
 * @param schema - Effect Schema to validate against
 * @returns Parser that returns typed result or undefined
 */
export const parseJsonAs =
  <A, I>(schema: Schema.Schema<A, I>) =>
  (raw: string): A | undefined => {
    try {
      return decodeOrUndefined(schema)(JSON.parse(raw))
    } catch {
      return undefined
    }
  }
