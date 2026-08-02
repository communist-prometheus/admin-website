import { LitElement } from 'lit';
/** One segment in a `cp-tabs` strip. */
export interface CpTab {
    readonly id: string;
    readonly label: string;
    readonly disabled?: boolean;
}
/**
 * Rounded-rectangle segmented tabs (R4, design.md §5). Mirrors the public site's
 * category filter: the active segment is a SOLID accent fill (not a tinted pill),
 * inactive segments are transparent with secondary text and a subtle surface
 * hover. Renders an ARIA `tablist` of `tab` buttons with roving `tabindex`,
 * ArrowLeft/ArrowRight focus movement, Home/End, and Enter/Space activation.
 * Selecting an enabled tab updates `active` and emits a bubbling+composed
 * `cp-tab-change` `CustomEvent` with `detail: { id }`; disabled tabs are inert.
 */
export declare class CpTabs extends LitElement {
    static styles: import("lit").CSSResult;
    /** The tab definitions rendered left-to-right. */
    tabs: ReadonlyArray<CpTab>;
    /** The active tab id. */
    active: string;
    /** All rendered tab buttons, in `tabs` order (disabled ones included). */
    private get tabButtons();
    /** The id that carries `tabindex="0"`: active-if-enabled, else first enabled. */
    private focusableId;
    /** Nearest enabled index from `from` stepping by `dir`, wrapping around. */
    private nextEnabled;
    private focusIndex;
    private selectTab;
    private handleKeydown;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'cp-tabs': CpTabs;
    }
}
//# sourceMappingURL=cp-tabs.d.ts.map