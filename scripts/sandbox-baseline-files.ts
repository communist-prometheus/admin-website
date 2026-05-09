import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = fileURLToPath(new URL('.', import.meta.url))
const baselineRoot = join(here, '..', 'e2e-realmode', 'fixtures', 'baseline')

interface BaselineFile {
  readonly path: string
  readonly content: string
}

const collect = (dir: string, out: BaselineFile[]): void => {
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry)
    const st = statSync(abs)
    if (st.isDirectory()) {
      collect(abs, out)
      continue
    }
    out.push({
      path: relative(baselineRoot, abs).replaceAll('\\', '/'),
      content: readFileSync(abs, 'utf8'),
    })
  }
}

/**
 * Load every baseline file under e2e-realmode/fixtures/baseline.
 * Paths are normalized to forward slashes for the GitHub API.
 * @returns Array of `{ path, content }` objects
 */
export const loadBaselineFiles = (): readonly BaselineFile[] => {
  const out: BaselineFile[] = []
  collect(baselineRoot, out)
  return out
}
