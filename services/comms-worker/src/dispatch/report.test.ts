import { describe, expect, it } from 'vitest'
import type { SendLogWithEmail } from '../send-log/with-email'
import { buildReport } from './report'

const TICK = new Date('2026-07-18T09:00:00.000Z')
const FROM = 'Communist Prometheus <newsletter@comprom.org>'

const row = (
  over: Partial<SendLogWithEmail> & Pick<SendLogWithEmail, 'status'>
): SendLogWithEmail => ({
  id: 1,
  subscriberId: 1,
  tickAt: TICK.toISOString(),
  articleCount: 3,
  resendId: undefined,
  error: undefined,
  email: 'a@test',
  ...over,
})

describe('buildReport', () => {
  it('goes back to the address the newsletter is sent from', () => {
    const r = buildReport(FROM, TICK, [row({ status: 'sent' })], 0)
    expect(r.from).toBe(FROM)
    expect(r.to).toBe(FROM)
  })

  it('puts the outcome in the subject so a glance at the inbox is enough', () => {
    const r = buildReport(
      FROM,
      TICK,
      [
        row({ status: 'sent', email: 'ok@test' }),
        row({ status: 'failed', email: 'bad@test', error: 'resend 422' }),
      ],
      0
    )
    expect(r.subject).toContain('2026-07-18')
    expect(r.subject).toContain('1 sent')
    expect(r.subject).toContain('1 failed')
  })

  it('flags a clean run in the subject', () => {
    const r = buildReport(FROM, TICK, [row({ status: 'sent' })], 0)
    expect(r.subject).toContain('OK')
    expect(r.subject).not.toContain('FAILED')
  })

  it('flags a run with failures so it cannot be mistaken for a good one', () => {
    const r = buildReport(
      FROM,
      TICK,
      [row({ status: 'failed', error: 'resend 409' })],
      0
    )
    expect(r.subject).toContain('FAILED')
  })

  /* The whole point of the report: name the addresses that did not get it. */
  it('lists every failed recipient with its real error', () => {
    const r = buildReport(
      FROM,
      TICK,
      [
        row({ status: 'sent', email: 'ok@test' }),
        row({ status: 'failed', email: 'bad@test', error: 'resend 422' }),
        row({ status: 'failed', email: 'worse@test', error: 'resend 409' }),
      ],
      0
    )
    expect(r.text).toContain('bad@test')
    expect(r.text).toContain('resend 422')
    expect(r.text).toContain('worse@test')
    expect(r.text).toContain('resend 409')
    expect(r.html).toContain('bad@test')
  })

  it('lists the recipients that did get it', () => {
    const r = buildReport(
      FROM,
      TICK,
      [row({ status: 'sent', email: 'ok@test' })],
      0
    )
    expect(r.text).toContain('ok@test')
  })

  /* A tick that reaches nobody still reports — silence is what hid the bug. */
  it('still reports when the tick had nothing to send', () => {
    const r = buildReport(FROM, TICK, [], 7)
    expect(r.subject).toContain('0 sent')
    expect(r.text).toContain('7')
  })

  it('escapes recipient data before it lands in the HTML body', () => {
    const r = buildReport(
      FROM,
      TICK,
      [row({ status: 'failed', email: 'x@test', error: '<img src=x>' })],
      0
    )
    expect(r.html).not.toContain('<img src=x>')
    expect(r.html).toContain('&lt;img src=x&gt;')
  })
})
