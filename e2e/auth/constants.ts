export const BUTTON_NAMES = {
  login: 'Login',
  logout: 'Logout',
  testUser: /Test User/i,
  differentAccount: /Login with different account/i,
} as const

export const SELECTORS = {
  testUserAvatar: 'img[aria-hidden="true"]',
} as const

export const ROUTES = {
  home: '/',
} as const
