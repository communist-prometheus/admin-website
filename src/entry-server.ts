import { renderToString } from 'vue/server-renderer'
import { createApp } from './app'

export const render = async (url: string, initialState?: { user?: any }) => {
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
