import type { FieldDefinition } from './frontmatter-fields'

/**
 * Format a frontmatter value for display in an input
 * @param value - The raw frontmatter value
 * @returns Formatted string for input display
 */
export const formatDateValue = (value: unknown): string => {
  if (value instanceof Date) return value.toISOString().split('T')[0] ?? ''
  if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/))
    return value.slice(0, 10)
  return String(value ?? '')
}

/**
 * Parse raw input string into typed value
 * @param type - The field type to parse as
 * @param raw - The raw input string
 * @returns Parsed value
 */
export const parseFieldValue = (
  type: FieldDefinition['type'],
  raw: string
): unknown => {
  if (type === 'number') return raw === '' ? 0 : Number(raw)
  if (type === 'date') return raw === '' ? '' : new Date(raw)
  return raw
}
