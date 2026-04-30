import type { ResolveStrategy } from '../protocol/push-control'

const HEAD_MARKER = /^<{7} .*$/
const SEP_MARKER = /^={7}$/
const TAIL_MARKER = /^>{7} .*$/

type Section = 'outside' | 'ours' | 'theirs'

const nextSection = (line: string, prev: Section): Section =>
  HEAD_MARKER.test(line)
    ? 'ours'
    : SEP_MARKER.test(line)
      ? 'theirs'
      : TAIL_MARKER.test(line)
        ? 'outside'
        : prev

const isMarker = (line: string): boolean =>
  HEAD_MARKER.test(line) || SEP_MARKER.test(line) || TAIL_MARKER.test(line)

const shouldKeep = (
  section: Section,
  line: string,
  keepOurs: boolean
): boolean =>
  !isMarker(line) &&
  (section === 'outside' ||
    (section === 'ours' && keepOurs) ||
    (section === 'theirs' && !keepOurs))

/**
 * Strip merge conflict markers from a textual file according to
 * the chosen resolution strategy. `mine` / `force-mine` keeps
 * `<<<<<<<`-`=======` lines; `theirs` keeps `=======`-`>>>>>>>`.
 * Lines outside any conflict block are kept verbatim.
 * @param content Raw file content with conflict markers.
 * @param strategy Resolution strategy chosen by the user.
 * @returns Resolved file content with markers stripped.
 */
export const resolveByStrategy = (
  content: string,
  strategy: ResolveStrategy
): string => {
  const keepOurs = strategy !== 'theirs'
  const lines = content.split('\n')
  const result: string[] = []
  let section: Section = 'outside'
  for (const line of lines) {
    section = nextSection(line, section)
    const include = shouldKeep(section, line, keepOurs)
    const noop = (): void => undefined
    const push = (): void => {
      result.push(line)
    }
    ;(include ? push : noop)()
  }
  return result.join('\n')
}
