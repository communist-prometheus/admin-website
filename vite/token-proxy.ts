import type { Plugin } from 'vite'
import { api } from '../src/api/app'

/**
 * Vite dev server plugin: mount shared Hono API app.
 * Passes GITHUB_CLIENT_SECRET from process.env as binding.
 * @returns Vite plugin
 */
export const tokenProxyPlugin = (): Plugin => ({
  name: 'api-proxy',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const url = req.url ?? ''
      if (!url.startsWith('/api/')) return next()

      const headers = new Headers()
      for (const [k, v] of Object.entries(req.headers)) {
        if (v) headers.set(k, Array.isArray(v) ? v[0] : v)
      }

      const chunks: Buffer[] = []
      for await (const chunk of req) {
        chunks.push(chunk as Buffer)
      }

      const request = new Request(`http://localhost${url}`, {
        method: req.method,
        headers,
        body:
          req.method !== 'GET' && req.method !== 'HEAD'
            ? Buffer.concat(chunks)
            : undefined,
      })

      const response = await api.fetch(request, {
        GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET ?? '',
      })

      res.writeHead(response.status, {
        'Content-Type':
          response.headers.get('Content-Type') ?? 'application/json',
      })
      res.end(await response.text())
    })
  },
})
