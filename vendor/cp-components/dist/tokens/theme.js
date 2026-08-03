/**
 * Single source of truth for the Communist Prometheus theme tokens.
 *
 * Values are locked in the admin-redesign design-system spec (design.md §3–§4)
 * and reconciled with the public site (`public-website/src/styles/theme.css`).
 * The four atomic theme blocks and the cp bridge are generated from this module
 * by `renderThemeCss` (see ../theme/render.ts) — never hand-duplicated — so the
 * light/dark values live in exactly one place.
 */
/** The color token set for light mode (design.md §3). */
export const light = {
    'color-background': 'hsl(0 0% 100%)',
    'color-surface': 'hsl(0 0% 98%)',
    'color-surface-elevated': 'hsl(0 0% 100%)',
    'color-text-primary': 'hsl(0 0% 13%)',
    'color-text-secondary': 'hsl(0 0% 40%)',
    'color-border': 'hsl(0 0% 88%)',
    'color-hairline': 'hsl(0 0% 93%)',
    'color-accent': 'hsl(12 80% 45%)',
    'color-accent-hover': 'hsl(12 80% 38%)',
    'color-on-accent': '#fff',
    cb: 'hsl(0 0% 55%)',
    ok: 'hsl(145 60% 30%)',
    'ok-bg': 'hsl(145 55% 34% / 0.12)',
    draft: 'hsl(35 90% 33%)',
    'draft-bg': 'hsl(35 90% 45% / 0.14)',
    info: 'hsl(212 80% 43%)',
    'info-bg': 'hsl(212 80% 48% / 0.12)',
    danger: 'hsl(0 72% 45%)',
    'danger-bg': 'hsl(0 72% 50% / 0.12)',
    'accent-bg': 'hsl(12 80% 45% / 0.08)',
};
/** The color token set for dark mode (design.md §3). */
export const dark = {
    'color-background': 'hsl(0 0% 10%)',
    'color-surface': 'hsl(0 0% 13%)',
    'color-surface-elevated': 'hsl(0 0% 17%)',
    'color-text-primary': 'hsl(0 0% 96%)',
    'color-text-secondary': 'hsl(0 0% 66%)',
    'color-border': 'hsl(0 0% 25%)',
    'color-hairline': 'hsl(0 0% 22%)',
    'color-accent': 'hsl(14 85% 62%)',
    'color-accent-hover': 'hsl(14 85% 70%)',
    'color-on-accent': 'hsl(0 0% 7%)',
    cb: 'hsl(0 0% 46%)',
    ok: 'hsl(145 55% 60%)',
    'ok-bg': 'hsl(145 55% 60% / 0.16)',
    draft: 'hsl(40 85% 66%)',
    'draft-bg': 'hsl(40 85% 66% / 0.16)',
    info: 'hsl(212 85% 70%)',
    'info-bg': 'hsl(212 85% 70% / 0.16)',
    danger: 'hsl(0 80% 68%)',
    'danger-bg': 'hsl(0 80% 68% / 0.16)',
    'accent-bg': 'hsl(14 85% 62% / 0.16)',
};
/** Non-color scales shared by both themes (design.md §4 + site tokens). */
export const scales = {
    'spacing-xs': '0.5rem',
    'spacing-sm': '1rem',
    'spacing-md': '1.5rem',
    'spacing-lg': '2rem',
    'spacing-xl': '3rem',
    'spacing-2xl': '4rem',
    'radius-sm': '0.5rem',
    'radius-md': '0.75rem',
    'radius-lg': '1rem',
    'font-sans': 'system-ui, -apple-system, sans-serif',
    'font-mono': 'ui-monospace, "Cascadia Code", monospace',
    'shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    'shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    'shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    'transition-fast': '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    'transition-base': '250ms cubic-bezier(0.4, 0, 0.2, 1)',
    'transition-slow': '350ms cubic-bezier(0.4, 0, 0.2, 1)',
    'fs-h1-hero': 'clamp(2rem, 6.5vw, 2.7rem)',
    'fs-h1-section': 'clamp(1.9rem, 7vw, 2.6rem)',
    'fs-lede': '1.22rem',
    'fs-live': '1.14rem',
};
/** Both color themes keyed by name, for the generator. */
export const themes = { light, dark };
//# sourceMappingURL=theme.js.map