/**
 * Represents authenticated user information.
 */
export interface User {
  readonly username: string
  readonly name: string
  readonly avatar: string
  readonly accessToken: string
}
