import type { MockEntry } from './all-entries'
import { labelsJson } from './settings/labels'
import { languagesJson } from './settings/languages'

/** All mock settings entries. */
export const settingsEntries: readonly MockEntry[] = [
  { path: 'settings/labels.json', content: labelsJson },
  { path: 'settings/languages.json', content: languagesJson },
]
