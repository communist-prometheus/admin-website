/* eslint-disable jsdoc/require-param, jsdoc/require-returns */

interface ManifestEntry {
  readonly file: string
  readonly css?: readonly string[]
  readonly imports?: readonly string[]
}

type ClientManifest = Record<string, ManifestEntry>

/**
 * Collect all transitive JS imports from a manifest entry.
 */
const collectImports = (
  manifest: ClientManifest,
  entry: ManifestEntry,
  seen = new Set<string>()
): readonly string[] => {
  const result: string[] = []
  for (const dep of entry.imports ?? []) {
    const depEntry = manifest[dep]
    if (!depEntry || seen.has(depEntry.file)) continue
    seen.add(depEntry.file)
    result.push(depEntry.file)
    result.push(...collectImports(manifest, depEntry, seen))
  }
  return result
}

/**
 * Process template with client manifest
 */
export const processTemplate = (
  template: string,
  clientManifest?: ClientManifest
): string => {
  const entryClient = clientManifest?.['src/entry-client.ts']
  if (!entryClient) return template

  let result = template

  const cssFiles = [
    ...(entryClient.css ?? []),
    ...(clientManifest['style.css']
      ? [clientManifest['style.css'].file]
      : []),
  ]
  const cssLinks = cssFiles
    .map(css => `<link rel="stylesheet" href="/${css}">`)
    .join('\n  ')

  const imports = collectImports(clientManifest, entryClient)
  const preloadLinks = imports
    .map(f => `<link rel="modulepreload" href="/${f}">`)
    .join('\n  ')

  const headInsert = [cssLinks, preloadLinks].filter(Boolean).join('\n  ')

  if (headInsert) {
    result = result.replace('<head>', `<head>\n  ${headInsert}`)
  }

  const swPreregister =
    `<script>if('serviceWorker' in navigator)` +
    `navigator.serviceWorker.register('/sw.js')</script>`
  result = result.replace('</head>', `${swPreregister}\n</head>`)

  const scriptTag = `<script type="module" src="/${entryClient.file}"></script>`
  result = result.replace(
    '<script type="module" src="/src/entry-client.ts"></script>',
    scriptTag
  )

  return result
}

/**
 * Inject initial state into HTML
 */
export const injectInitialState = (
  html: string,
  initialState?: import('../../../types/user').InitialState
): string => {
  if (!initialState) return html

  const stateScript = `<script>window.__INITIAL_STATE__ = ${JSON.stringify(initialState)}</script>`
  return html.replace('</head>', `${stateScript}\n</head>`)
}
