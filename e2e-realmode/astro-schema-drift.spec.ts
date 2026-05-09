import { expect, test } from '@prometheus/e2e-toolkit'

/**
 * Detect drift between admin's vendored mirror of public-website's
 * content collection schema and the upstream source of truth.
 *
 * The mirror lives at `e2e-realmode/fixtures/astro-schema/`. When
 * upstream adds / removes / retypes a field, this test goes red on
 * the very next PR and the mirror must be updated to match BEFORE
 * admin can merge anything else. Without this check the gate
 * (validate-stage.ts) would slowly diverge from astro and the next
 * "lang: uk" class regression would slip through unnoticed.
 *
 * The check is structural: collection names + field names. Comments,
 * whitespace, and adapter-only differences (`astro:content` → `zod`,
 * `image()` stub) are intentionally ignored so the mirror never
 * trips on cosmetic diffs.
 */

const UPSTREAM =
  'https://raw.githubusercontent.com/communist-prometheus/public-website/master/src/content.config.ts'

/* `\w+\s*:` at the start of a trimmed line — keeps identifiers
 * regardless of how complex the zod expression to the right gets
 * (nested unions, function calls, the lot). Comment lines and
 * the closing `}` brace get filtered explicitly. */
const FIELD_LINE = /^([a-zA-Z_]\w*)\s*:/

const fieldsFromBody = (body: string): readonly string[] => {
  const out: string[] = []
  for (const line of body.split('\n')) {
    const trimmed = line.trim()
    const isComment =
      trimmed.startsWith('//') ||
      trimmed.startsWith('*') ||
      trimmed.startsWith('/*')
    const m = isComment ? undefined : FIELD_LINE.exec(trimmed)
    if (m?.[1]) out.push(m[1])
  }
  return out.sort()
}

const UPSTREAM_RE =
  /const (\w+)Collection = defineCollection\([\s\S]*?z\.object\(\{([\s\S]*?)\}\)\)?[\s\S]*?\}\);/g

const upstreamCollections = (src: string): Map<string, readonly string[]> => {
  const out = new Map<string, readonly string[]>()
  for (const m of src.matchAll(UPSTREAM_RE)) {
    out.set(m[1] ?? '', fieldsFromBody(m[2] ?? ''))
  }
  return out
}

const MIRROR_RE =
  /const (\w+)Schema = \(allowed: ReadonlySet<string>\) =>\s*z\.object\(\{([\s\S]*?)\}\)/g

const mirrorCollections = (src: string): Map<string, readonly string[]> => {
  const out = new Map<string, readonly string[]>()
  for (const m of src.matchAll(MIRROR_RE)) {
    out.set(m[1] ?? '', fieldsFromBody(m[2] ?? ''))
  }
  return out
}

const fetchUpstream = async (): Promise<string> => {
  const res = await fetch(UPSTREAM)
  if (!res.ok) {
    throw new Error(`upstream fetch ${res.status}: ${res.statusText}`)
  }
  return res.text()
}

const loadMirror = async (): Promise<string> => {
  const fs = await import('node:fs/promises')
  const path = await import('node:path')
  const url = await import('node:url')
  const here = url.fileURLToPath(new URL('.', import.meta.url))
  return fs.readFile(
    path.join(here, 'fixtures', 'astro-schema', 'content.config.ts'),
    'utf8'
  )
}

test('astro schema mirror has no drift from upstream', async () => {
  test.setTimeout(60_000)
  const [upstream, mirror] = await Promise.all([
    fetchUpstream(),
    loadMirror(),
  ])
  const ups = upstreamCollections(upstream)
  const mir = mirrorCollections(mirror)

  expect(
    [...ups.keys()].sort(),
    'collection set must match upstream'
  ).toEqual([...mir.keys()].sort())

  for (const [name, upFields] of ups) {
    expect(mir.get(name), `${name}: field set must match upstream`).toEqual(
      upFields
    )
  }
})
