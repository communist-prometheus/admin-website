import type { TemplateResult } from 'lit';
import { CpFormControl } from '../common/cp-form-control.js';
/**
 * Single-line, form-associated text field (R4/R7, design.md §5/§8). A native
 * `<input>` wrapped in Shadow DOM with a bound `<label>`; participates in a real
 * `<form>` through ElementInternals (submits its `value` under `name`, reports a
 * custom error when `required` and empty or when `invalid` is set). Inherits the
 * shared form/validity/event lifecycle from {@link CpFormControl} and only adds
 * the `type` passthrough for the concrete input element.
 */
export declare class CpInput extends CpFormControl {
    static styles: import("lit").CSSResult[];
    /** Native input type (text/email/url/number/tel/search/password…). */
    type: string;
    protected renderControl(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'cp-input': CpInput;
    }
}
//# sourceMappingURL=cp-input.d.ts.map