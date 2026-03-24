/** Subset of frontmatter input for defaults */
interface DefaultsInput {
  readonly description?: string
  readonly category?: string
  readonly order?: number
}

/**
 * Frontmatter defaults for blog content type.
 * @param data - Frontmatter input data
 * @returns Blog-specific frontmatter fields
 */
const blogDefaults = (data: DefaultsInput): Record<string, unknown> => ({
  description: data.description || '',
  category: data.category || '',
  pubDate: new Date(),
})

/**
 * Frontmatter defaults for positions content type.
 * @param data - Frontmatter input data
 * @returns Position-specific frontmatter fields
 */
const positionsDefaults = (data: DefaultsInput): Record<string, unknown> => ({
  description: data.description || '',
  order: data.order || 1,
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

/** Extra frontmatter fields by content type */
export const extrasByType: Readonly<
  Record<string, (data: DefaultsInput) => Record<string, unknown>>
> = {
  blog: blogDefaults,
  positions: positionsDefaults,
  common: commonDefaults,
}
