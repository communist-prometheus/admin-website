import { pipe } from 'effect'

const collectCssFiles = (
  modules: Set<string>,
  ssrManifest?: Record<string, string[]>
): Set<string> => {
  const cssFiles = new Set<string>()
  if (!ssrManifest) return cssFiles
  for (const moduleId of modules) {
    const assets = ssrManifest[moduleId]
    if (assets)
      assets
        .filter(asset => asset.endsWith('.css'))
        .forEach(css => {
          cssFiles.add(css)
        })
  }
  return cssFiles
}

const cssFilesToLinks = (cssFiles: Set<string>): string =>
  Array.from(cssFiles)
    .map(file => `<link rel="stylesheet" href="${file}">`)
    .join('\n  ')

/**
 * Generates preload link tags for CSS files from SSR modules.
 * @param modules - Set of module IDs used during SSR
 * @param ssrManifest - SSR manifest mapping modules to assets
 * @returns HTML link tags for CSS preloading
 */
export const getPreloadLinks = (
  modules: Set<string>,
  ssrManifest?: Record<string, string[]>
): string => pipe(collectCssFiles(modules, ssrManifest), cssFilesToLinks)
