/**
 * Validation infrastructure barrel export.
 * Provides Schema-based decoders and type-safe helpers.
 */
export { decodeOrDefault, decodeOrUndefined, parseJsonAs } from './decode'
export { decodeResponse } from './decode-response'
export { extractString } from './extract-string'
export { normalizeHeaders } from './normalize-headers'
export { serializeBody } from './serialize-body'
