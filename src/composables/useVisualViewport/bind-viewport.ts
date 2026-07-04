/*
 * Bind visualViewport → CSS custom properties on documentElement so
 * every sticky UI can hug the ACTUAL visible viewport rectangle.
 *
 *   --app-vh = visualViewport.height (px) — the visible viewport height
 *              minus the browser toolbars AND minus any on-screen
 *              keyboard. Fallback is `100svh` while the script hasn't
 *              measured yet.
 *   --app-vt = visualViewport.offsetTop (px) — top offset of the visible
 *              viewport within the layout viewport. Non-zero on mobile
 *              when the top toolbar is auto-hidden or when a form input
 *              has been scrolled to keep it above the keyboard.
 *
 * Consumers pin `position: fixed; top: var(--app-vt); …` and set
 * `block-size: var(--app-vh)` to stay glued to the visible area.
 *
 * Idempotent — safe to call more than once; subsequent calls just
 * re-bind the same listeners.
 */

let installed = false

const write = (vv: VisualViewport | null): void => {
  const root = document.documentElement.style
  const h = vv?.height ?? window.innerHeight
  const t = vv?.offsetTop ?? 0
  root.setProperty('--app-vh', `${h}px`)
  root.setProperty('--app-vt', `${t}px`)
}

const doInstall = (): void => {
  installed = true
  const vv = window.visualViewport ?? null
  write(vv)
  const onChange = (): void => write(vv)
  vv?.addEventListener('resize', onChange)
  vv?.addEventListener('scroll', onChange)
  window.addEventListener('resize', onChange)
}

/**
 * Attach visualViewport listeners on window and write the initial
 * `--app-vh` / `--app-vt` values on `documentElement`. Safe to call
 * more than once — subsequent calls are no-ops.
 *
 * @returns void — the binding lives for the app's lifetime; there is
 *   no unbind path because the root element outlives every consumer.
 */
export const installVisualViewportBinding = (): void =>
  installed ? undefined : doInstall()
