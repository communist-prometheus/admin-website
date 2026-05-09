import { parse as parseYaml } from 'yaml'
import { astroSchemas } from '../fixtures/astro-schema/content.config'
import { cfg } from './sandbox-config'

const FENCE_RE = /^---\n([\s\S]*?)\n---\n/

const SUPPORTED_PATH = 'settings/languages.json'

interface LangEntry {
  readonly code: string
}

const fetchSupportedLangs = async (): Promise<ReadonlySet<string>> => {
  const url =
    `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/` +
    `${SUPPORTED_PATH}?ref=${cfg.branch}`
  const res = await fetch(url, {
    headers: { authorization: `Bearer ${cfg.token}` },
  })
  if (!res.ok) return new Set(['en', 'ru', 'it', 'es'])
  const data = (await res.json()) as { content: string; encoding: string }
  const raw = Buffer.from(
    data.content,
    data.encoding as BufferEncoding
  ).toString('utf8')
  const list = JSON.parse(raw) as readonly LangEntry[]
  return new Set(list.map(l => l.code))
}

/**
 * Parse just the YAML frontmatter from a markdown buffer. Throws
 * when the fence is missing or the YAML is malformed — those are
 * the failure modes that should make the test loud.
 * @param raw - Markdown file contents (with YAML fence)
 * @returns The parsed frontmatter as a record
 */
export const frontmatterOf = (raw: string): Record<string, unknown> => {
  const m = FENCE_RE.exec(raw)
  if (!m?.[1]) throw new Error('frontmatter fence missing')
  const parsed: unknown = parseYaml(m[1])
  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    Array.isArray(parsed)
  ) {
    throw new Error('frontmatter must be a YAML mapping')
  }
  return parsed as Record<string, unknown>
}

type AstroType = keyof ReturnType<typeof astroSchemas>

/**
 * Validate a committed file's frontmatter against the mirrored
 * astro collection schema. Throws a descriptive error when the
 * payload would fail the public-website build — that is the
 * contract this helper protects.
 * @param type - Content type (matches astro collection name)
 * @param raw - Markdown file contents from the sandbox
 */
export const assertAstroAccepts = async (
  type: AstroType,
  raw: string
): Promise<void> => {
  const fm = frontmatterOf(raw)
  const allowed = await fetchSupportedLangs()
  astroSchemas(allowed)[type].parse(fm)
}
