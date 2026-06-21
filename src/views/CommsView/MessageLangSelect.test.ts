import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MessageLangSelect from './MessageLangSelect.vue'

describe('MessageLangSelect', () => {
  it('reflects the bound value as the selected option', () => {
    const w = mount(MessageLangSelect, { props: { modelValue: 'ru' } })
    expect(
      (
        w.get('[data-testid="message-lang-select"]')
          .element as HTMLSelectElement
      ).value
    ).toBe('ru')
  })

  it('emits update:modelValue on change', async () => {
    const w = mount(MessageLangSelect, { props: { modelValue: 'en' } })
    await w.get('[data-testid="message-lang-select"]').setValue('it')
    expect(w.emitted('update:modelValue')?.[0]?.[0]).toBe('it')
  })

  it('disables the select when disabled', () => {
    const w = mount(MessageLangSelect, {
      props: { modelValue: 'en', disabled: true },
    })
    expect(
      w.get('[data-testid="message-lang-select"]').attributes('disabled')
    ).toBeDefined()
  })
})
