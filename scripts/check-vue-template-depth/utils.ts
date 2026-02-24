export const normalizePathSeparators = (path: string): string =>
  path.replace(/\\/g, '/')

export const getRelativePath = (filePath: string): string =>
  normalizePathSeparators(filePath.replace(`${process.cwd()}\\`, ''))
