import { beforeEach, describe, expect, it } from 'vitest'
import { base64urlEncode } from './base64url'
import { __clearAccessCache, verifyAccessJwt } from './cf-access'

type KeyPair = {
  readonly publicKey: CryptoKey
  readonly privateKey: CryptoKey
}

const algorithm: RsaHashedKeyGenParams = {
  name: 'RSASSA-PKCS1-v1_5',
  modulusLength: 2048,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: 'SHA-256',
}

const generateRsaPair = async (): Promise<KeyPair> => {
  const pair = await crypto.subtle.generateKey(algorithm, true, [
    'sign',
    'verify',
  ])
  return { publicKey: pair.publicKey, privateKey: pair.privateKey }
}

const exportJwks = async (
  publicKey: CryptoKey,
  kid: string
): Promise<string> => {
  const jwk = await crypto.subtle.exportKey('jwk', publicKey)
  return JSON.stringify({ keys: [{ ...jwk, kid, alg: 'RS256', use: 'sig' }] })
}

type Claims = {
  readonly aud: string | ReadonlyArray<string>
  readonly iss: string
  readonly email: string
  readonly sub: string
  readonly exp: number
  readonly iat: number
}

const signJwt = async (
  claims: Claims,
  kid: string,
  privateKey: CryptoKey
): Promise<string> => {
  const header = base64urlEncode(JSON.stringify({ alg: 'RS256', kid }))
  const body = base64urlEncode(JSON.stringify(claims))
  const data = `${header}.${body}`
  const sig = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(data)
  )
  return `${data}.${base64urlEncode(sig)}`
}

const TEAM = 'comprom'
const ISS = `https://${TEAM}.cloudflareaccess.com`
const AUD = 'aud-tag-abc'
const NOW_MS = 1_750_000_000_000
const NOW_SEC = Math.floor(NOW_MS / 1000)
const claims = (overrides: Partial<Claims> = {}): Claims => ({
  aud: AUD,
  iss: ISS,
  email: 'admin@comprom.org',
  sub: 'github|undeadliner',
  exp: NOW_SEC + 300,
  iat: NOW_SEC - 10,
  ...overrides,
})

let pair: KeyPair
let jwks: string

const config = (
  overrides: Partial<Parameters<typeof verifyAccessJwt>[1]> = {}
) => ({
  aud: AUD,
  team: TEAM,
  now: () => NOW_MS,
  fetchJwks: async () =>
    new Response(jwks, { headers: { 'Content-Type': 'application/json' } }),
  ...overrides,
})

beforeEach(async () => {
  __clearAccessCache()
  pair = await generateRsaPair()
  jwks = await exportJwks(pair.publicKey, 'k1')
})

describe('verifyAccessJwt', () => {
  it('returns claims for a valid token', async () => {
    const tok = await signJwt(claims(), 'k1', pair.privateKey)
    const res = await verifyAccessJwt(tok, config())
    expect(res?.email).toBe('admin@comprom.org')
    expect(res?.sub).toBe('github|undeadliner')
  })

  it('rejects when the audience does not match', async () => {
    const tok = await signJwt(
      claims({ aud: 'other-aud' }),
      'k1',
      pair.privateKey
    )
    const res = await verifyAccessJwt(tok, config())
    expect(res).toBeUndefined()
  })

  it('accepts an aud claim provided as an array', async () => {
    const tok = await signJwt(
      claims({ aud: ['other', AUD] }),
      'k1',
      pair.privateKey
    )
    const res = await verifyAccessJwt(tok, config())
    expect(res).toBeDefined()
  })

  it('rejects when the issuer does not match the team URL', async () => {
    const tok = await signJwt(
      claims({ iss: 'https://attacker.cloudflareaccess.com' }),
      'k1',
      pair.privateKey
    )
    const res = await verifyAccessJwt(tok, config())
    expect(res).toBeUndefined()
  })

  it('rejects an expired token', async () => {
    const tok = await signJwt(
      claims({ exp: NOW_SEC - 10 }),
      'k1',
      pair.privateKey
    )
    const res = await verifyAccessJwt(tok, config())
    expect(res).toBeUndefined()
  })

  it('rejects a token signed with the wrong key', async () => {
    const other = await generateRsaPair()
    const tok = await signJwt(claims(), 'k1', other.privateKey)
    const res = await verifyAccessJwt(tok, config())
    expect(res).toBeUndefined()
  })

  it('rejects a token whose body bytes are tampered', async () => {
    const tok = await signJwt(claims(), 'k1', pair.privateKey)
    const [h, b, s] = tok.split('.')
    const tampered = `${h}.${b}xx.${s}`
    const res = await verifyAccessJwt(tampered, config())
    expect(res).toBeUndefined()
  })

  it('rejects when the kid is unknown to the JWKS', async () => {
    const tok = await signJwt(claims(), 'unknown-kid', pair.privateKey)
    const res = await verifyAccessJwt(tok, config())
    expect(res).toBeUndefined()
  })

  it('caches JWKS within the TTL — second call does not refetch', async () => {
    let fetches = 0
    const cfg = config({
      fetchJwks: async () => {
        fetches += 1
        return new Response(jwks, {
          headers: { 'Content-Type': 'application/json' },
        })
      },
    })
    const tok = await signJwt(claims(), 'k1', pair.privateKey)
    await verifyAccessJwt(tok, cfg)
    await verifyAccessJwt(tok, cfg)
    expect(fetches).toBe(1)
  })

  it('refreshes JWKS once an entry exceeds the 24h TTL', async () => {
    let fetches = 0
    let nowMs = NOW_MS
    const cfg = config({
      now: () => nowMs,
      fetchJwks: async () => {
        fetches += 1
        return new Response(jwks, {
          headers: { 'Content-Type': 'application/json' },
        })
      },
    })
    const tok = await signJwt(
      claims({ exp: NOW_SEC + 999_999 }),
      'k1',
      pair.privateKey
    )
    await verifyAccessJwt(tok, cfg)
    nowMs = NOW_MS + 25 * 3600 * 1000
    await verifyAccessJwt(tok, cfg)
    expect(fetches).toBe(2)
  })

  it('rejects a structurally malformed token', async () => {
    const res = await verifyAccessJwt('not.a.jwt', config())
    expect(res).toBeUndefined()
  })
})
