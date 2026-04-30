/**
 * Import an HMAC key for HS256 JWT sign/verify. Reused by both
 * sign and verify to keep the algorithm choice in one place.
 * @param secret HS256 signing secret.
 * @returns CryptoKey ready for sign/verify.
 */
export const importHs256Key = (secret: string): Promise<CryptoKey> =>
  globalThis.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
