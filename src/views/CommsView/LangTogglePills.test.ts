import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import LangTogglePills from './LangTogglePills.vue'

describe('LangTogglePills', () => {
  it('adds a language on click and emits the new set', async () => {
    const w = mount(LangTogglePills, { props: { langs: ['en'] } })
    await w.get('[data-testid="lang-toggle-ru"]').trigger('click')
    expect(w.emitted('change')?.[0]?.[0]).toEqual(['en', 'ru'])
  })

  it('removes an already-selected language on click', async () => {
    const w = mount(LangTogglePills, { props: { langs: ['en', 'ru'] } })
    await w.get('[data-testid="lang-toggle-en"]').trigger('click')
    expect(w.emitted('change')?.[0]?.[0]).toEqual(['ru'])
  })

  it('marks selected pills via aria-pressed', () => {
    const w = mount(LangTogglePills, { props: { langs: ['ru'] } })
    expect(
      w.get('[data-testid="lang-toggle-ru"]').attributes('aria-pressed')
    ).toBe('true')
    expect(
      w.get('[data-testid="lang-toggle-en"]').attributes('aria-pressed')
    ).toBe('false')
  })

  it('disables every pill when disabled', () => {
    const w = mount(LangTogglePills, {
      props: { langs: ['en'], disabled: true },
    })
    expect(
      w.get('[data-testid="lang-toggle-en"]').attributes('disabled')
    ).toBeDefined()
  })
})
