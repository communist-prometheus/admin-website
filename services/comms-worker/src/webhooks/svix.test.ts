import { describe, expect, it } from 'vitest'
import {
  signWebhookHeader,
  verifyWebhookSignature,
  WEBHOOK_WINDOW_MS,
} from './svix'

const SECRET = 'whsec_dGVzdHNlY3JldGtleS0xMjM0NTY3ODkw'
const OTHER = 'whsec_b3RoZXJzZWNyZXQtMTIzNDU2Nzg5MA=='
const NOW_MS = 1_750_000_000_000
const NOW_SEC = String(Math.floor(NOW_MS / 1000))
const ID = 'msg_1'
const BODY = '{"type":"email.bounced"}'

describe('WEBHOOK_WINDOW_MS', () => {
  it('is five minutes (the Svix recommendation)', () => {
    expect(WEBHOOK_WINDOW_MS).toBe(5 * 60 * 1000)
  })
})

describe('signWebhookHeader', () => {
  it('returns a `v1,<base64-sig>` header value', async () => {
    const header = await signWebhookHeader(SECRET, ID, NOW_SEC, BODY)
    expect(header.startsWith('v1,')).toBe(true)
    expect(header.length).toBeGreaterThan('v1,'.length)
  })

  it('is deterministic for the same inputs', async () => {
    const a = await signWebhookHeader(SECRET, ID, NOW_SEC, BODY)
    const b = await signWebhookHeader(SECRET, ID, NOW_SEC, BODY)
    expect(a).toBe(b)
  })

  it('differs when the secret changes', async () => {
    const a = await signWebhookHeader(SECRET, ID, NOW_SEC, BODY)
    const b = await signWebhookHeader(OTHER, ID, NOW_SEC, BODY)
    expect(a).not.toBe(b)
  })
})

describe('verifyWebhookSignature — happy path', () => {
  it('returns true on a freshly-signed payload', async () => {
    const header = await signWebhookHeader(SECRET, ID, NOW_SEC, BODY)
    expect(
      await verifyWebhookSignature({
        secret: SECRET,
        id: ID,
        timestamp: NOW_SEC,
        body: BODY,
        signatureHeader: header,
        nowMs: NOW_MS,
      })
    ).toBe(true)
  })

  it('accepts a header that bundles multiple signatures for rotation', async () => {
    const valid = await signWebhookHeader(SECRET, ID, NOW_SEC, BODY)
    const bogus = 'v1,Zm9vYmFy'
    const combined = `${bogus} ${valid}`
    expect(
      await verifyWebhookSignature({
        secret: SECRET,
        id: ID,
        timestamp: NOW_SEC,
        body: BODY,
        signatureHeader: combined,
        nowMs: NOW_MS,
      })
    ).toBe(true)
  })
})

describe('verifyWebhookSignature — failure modes', () => {
  it('returns false when the body has been tampered with', async () => {
    const header = await signWebhookHeader(SECRET, ID, NOW_SEC, BODY)
    expect(
      await verifyWebhookSignature({
        secret: SECRET,
        id: ID,
        timestamp: NOW_SEC,
        body: `${BODY} `,
        signatureHeader: header,
        nowMs: NOW_MS,
      })
    ).toBe(false)
  })

  it('returns false when the secret used to verify is wrong', async () => {
    const header = await signWebhookHeader(SECRET, ID, NOW_SEC, BODY)
    expect(
      await verifyWebhookSignature({
        secret: OTHER,
        id: ID,
        timestamp: NOW_SEC,
        body: BODY,
        signatureHeader: header,
        nowMs: NOW_MS,
      })
    ).toBe(false)
  })

  it('returns false when the timestamp is older than 5 min', async () => {
    const oldSec = String(Math.floor(NOW_MS / 1000) - 6 * 60)
    const header = await signWebhookHeader(SECRET, ID, oldSec, BODY)
    expect(
      await verifyWebhookSignature({
        secret: SECRET,
        id: ID,
        timestamp: oldSec,
        body: BODY,
        signatureHeader: header,
        nowMs: NOW_MS,
      })
    ).toBe(false)
  })

  it('returns false when the timestamp is more than 5 min in the future', async () => {
    const futureSec = String(Math.floor(NOW_MS / 1000) + 6 * 60)
    const header = await signWebhookHeader(SECRET, ID, futureSec, BODY)
    expect(
      await verifyWebhookSignature({
        secret: SECRET,
        id: ID,
        timestamp: futureSec,
        body: BODY,
        signatureHeader: header,
        nowMs: NOW_MS,
      })
    ).toBe(false)
  })

  it('returns false when the timestamp is not numeric', async () => {
    expect(
      await verifyWebhookSignature({
        secret: SECRET,
        id: ID,
        timestamp: 'NaN',
        body: BODY,
        signatureHeader: 'v1,Zm9v',
        nowMs: NOW_MS,
      })
    ).toBe(false)
  })

  it('returns false when no v1 entries are present', async () => {
    expect(
      await verifyWebhookSignature({
        secret: SECRET,
        id: ID,
        timestamp: NOW_SEC,
        body: BODY,
        signatureHeader: 'v2,Zm9v',
        nowMs: NOW_MS,
      })
    ).toBe(false)
  })

  it('returns false when the secret prefix is missing or malformed', async () => {
    expect(
      await verifyWebhookSignature({
        secret: 'not-a-whsec-secret',
        id: ID,
        timestamp: NOW_SEC,
        body: BODY,
        signatureHeader: 'v1,Zm9v',
        nowMs: NOW_MS,
      })
    ).toBe(false)
  })
})
