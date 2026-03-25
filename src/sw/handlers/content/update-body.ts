/** Fields required for a content update request. */
export type UpdateBody = Record<string, unknown> & {
  readonly type: string
  readonly slug: string
  readonly lang: string
  readonly frontmatter: Record<string, unknown>
  readonly body: string
  readonly message: string
}

/**
 * Type guard checking all required update fields.
 * @param b - Parsed request body
 * @returns Whether body satisfies UpdateBody
 */
export const isValidUpdate = (b: Record<string, unknown>): b is UpdateBody =>
  Boolean(b['type'] && b['slug'] && b['lang'] && b['message'])
