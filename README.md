# admin-website

Vue 3 SPA for managing multilingual content in the [public-website](https://github.com/communist-prometheus/public-website) repository. Uses a Service Worker as a Backend-for-Frontend (BFF) that clones the content repo into IndexedDB via isomorphic-git, serving REST endpoints entirely from the browser. No backend server required.

## Architecture

Pure client-side Single Page Application with PKCE OAuth:

- **Client**: Vue 3 SPA with Pinia stores and composable-based business logic
- **Service Worker BFF**: Clones a GitHub repo into IndexedDB, serves `/api/github/*` endpoints locally
- **Auth**: GitHub OAuth PKCE flow via popup -- tokens stored in localStorage
- **Build**: Vite bundles client and SW separately

See also:
- [ARCHITECTURE.md](ARCHITECTURE.md) -- architectural principles and constraints
- [CODE_STYLE.md](CODE_STYLE.md) -- Effect.js patterns, FP principles, file size limits
- [TYPE_SAFETY.md](TYPE_SAFETY.md) -- zero `as` cast policy, Schema validation, narrowing patterns

## Project Structure

```
src/
  api/                  -- API client utilities
  assets/styles/        -- global SCSS variables and resets
  components/           -- shared and feature-scoped Vue components
  composables/          -- Vue composables (business logic)
    useAuth/            -- authentication lifecycle
    useContent/         -- content list, editor, creator
    useAssets/          -- asset management (upload, delete, display)
    useGitHubApi/       -- typed API client for SW endpoints
    useSWBridge/        -- SW registration, init, message transport
    useOAuthPopup/      -- PKCE OAuth popup flow
  config/               -- build-time configuration (auth, GitHub, content paths)
  directives/           -- Vue custom directives
  router/               -- Vue Router configuration
  stores/               -- Pinia stores (auth, content, settings)
  sw/                   -- Service Worker BFF
    core/               -- lifecycle, fetch listener, message dispatch
    errors/             -- typed Effect error classes
    git/                -- isomorphic-git operations
      io/               -- file read/write/delete/list
      remote/           -- commit and push
      repo/             -- repo existence, mock init, config persistence
      sync/             -- clone-or-pull orchestration
    handlers/           -- HTTP request handlers
      asset/            -- asset CRUD
      content/          -- content CRUD
      file/             -- file CRUD
      shared/           -- JSON response, MIME, frontmatter, slug parsing
    logging/            -- structured logging, metrics, tracing
    mock/               -- mock data for E2E tests
    protocol/           -- SW communication types and constants
    state/              -- global worker state
  types/                -- domain model type definitions
  utils/                -- shared utility functions
  validation/           -- Effect.Schema-based validation infrastructure
    schemas/            -- schema definitions for all data boundaries
  views/                -- page-level components (routes)
```

## Content Repository Structure

This admin manages content in the [public-website](https://github.com/communist-prometheus/public-website) repository (`develop` branch). The content directory layout:

```
src/content/
  blog/                              -- nested: slug/index.lang.md + assets/
    {slug}/
      index.{en|ru|it|es}.md         -- article content per language
      assets/                        -- optional media (images, video, audio)
        cover.jpg
        hero.svg
        demo.mp4
        sample.m4a
  pages/                             -- flat: slug.lang.md
    {slug}.{en|ru|it|es}.md
  positions/                         -- flat: slug.lang.md
    {slug}.{en|ru|it|es}.md
```

Key points:
- Blog articles use **`index.{lang}.md`** inside a slug directory (NOT `{slug}.{lang}.md`)
- Media assets (images, video, audio, PDF) live in `{slug}/assets/`
- Pages and positions use flat files: `{slug}.{lang}.md`
- Supported languages: `en`, `ru`, `it`, `es`
- Frontmatter may reference assets via `image: ./assets/file`
- Body may embed assets via `![alt](./assets/file)` or `<video>`/`<audio>` HTML

### Service Worker Data Flow

- **`dev:token`**: Builds SW without mock mode -- clones real repo via `GITHUB_E2E_KEY` token -- pulls latest on each init
- **`build:e2e`**: Builds SW with `MOCK_OAUTH=true` -- uses hardcoded mock entries (no GitHub API)
- **Production**: SW clones via user's OAuth token through CORS proxy

Mock entries in `src/sw/mock/` MUST mirror the production content structure above.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
bun install
```

## Development

Run the development server with HMR:

```sh
bun run dev
```

Server will start at `http://localhost:5173`

To run with a real GitHub token (clones real repo):

```sh
bun run dev:token
```

## Production

**Live site**: https://admin.comprom.org

Deployed on Cloudflare Workers. The CORS proxy (`cors-proxy/`) is a separate Worker (`prometheus-cors-proxy`) that proxies git operations to GitHub.

### Build

Build client and SW bundles:

```sh
bun run build
```

This creates:
- `dist/client/` -- client-side SPA bundle with assets
- `dist/client/sw.js` -- Service Worker bundle

### Preview

Run the production build locally:

```sh
bun run preview
```

## Testing

### Unit Tests with [Vitest](https://vitest.dev/)

```sh
bun run test:unit
```

### E2E Tests with [Playwright](https://playwright.dev)

```sh
# Install browsers for the first run
npx playwright install

# Build with mock auth for E2E
bun run build:e2e

# Run end-to-end tests
bun run test:e2e

# Run with UI
bun run test:e2e:ui
```

## Code Quality

### Type Checking

```sh
bun run type-check
```

### Lint and Format

```sh
bun run format          # Biome format
bun run lint            # Biome lint
bun run lint:sonar      # oxlint (file/function size limits)
bun run lint:jsdoc      # JSDoc completeness
bun run lint:css        # Stylelint
bun run lint:vue-depth  # Vue template depth check
bun run validate        # Run all checks
```
