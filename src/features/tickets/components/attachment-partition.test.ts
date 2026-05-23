import { describe, expect, it } from 'vitest'
import { MAX_ATTACHMENT_BYTES } from '../api/attachment-limits'
import { partition } from './attachment-partition'

const fakeFile = (name: string, type: string, size: number): File => {
  const f = new File([''], name, { type })
  Object.defineProperty(f, 'size', { value: size })
  return f
}

describe('partition', () => {
  it('returns the empty split for an empty input', () => {
    expect(partition([])).toEqual({ accepted: [], rejected: [] })
  })

  it('accepts allowed files and reports reasons for the rest', () => {
    const ok1 = fakeFile('a.png', 'image/png', 1000)
    const ok2 = fakeFile('b.pdf', 'application/pdf', 1000)
    const tooBig = fakeFile('huge.png', 'image/png', MAX_ATTACHMENT_BYTES + 1)
    const wrongType = fakeFile('clip.mp4', 'video/mp4', 1000)

    const { accepted, rejected } = partition([ok1, tooBig, ok2, wrongType])
    expect(accepted).toEqual([ok1, ok2])
    expect(rejected).toHaveLength(2)
    expect(rejected[0]).toMatch(/huge\.png/)
    expect(rejected[1]).toMatch(/clip\.mp4/)
  })
})
