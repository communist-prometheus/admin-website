import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ListHeaderActions from './ListHeaderActions.vue'

describe('ListHeaderActions — out-of-select-mode', () => {
  it('hides the Select button when there are no items to select', () => {
    /*
     * Reported regression on /content/newspaper?lang=ru — list was
     * empty ("No content found for en"), but the Select button was
     * still shown. Click did nothing visible (the list has no rows
     * to gain checkboxes). The Select affordance only earns its
     * spot when there is actually something to bulk-select.
     */
    const w = mount(ListHeaderActions, { props: { hasItems: false } })
    expect(w.find('[data-testid="select-mode"]').exists()).toBe(false)
    expect(w.find('[data-testid="create-button"]').exists()).toBe(true)
  })

  it('shows the Select button when items exist', () => {
    const w = mount(ListHeaderActions, { props: { hasItems: true } })
    expect(w.find('[data-testid="select-mode"]').exists()).toBe(true)
  })

  it('defaults to hidden when hasItems is omitted', () => {
    const w = mount(ListHeaderActions, { props: {} })
    expect(w.find('[data-testid="select-mode"]').exists()).toBe(false)
  })
})

describe('ListHeaderActions — in-select-mode', () => {
  it('shows count + Cancel + Delete-selected, ignores hasItems', () => {
    const w = mount(ListHeaderActions, {
      props: { selectMode: true, selectedCount: 2, hasItems: false },
    })
    expect(w.find('[data-testid="bulk-count"]').text()).toContain('2')
    expect(w.find('[data-testid="bulk-cancel"]').exists()).toBe(true)
    expect(w.find('[data-testid="bulk-delete"]').exists()).toBe(true)
  })
})
