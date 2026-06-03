import type { AccessClaims, AccessVerifyConfig } from './cf-access-types'
import { claimsOk } from './claims-check'
import { __clearJwksCache, resolveJwks } from './jwks-cache'
import { decodeJson, verifyRs256 } from './jwt-decode'

export type { AccessClaims, AccessVerifyConfig } from './cf-access-types'

/**
 * Verify a CF Access JWT and return its claims when valid.
 * @param token Compact-serialised JWT.
 * @param cfg Audience, team, optional fetch + clock injectables.
 * @returns Claims on success, undefined on any failure.
 */
export const verifyAccessJwt = async (
  token: string,
  cfg: AccessVerifyConfig
): Promise<AccessClaims | undefined> => {
  const [head, body, sig, ...rest] = token.split('.')
  if (head === undefined || body === undefined || sig === undefined) {
    return undefined
  }
  if (rest.length > 0) return undefined
  const hdr = decodeJson<{ readonly kid?: string }>(head)
  const claims = decodeJson<AccessClaims>(body)
  if (hdr?.kid === undefined || claims === undefined) return undefined
  const nowMs = cfg.now?.() ?? Date.now()
  if (!claimsOk(claims, cfg, Math.floor(nowMs / 1000))) return undefined
  const fetcher = cfg.fetchJwks ?? globalThis.fetch.bind(globalThis)
  const key = (await resolveJwks(cfg.team, fetcher, nowMs)).get(hdr.kid)
  if (key === undefined) return undefined
  return (await verifyRs256(head, body, sig, key)) ? claims : undefined
}

/** Clear the JWKS cache. Intended for tests only. */
export const __clearAccessCache = (): void => {
  __clearJwksCache()
}
