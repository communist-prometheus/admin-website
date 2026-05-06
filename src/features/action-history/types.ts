/** Discriminated union of every action we record. */
export type ActionEntry =
  | NavigationEntry
  | SaveEntry
  | StageEntry
  | AuthEntry
  | SwErrorEntry
  | NetworkErrorEntry

/** Common fields on every entry. */
export interface BaseEntry {
  readonly id: string
  readonly ts: number
}

/** Route navigation. */
export interface NavigationEntry extends BaseEntry {
  readonly kind: 'navigation'
  readonly from: string
  readonly to: string
}

/** Save / commit / push outcome. */
export interface SaveEntry extends BaseEntry {
  readonly kind: 'save'
  readonly action: 'save' | 'commit' | 'push'
  readonly path: string
  readonly status: 'ok' | 'failed'
  readonly errorMessage?: string
}

/** Stage / unstage / discard event. */
export interface StageEntry extends BaseEntry {
  readonly kind: 'stage'
  readonly action: 'stage' | 'unstage' | 'discard'
  readonly path: string
}

/** Auth state change. */
export interface AuthEntry extends BaseEntry {
  readonly kind: 'auth'
  readonly action: 'login' | 'logout' | 'token-refresh'
}

/** SW bridge error. */
export interface SwErrorEntry extends BaseEntry {
  readonly kind: 'sw-error'
  readonly reason: string
}

/** User-visible network failure (toast / banner). */
export interface NetworkErrorEntry extends BaseEntry {
  readonly kind: 'network-error'
  readonly url: string
  readonly status?: number
  readonly reason: string
}

/** Action entry without the auto-assigned id + ts. */
export type RecordableEntry =
  | Omit<NavigationEntry, 'id' | 'ts'>
  | Omit<SaveEntry, 'id' | 'ts'>
  | Omit<StageEntry, 'id' | 'ts'>
  | Omit<AuthEntry, 'id' | 'ts'>
  | Omit<SwErrorEntry, 'id' | 'ts'>
  | Omit<NetworkErrorEntry, 'id' | 'ts'>
