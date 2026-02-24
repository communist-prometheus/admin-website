import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { Effect } from 'effect'

export const findVueFiles = (dir: string): Effect.Effect<readonly string[]> =>
  Effect.tryPromise({
    try: async () => {
      const entries = await readdir(dir, { withFileTypes: true })
      const results = await Promise.all(
        entries.map(async entry => {
          const fullPath = join(dir, entry.name)

          if (entry.isDirectory() && entry.name !== 'node_modules') {
            return await Effect.runPromise(findVueFiles(fullPath))
          }

          return entry.isFile() && entry.name.endsWith('.vue')
            ? [fullPath]
            : []
        })
      )
      return results.flat()
    },
    catch: () => new Error(`Failed to read directory: ${dir}`),
  })

export const readFileContent = (filePath: string): Effect.Effect<string> =>
  Effect.tryPromise({
    try: () => readFile(filePath, 'utf-8'),
    catch: () => new Error(`Failed to read file: ${filePath}`),
  })
