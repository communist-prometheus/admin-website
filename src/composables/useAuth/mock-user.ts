import type { User } from '@/types/user'

/**
 * Get mock user for testing
 * @returns Mock user object
 */
export const getMockUser = (): User => ({
  username: 'test-user',
  name: 'Test User',
  avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
})
