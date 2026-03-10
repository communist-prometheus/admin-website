/** GitHub repo configuration sent to the SW */
export interface SWGitConfig {
  readonly owner: string
  readonly repo: string
  readonly branch: string
  readonly contentPath: string
  readonly corsProxy: string
  readonly token: string
}

/** Messages from client to Service Worker */
export type SWRequest =
  | { readonly type: 'SW_INIT'; readonly config: SWGitConfig }
  | { readonly type: 'SW_STATUS' }
  | { readonly type: 'SW_CLONE' }
  | { readonly type: 'SW_PULL' }
  | { readonly type: 'SW_INVALIDATE' }
  | { readonly type: 'SW_METRICS' }
  | { readonly type: 'SW_LOG_SUBSCRIBE' }

/** Service Worker readiness state */
export type SWState = 'idle' | 'cloning' | 'ready' | 'syncing' | 'error'
