import type { HttpClient } from 'isomorphic-git'
import { withTraceparent } from './http-traceparent'

/**
 * Lazily import isomorphic-git's web HTTP client and wrap it so
 * every outbound request carries the active SW trace context.
 * Replaces `await import('isomorphic-git/http/web')` callsites.
 * @returns Wrapped HTTP client.
 */
export const loadTracedHttp = async (): Promise<HttpClient> => {
  const { default: http } = await import('isomorphic-git/http/web')
  return withTraceparent(http)
}
