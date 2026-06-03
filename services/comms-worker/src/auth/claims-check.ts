import type { AccessClaims, AccessVerifyConfig } from './cf-access-types'

const audOk = (aud: AccessClaims['aud'], expected: string): boolean =>
  Array.isArray(aud) ? aud.includes(expected) : aud === expected

/**
 * Check the trio of claim constraints CF Access tokens must satisfy:
 * unexpired, audience-aligned, and issued by the configured team.
 * @param claims Decoded JWT claims.
 * @param cfg Verifier config with audience + team.
 * @param nowSec Current epoch seconds.
 * @returns True iff all three checks pass.
 */
export const claimsOk = (
  claims: AccessClaims,
  cfg: AccessVerifyConfig,
  nowSec: number
): boolean =>
  claims.exp > nowSec &&
  audOk(claims.aud, cfg.aud) &&
  claims.iss === `https://${cfg.team}.cloudflareaccess.com`
