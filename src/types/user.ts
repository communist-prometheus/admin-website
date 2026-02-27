/**
 * Represents authenticated user information.
 */
export interface User {
  username: string
  name: string
  avatar: string
  accessToken: string
}

/**
 * Initial state passed to the client during SSR.
 */
export interface InitialState {
  user?: User
}
