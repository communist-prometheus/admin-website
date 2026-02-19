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

const renderPage = async (url: string, initialState?: { user?: any }): Promise<string> => {
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

  const { html: appHtml, modules } = await render(url, initialState)
  const preloadLinks = generatePreloadLinks(modules)

  let finalHtml = template.replace('<!--ssr-outlet-->', appHtml)

  if (preloadLinks) {
    // Insert preload links at the START of <head>, not at the end
    finalHtml = finalHtml.replace('<head>', `<head>\n  ${preloadLinks}`)
  }

  // Inject initial state for SSR hydration
  if (initialState) {
    const stateScript = `<script>window.__INITIAL_STATE__ = ${JSON.stringify(initialState)}</script>`
    finalHtml = finalHtml.replace('</head>', `${stateScript}\n</head>`)
  }

  return finalHtml
}

// Mock OAuth data for testing
const mockUser = {
  login: 'test-user',
  name: 'Test User',
  avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4'
}

// GitHub OAuth routes
fastify.get('/api/auth/github', async (_request, reply) => {
  const isMockMode = process.env.MOCK_OAUTH === 'true'
  
  // Mock mode: redirect directly to callback with mock code
  if (isMockMode) {
    const callbackUrl = process.env.GITHUB_CALLBACK_URL || 'http://localhost:3000/auth/github/callback'
    return reply.redirect(`${callbackUrl}?code=mock_code_123`)
  }
  
  // Real mode: redirect to GitHub
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
    const isMockMode = process.env.MOCK_OAUTH === 'true'
    let userData: { login?: string; name?: string; avatar_url?: string }
    
    // Mock mode: skip GitHub API calls and use mock data
    if (isMockMode) {
      fastify.log.info('Mock OAuth: Using mock user data')
      userData = mockUser
    } else {
      // Real mode: exchange code for access token
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

      // Get user info from GitHub
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Accept': 'application/json'
        }
      })

      userData = await userResponse.json() as { login?: string; name?: string; avatar_url?: string }
    }

    // Store user info in session
    // @ts-expect-error - fastify-session typing issue
    request.session.github_user = {
      username: userData.login,
      name: userData.name,
      avatar: userData.avatar_url
    }
    
    fastify.log.info('GitHub OAuth: User stored in session', {
      username: userData.login,
      name: userData.name
    })

    // Return HTML page that posts message to parent window and closes popup
    return reply.type('text/html').send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authentication Successful</title>
      </head>
      <body>
        <script>
          console.log('[OAuth Callback] Page loaded');
          console.log('[OAuth Callback] window.opener exists:', !!window.opener);
          
          if (window.opener) {
            const userData = {
              type: 'github-oauth-success',
              user: {
                username: ${JSON.stringify(userData.login)},
                name: ${JSON.stringify(userData.name)},
                avatar: ${JSON.stringify(userData.avatar_url)}
              }
            };
            
            console.log('[OAuth Callback] Sending postMessage:', userData);
            console.log('[OAuth Callback] Target origin:', window.location.origin);
            
            window.opener.postMessage(userData, window.location.origin);
            
            console.log('[OAuth Callback] Message sent, closing window in 1 second...');
            setTimeout(() => {
              window.close();
            }, 1000);
          } else {
            console.log('[OAuth Callback] No opener, redirecting to home');
            window.location.href = '/';
          }
        </script>
        <p>Authentication successful. This window will close automatically...</p>
      </body>
      </html>
    `)
  } catch (error) {
    fastify.log.error(error)
    return reply.status(500).send({ error: 'OAuth failed' })
  }
})

fastify.get('/api/auth/user', async (request, reply) => {
  // @ts-expect-error - fastify-session typing issue
  const user = request.session.github_user
  fastify.log.info('Auth check - session user:', user)
  if (!user) {
    fastify.log.info('User not authenticated - returning 401')
    return reply.status(401).send({ authenticated: false })
  }
  fastify.log.info('User authenticated - returning user data')
  return reply.send({ authenticated: true, user })
})

fastify.get('/api/auth/logout', async (request, reply) => {
  // @ts-expect-error - fastify-session typing issue
  request.session.github_user = undefined
  
  fastify.log.info('User logged out from app session')
  
  // Redirect back to home page
  return reply.redirect('/')
})

if (isProduction) {
  fastify.get('/favicon.ico', async (_request, reply) => {
    return reply.sendFile('favicon.ico', resolveDistPath('client'))
  })
}

fastify.get('*', async (request, reply) => {
  try {
    // @ts-expect-error - fastify-session typing issue
    const githubUser = request.session.github_user
    
    const initialState = githubUser ? { user: githubUser } : undefined
    
    const html = await renderPage(request.url, initialState)
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
