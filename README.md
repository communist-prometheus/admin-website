# admin-website

Vue 3 SSR application with client-side hydration powered by Vite and Fastify.

## Architecture

This project implements Server-Side Rendering (SSR) with client-side hydration:

- **Server**: Fastify serves SSR-rendered HTML
- **Client**: Vue 3 hydrates the SSR content for interactivity
- **Build**: Vite bundles both client and server code
- **Development**: Integrated Vite dev server with HMR

## Code Style

### Effect.js Functional Programming

All server-side code MUST be written using Effect.js in functional pipeline style:

- Use `Effect.promise`, `Effect.tryPromise`, `Effect.sync` for async operations
- Chain operations using `pipe()` and `Effect.flatMap`, `Effect.map`, `Effect.tap`
- Avoid `async/await` - use Effect combinators instead
- Use `Effect.gen` for complex flows requiring multiple bindings
- Handle errors with `Effect.mapError`, `Effect.catchAll`
- Keep functions pure and composable
- Execute effects with `Effect.runPromise` only at application boundaries

### Key Files

- `src/app.ts` - Universal app factory (shared between client and server)
- `src/entry-client.ts` - Client entry point for hydration
- `src/entry-server.ts` - Server entry point for SSR rendering
- `src/server.ts` - Fastify server with SSR support
- `index.html` - HTML template with SSR outlet placeholder

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
npm install
```

## Development

Run the development server with SSR and HMR:

```sh
npm run dev
```

Server will start at `http://localhost:3000`

## Production

### Build

Build both client and server bundles:

```sh
npm run build
```

This creates:
- `dist/client/` - Client-side bundle with assets
- `dist/server/` - Server-side rendering bundle

### Preview

Run the production build locally:

```sh
npm run preview
```

## Testing

### Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### E2E Tests with [Playwright](https://playwright.dev)

```sh
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
npm run build

# Runs the end-to-end tests
npm run test:e2e
# Runs the tests only on Chromium
npm run test:e2e --project=chromium
# Runs the tests of a specific file
npm run test:e2e tests/example.spec.ts
# Runs the tests in debug mode
npm run test:e2e --debug
```

## Code Quality

### Type Checking

```sh
npm run type-check
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
