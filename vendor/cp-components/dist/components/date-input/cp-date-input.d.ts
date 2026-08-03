import type { TemplateResult } from 'lit';
import { CpFormControl } from '../common/cp-form-control.js';
/**
 * Form-associated date / date-time field (R4/R7, design.md §5/§8). Wraps a native
 * `<input type="date">` or `<input type="datetime-local">` (selected via
 * {@link type}) in Shadow DOM with a bound `<label>`; participates in a real
 * `<form>` through ElementInternals (submits its ISO `value` under `name`) and
 * reports a custom error when `required` and empty or when `invalid` is set. The
 * `min`/`max` bounds pass straight through to the native control. Inherits the
 * shared form/validity/event lifecycle from {@link CpFormControl}.
 *
 * Bridged `--cp-*` tokens carry surface/text/accent/danger (with standalone
 * fallbacks); the resting outline uses the site `--cb` control-border token.
 *
 * @fires cp-input - Bubbling + composed, `detail.value` = live ISO string.
 * @fires cp-change - Bubbling + composed, `detail.value` = committed ISO string.
 */
export declare class CpDateInput extends CpFormControl {
    static styles: import("lit").CSSResult[];
    /** Native input kind: calendar date or local date + time. */
    type: 'date' | 'datetime-local';
    /** Earliest allowed ISO value; passed to the native control's `min`. */
    min: string;
    /** Latest allowed ISO value; passed to the native control's `max`. */
    max: string;
    protected renderControl(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'cp-date-input': CpDateInput;
    }
}
//# sourceMappingURL=cp-date-input.d.ts.map