const SLUG_PATTERN = /^[a-z][a-z0-9-]*$/
const MAX_LENGTH = 20

/**
 * Validate a content slug.
 * @param slug - Slug string to validate
 * @returns Error message or undefined if valid
 */
export const validateSlug = (slug: string): string | undefined => {
  if (slug.length === 0) return 'Slug cannot be empty'
  if (slug.length > MAX_LENGTH) return `Max ${MAX_LENGTH} characters`
  if (!SLUG_PATTERN.test(slug))
    return 'Lowercase letters, digits, hyphens only; must start with letter'
  return undefined
}
