/**
 * Engine readiness broadcast (git-engine first-load race, QA #12).
 *
 * Screens read repo content in their `connectedCallback`, which runs while the
 * shell mounts — before {@link bootEngine} has finished cloning/syncing the repo
 * through `POST /api/sw/init`. Without a signal the first read returns nothing
 * and the screen stays empty until a manual reload. This tiny module lets the
 * boot sequence announce readiness and lets screens re-read exactly once when it
 * arrives (or immediately, if they mounted after boot completed).
 */

const target = new EventTarget();
let ready = false;

/** Whether the content engine has finished booting (repo cloned/synced). */
export const isEngineReady = (): boolean => ready;

/** Marks the engine ready and notifies subscribers. Idempotent. */
export const markEngineReady = (): void => {
  if (ready) return;
  ready = true;
  target.dispatchEvent(new Event('ready'));
};

/**
 * Invokes `listener` once the engine is ready: synchronously-scheduled on a
 * microtask if it is already ready, otherwise on the next readiness broadcast.
 * Returns an unsubscribe function safe to call in `disconnectedCallback`.
 */
export const onEngineReady = (listener: () => void): (() => void) => {
  if (ready) {
    queueMicrotask(listener);
    return () => {};
  }
  target.addEventListener('ready', listener, { once: true });
  return () => target.removeEventListener('ready', listener);
};
