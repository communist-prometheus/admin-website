/* eslint-disable jsdoc/require-param, jsdoc/require-returns */
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
<script>
if (window.opener) {
  window.opener.postMessage({
    type: 'github-oauth-success',
    user: {
      username: ${JSON.stringify(userData.login)},
      name: ${JSON.stringify(userData.name)},
      avatar: ${JSON.stringify(userData.avatar_url)}
    }
  }, window.location.origin);
  setTimeout(() => window.close(), 1000);
} else {
  window.location.href = '/';
}
</script>
<p>Authentication successful. This window will close automatically...</p>
</body>
</html>`
