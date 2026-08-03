/** One emitted CSS block: a selector and its custom-property declarations. */
export interface ThemeBlock {
    readonly selector: string;
    readonly tokens: Readonly<Record<string, string>>;
}
/**
 * The complete `--cp-*` → site-token bridge (design.md §2). Declared once on the
 * base `:root`; because `var()` re-resolves at use-site, this single mapping
 * re-themes every cp component and flips with the active theme. The bridge-
 * completeness test asserts every `--cp-*` read in cp CSS has an entry here.
 */
export declare function bridgeDeclarations(): Readonly<Record<string, string>>;
/** The four atomic theme blocks (design.md §3), base carrying scales + bridge. */
export declare function themeBlocks(): readonly ThemeBlock[];
/** The full theme-layer CSS: four atomic blocks, deterministic order. */
export declare function renderThemeCss(): string;
//# sourceMappingURL=render.d.ts.map