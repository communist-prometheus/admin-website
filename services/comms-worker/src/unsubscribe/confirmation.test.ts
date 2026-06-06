import { describe, expect, it } from 'vitest'
import { renderExpiredPage, renderUnsubscribedPage } from './confirmation'

describe('renderUnsubscribedPage', () => {
  it('returns a full HTML5 document with the lang attribute set', () => {
    const html = renderUnsubscribedPage('en')
    expect(html.startsWith('<!DOCTYPE html>')).toBe(true)
    expect(html).toMatch(/<html lang="en">/)
  })

  it('uses the English chrome by default', () => {
    const html = renderUnsubscribedPage('en')
    expect(html).toContain('You have been unsubscribed')
    expect(html).toContain('mailto:public@comprom.org')
  })

  it('switches to Russian chrome when requested', () => {
    const html = renderUnsubscribedPage('ru')
    expect(html).toContain('Вы отписаны')
    expect(html).toMatch(/<html lang="ru">/)
  })

  it('switches to Italian chrome when requested', () => {
    const html = renderUnsubscribedPage('it')
    expect(html).toContain('Sei stato disiscritto')
  })

  it('does not contain raw script tags (no XSS injection vectors)', () => {
    const html = renderUnsubscribedPage('en')
    expect(html).not.toMatch(/<script\b/i)
  })
})

describe('renderExpiredPage', () => {
  it('returns a localised "link expired" page in the requested lang', () => {
    const en = renderExpiredPage('en')
    expect(en).toContain('This link has expired')
    expect(en).toMatch(/<html lang="en">/)
    const ru = renderExpiredPage('ru')
    expect(ru).toContain('недействительна')
    expect(ru).toMatch(/<html lang="ru">/)
  })

  it('still surfaces the public mailto for support', () => {
    expect(renderExpiredPage('en')).toContain('mailto:public@comprom.org')
  })
})
