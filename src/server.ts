import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Effect, pipe } from 'effect'
import { registerAuthRoutes } from './server/auth/routes'
import { bootstrapServer } from './server/bootstrap'
import { config } from './server/config'
import { setupRoutes } from './server/routes'
import { createRenderer } from './server/ssr/render'
import 'dotenv/config'

const __dirname = dirname(fileURLToPath(import.meta.url))
const oauthConfig = { ...config.github, isMockMode: config.isMockOAuth }

const program = pipe(
  bootstrapServer(__dirname),
  Effect.flatMap(({ fastify, assets, viteServer }) =>
    pipe(
      createRenderer(
        config.isProduction,
        __dirname,
        viteServer,
        assets.ssrManifest,
        assets.clientManifest
      ),
      Effect.tap(() =>
        Effect.sync(() =>
          registerAuthRoutes(fastify, oauthConfig, config.isProduction)
        )
      ),
      Effect.flatMap(renderPage => setupRoutes(fastify, renderPage)),
      Effect.flatMap(() =>
        Effect.tryPromise(() => fastify.listen(config.server))
      )
    )
  )
)

Effect.runPromise(program).catch(() => {
  process.exit(1)
})
