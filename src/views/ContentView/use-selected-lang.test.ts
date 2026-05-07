import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { useSelectedLang } from './use-selected-lang'

const Stub = defineComponent({
  setup: () => ({}),
  render: () => h('div'),
})

const setupRouter = (initialPath: string) => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/content/:type', component: Stub },
      { path: '/content/:type/edit/:slug', component: Stub },
    ],
  })
  router.push(initialPath)
  return router
}

const captureLang = (available: () => readonly string[]) => {
  const slot: { ref?: ReturnType<typeof useSelectedLang> } = {}
  const Host = defineComponent({
    setup: () => {
      slot.ref = useSelectedLang(available)
      return () => h('div')
    },
  })
  return { slot, Host }
}

const mountWith = async (
  initialPath: string,
  available: () => readonly string[]
) => {
  const router = setupRouter(initialPath)
  await router.isReady()
  const { slot, Host } = captureLang(available)
  mount(Host, { global: { plugins: [router] } })
  if (!slot.ref) throw new Error('useSelectedLang not captured')
  return { router, lang: slot.ref }
}

describe('useSelectedLang', () => {
  it('reads from query.lang when valid', async () => {
    const { lang } = await mountWith('/content/blog?lang=ru', () => [
      'en',
      'ru',
    ])
    expect(lang.value).toBe('ru')
  })

  it('falls back to first available when query.lang missing', async () => {
    const { lang } = await mountWith('/content/blog', () => ['it', 'en'])
    expect(lang.value).toBe('it')
  })

  it('honours query.lang even when not in the loaded-content subset', async () => {
    /*
     * Earlier version validated `?lang=` against `available()` (the
     * loaded-content subset) and silently demoted out-of-set values
     * to `available[0]`. That broke the "select РУССКИЙ on a
     * newspaper page that has no Russian issue yet" flow — the URL
     * stayed at `ru` but the selector rendered `en` and the content
     * area read "No content found for en". The contract now is:
     * trust the URL. Available is the fallback default only.
     */
    const { lang } = await mountWith('/content/newspaper?lang=ru', () => [
      'en',
    ])
    expect(lang.value).toBe('ru')
  })

  it('falls back to "en" when neither query nor available match', async () => {
    const { lang } = await mountWith('/content/blog', () => [])
    expect(lang.value).toBe('en')
  })

  it('writes via router.replace, merging the existing query', async () => {
    const { router, lang } = await mountWith(
      '/content/blog?foo=bar&lang=en',
      () => ['en', 'ru']
    )
    const spy = vi.spyOn(router, 'replace')
    lang.value = 'ru'
    await nextTick()
    expect(spy).toHaveBeenCalledWith({
      query: { foo: 'bar', lang: 'ru' },
    })
  })

  it('round-trips: after setter, getter reflects new value', async () => {
    const { lang } = await mountWith('/content/blog?lang=en', () => [
      'en',
      'ru',
    ])
    lang.value = 'ru'
    await new Promise(r => setTimeout(r, 0))
    await nextTick()
    expect(lang.value).toBe('ru')
  })
})
