# stores

Pinia state management stores. Each store is decomposed: the `defineStore` file delegates to factory functions in sibling files to stay under the 50-line limit.

## Stores

- `auth` -- user authentication state, token sync to SW, login/logout actions
- `content` -- global content item cache, loaded once on auth, filtered by type
- `settings` -- application language settings, loaded from `languages.json` in the content repo
