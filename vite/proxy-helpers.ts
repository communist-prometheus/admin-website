import type {
  IncomingHttpHeaders,
  IncomingMessage,
  ServerResponse,
} from 'node:http'
import { api } from '../src/api/app'

/**
 * Convert Node.js IncomingHttpHeaders to a Headers object.
 * @param raw - Raw headers from the incoming request
 * @returns Web API Headers instance
 */
export const toHeaders = (raw: IncomingHttpHeaders): Headers => {
  const h = new Headers()
  for (const [k, v] of Object.entries(raw)) {
    if (v) h.set(k, Array.isArray(v) ? v[0] : v)
  }
  return h
}

/**
 * Read the full body of an incoming request as a Buffer.
 * @param req - Node.js incoming message
 * @returns Concatenated body buffer
 */
export const readBody = async (req: IncomingMessage): Promise<Buffer> => {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(Buffer.from(chunk))
  return Buffer.concat(chunks)
}

/**
 * Forward a request to the Hono API and write the response.
 *
 * The body is forwarded as a `Buffer` so binary payloads (git pack
 * files via /api/cors/...) round-trip byte-for-byte. The previous
 * `response.text()` path decoded packfiles as UTF-8 and silently
 * corrupted them — fine for /api/oauth/token JSON, fatal for git
 * clone over the CORS proxy.
 *
 * Headers are forwarded wholesale (minus content-encoding and
 * content-length). Node decompresses gzipped responses transparently
 * via undici; re-emitting the original `content-encoding` header
 * would tell the SW the bytes are still gzipped when they aren't.
 * Likewise `content-length` would lie about the post-decompression
 * size, so we let Node compute it.
 * @param request - Web API Request
 * @param res - Node.js ServerResponse
 */
export const forwardToApi = async (
  request: Request,
  res: ServerResponse
): Promise<void> => {
  const response = await api.fetch(request, {
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET ?? '',
    CF_API_TOKEN: process.env.VITE_CF_API_TOKEN ?? '',
    CF_ACCOUNT_ID: process.env.VITE_CF_ACCOUNT_ID ?? '',
    CF_PROJECT_NAME: process.env.VITE_CF_PROJECT_NAME ?? '',
  })
  const headers: Record<string, string> = {}
  for (const [k, v] of response.headers.entries()) {
    const lk = k.toLowerCase()
    if (lk === 'content-encoding' || lk === 'content-length') continue
    headers[k] = v
  }
  const body = Buffer.from(await response.arrayBuffer())
  res.writeHead(response.status, headers)
  res.end(body)
}
