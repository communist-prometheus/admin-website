/* eslint-disable jsdoc/require-param, jsdoc/require-returns */

const createScript = (userData: {
  login?: string
  name?: string
  avatar_url?: string
}) => `
console.log('[OAuth Callback] Window opened', {
  hasOpener: !!window.opener,
  origin: window.location.origin,
  userData: ${JSON.stringify({ login: userData.login, name: userData.name })}
});

if (window.opener) {
  console.log('[OAuth Callback] Sending postMessage to opener');
  window.opener.postMessage({
    type: 'github-oauth-success',
    user: {
      username: ${JSON.stringify(userData.login)},
      name: ${JSON.stringify(userData.name)},
      avatar: ${JSON.stringify(userData.avatar_url)}
    }
  }, window.location.origin);
  console.log('[OAuth Callback] postMessage sent, closing in 1s');
  setTimeout(() => {
    console.log('[OAuth Callback] Closing popup');
    window.close();
  }, 1000);
} else {
  console.log('[OAuth Callback] No opener, redirecting to home');
  window.location.href = '/';
}
`

/**
 * Generate OAuth callback HTML
 */
export const generateCallbackHtml = (userData: {
  login?: string
  name?: string
  avatar_url?: string
}): string => `<!DOCTYPE html>
<html lang="en">
<head><title>Authentication Successful</title></head>
<body>
<script>${createScript(userData)}</script>
<p>Authentication successful. This window will close automatically...</p>
</body>
</html>`
