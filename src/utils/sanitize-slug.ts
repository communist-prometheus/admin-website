/**
 * Strip everything that is not lowercase Latin, digits, or hyphen
 * from a slug input. Uppercase letters are folded to lowercase so
 * editors can paste their preferred case and we accept it.
 *
 * Mirrors the runtime contract validated in `validate-slug.ts` so
 * the input field cannot hold any character that would later fail
 * validation.
 *
 * @param raw - Raw user input
 * @returns Sanitized slug — empty string if nothing was usable
 */
export const sanitizeSlug = (raw: string): string =>
  raw.toLowerCase().replace(/[^a-z0-9-]+/g, '')
