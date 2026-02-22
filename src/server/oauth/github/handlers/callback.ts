/* eslint-disable jsdoc/require-param, jsdoc/require-returns */
import { Effect, pipe } from 'effect'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { fetchAccessToken, fetchGitHubUser, saveSession } from '../utils'

const mockUser = {
  login: 'test-user',
  name: 'Test User',
  avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
}

/**
 * Generate OAuth callback HTML
 */
const generateCallbackHtml = (userData: {
  login?: string
  name?: string
  avatar_url?: string
}): string => `
<!DOCTYPE html>
<html>
<head>
  <title>Authentication Successful</title>
</head>
<body>
  <script>
    console.log('[OAuth Callback] Page loaded');
    console.log('[OAuth Callback] window.opener exists:', !!window.opener);

    if (window.opener) {
      const userData = {
        type: 'github-oauth-success',
        user: {
          username: ${JSON.stringify(userData.login)},
          name: ${JSON.stringify(userData.name)},
          avatar: ${JSON.stringify(userData.avatar_url)}
        }
      };

      console.log('[OAuth Callback] Sending postMessage:', userData);
      console.log('[OAuth Callback] Target origin:', window.location.origin);

      window.opener.postMessage(userData, window.location.origin);

      console.log('[OAuth Callback] Message sent, closing window in 1 second...');
      setTimeout(() => {
        window.close();
      }, 1000);
    } else {
      console.log('[OAuth Callback] No opener, redirecting to home');
      window.location.href = '/';
    }
  </script>
  <p>Authentication successful. This window will close automatically...</p>
</body>
</html>
`

/**
 * Handle GitHub OAuth callback
 */
export const handleCallback = (
  request: FastifyRequest,
  reply: FastifyReply,
  config: {
    clientId?: string
    clientSecret?: string
    callbackUrl?: string
    isMockMode: boolean
  }
) => {
  const { code } = request.query as { code?: string }

  if (!code) {
    return reply.status(400).send({ error: 'No code provided' })
  }

  const program = config.isMockMode
    ? Effect.succeed(mockUser)
    : pipe(fetchAccessToken(code, config), Effect.flatMap(fetchGitHubUser))

  return Effect.runPromise(
    pipe(
      program,
      Effect.tap(userData => {
        // @ts-expect-error - fastify-session typing issue
        request.session.github_user = {
          username: userData.login,
          name: userData.name,
          avatar: userData.avatar_url,
        }
        request.log.info(
          { username: userData.login, name: userData.name },
          'GitHub OAuth: User stored in session'
        )
      }),
      Effect.flatMap(userData =>
        config.isMockMode
          ? pipe(
              saveSession(request),
              Effect.tap(() => {
                request.log.info(
                  '🧪 Mock OAuth: Session saved, redirecting to home'
                )
              }),
              Effect.map(() => reply.redirect('/'))
            )
          : Effect.succeed(
              reply.type('text/html').send(generateCallbackHtml(userData))
            )
      ),
      Effect.catchAll(error => {
        request.log.error(error)
        return Effect.succeed(
          reply.status(500).send({ error: 'OAuth failed' })
        )
      })
    )
  )
}
