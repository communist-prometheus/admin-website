import { LitElement } from 'lit';
import '../icon/cp-icon.js';
/**
 * List chip (R4/R7, design.md §5). Two modes on one primitive:
 *
 * - Default: a filled label chip. When `removable`, a trailing icon-button
 *   (`part="remove"`, accessible-named) emits a bubbling+composed `cp-remove`
 *   and stops propagation so a surrounding chip-list click handler is not also
 *   triggered.
 * - `add`: a ghost/dashed "＋ label" control that emits `cp-add` on click — the
 *   site's "add tag/filter" affordance at the end of a chip list.
 *
 * Decorative marks come from `<cp-icon>`; Unicode glyphs are never used.
 */
export declare class CpChip extends LitElement {
    static styles: import("lit").CSSResult;
    /** Visible chip label. */
    label: string;
    /** Renders a trailing remove control that emits `cp-remove`. */
    removable: boolean;
    /** Renders the ghost/dashed "＋ label" add control that emits `cp-add`. */
    add: boolean;
    private handleAdd;
    private handleRemove;
    private renderAdd;
    private renderLabel;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'cp-chip': CpChip;
    }
}
//# sourceMappingURL=cp-chip.d.ts.map