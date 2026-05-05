const STEP_HEADER_RE = /^\d{4}-\d{2}-\d{2}T[^Z]+Z\s+##\[group\]Run\s+(.+?)$/

const closeStep = (
  out: Record<string, string>,
  current: string | undefined,
  buffer: readonly string[]
): void => {
  const closed = current ? { [current]: buffer.join('\n') } : undefined
  Object.assign(out, closed ?? {})
}

const stepStart = (line: string): string | undefined =>
  line.match(STEP_HEADER_RE)?.[1]?.trim()

/**
 * Slice the log by the `##[group]Run X` markers GitHub Actions
 * emits at the start of each step. Returns a record keyed by step
 * name with the raw lines (timestamps included so the editor sees
 * exact moment of failure).
 *
 * @param log Plain-text log file contents.
 * @returns Step-name → lines mapping.
 */
export const sliceLogByStep = (
  log: string
): Readonly<Record<string, string>> => {
  const out: Record<string, string> = {}
  let current: string | undefined
  let buffer: string[] = []
  for (const line of log.split('\n')) {
    const next = stepStart(line)
    const isHeader = next !== undefined
    closeStep(out, isHeader ? current : undefined, isHeader ? buffer : [])
    current = isHeader ? next : current
    buffer = isHeader ? [line] : [...buffer, line]
  }
  closeStep(out, current, buffer)
  return out
}

/**
 * Tail of the log around a failure marker. We keep the last N
 * lines because Astro / vite / wrangler errors typically print a
 * short stack right before the non-zero exit, and N=200 is enough
 * to catch the cause without dumping the whole verbose build.
 *
 * @param section Raw section text from `sliceLogByStep`.
 * @param maxLines Maximum lines to retain.
 * @returns Trimmed tail.
 */
export const tailLog = (section: string, maxLines = 200): string => {
  const lines = section.split('\n')
  return lines.slice(Math.max(0, lines.length - maxLines)).join('\n')
}
