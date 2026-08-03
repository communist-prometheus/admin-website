import type { TemplateResult } from 'lit';
import { CpFormControl } from '../common/cp-form-control.js';
/**
 * Multi-line, form-associated text field (R4/R7, design.md §5/§8). A native
 * `<textarea>` wrapped in Shadow DOM with a bound `<label>`; participates in a
 * real `<form>` through ElementInternals (submits its `value` under `name`,
 * reports a custom error when `required` and empty or when `invalid` is set).
 * Inherits the shared form/validity/event lifecycle from {@link CpFormControl}
 * and only adds the `rows` passthrough for the concrete textarea element.
 */
export declare class CpTextarea extends CpFormControl {
    static styles: import("lit").CSSResult[];
    /** Visible row count of the inner textarea. */
    rows: number;
    protected renderControl(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'cp-textarea': CpTextarea;
    }
}
//# sourceMappingURL=cp-textarea.d.ts.map