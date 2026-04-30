/** Audience the collector accepts. */
export const JWT_AUDIENCE = 'log-collector'

/** Default token lifetime in seconds (1 hour). */
export const JWT_TTL_SECONDS = 3600

/** Decoded JWT payload — claim names follow RFC 7519. */
export type JwtPayload = {
  readonly sub: string
  readonly aud: string
  readonly iat: number
  readonly exp: number
}

/** JWT header — fixed alg+typ, validated on verify. */
export type JwtHeader = {
  readonly alg: 'HS256'
  readonly typ: 'JWT'
}
