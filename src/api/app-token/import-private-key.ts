const PKCS8_HEADER: readonly number[] = [
  0x30, 0x82, 0x00, 0x00, 0x02, 0x01, 0x00, 0x30, 0x0d, 0x06, 0x09, 0x2a,
  0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00, 0x04, 0x82,
  0x00, 0x00,
]

const stripPem = (pem: string): Uint8Array =>
  Uint8Array.from(
    atob(
      pem
        .replace(/-----BEGIN [^-]+-----/g, '')
        .replace(/-----END [^-]+-----/g, '')
        .replace(/\s+/g, '')
    ),
    c => c.charCodeAt(0)
  )

const wrapPkcs1AsPkcs8 = (pkcs1: Uint8Array): ArrayBuffer => {
  const header = Uint8Array.from(PKCS8_HEADER)
  const totalLen = header.length + pkcs1.length
  const outerLen = totalLen - 4
  header[2] = (outerLen >> 8) & 0xff
  header[3] = outerLen & 0xff
  header[header.length - 2] = (pkcs1.length >> 8) & 0xff
  header[header.length - 1] = pkcs1.length & 0xff
  const out = new ArrayBuffer(totalLen)
  const view = new Uint8Array(out)
  view.set(header, 0)
  view.set(pkcs1, header.length)
  return out
}

/**
 * Parse an RSA private key PEM into a CryptoKey usable by Web Crypto.
 * Accepts the `BEGIN RSA PRIVATE KEY` (PKCS#1) format that GitHub hands
 * out when you download a GitHub App private key, and wraps it as
 * PKCS#8 before importing so the Workers runtime accepts it.
 * @param pem - PEM-encoded RSA private key
 * @returns Imported CryptoKey for RS256 signing
 */
export const importPrivateKey = async (pem: string): Promise<CryptoKey> => {
  const pkcs1 = stripPem(pem)
  const pkcs8 = wrapPkcs1AsPkcs8(pkcs1)
  return crypto.subtle.importKey(
    'pkcs8',
    pkcs8,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )
}
