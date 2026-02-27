export interface Config {
  readonly maxDepth: number
  readonly excludePatterns: readonly string[]
}

export const config: Config = {
  maxDepth: 2,
  excludePatterns: ['src/components/icons/**/*.vue', 'src/views/**/*.vue'],
} as const

const normalizePathSeparators = (path: string): string =>
  path.replace(/\\/g, '/')

const matchesPattern =
  (normalizedPath: string) =>
  (pattern: string): boolean =>
    pattern.includes('**')
      ? normalizedPath.startsWith(pattern.split('**')[0])
      : normalizedPath === pattern

export const isExcluded = (filePath: string): boolean => {
  const normalizedPath = normalizePathSeparators(
    filePath.replace(`${process.cwd()}\\`, '')
  )
  return config.excludePatterns.some(matchesPattern(normalizedPath))
}
