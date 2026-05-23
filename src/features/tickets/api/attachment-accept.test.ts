import { describe, expect, it } from 'vitest'
import { ACCEPT_ATTR } from './attachment-accept'

describe('ACCEPT_ATTR', () => {
  it('keeps the image-wildcard from the original picker', () => {
    expect(ACCEPT_ATTR).toMatch(/image\/\*/)
  })

  it('opens the picker to PDF and text files', () => {
    expect(ACCEPT_ATTR).toMatch(/application\/pdf/)
    expect(ACCEPT_ATTR).toMatch(/text\/\*/)
  })

  it('opens the picker to office documents by extension and MIME', () => {
    expect(ACCEPT_ATTR).toMatch(/\.docx/)
    expect(ACCEPT_ATTR).toMatch(/\.xlsx/)
    expect(ACCEPT_ATTR).toMatch(/officedocument/)
  })

  it('opens the picker to archives', () => {
    expect(ACCEPT_ATTR).toMatch(/\.zip/)
    expect(ACCEPT_ATTR).toMatch(/\.7z/)
    expect(ACCEPT_ATTR).toMatch(/\.tar/)
  })
})
