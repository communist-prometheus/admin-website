import { describe, expect, it } from 'vitest'
import { promoteVisualHeadings } from './promote-visual-headings'

describe('promoteVisualHeadings', () => {
  it('promotes a single bold-only paragraph to h1 when no h1 exists', () => {
    const out = promoteVisualHeadings(
      '<p><strong>От редакции: новый этап</strong></p><p>body</p>'
    )
    expect(out).toBe('<h1>От редакции: новый этап</h1><p>body</p>')
  })

  it('promotes subsequent titles to h2', () => {
    const out = promoteVisualHeadings(
      '<p><strong>First</strong></p><p>body</p>' +
        '<p><strong>Second</strong></p><p>body</p>' +
        '<p><strong>Third</strong></p><p>body</p>'
    )
    expect(out).toBe(
      '<h1>First</h1><p>body</p><h2>Second</h2><p>body</p><h2>Third</h2><p>body</p>'
    )
  })

  it('emits h2 for the first promoted title when an h1 already exists', () => {
    const out = promoteVisualHeadings(
      '<h1>Real</h1><p><strong>Bold title</strong></p>'
    )
    expect(out).toBe('<h1>Real</h1><h2>Bold title</h2>')
  })

  it('leaves existing h1/h2 untouched', () => {
    const out = promoteVisualHeadings('<h1>a</h1><h2>b</h2>')
    expect(out).toBe('<h1>a</h1><h2>b</h2>')
  })

  it('keeps inline bold inside a sentence as-is', () => {
    const out = promoteVisualHeadings(
      '<p>This is <strong>emphatic</strong> text.</p>'
    )
    expect(out).toBe('<p>This is <strong>emphatic</strong> text.</p>')
  })

  it('keeps a bold sentence ending with full stop', () => {
    const out = promoteVisualHeadings(
      '<p><strong>This is important.</strong></p><p>body</p>'
    )
    expect(out).toBe('<p><strong>This is important.</strong></p><p>body</p>')
  })

  it('keeps a bold phrase longer than the title limit', () => {
    const long = 'A'.repeat(200)
    const out = promoteVisualHeadings(`<p><strong>${long}</strong></p>`)
    expect(out).toBe(`<p><strong>${long}</strong></p>`)
  })

  it('ignores an empty strong paragraph', () => {
    const out = promoteVisualHeadings('<p><strong></strong></p>')
    expect(out).toBe('<p><strong></strong></p>')
  })

  it('allows title ending with a colon', () => {
    const out = promoteVisualHeadings(
      '<p><strong>Introduction:</strong></p><p>body</p>'
    )
    expect(out).toBe('<h1>Introduction:</h1><p>body</p>')
  })
})
