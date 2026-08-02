/**
 * Entry for the redesigned admin shell preview. Loads the generated theme layer,
 * registers the design-system primitives, resolves the initial theme
 * (localStorage → OS preference, explicit so the toggle is authoritative), and
 * boots the `app-shell` island. Runs alongside the current app without touching
 * it; the formal cutover replaces the old entry later.
 */
import '../styles/theme.css';
import '@communist-prometheus/cp-components';
import './app-shell.js';
import { bootEngineIfTokenPresent } from './engine/engine-boot.js';

// In local `dev:token` mode (VITE_DEV_TOKEN set), register + init the real
// content engine so screens run against actual GitHub; a no-op otherwise.
void bootEngineIfTokenPresent();

// The initial theme is set inline in redesign.html <head> before this module so
// the shell mirrors it on connect and first paint is themed (no FOUC).
