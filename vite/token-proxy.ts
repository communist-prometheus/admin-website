import type { Plugin } from 'vite'

const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token'

/**
 * Vite dev server proxy for GitHub token exchange.
 * Injects GITHUB_CLIENT_SECRET from server .env.
 * The secret never reaches the browser.
 * @returns Vite plugin
 */
export const tokenProxyPlugin = (): Plugin => ({
  name: 'github-token-proxy',
  configureServer(server) {
    server.middlewares.use('/api/oauth/token', async (req, res) => {
      const chunks: Buffer[] = []
      for await (const chunk of req) {
        chunks.push(chunk as Buffer)
      }
      const body = new URLSearchParams(Buffer.concat(chunks).toString())
      const secret = process.env.GITHUB_CLIENT_SECRET
      if (secret) body.set('client_secret', secret)

      const gh = await fetch(GITHUB_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: body.toString(),
      })

      res.writeHead(gh.status, {
        'Content-Type': 'application/json',
      })
      res.end(await gh.text())
    })
  },
})
