import type { Plugin } from 'vite'
import { forwardToApi, readBody, toHeaders } from './proxy-helpers'

const NO_BODY = new Set(['GET', 'HEAD'])

/**
 * Build a Web API Request from a Node.js incoming message.
 * @param req - Node.js incoming message
 * @returns Web API Request
 */
const buildRequest = async (
  req: import('node:http').IncomingMessage
): Promise<Request> => {
  const url = req.url ?? ''
  const raw = NO_BODY.has(req.method ?? '') ? undefined : await readBody(req)
  const body = raw ? raw.toString() : undefined
  return new Request(`http://localhost${url}`, {
    method: req.method,
    headers: toHeaders(req.headers),
    body,
  })
}

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
      if (!url.startsWith('/api/oauth/')) return next()
      const request = await buildRequest(req)
      await forwardToApi(request, res)
    })
  },
})
