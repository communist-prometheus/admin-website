import { renderToString } from 'vue/server-renderer'
import { createApp } from './app'
import { transformDeclarativeShadowDOM } from './server/utils/transformDeclarativeShadowDOM'
import type { InitialState } from './types/user'

/**
 * Server-side render function for Vue SSR.
 * @param url - Request URL to render
 * @param initialState - Optional initial state for client hydration
 * @returns Object with rendered HTML and module set with Declarative Shadow DOM
 */
export const render = async (url: string, initialState?: InitialState) => {
  const { app, router } = createApp(true)

  if (initialState) {
    app.provide('initialState', initialState)
  }

  await router.push(url)
  await router.isReady()

  const ctx: { modules?: Set<string> } = {}
  const rawHtml = await renderToString(app, ctx)
  const html = transformDeclarativeShadowDOM(rawHtml)

  return { html, modules: ctx.modules || new Set<string>() }
}
