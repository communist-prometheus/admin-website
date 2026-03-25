/** Required fields for a content rename request. */
export type RenameBody = Record<string, unknown> & {
  readonly type: string
  readonly oldSlug: string
  readonly newSlug: string
}

/**
 * Type guard for rename request body.
 * @param b - Parsed body
 * @returns Whether body has type, oldSlug, newSlug
 */
export const isValidRename = (b: Record<string, unknown>): b is RenameBody =>
  Boolean(b['type'] && b['oldSlug'] && b['newSlug'])
