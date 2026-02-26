import type { ShadowDOMConfig } from './types'

const LAYOUT_STYLES =
  ':host{display:grid;grid-template-rows:auto 1fr auto;min-height:100vh}'
const HEADER_STYLES =
  ':host{display:flex;justify-content:space-between;align-items:center;padding:clamp(0.75rem,2vw,1rem) clamp(1rem,4vw,2rem);border-bottom:1px solid var(--color-border);background:var(--color-background);color:var(--color-heading)}h1{font-size:clamp(1.25rem,3vw,1.5rem);font-weight:600;margin:0}'
const MAIN_STYLES =
  ':host{display:block;padding:clamp(1rem,4vw,2rem);color:var(--color-text)}'
const FOOTER_STYLES =
  ':host{display:block;padding:clamp(1rem,3vw,1.5rem) clamp(1rem,4vw,2rem);border-top:1px solid var(--color-border);background:var(--color-background-mute);text-align:center;color:var(--color-text-muted);font-size:clamp(0.75rem,2vw,0.875rem)}'

/**
 * Configuration for semantic custom elements with Declarative Shadow DOM
 */
export const WEB_COMPONENTS_CONFIG: readonly ShadowDOMConfig[] = [
  { tag: 'app-layout', styles: LAYOUT_STYLES },
  { tag: 'app-header', styles: HEADER_STYLES },
  { tag: 'app-main', styles: MAIN_STYLES },
  { tag: 'app-footer', styles: FOOTER_STYLES },
] as const
