import type { Connect, Plugin } from 'vite'
import { forwardToApi, readBody, toHeaders } from './proxy-helpers'

const NO_BODY = new Set(['GET', 'HEAD'])

/**
 * Build a Web API Request from a Node.js incoming message.
 *
 * The body is passed through as `Uint8Array` so binary payloads
 * (e.g. git-receive-pack push packfiles via /api/cors/*) round-trip
 * byte-for-byte. The previous `Buffer#toString()` decoded packfiles
 * as UTF-8 and silently corrupted them — fine for /api/oauth/token
 * JSON, fatal for git push, and the only signal was a vague
 * "fetch failed: other side closed" upstream.
 * @param req - Node.js incoming message
 * @returns Web API Request
 */
const toArrayBuffer = (b: Buffer): ArrayBuffer => {
  const out = new ArrayBuffer(b.byteLength)
  new Uint8Array(out).set(b)
  return out
}

const buildRequest = async (
  req: import('node:http').IncomingMessage
): Promise<Request> => {
  const url = req.url ?? ''
  const raw = NO_BODY.has(req.method ?? '') ? undefined : await readBody(req)
  const body = raw === undefined ? undefined : toArrayBuffer(raw)
  return new Request(`http://localhost${url}`, {
    method: req.method,
    headers: toHeaders(req.headers),
    body,
  })
}

const apiMiddleware: Connect.NextHandleFunction = async (req, res, next) => {
  const url = req.url ?? ''
  if (!url.startsWith('/api/')) return next()
  const request = await buildRequest(req)
  await forwardToApi(request, res)
}

/**
 * Vite plugin: mount shared Hono API app on dev AND preview servers.
 * Without `configurePreviewServer`, `vite preview` returns 404 for
 * /api/cors/* — which the SW git layer needs in production-like local
 * runs. Real-mode E2E (Playwright via vite preview) depends on this.
 * Passes GITHUB_CLIENT_SECRET from process.env as binding.
 * @returns Vite plugin
 */
export const tokenProxyPlugin = (): Plugin => ({
  name: 'api-proxy',
  configureServer(server) {
    server.middlewares.use(apiMiddleware)
  },
  configurePreviewServer(server) {
    server.middlewares.use(apiMiddleware)
  },
})
