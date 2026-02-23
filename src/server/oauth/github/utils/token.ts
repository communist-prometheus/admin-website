/* eslint-disable jsdoc/require-param, jsdoc/require-returns */
import { Effect, pipe } from 'effect'
import { extractToken, requestToken } from './token-helpers'

/**
 * Fetch access token from GitHub
 */
export const fetchAccessToken = (
  code: string,
  config: {
    clientId?: string
    clientSecret?: string
    callbackUrl?: string
    isMockMode: boolean
  }
) => pipe(requestToken(code, config), Effect.flatMap(extractToken))
