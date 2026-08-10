import { isEngineReady } from './engine-ready.js';

/**
 * How an empty content read should be presented (QA #14). The screens' reads
 * return an empty list on both "signed out" and "signed in but nothing came
 * back", so a naive empty state told signed-in editors to sign in again. This
 * classifier separates the two using the engine-ready signal:
 *
 * - `loading`    — the first read has not completed yet.
 * - `signed-out` — the read completed with no session at all (no `gh_token`),
 *                  so a sign-in prompt is the correct call to action.
 * - `empty`      — either the engine is running and simply returned nothing (an
 *                  empty repo, a failed fetch, a filtered-away set) OR a session
 *                  exists but the engine has not finished / failed to boot: offer
 *                  a reload, never a sign-in prompt.
 *
 * The session check is what closes the earlier hole where a signed-in editor
 * whose engine boot FAILED (so `isEngineReady()` stays false) was wrongly told
 * to sign in again — engine-not-ready no longer implies signed-out.
 */
export type LoadState = 'loading' | 'signed-out' | 'empty';

/** The persisted access token, or undefined when there is no session. */
const storedToken = (): string | undefined => {
  try {
    return globalThis.localStorage?.getItem('gh_token') ?? undefined;
  } catch {
    return undefined;
  }
};

/**
 * Classifies a completed-or-pending content read for the empty-state UI. Call
 * only when there is no data to show; when items exist, render them instead.
 */
export const classifyEmpty = (loaded: boolean): LoadState => {
  if (!loaded) return 'loading';
  if (isEngineReady()) return 'empty';
  const token = storedToken();
  return token !== undefined && token !== '' ? 'empty' : 'signed-out';
};
