import { LitElement } from 'lit';
/**
 * Surface container (R4, design.md §5). Groups related content on the site's
 * elevated surface. `hoverable`/`elevated` keep their original shadow treatment
 * and emit `cp-card-click`. `interactive` promotes the whole card to a single
 * focusable control (tabindex 0, `role="button"`, `:focus-visible` ring, hover
 * lift) that emits a bubbling+composed `cp-click` on click and Enter/Space — the
 * pattern used by the review-queue list items. Named slots (`pill`, `title`,
 * `summary`, `meta`, `actions`) lay out a headed card; the default slot carries
 * free-form body content. Empty named regions collapse after `slotchange`.
 */
export declare class CpCard extends LitElement {
    static styles: import("lit").CSSResult;
    /** Original hover-shadow treatment; emits `cp-card-click`. */
    hoverable: boolean;
    /** Raises the card onto a resting shadow. */
    elevated: boolean;
    /**
     * Promotes the card to a single focusable control that emits `cp-click` on
     * pointer and keyboard (Enter/Space) activation, with a hover lift.
     */
    interactive: boolean;
    /** Names of slots currently resolving to no flattened content. */
    private empties;
    private get activatable();
    private activate;
    private handleClick;
    private handleKeydown;
    firstUpdated(): void;
    private handleSlotChange;
    private syncEmpties;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'cp-card': CpCard;
    }
}
//# sourceMappingURL=cp-card.d.ts.map