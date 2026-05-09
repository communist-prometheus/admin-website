import type { SWGitConfig, SWState } from '../protocol'

/** Mutable Service Worker state */
interface WorkerState {
  config: SWGitConfig | undefined
  state: SWState
  lastSync: number | undefined
  commitSha: string | undefined
  /**
   * Allowed `lang` codes for content files. Refreshed from
   * `settings/languages.json` after every successful sync. Stage-time
   * validation rejects payloads whose filename or frontmatter lang
   * is outside this set, so admin cannot push unbuildable repo state.
   *
   * Populated lazily — the four-language compile-time fallback covers
   * the gap before the first sync completes; once the file lands the
   * set widens to whatever the content repo declares (uk/pl/bl/…).
   */
  supportedLangs: ReadonlySet<string>
}

const DEFAULT_LANGS: ReadonlySet<string> = new Set(['en', 'ru', 'it', 'es'])

/**
 * Global mutable state for the Service Worker.
 * Stored in module scope — persists for SW lifetime.
 */
export const workerState: WorkerState = {
  config: undefined,
  state: 'idle',
  lastSync: undefined,
  commitSha: undefined,
  supportedLangs: DEFAULT_LANGS,
}
