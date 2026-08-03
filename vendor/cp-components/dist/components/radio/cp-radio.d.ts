import type { TemplateResult } from 'lit';
import { CpBooleanControl } from '../common/cp-boolean-control.js';
/**
 * Form-associated radio button (R4/R7, design.md §5/§8). A visually-hidden
 * native `<input type="radio">` supplies role, focus and keyboard behaviour
 * while a custom-styled ring with a CSS dot provides the site presentation; the
 * input lives inside its `<label>` for implicit name association. Because each
 * `cp-radio` owns a separate Shadow DOM the browser cannot form a native group,
 * so selecting one deselects its same-`name` peers within the nearest `<form>`
 * (or root) explicitly. Participates in a real `<form>` through ElementInternals
 * via the shared {@link CpBooleanControl}: submits `value` under `name` only
 * while checked and emits a bubbling+composed `cp-change` carrying
 * `detail.checked`.
 */
export declare class CpRadio extends CpBooleanControl {
    static styles: import("lit").CSSResult;
    /** The nearest form (else root) scoping same-`name` peer deselection. */
    private scope;
    /** Unchecks same-`name` peers so only this radio stays selected. */
    private deselectPeers;
    /** Syncs state from the native input, exclusivity, then republishes. */
    private handleChange;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'cp-radio': CpRadio;
    }
}
//# sourceMappingURL=cp-radio.d.ts.map