import { LitElement } from 'lit';
/** Placeholder geometry: inline text lines or a single solid block. */
export type SkeletonVariant = 'text' | 'block';
/**
 * Loading skeleton (R5/NFR-2, design.md §5). Renders one or more shimmering
 * placeholder shapes (`part="block"`) while real content loads. The `text`
 * variant draws `lines` stacked bars (the last one shortened); the `block`
 * variant draws a single tall block. The shimmer runs on `transform`/background
 * only and is disabled under `prefers-reduced-motion: reduce`, leaving a static
 * placeholder.
 *
 * The shapes are decorative (`aria-hidden="true"`); a visually-hidden
 * `role="status"` "Loading" node carries the accessible announcement.
 */
export declare class CpSkeleton extends LitElement {
    static styles: import("lit").CSSResult;
    /** Number of placeholder lines in the `text` variant (ignored for `block`). */
    lines: number;
    /** Placeholder geometry. */
    variant: SkeletonVariant;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'cp-skeleton': CpSkeleton;
    }
}
//# sourceMappingURL=cp-skeleton.d.ts.map