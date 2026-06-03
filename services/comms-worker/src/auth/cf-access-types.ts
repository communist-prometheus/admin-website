/** Subset of CF Access JWT claims this service relies on. */
export type AccessClaims = {
  readonly aud: string | ReadonlyArray<string>
  readonly iss: string
  readonly email: string
  readonly sub: string
  readonly exp: number
  readonly iat: number
}

/** Config supplied per call to keep the verifier pure. */
export type AccessVerifyConfig = {
  readonly aud: string
  readonly team: string
  readonly fetchJwks?: (url: string) => Promise<Response>
  readonly now?: () => number
}
