import type { TemplateResult } from 'lit';
import { CpBooleanControl } from '../common/cp-boolean-control.js';
import '../icon/cp-icon.js';
/**
 * Form-associated checkbox (R4/R7, design.md §5/§8). A visually-hidden native
 * `<input type="checkbox">` supplies role, focus and keyboard behaviour while a
 * custom-styled box (with a `<cp-icon name="check">` when `checked`) provides
 * the site presentation; the input lives inside its `<label>` for implicit name
 * association. Participates in a real `<form>` through ElementInternals via the
 * shared {@link CpBooleanControl}: submits `value` (default `on`) under `name`
 * only while checked, reports `valueMissing` when `required` and unchecked, and
 * emits a bubbling+composed `cp-change` carrying `detail.checked`.
 */
export declare class CpCheckbox extends CpBooleanControl {
    static styles: import("lit").CSSResult;
    /** Syncs state from the native input, then republishes the change. */
    private handleChange;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'cp-checkbox': CpCheckbox;
    }
}
//# sourceMappingURL=cp-checkbox.d.ts.map