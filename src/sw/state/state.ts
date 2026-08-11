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
  /**
   * Per-session capability nonce (confused-deputy guard). Issued at
   * `/api/sw/init` and returned to the initiating client; every
   * `/api/github/*` request (native fetch or SW_FETCH message) must echo it
   * back in `X-SW-Nonce`, so an injected same-origin script that never saw the
   * init response cannot borrow the ambient token to read the repo or push.
   * Undefined until the first init; cleared on invalidate/logout.
   */
  nonce: string | undefined
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
  nonce: undefined,
}
