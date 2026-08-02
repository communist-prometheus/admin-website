import { LitElement, type TemplateResult } from 'lit';
import '../icon/cp-icon.js';
/**
 * Pagination control (R4/R5, design.md §5). A `<nav>` landmark holding a prev
 * icon-button, the numbered `part="list"` of `part="item"` page buttons, and a
 * next icon-button. The active page is marked `aria-current="page"`; prev/next
 * disable themselves at the first/last page. Any activation emits a `cp-page`
 * event carrying the requested `{ page }`, leaving the owner to update `page`
 * (the control is fully controlled).
 *
 * Theming flows through bridged `--cp-*` tokens (design.md §2) with literal
 * fallbacks so the element renders standalone.
 */
export declare class CpPagination extends LitElement {
    static styles: import("lit").CSSResult;
    /** Active page (1-based, controlled). */
    page: number;
    /** Total number of pages. */
    pages: number;
    private emitPage;
    private renderStep;
    render(): TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'cp-pagination': CpPagination;
    }
}
//# sourceMappingURL=cp-pagination.d.ts.map