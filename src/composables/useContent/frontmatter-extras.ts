/** Subset of frontmatter input for defaults */
interface DefaultsInput {
  readonly description?: string
  readonly category?: string
}

/**
 * Frontmatter defaults for blog content type.
 * @param data - Frontmatter input data
 * @returns Blog-specific frontmatter fields
 */
const blogDefaults = (data: DefaultsInput): Record<string, unknown> => ({
  description: data.description || '',
  category: data.category || '',
})

/**
 * Frontmatter defaults for positions content type.
 * @param data - Frontmatter input data
 * @returns Position-specific frontmatter fields
 */
const positionsDefaults = (data: DefaultsInput): Record<string, unknown> => ({
  description: data.description || '',
})

/**
 * Frontmatter defaults for common content type.
 * @returns Common-specific frontmatter fields
 */
const commonDefaults = (): Record<string, unknown> => ({
  readMore: '',
  viewAll: '',
  backToList: '',
})

/**
 * Frontmatter defaults for newspaper content type.
 * @param data - Frontmatter input data
 * @returns Newspaper-specific frontmatter fields
 */
const newspaperDefaults = (data: DefaultsInput): Record<string, unknown> => ({
  description: data.description || '',
})

/** Extra frontmatter fields by content type */
export const extrasByType: Readonly<
  Record<string, (data: DefaultsInput) => Record<string, unknown>>
> = {
  blog: blogDefaults,
  positions: positionsDefaults,
  common: commonDefaults,
  newspaper: newspaperDefaults,
}
