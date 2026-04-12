import { importPrivateKey } from './import-private-key'

const base64urlBytes = (buf: ArrayBuffer): string => {
  const bytes = new Uint8Array(buf)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

const base64urlText = (text: string): string =>
  btoa(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

/**
 * Sign a GitHub App JWT (RS256) valid for 9 minutes.
 * @param privateKeyPem - RSA private key in PEM format
 * @param appId - Numeric GitHub App ID used as the `iss` claim
 * @returns Base64url-encoded JWT suitable for Bearer auth on /app/*
 */
export const signAppJwt = async (
  privateKeyPem: string,
  appId: string
): Promise<string> => {
  const now = Math.floor(Date.now() / 1000)
  const header = base64urlText(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payload = base64urlText(
    JSON.stringify({ iat: now - 60, exp: now + 540, iss: appId })
  )
  const data = `${header}.${payload}`
  const key = await importPrivateKey(privateKeyPem)
  const sig = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(data)
  )
  return `${data}.${base64urlBytes(sig)}`
}
