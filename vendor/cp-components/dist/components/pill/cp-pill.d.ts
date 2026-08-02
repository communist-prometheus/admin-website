import { LitElement } from 'lit';
/**
 * Solid-fill category/topic pill (R4, design.md §5). The site's filled uppercase
 * pill: a solid accent block whose slotted content is the label. Purely
 * presentational and non-interactive. Consumers recolour a single instance by
 * setting the local `--tc` (fill) and `--tc-fg` (foreground) properties inline —
 * the fill falls back to the accent bridge token, so an un-overridden pill still
 * themes and flips with light/dark.
 */
export declare class CpPill extends LitElement {
    static styles: import("lit").CSSResult;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'cp-pill': CpPill;
    }
}
//# sourceMappingURL=cp-pill.d.ts.map