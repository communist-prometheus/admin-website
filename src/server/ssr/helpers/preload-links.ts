/* eslint-disable jsdoc/require-param, jsdoc/require-returns */
/**
 * Generate preload links for CSS modules
 */
export const generatePreloadLinks = (
  modules: Set<string>,
  ssrManifest?: Record<string, string[]>
): string => {
  if (!ssrManifest) return ''

  const cssFiles = new Set<string>()

  for (const moduleId of modules) {
    const assets = ssrManifest[moduleId]
    if (assets) {
      for (const asset of assets) {
        if (asset.endsWith('.css')) cssFiles.add(asset)
      }
    }
  }

  return Array.from(cssFiles)
    .map(file => `<link rel="stylesheet" href="${file}">`)
    .join('\n  ')
}
