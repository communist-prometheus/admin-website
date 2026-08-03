/**
 * Entry for the redesigned admin. When served at the OAuth callback path this
 * window is the login popup — it completes the exchange, posts the token to the
 * opener, and closes without mounting the app. Otherwise it mounts the shell and
 * boots the git engine from the dev token (local) or the OAuth session
 * (deployed). The initial theme is set inline in the HTML <head> before this
 * module so first paint is themed (no FOUC).
 */
import '../styles/theme.css';
import './styles/base.css';
import './styles/view-transition.css';
import '@communist-prometheus/cp-components';
import './editor/cp-markdown-editor.js';
import './app-shell.js';
import { bootEngineIfTokenPresent } from './engine/engine-boot.js';
import { handleOAuthCallbackIfPresent } from './engine/oauth-callback.js';

const boot = async (): Promise<void> => {
  if (await handleOAuthCallbackIfPresent()) return;
  document.body.appendChild(document.createElement('app-shell'));
  await bootEngineIfTokenPresent();
};

void boot();
