import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import middie from '@fastify/middie'
import fastifyCookie from '@fastify/cookie'
import fastifySession from '@fastify/session'
import type { ViteDevServer } from 'vite'
import 'dotenv/config'

const __dirname = dirname(fileURLToPath(import.meta.url))
const isProduction = process.env.NODE_ENV === 'production'

const fastify = Fastify({
  logger: true
})

await fastify.register(fastifyCookie)
await fastify.register(fastifySession, {
  secret: process.env.SESSION_SECRET || 'a-very-secret-key-change-in-production-minimum-32-characters-required',
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
})
await fastify.register(middie)

const resolveDistPath = (path: string): string => 
  resolve(__dirname, '../dist', path)

let viteServer: ViteDevServer | undefined
let ssrManifest: Record<string, string[]> | undefined
let clientManifest: Record<string, { file: string; css?: string[] }> | undefined

if (!isProduction) {
  const vite = await import('vite')
  viteServer = await vite.createServer({
    server: { middlewareMode: true },
    appType: 'custom'
  })

  await fastify.use(viteServer.middlewares)
} else {
  await fastify.register(fastifyStatic, {
    root: resolveDistPath('client/assets'),
    prefix: '/assets/'
  })

  ssrManifest = JSON.parse(
    readFileSync(resolveDistPath('client/.vite/ssr-manifest.json'), 'utf-8')
  )

  clientManifest = JSON.parse(
    readFileSync(resolveDistPath('client/.vite/manifest.json'), 'utf-8')
  )
}

const generatePreloadLinks = (modules: Set<string>): string => {
  if (!ssrManifest) return ''

  const cssFiles = new Set<string>()

  for (const moduleId of modules) {
    const assets = ssrManifest[moduleId]
    if (assets) {
      for (const asset of assets) {
        if (asset.endsWith('.css')) {
          cssFiles.add(asset)
        }
      }
    }
  }

  return Array.from(cssFiles)
    .map(file => `<link rel="stylesheet" href="${file}">`)
    .join('\n  ')
}

const renderPage = async (url: string): Promise<string> => {
  let template: string
  let render: (url: string) => Promise<{ html: string; modules: Set<string> }>

  if (isProduction) {
    template = readFileSync(resolve(__dirname, '../index.html'), 'utf-8')
    
    const entryClient = clientManifest?.['src/entry-client.ts']
    if (entryClient) {
      // Insert CSS at the START of <head> to prevent FOUC/CLS
      const cssLinks = entryClient.css
        ?.map(css => `<link rel="stylesheet" href="/${css}">`)
        .join('\n  ') || ''
      
      if (cssLinks) {
        template = template.replace('<head>', `<head>\n  ${cssLinks}`)
      }
      
      // Replace script tag in body
      const scriptTag = `<script type="module" src="/${entryClient.file}"></script>`
      template = template.replace(
        '<script type="module" src="/src/entry-client.ts"></script>',
        scriptTag
      )
    }
    
    // @ts-expect-error - build output not available in dev mode
    const { render: prodRender } = await import('../dist/server/entry-server.js')
    render = prodRender
  } else {
    if (!viteServer) {
      throw new Error('Vite server not initialized')
    }

    template = readFileSync(resolve(__dirname, '../index.html'), 'utf-8')
    template = await viteServer.transformIndexHtml(url, template)

    const { render: devRender } = await viteServer.ssrLoadModule('/src/entry-server.ts')
    render = devRender
  }

  const { html: appHtml, modules } = await render(url)
  const preloadLinks = generatePreloadLinks(modules)

  let finalHtml = template.replace('<!--ssr-outlet-->', appHtml)

  if (preloadLinks) {
    // Insert preload links at the START of <head>, not at the end
    finalHtml = finalHtml.replace('<head>', `<head>\n  ${preloadLinks}`)
  }

  return finalHtml
}

// GitHub OAuth routes
fastify.get('/api/auth/github', async (_request, reply) => {
  const clientId = process.env.GITHUB_CLIENT_ID
  const callbackUrl = process.env.GITHUB_CALLBACK_URL
  
  if (!clientId) {
    return reply.status(500).send({ error: 'GitHub client ID not configured' })
  }
  if (!callbackUrl) {
    return reply.status(500).send({ error: 'GitHub callback URL not configured' })
  }

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=read:user`
  return reply.redirect(githubAuthUrl)
})

fastify.get('/auth/github/callback', async (request, reply) => {
  const { code } = request.query as { code?: string }

  if (!code) {
    return reply.status(400).send({ error: 'No code provided' })
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_CALLBACK_URL
      })
    })

    const tokenData = await tokenResponse.json() as { access_token?: string; error?: string }

    if (tokenData.error || !tokenData.access_token) {
      return reply.status(400).send({ error: 'Failed to get access token' })
    }

    // Get user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/json'
      }
    })

    const userData = await userResponse.json() as { login?: string; name?: string; avatar_url?: string }

    // Store user info in session
    // @ts-expect-error - fastify-session typing issue
    request.session.github_user = {
      username: userData.login,
      name: userData.name,
      avatar: userData.avatar_url
    }

    // Redirect back to home page
    return reply.redirect('/')
  } catch (error) {
    fastify.log.error(error)
    return reply.status(500).send({ error: 'OAuth failed' })
  }
})

fastify.get('/api/auth/user', async (request, reply) => {
  // @ts-expect-error - fastify-session typing issue
  const user = request.session.github_user
  if (!user) {
    return reply.status(401).send({ authenticated: false })
  }
  return reply.send({ authenticated: true, user })
})

fastify.post('/api/auth/logout', async (request, reply) => {
  // @ts-expect-error - fastify-session typing issue
  request.session.github_user = undefined
  return reply.send({ success: true })
})

if (isProduction) {
  fastify.get('/favicon.ico', async (_request, reply) => {
    return reply.sendFile('favicon.ico', resolveDistPath('client'))
  })
}

fastify.get('*', async (request, reply) => {
  try {
    const html = await renderPage(request.url)
    reply.type('text/html').send(html)
  } catch (error) {
    fastify.log.error(error)
    reply.status(500).send('Internal Server Error')
  }
})

try {
  await fastify.listen({ port: 3000 })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
