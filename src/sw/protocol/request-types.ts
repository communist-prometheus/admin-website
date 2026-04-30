/** GitHub repo configuration sent to the SW */
export interface SWGitConfig {
  readonly owner: string
  readonly repo: string
  readonly branch: string
  readonly contentPath: string
  readonly corsProxy: string
  readonly token: string
  readonly username?: string
  readonly authorName?: string
  readonly authorEmail?: string
  readonly mock?: boolean
}

/** Proxied fetch request for browsers without SW controller */
export interface SWFetchRequest {
  readonly type: 'SW_FETCH'
  readonly url: string
  readonly method?: string
  readonly headers?: Record<string, string>
  readonly body?: string
  readonly traceparent?: string
}

/** Response from SW_FETCH proxy */
export interface SWFetchResponse {
  readonly status: number
  readonly body: string
  readonly headers: Record<string, string>
}

/** Fields shared by every SW request envelope. */
type Traced = { readonly traceparent?: string }

/** Messages from client to Service Worker */
export type SWRequest =
  | (Traced & { readonly type: 'SW_INIT'; readonly config: SWGitConfig })
  | (Traced & { readonly type: 'SW_STATUS' })
  | (Traced & { readonly type: 'SW_INVALIDATE' })
  | (Traced & { readonly type: 'SW_METRICS' })
  | (Traced & { readonly type: 'SW_LOG_SUBSCRIBE' })
  | SWFetchRequest

/** Service Worker readiness state */
export type SWState = 'idle' | 'cloning' | 'ready' | 'syncing' | 'error'
