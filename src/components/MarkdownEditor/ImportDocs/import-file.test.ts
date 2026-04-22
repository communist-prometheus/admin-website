import { describe, expect, it } from 'vitest'
import { importFile } from './import-file'

describe('importFile', () => {
  it('imports .md verbatim', async () => {
    const file = new File(['# hi\n\nbody'], 'doc.md', {
      type: 'text/markdown',
    })
    const out = await importFile(file)
    expect(out.markdown).toBe('# hi\n\nbody')
    expect(out.images).toHaveLength(0)
  })

  it('imports .html to markdown', async () => {
    const file = new File(['<h1>T</h1>'], 'x.html', { type: 'text/html' })
    const out = await importFile(file)
    expect(out.markdown).toContain('# T')
  })

  it('rejects .pdf with a clear error', async () => {
    const file = new File(['x'], 'x.pdf', { type: 'application/pdf' })
    await expect(importFile(file)).rejects.toThrow(/unsupported/i)
  })
})
