import { stripQuery, truncate } from './redact-helpers'
import type {
  ActionEntry,
  NavigationEntry,
  NetworkErrorEntry,
  RecordableEntry,
  SaveEntry,
  SwErrorEntry,
} from './types'

const redactSave = (e: Omit<SaveEntry, 'id' | 'ts'>): typeof e => ({
  ...e,
  errorMessage:
    e.errorMessage === undefined ? undefined : truncate(e.errorMessage),
})

const redactSw = (e: Omit<SwErrorEntry, 'id' | 'ts'>): typeof e => ({
  ...e,
  reason: truncate(e.reason),
})

const redactNet = (e: Omit<NetworkErrorEntry, 'id' | 'ts'>): typeof e => ({
  ...e,
  url: stripQuery(e.url),
  reason: truncate(e.reason),
})

const redactNav = (e: Omit<NavigationEntry, 'id' | 'ts'>): typeof e => ({
  ...e,
  from: stripQuery(e.from),
  to: stripQuery(e.to),
})

/**
 * Strip / truncate any field that could carry PII before persistence.
 *
 * The PII boundary lives here, not at every recorder call site. Any
 * future entry kind that adds a free-text field MUST be handled
 * explicitly — the discriminated union makes that omission a type
 * error rather than a silent leak.
 *
 * @param entry - Recorded entry without id/ts
 * @returns Entry with long strings truncated and contents stripped
 */
export const redactEntry = (entry: RecordableEntry): RecordableEntry => {
  const dispatch = {
    save: () => redactSave(entry as Omit<SaveEntry, 'id' | 'ts'>),
    'sw-error': () => redactSw(entry as Omit<SwErrorEntry, 'id' | 'ts'>),
    'network-error': () =>
      redactNet(entry as Omit<NetworkErrorEntry, 'id' | 'ts'>),
    navigation: () => redactNav(entry as Omit<NavigationEntry, 'id' | 'ts'>),
    stage: () => entry,
    auth: () => entry,
  } as const
  return dispatch[entry.kind]()
}

/**
 * Convenience: redact and stamp with a fresh id + ts.
 * @param entry - Recordable entry
 * @param now - Wall-clock timestamp to stamp
 * @param idGen - Id factory (allow injection for tests)
 * @returns Full ActionEntry ready to persist
 */
export const stampEntry = (
  entry: RecordableEntry,
  now: number,
  idGen: () => string
): ActionEntry =>
  ({ ...redactEntry(entry), id: idGen(), ts: now }) as ActionEntry
