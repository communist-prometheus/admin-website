import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const ROOT = 'src/sw/mock'

const walk = async (dir: string): Promise<readonly string[]> => {
  const entries = await readdir(dir, { withFileTypes: true })
  const out: string[] = []
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await walk(full)))
    else if (entry.name.endsWith('.ts')) out.push(full)
  }
  return out
}

/**
 * Rewrite `pubDate:` lines inside template-literal frontmatter to
 * `publishDate:` and ensure a `published: true` line follows.
 */
const rewrite = (source: string): string => {
  let changed = false
  const next = source.replace(/^pubDate:\s*(.+)$/gm, (_, value: string) => {
    changed = true
    return `published: true\npublishDate: ${value.trim()}`
  })
  return changed ? next : source
}

const run = async (): Promise<void> => {
  let count = 0
  for (const file of await walk(ROOT)) {
    const src = await readFile(file, 'utf8')
    const out = rewrite(src)
    if (out !== src) {
      await writeFile(file, out, 'utf8')
      count += 1
    }
  }
  // eslint-disable-next-line no-console
  console.log(`migrated ${count} mock file(s)`)
}

run().catch((err: unknown) => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
})
