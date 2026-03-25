# composables

Vue composables encapsulating business logic. Each composable is decomposed into small helper files (under 50 lines each) to satisfy linter constraints.

## Key Composables

- `useAuth` -- authentication state and login/logout lifecycle
- `useContent` -- content list, selection, editing, and creation
- `useAssets` -- asset management (upload, delete, display, transactional save)
- `useGitHubApi` -- typed API client for all SW endpoints (file, content, asset, tree, commit)
- `useSWBridge` -- Service Worker registration, initialization, and message transport
- `useOAuthPopup` -- PKCE OAuth popup flow (authorize URL, popup monitor, token exchange)
- `useDropdown` -- dropdown open/close state
- `useUnsavedGuard` -- warn before navigating away with unsaved changes
