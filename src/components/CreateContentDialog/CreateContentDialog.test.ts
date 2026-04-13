import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CreateContentDialog from './CreateContentDialog.vue'

const baseProps = {
  show: true,
  contentType: 'blog' as const,
  lang: 'en' as const,
  labels: [{ key: 'technology', translations: { en: 'Technology' } }],
}

const mountDialog = (
  overrides: Partial<typeof baseProps & { submitting: boolean }> = {}
) => mount(CreateContentDialog, { props: { ...baseProps, ...overrides } })

describe('CreateContentDialog submitting state', () => {
  it('submit button is enabled and hides the spinner class by default', () => {
    const wrapper = mountDialog()
    const submit = wrapper.get('[data-testid="create-submit"]')
    expect(submit.attributes('disabled')).toBeUndefined()
    expect(submit.classes()).not.toContain('is-submitting')
    expect(submit.text()).toContain('Create')
  })

  it('disables submit button, fields and shows spinner when submitting', () => {
    const wrapper = mountDialog({ submitting: true })
    const submit = wrapper.get('[data-testid="create-submit"]')
    expect(submit.attributes('disabled')).toBeDefined()
    expect(submit.classes()).toContain('is-submitting')
    expect(submit.text()).toContain('Creating')

    const fieldset = wrapper.get('fieldset')
    expect(fieldset.attributes('disabled')).toBeDefined()

    const cancel = wrapper
      .findAll('button')
      .find(b => b.text() === 'Cancel')
    expect(cancel).toBeDefined()
    expect(cancel?.attributes('disabled')).toBeDefined()
  })

  it('does not emit create a second time while submitting', async () => {
    const wrapper = mountDialog({ submitting: true })
    await wrapper.get('input#slug').setValue('my-slug')
    await wrapper.get('input#title').setValue('Title')
    await wrapper.get('textarea#description').setValue('Desc')
    await wrapper
      .get('select#category')
      .setValue('technology')
    // click works on enabled elements only — a disabled button ignores
    // the event, so the emit list stays empty.
    await wrapper.get('[data-testid="create-submit"]').trigger('click')
    expect(wrapper.emitted('create')).toBeUndefined()
  })

  it('emits create once with the form data when not submitting', async () => {
    const wrapper = mountDialog({ submitting: false })
    await wrapper.get('input#slug').setValue('my-slug')
    await wrapper.get('input#title').setValue('My Title')
    await wrapper.get('textarea#description').setValue('My description')
    await wrapper
      .get('select#category')
      .setValue('technology')
    await wrapper.get('[data-testid="create-submit"]').trigger('click')
    const events = wrapper.emitted('create')
    expect(events).toBeDefined()
    expect(events).toHaveLength(1)
    const payload = events?.[0]?.[0] as Record<string, unknown>
    expect(payload?.slug).toBe('my-slug')
    expect(payload?.title).toBe('My Title')
  })
})
