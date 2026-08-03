import { LitElement, nothing } from 'lit';
/** Filled tones a badge can take. */
export type BadgeTone = 'danger' | 'info' | 'success' | 'warning' | 'neutral';
/**
 * Small count badge (R4, design.md §5). Renders a numeric `count` inside a
 * filled, rounded pill; when `count <= 0` it renders nothing so callers can bind
 * a live count without conditionally templating the element away. The `tone`
 * selects the fill colour; text stays on-accent/white for contrast.
 */
export declare class CpBadge extends LitElement {
    static styles: import("lit").CSSResult;
    /** The number to display; values <= 0 render nothing. */
    count: number;
    /** Fill colour tone. */
    tone: BadgeTone;
    render(): typeof nothing | import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'cp-badge': CpBadge;
    }
}
//# sourceMappingURL=cp-badge.d.ts.map