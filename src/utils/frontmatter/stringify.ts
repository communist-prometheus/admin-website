const formatValue = (value: unknown): string => {
  if (value instanceof Date) {
    return value.toISOString().split('T')[0] ?? ''
  }
  return String(value)
}

export const stringifyFrontmatter = <
  T extends Record<string, unknown> = Record<string, unknown>,
>(
  frontmatter: T,
  content: string
): string => {
  const lines = Object.entries(frontmatter as Record<string, unknown>).map(
    ([key, value]) => `${key}: ${formatValue(value)}`
  )

  return `---\n${lines.join('\n')}\n---\n\n${content}`
}
