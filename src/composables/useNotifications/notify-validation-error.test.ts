import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useNotificationsStore } from '@/stores/notifications'
import { notifyValidationError } from './notify-validation-error'

describe('notifyValidationError', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('emits an error entry naming the field and reason', () => {
    notifyValidationError('slug', 'must be lowercase Latin')
    const store = useNotificationsStore()
    const entry = store.entries[0]
    expect(entry?.kind).toBe('error')
    expect(entry?.title).toMatch(/validation/i)
    expect(entry?.message).toContain('slug')
    expect(entry?.message).toContain('must be lowercase Latin')
  })
})
