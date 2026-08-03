import type { TemplateResult } from 'lit';
import type { PropertyValues } from 'lit';
import { CpFormControl } from '../common/cp-form-control.js';
import '../icon/cp-icon.js';
/** One selectable option: the submitted `value` and its visible `label`. */
export interface CpSelectOption {
    readonly value: string;
    readonly label: string;
}
/**
 * Single-choice, form-associated dropdown (R4/R7, design.md §5/§8). A native
 * `<select>` wrapped in Shadow DOM with a bound `<label>` and a decorative
 * `<cp-icon name="chevron-down">` affordance; participates in a real `<form>`
 * through ElementInternals (submits its `value` under `name`, reports a custom
 * error when `required` and empty or when `invalid` is set). Inherits the
 * shared form/validity lifecycle from {@link CpFormControl} and renders its
 * `options` as native `<option>`s so keyboard, screen-reader and native popup
 * behaviour come for free.
 */
export declare class CpSelect extends CpFormControl {
    static styles: import("lit").CSSResult[];
    /** Selectable options rendered as native `<option>` elements. */
    options: readonly CpSelectOption[];
    /** Reads the committed choice out of the native select and republishes it. */
    private handleSelect;
    updated(changed: PropertyValues): void;
    protected renderControl(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'cp-select': CpSelect;
    }
}
//# sourceMappingURL=cp-select.d.ts.map