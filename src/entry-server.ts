import { renderToString } from 'vue/server-renderer'
import { createApp } from './app'

export const render = async (url: string) => {
  const { app, router } = createApp(true)

  await router.push(url)
  await router.isReady()

  const ctx: { modules?: Set<string> } = {}
  const html = await renderToString(app, ctx)

  return { html, modules: ctx.modules || new Set<string>() }
}
