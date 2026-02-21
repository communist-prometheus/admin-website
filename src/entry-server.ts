import { renderToString } from 'vue/server-renderer'
import { createApp } from './app'
import type { InitialState } from './types/user'

/**
 * Server-side render function for Vue SSR.
 * @param url - Request URL to render
 * @param initialState - Optional initial state for client hydration
 * @returns Object with rendered HTML and module set
 */
export const render = async (url: string, initialState?: InitialState) => {
  const { app, router } = createApp(true)

  // Provide initial state for SSR
  if (initialState) {
    app.provide('initialState', initialState)
  }

  await router.push(url)
  await router.isReady()

  const ctx: { modules?: Set<string> } = {}
  const html = await renderToString(app, ctx)

  return { html, modules: ctx.modules || new Set<string>() }
}
