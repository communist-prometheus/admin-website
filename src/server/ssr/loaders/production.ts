/* eslint-disable jsdoc/require-returns */
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Effect } from 'effect'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Load production render function
 */
export const loadProdRender = () =>
  Effect.promise(async () => {
    const entryPath = resolve(__dirname, '../../../../dist/server/entry-server.js')
    const module = await import(entryPath)
    return module.render
  })
