/**
 * Import an HMAC-SHA256 key for HS256 JWT verify. Mirrors the helper
 * used by auth-worker — both workers must produce the exact same
 * CryptoKey for a given secret string, or signatures won't match.
 * @param secret Shared HS256 secret from `JWT_SECRET`.
 * @returns CryptoKey ready for `crypto.subtle.verify`.
 */
export const importHs256Key = (secret: string): Promise<CryptoKey> =>
  globalThis.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  )
