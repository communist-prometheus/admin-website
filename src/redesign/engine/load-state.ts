import { isEngineReady } from './engine-ready.js';

/**
 * How an empty content read should be presented (QA #14). The screens' reads
 * return an empty list on both "signed out" and "signed in but nothing came
 * back", so a naive empty state told signed-in editors to sign in again. This
 * classifier separates the two using the engine-ready signal:
 *
 * - `loading`    — the first read has not completed yet.
 * - `signed-out` — the read completed but the engine never booted (no session),
 *                  so a sign-in prompt is the correct call to action.
 * - `empty`      — the engine is running and simply returned nothing (an empty
 *                  repo, a failed fetch, or a filtered-away set): offer a reload,
 *                  never a sign-in prompt.
 */
export type LoadState = 'loading' | 'signed-out' | 'empty';

/**
 * Classifies a completed-or-pending content read for the empty-state UI. Call
 * only when there is no data to show; when items exist, render them instead.
 */
export const classifyEmpty = (loaded: boolean): LoadState => {
  if (!loaded) return 'loading';
  return isEngineReady() ? 'empty' : 'signed-out';
};
