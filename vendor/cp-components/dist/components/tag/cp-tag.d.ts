import { LitElement } from 'lit';
/** Semantic status tone for the tag. */
export type TagTone = 'success' | 'warning' | 'info' | 'danger' | 'neutral';
/**
 * Tinted status badge (R4, design.md §5). Distinct from the solid `cp-pill`:
 * a low-emphasis, mixed-case chip whose fill/foreground come from a semantic
 * tone pair (`--cp-color-<tone>-bg` / `--cp-color-<tone>`). `neutral` falls back
 * to the surface + secondary-text tokens. The tone maps to a class so every
 * colour resolves through the theme bridge and flips with light/dark.
 */
export declare class CpTag extends LitElement {
    static styles: import("lit").CSSResult;
    /** Semantic tone; selects the background/foreground token pair. */
    tone: TagTone;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'cp-tag': CpTag;
    }
}
//# sourceMappingURL=cp-tag.d.ts.map