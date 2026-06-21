import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import StatusFilter from './StatusFilter.vue'

const COUNTS = { active: 2, unsubscribed: 1, bounced: 0, complained: 0 }

const props = { modelValue: 'all' as const, counts: COUNTS, total: 3 }

describe('StatusFilter', () => {
  it('labels every chip with its count', () => {
    const w = mount(StatusFilter, { props })
    expect(w.get('[data-testid="status-filter-all"]').text()).toContain('(3)')
    expect(w.get('[data-testid="status-filter-active"]').text()).toContain(
      '(2)'
    )
  })

  it('marks the active filter via aria-pressed', () => {
    const w = mount(StatusFilter, {
      props: { ...props, modelValue: 'active' },
    })
    expect(
      w.get('[data-testid="status-filter-active"]').attributes('aria-pressed')
    ).toBe('true')
    expect(
      w.get('[data-testid="status-filter-all"]').attributes('aria-pressed')
    ).toBe('false')
  })

  it('emits the chosen status on click', async () => {
    const w = mount(StatusFilter, { props })
    await w.get('[data-testid="status-filter-bounced"]').trigger('click')
    expect(w.emitted('update:modelValue')?.[0]?.[0]).toBe('bounced')
  })
})
