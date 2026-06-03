type JwksEntry = {
  readonly keys: ReadonlyMap<string, CryptoKey>
  readonly fetchedAt: number
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000
const cache = new Map<string, JwksEntry>()

const importJwk = async (jwk: JsonWebKey): Promise<CryptoKey> =>
  crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  )

const parseJwks = async (
  json: string
): Promise<ReadonlyMap<string, CryptoKey>> => {
  const doc = JSON.parse(json) as {
    readonly keys?: ReadonlyArray<JsonWebKey & { kid?: string }>
  }
  const map = new Map<string, CryptoKey>()
  for (const jwk of doc.keys ?? []) {
    if (jwk.kid !== undefined) map.set(jwk.kid, await importJwk(jwk))
  }
  return map
}

/**
 * Resolve the imported public keys for a CF Access team, caching
 * for `CACHE_TTL_MS` ms keyed by team.
 * @param team Team slug; the JWKS URL is derived from it.
 * @param fetcher Injectable fetch (lets tests stub the network).
 * @param nowMs Current epoch milliseconds (injectable for tests).
 * @returns Map of `kid -> CryptoKey`.
 */
export const resolveJwks = async (
  team: string,
  fetcher: (url: string) => Promise<Response>,
  nowMs: number
): Promise<ReadonlyMap<string, CryptoKey>> => {
  const cached = cache.get(team)
  if (cached !== undefined && nowMs - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.keys
  }
  const url = `https://${team}.cloudflareaccess.com/cdn-cgi/access/certs`
  const res = await fetcher(url)
  const keys = await parseJwks(await res.text())
  cache.set(team, { keys, fetchedAt: nowMs })
  return keys
}

/** Reset the in-memory JWKS cache. Intended for test isolation. */
export const __clearJwksCache = (): void => {
  cache.clear()
}
