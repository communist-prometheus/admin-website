/**
 * Generates the admin theme layer from the single token source
 * (../tokens/theme.ts): the four atomic theme blocks plus the cp bridge, so the
 * split-theme regression (R2) is structurally impossible — light/dark values are
 * never hand-duplicated. See design.md §2–§3.
 */
import { light, dark, scales } from '../tokens/theme.js';
const BASE = ':root';
const LIGHT = ':root[data-theme="light"]';
const MEDIA = '@media (prefers-color-scheme: dark) :root:not([data-theme="light"])';
const DARK = ':root[data-theme="dark"]';
/**
 * The complete `--cp-*` → site-token bridge (design.md §2). Declared once on the
 * base `:root`; because `var()` re-resolves at use-site, this single mapping
 * re-themes every cp component and flips with the active theme. The bridge-
 * completeness test asserts every `--cp-*` read in cp CSS has an entry here.
 */
export function bridgeDeclarations() {
    return {
        'cp-color-accent': 'var(--color-accent)',
        'cp-color-accent-hover': 'var(--color-accent-hover)',
        'cp-color-on-accent': 'var(--color-on-accent)',
        'cp-color-text-primary': 'var(--color-text-primary)',
        'cp-color-text-secondary': 'var(--color-text-secondary)',
        'cp-color-background': 'var(--color-background)',
        'cp-color-surface': 'var(--color-surface)',
        'cp-color-surface-elevated': 'var(--color-surface-elevated)',
        'cp-color-border': 'var(--color-border)',
        'cp-spacing-xs': 'var(--spacing-xs)',
        'cp-spacing-sm': 'var(--spacing-sm)',
        'cp-spacing-md': 'var(--spacing-md)',
        'cp-spacing-lg': 'var(--spacing-lg)',
        'cp-spacing-xl': 'var(--spacing-xl)',
        'cp-radius-sm': 'var(--radius-sm)',
        'cp-radius-md': 'var(--radius-md)',
        'cp-radius-lg': 'var(--radius-lg)',
        'cp-shadow-sm': 'var(--shadow-sm)',
        'cp-shadow-md': 'var(--shadow-md)',
        'cp-shadow-lg': 'var(--shadow-lg)',
        'cp-transition-fast': 'var(--transition-fast)',
        'cp-transition-base': 'var(--transition-base)',
        'cp-transition-slow': 'var(--transition-slow)',
        'cp-fs-h1-hero': 'var(--fs-h1-hero)',
        'cp-fs-h1-section': 'var(--fs-h1-section)',
        'cp-fs-lede': 'var(--fs-lede)',
        'cp-fs-live': 'var(--fs-live)',
        // Generic semantic tones — the library stays domain-free; the admin's
        // semantic token names (ok/draft/info/danger) map onto them here.
        'cp-color-success': 'var(--ok)',
        'cp-color-success-bg': 'var(--ok-bg)',
        'cp-color-warning': 'var(--draft)',
        'cp-color-warning-bg': 'var(--draft-bg)',
        'cp-color-info': 'var(--info)',
        'cp-color-info-bg': 'var(--info-bg)',
        'cp-color-danger': 'var(--danger)',
        'cp-color-danger-bg': 'var(--danger-bg)',
    };
}
/** The four atomic theme blocks (design.md §3), base carrying scales + bridge. */
export function themeBlocks() {
    return [
        { selector: BASE, tokens: { ...light, ...scales, ...bridgeDeclarations() } },
        { selector: LIGHT, tokens: { ...light } },
        { selector: MEDIA, tokens: { ...dark } },
        { selector: DARK, tokens: { ...dark } },
    ];
}
/** Renders one block's declarations, wrapping the `@media` block's inner rule. */
function renderBlock(block) {
    const body = Object.entries(block.tokens)
        .map(([name, value]) => `  --${name}: ${value};`)
        .join('\n');
    const mediaSplit = block.selector.indexOf(' :root');
    const isMedia = block.selector.startsWith('@media');
    return isMedia
        ? `${block.selector.slice(0, mediaSplit)} {\n  ${block.selector.slice(mediaSplit + 1)} {\n${body}\n  }\n}`
        : `${block.selector} {\n${body}\n}`;
}
/** The full theme-layer CSS: four atomic blocks, deterministic order. */
export function renderThemeCss() {
    const banner = '/* GENERATED from cp-components tokens/theme.ts — do not edit by hand. */\n';
    return `${banner}${themeBlocks().map(renderBlock).join('\n\n')}\n`;
}
//# sourceMappingURL=render.js.map