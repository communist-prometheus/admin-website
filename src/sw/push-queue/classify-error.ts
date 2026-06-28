import type { PushFailureReason } from '../protocol/push-error'

const NETWORK_PATTERNS: ReadonlyArray<RegExp> = [
  /failed to fetch/i,
  /networkerror/i,
  /load failed/i,
  /err_network/i,
  /enotfound/i,
  /econnreset/i,
]

const AUTH_PATTERNS: ReadonlyArray<RegExp> = [
  /401/,
  /403/,
  /unauthorized/i,
  /forbidden/i,
  /bad credentials/i,
]

const FF_PATTERNS: ReadonlyArray<RegExp> = [
  /not a fast-?forward/i,
  // isomorphic-git's literal PushRejectedError wording — the
  // interposed "simple" keeps it from matching the bare pattern
  // above, so it must be listed explicitly.
  /not a simple fast-forward/i,
  /fetch first/i,
  /non-fast-forward/i,
  /push declined.*non-fast/i,
]

const VALIDATION_PATTERNS: ReadonlyArray<RegExp> = [
  /422/,
  /unprocessable/i,
  /validation failed/i,
]

const matches = (source: string, patterns: ReadonlyArray<RegExp>): boolean =>
  patterns.some(re => re.test(source))

const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : String(error)

/**
 * Classify a push failure into one of the typed reasons that the
 * notification factory understands. Falls back to `unknown` so
 * callers always get a reason and can surface a generic copy.
 * @param error Raw error thrown by the push pipeline.
 * @returns Classified reason.
 */
export const classifyPushError = (error: unknown): PushFailureReason => {
  const msg = messageOf(error)
  return matches(msg, FF_PATTERNS)
    ? 'non-fast-forward'
    : matches(msg, AUTH_PATTERNS)
      ? 'auth'
      : matches(msg, VALIDATION_PATTERNS)
        ? 'validation'
        : matches(msg, NETWORK_PATTERNS)
          ? 'network'
          : 'unknown'
}
