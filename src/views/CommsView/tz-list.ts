/** Curated IANA timezones offered in the schedule editor dropdown. */
export const COMMON_TIMEZONES = [
  'Etc/UTC',
  'Europe/Moscow',
  'Europe/Berlin',
  'Europe/London',
  'Europe/Madrid',
  'Europe/Kyiv',
  'Europe/Warsaw',
  'Europe/Minsk',
  'Europe/Rome',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Tokyo',
] as const

/** Width of the IANA TZ string type (one of {@link COMMON_TIMEZONES}). */
export type CommonTimezone = (typeof COMMON_TIMEZONES)[number]
