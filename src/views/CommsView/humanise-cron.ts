const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

const fmt2 = (n: number): string => String(n).padStart(2, '0')

type Rule = readonly [RegExp, (m: RegExpExecArray) => string]

const RULES: ReadonlyArray<Rule> = [
  [/^\*\s+\*\s+\*\s+\*\s+\*$/, () => 'every minute'],
  [/^\*\/(\d+)\s+\*\s+\*\s+\*\s+\*$/, m => `every ${m[1]} minutes`],
  [/^(\d+)\s+\*\s+\*\s+\*\s+\*$/, m => `every hour at minute ${m[1]}`],
  [
    /^(\d+)\s+(\d+)\s+\*\s+\*\s+\*$/,
    m => `every day at ${fmt2(Number(m[2]))}:${fmt2(Number(m[1]))}`,
  ],
  [
    /^(\d+)\s+(\d+)\s+\*\s+\*\s+(\d+)$/,
    m => {
      const day = DAYS[Number(m[3]) % 7] ?? 'day'
      return `every ${day} at ${fmt2(Number(m[2]))}:${fmt2(Number(m[1]))}`
    },
  ],
]

/**
 * Render a small set of canonical crontab patterns into plain English.
 * Falls through to the raw trimmed expression for shapes outside the set.
 * @param cron Raw crontab string.
 * @returns Human-readable label for the schedule input.
 */
export const humaniseCron = (cron: string): string => {
  const trimmed = cron.trim()
  const matched = RULES.map(([re, fn]) => ({
    fn,
    match: re.exec(trimmed),
  })).find(r => r.match !== null)
  return matched?.match ? matched.fn(matched.match) : trimmed
}
