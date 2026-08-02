/**
 * Single source of truth for the Communist Prometheus theme tokens.
 *
 * Values are locked in the admin-redesign design-system spec (design.md §3–§4)
 * and reconciled with the public site (`public-website/src/styles/theme.css`).
 * The four atomic theme blocks and the cp bridge are generated from this module
 * by `renderThemeCss` (see ../theme/render.ts) — never hand-duplicated — so the
 * light/dark values live in exactly one place.
 */
/** CSS custom-property name (without the leading `--`) → color value. */
export type ColorTokens = Readonly<Record<string, string>>;
/** The color token set for light mode (design.md §3). */
export declare const light: ColorTokens;
/** The color token set for dark mode (design.md §3). */
export declare const dark: ColorTokens;
/** Non-color scales shared by both themes (design.md §4 + site tokens). */
export declare const scales: {
    readonly 'spacing-xs': "0.5rem";
    readonly 'spacing-sm': "1rem";
    readonly 'spacing-md': "1.5rem";
    readonly 'spacing-lg': "2rem";
    readonly 'spacing-xl': "3rem";
    readonly 'spacing-2xl': "4rem";
    readonly 'radius-sm': "0.5rem";
    readonly 'radius-md': "0.75rem";
    readonly 'radius-lg': "1rem";
    readonly 'font-sans': "system-ui, -apple-system, sans-serif";
    readonly 'font-mono': "ui-monospace, \"Cascadia Code\", monospace";
    readonly 'shadow-sm': "0 1px 2px 0 rgb(0 0 0 / 0.05)";
    readonly 'shadow-md': "0 4px 6px -1px rgb(0 0 0 / 0.1)";
    readonly 'shadow-lg': "0 10px 15px -3px rgb(0 0 0 / 0.1)";
    readonly 'transition-fast': "150ms cubic-bezier(0.4, 0, 0.2, 1)";
    readonly 'transition-base': "250ms cubic-bezier(0.4, 0, 0.2, 1)";
    readonly 'transition-slow': "350ms cubic-bezier(0.4, 0, 0.2, 1)";
    readonly 'fs-h1-hero': "clamp(2rem, 6.5vw, 2.7rem)";
    readonly 'fs-h1-section': "clamp(1.9rem, 7vw, 2.6rem)";
    readonly 'fs-lede': "1.22rem";
    readonly 'fs-live': "1.14rem";
};
/** Both color themes keyed by name, for the generator. */
export declare const themes: {
    readonly light: Readonly<Record<string, string>>;
    readonly dark: Readonly<Record<string, string>>;
};
/** Theme name. */
export type ThemeName = keyof typeof themes;
//# sourceMappingURL=theme.d.ts.map