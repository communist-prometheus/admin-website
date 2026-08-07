import { fail } from './fail'

// `typeof x === 'object'` also admits the empty reference; truthiness
// rejects it so callers get a real record.
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && Boolean(value)

/**
 * Read the `sha` of a blob/tree/commit response without a type assertion.
 * @param value - Parsed GitHub JSON body
 * @returns The object sha
 */
export const shaOf = (value: unknown): string =>
  isRecord(value) && typeof value.sha === 'string'
    ? value.sha
    : fail('github response missing sha')

/**
 * Read `object.sha` of a ref response without a type assertion.
 * @param value - Parsed GitHub ref JSON body
 * @returns The referenced commit sha
 */
export const refShaOf = (value: unknown): string =>
  isRecord(value) &&
  isRecord(value.object) &&
  typeof value.object.sha === 'string'
    ? value.object.sha
    : fail('github ref response missing object.sha')
