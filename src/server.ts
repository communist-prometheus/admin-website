import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import middie from '@fastify/middie'
import type { ViteDevServer } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))
const isProduction = process.env.NODE_ENV === 'production'

const fastify = Fastify({
  logger: true
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
