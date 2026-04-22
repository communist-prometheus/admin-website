import { mount } from '@vue/test-utils'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import FrontmatterEditor from './FrontmatterEditor.vue'

const TODAY = '2026-04-23'

const mountEditor = (frontmatter: Record<string, unknown>) =>
  mount(FrontmatterEditor, {
    props: { frontmatter, contentType: 'blog' as const },
  })

const lastEmit = (
  w: ReturnType<typeof mountEditor>
): Record<string, unknown> | undefined => {
  const events = w.emitted('update:frontmatter') ?? []
  const last = events[events.length - 1]
  return last?.[0] as Record<string, unknown> | undefined
}

describe('FrontmatterEditor — publishDate auto-fill', () => {
  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(`${TODAY}T12:00:00Z`))
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  it('auto-fills publishDate when published toggles on and date is empty', async () => {
    const wrapper = mountEditor({
      title: 'T',
      description: 'D',
      category: 'C',
      lang: 'en',
    })
    const checkbox = wrapper.get('input[type="checkbox"][id="fm-published"]')
    await checkbox.setValue(true)
    const updated = lastEmit(wrapper)
    expect(updated?.published).toBe(true)
    expect(updated?.publishDate).toBe(TODAY)
  })

  it('does NOT overwrite an existing publishDate when toggling on', async () => {
    const wrapper = mountEditor({
      title: 'T',
      description: 'D',
      category: 'C',
      lang: 'en',
      publishDate: '2024-06-01',
    })
    const checkbox = wrapper.get('input[type="checkbox"][id="fm-published"]')
    await checkbox.setValue(true)
    const updated = lastEmit(wrapper)
    expect(updated?.publishDate).toBe('2024-06-01')
  })

  it('toggling off does not clear publishDate', async () => {
    const wrapper = mountEditor({
      title: 'T',
      description: 'D',
      category: 'C',
      lang: 'en',
      published: true,
      publishDate: '2024-01-01',
    })
    const checkbox = wrapper.get('input[type="checkbox"][id="fm-published"]')
    await checkbox.setValue(false)
    const updated = lastEmit(wrapper)
    expect(updated?.published).toBe(false)
    expect(updated?.publishDate).toBe('2024-01-01')
  })

  it('does not surface pubDate field at all', () => {
    const wrapper = mountEditor({
      title: 'T',
      description: 'D',
      category: 'C',
      lang: 'en',
    })
    expect(wrapper.find('#fm-pubDate').exists()).toBe(false)
  })
})
