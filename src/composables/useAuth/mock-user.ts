import type { User } from '@/types/user'

export const getMockUser = (): User => ({
  username: 'test-user',
  name: 'Test User',
  avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
})
