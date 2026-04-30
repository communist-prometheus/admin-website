import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { NotificationEntry } from '@/stores/notifications'
import { useNotificationsStore } from '@/stores/notifications'
import NotificationToast from './NotificationToast.vue'
import { TOAST_TEST_IDS } from './test-ids'

const buildEntry = (
  overrides: Partial<NotificationEntry> = {}
): NotificationEntry => ({
  id: 'fixed-id',
  kind: 'error',
  title: 'A title',
  createdAt: 1,
  ...overrides,
})

describe('NotificationToast', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders title and message', () => {
    const entry = buildEntry({ message: 'something broke' })
    const wrapper = mount(NotificationToast, { props: { entry } })
    expect(wrapper.text()).toContain('A title')
    expect(wrapper.text()).toContain('something broke')
  })

  it('omits the cta button when entry has no cta', () => {
    const wrapper = mount(NotificationToast, {
      props: { entry: buildEntry() },
    })
    expect(
      wrapper.find(`[data-testid="${TOAST_TEST_IDS.cta}"]`).exists()
    ).toBe(false)
  })

  it('renders the cta button and runs the supplied action on click', async () => {
    const action = vi.fn()
    const store = useNotificationsStore()
    store.notify({
      kind: 'network',
      title: 'down',
      cta: { label: 'Retry', action },
    })
    const real = store.entries[0]
    expect(real).toBeDefined()
    const wrapper = mount(NotificationToast, {
      props: { entry: real as NotificationEntry },
    })
    const cta = wrapper.find(`[data-testid="${TOAST_TEST_IDS.cta}"]`)
    expect(cta.exists()).toBe(true)
    expect(cta.text()).toBe('Retry')
    await cta.trigger('click')
    expect(action).toHaveBeenCalledTimes(1)
    expect(store.entries).toHaveLength(0)
  })
})
