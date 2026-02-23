import type { FastifyReply } from 'fastify'
import type { User } from '@/types/user'

/**
 * Determines the origin URL of the request based on host header and environment.
 * @param request - Request object
 * @param request.headers - Request headers object
 * @param request.headers.host - Host header value
 * @param isProduction - Whether running in production mode
 * @returns Full origin URL (protocol + host)
 */
export const getRequestOrigin = (
  request: { headers: { host?: string | string[] } },
  isProduction: boolean
): string => {
  const hostHeader = request.headers.host
  const host = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader
  const protocol = isProduction ? 'https' : 'http'
  return `${protocol}://${host || 'localhost:3000'}`
}

/**
 * Sends HTML response for OAuth popup window with postMessage to parent.
 * @param reply - Fastify reply object
 * @param user - Authenticated user data to send to parent window
 * @returns FastifyReply with HTML content
 */
export const sendPopupHTML = (reply: FastifyReply, user: User) =>
  reply.type('text/html').send(`
    <!DOCTYPE html>
    <html>
    <head><title>Authentication Successful</title></head>
    <body>
      <script>
        if (window.opener) {
          window.opener.postMessage({
            type: 'github-oauth-success',
            user: ${JSON.stringify(user)}
          }, window.location.origin);
          setTimeout(() => window.close(), 1000);
        } else {
          window.location.href = '/';
        }
      </script>
      <p>Authentication successful. This window will close automatically...</p>
    </body>
    </html>
  `)
