/**
 * Import an HMAC key for HS256 sign/verify. One factory for both
 * directions keeps the algorithm choice in a single place.
 * @param secret HS256 signing secret.
 * @returns CryptoKey ready for sign and verify.
 */
export const importHs256Key = (secret: string): Promise<CryptoKey> =>
  globalThis.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
