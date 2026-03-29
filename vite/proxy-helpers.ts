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
 * @param request - Web API Request
 * @param res - Node.js ServerResponse
 */
export const forwardToApi = async (
  request: Request,
  res: ServerResponse
): Promise<void> => {
  const response = await api.fetch(request, {
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET ?? '',
    GITHUB_TOKEN: process.env.GITHUB_E2E_KEY ?? '',
    CF_API_TOKEN: process.env.VITE_CF_API_TOKEN ?? '',
    CF_ACCOUNT_ID: process.env.VITE_CF_ACCOUNT_ID ?? '',
    CF_PROJECT_NAME: process.env.VITE_CF_PROJECT_NAME ?? '',
  })
  res.writeHead(response.status, {
    'Content-Type':
      response.headers.get('Content-Type') ?? 'application/json',
  })
  res.end(await response.text())
}
