import { describe, expect, it } from 'vitest'
import { MAX_ATTACHMENT_BYTES } from './attachment-limits'
import { validateAttachment } from './attachment-validate'

const fakeFile = (name: string, type: string, size: number): File => {
  const f = new File([''], name, { type })
  Object.defineProperty(f, 'size', { value: size })
  return f
}

describe('validateAttachment', () => {
  it('accepts an image at the 100 MiB cap', () => {
    const f = fakeFile('big.png', 'image/png', MAX_ATTACHMENT_BYTES)
    expect(validateAttachment(f)).toEqual({ ok: true })
  })

  it('rejects a file one byte over the cap with a sized message', () => {
    const f = fakeFile('big.png', 'image/png', MAX_ATTACHMENT_BYTES + 1)
    const r = validateAttachment(f)
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.reason).toMatch(/big\.png/)
      expect(r.reason).toMatch(/100\.0 MiB/)
    }
  })

  it('accepts a PDF by MIME type', () => {
    expect(
      validateAttachment(fakeFile('doc.pdf', 'application/pdf', 1000))
    ).toEqual({ ok: true })
  })

  it('accepts a .docx with the office MIME', () => {
    const mime =
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    expect(validateAttachment(fakeFile('a.docx', mime, 1000))).toEqual({
      ok: true,
    })
  })

  it('accepts a zip by extension when MIME is empty', () => {
    expect(validateAttachment(fakeFile('logs.zip', '', 1000))).toEqual({
      ok: true,
    })
  })

  it('accepts a plain log by extension', () => {
    expect(validateAttachment(fakeFile('app.log', '', 1000))).toEqual({
      ok: true,
    })
  })

  it('rejects an executable with a typed message', () => {
    const f = fakeFile('virus.exe', 'application/x-msdownload', 1000)
    const r = validateAttachment(f)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toMatch(/not an allowed file type/)
  })

  it('rejects a video file', () => {
    expect(
      validateAttachment(fakeFile('clip.mp4', 'video/mp4', 1000)).ok
    ).toBe(false)
  })
})
