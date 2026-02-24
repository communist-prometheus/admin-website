export const AUTH_ENDPOINTS = {
  github: '/api/auth/github',
  status: '/api/test/status',
} as const

export const BUTTON_NAMES = {
  login: 'Login',
  logout: 'Logout',
  testUser: /Test User/i,
  differentAccount: /Login with different account/i,
} as const

export const SELECTORS = {
  testUserAvatar: 'img[alt="test-user"]',
} as const

export const ROUTES = {
  home: '/',
} as const
