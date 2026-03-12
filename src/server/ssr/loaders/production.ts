/* eslint-disable jsdoc/require-returns */
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Effect } from 'effect'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const distServer = resolve(__dirname, '../../../../dist/server')

/**
 * Resolve the SSR entry path from the Vite manifest.
 */
const resolveEntryFromManifest = async (): Promise<string> => {
  const raw = await readFile(
    resolve(distServer, '.vite/manifest.json'),
    'utf-8'
  )
  const manifest = JSON.parse(raw) as Record<string, { file: string }>
  const entry = manifest['src/entry-server.ts']
  if (!entry) throw new Error('SSR entry not found in manifest')
  return resolve(distServer, entry.file)
}

/**
 * Load production render function
 */
export const loadProdRender = () =>
  Effect.promise(async () => {
    const entryPath = await resolveEntryFromManifest()
    const module = await import(entryPath)
    return module.render
  })
