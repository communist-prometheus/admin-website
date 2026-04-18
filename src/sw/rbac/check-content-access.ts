import type { ContentType } from '@/types/content'
import type { Role } from '@/types/role'

const ADMIN_ONLY: ReadonlySet<ContentType> = new Set(['pages', 'common'])
const CHIEF_OR_ADMIN: ReadonlySet<ContentType> = new Set(['positions'])

const atLeast = (role: Role, min: Role): boolean => {
  const order: Record<Role, number> = {
    editor: 0,
    'chief-editor': 1,
    admin: 2,
  }
  return order[role] >= order[min]
}

/**
 * Check if a role can perform an action on a content type.
 * @param role - User's assigned role
 * @param action - Mutation action name
 * @param contentType - Target content type
 * @param username - Current user's GitHub login
 * @param authorUsername - Content author's username
 * @returns Error message or undefined if allowed
 */
export const checkContentAccess = (
  role: Role,
  action: string,
  contentType: ContentType,
  username: string,
  authorUsername?: string
): string | undefined => {
  if (ADMIN_ONLY.has(contentType) && !atLeast(role, 'admin'))
    return `${role} cannot ${action} ${contentType}`
  if (CHIEF_OR_ADMIN.has(contentType) && !atLeast(role, 'chief-editor'))
    return `${role} cannot ${action} ${contentType}`
  if (role === 'editor' && authorUsername && authorUsername !== username)
    return 'Editors can only modify their own content'
  return undefined
}
