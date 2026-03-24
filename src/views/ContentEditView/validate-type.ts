import { isContentType } from '@/types/content'

/**
 * Validate and narrow the type string to ContentType.
 * @param type - Content type string from route params
 * @returns Validated ContentType
 * @throws Error if the type is not a valid ContentType
 */
export const validateContentType = (type: string) => {
  if (!isContentType(type)) {
    throw new Error(`Invalid content type: ${type}`)
  }
  return type
}
