/* eslint-disable jsdoc/require-param, jsdoc/require-returns */
/**
 * Process template with client manifest
 */
export const processTemplate = (
  template: string,
  clientManifest?: Record<string, { file: string; css?: string[] }>
): string => {
  const entryClient = clientManifest?.['src/entry-client.ts']
  if (!entryClient) return template

  let result = template

  const cssLinks =
    entryClient.css
      ?.map(css => `<link rel="stylesheet" href="/${css}">`)
      .join('\n  ') || ''

  if (cssLinks) {
    result = result.replace('<head>', `<head>\n  ${cssLinks}`)
  }

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
