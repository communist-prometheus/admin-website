/** BroadcastChannel name for client→SW connectivity state. */
export const SW_CONNECTIVITY_CHANNEL = 'sw-connectivity'

/** Connectivity broadcast payload. */
export type ConnectivityEvent = {
  readonly online: boolean
  readonly at: number
}
