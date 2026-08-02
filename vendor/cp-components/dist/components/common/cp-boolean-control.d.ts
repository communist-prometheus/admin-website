import { LitElement } from 'lit';
import type { PropertyValues } from 'lit';
/** Stable id wiring the inner control to its `<label>` / validity anchor. */
export declare const BOOLEAN_CONTROL_ID = "control";
/**
 * Abstract form-associated boolean control (R4/R7, design.md §5/§8). The
 * string-valued {@link CpFormControl} models a text `value`, so the on/off
 * controls (`cp-checkbox`, `cp-radio`, `cp-switch`) share this sibling base
 * instead: it owns the ElementInternals lifecycle for a boolean `checked`
 * state — publishing `value` into the enclosing native `<form>` only while
 * checked (`setFormValue(checked ? value : null)`), mirroring the
 * required-but-unchecked constraint through `internals.setValidity`, and
 * emitting a bubbling+composed `cp-change` carrying `detail.checked`.
 * Subclasses supply only the declarative inner markup.
 */
export declare abstract class CpBooleanControl extends LitElement {
    /** Opts the element into form participation (spec: form-associated custom element). */
    static readonly formAssociated = true;
    /** Per-instance form/validity bridge; created once at construction. */
    protected readonly internals: ElementInternals;
    /** Checked state; when set, `value` is submitted under `name`. */
    checked: boolean;
    /** Form field name used as the FormData key on submit. */
    name: string;
    /** Value submitted under `name` while `checked` (defaults to the HTML idiom `on`). */
    value: string;
    /** Visible label text, associated with the inner control. */
    label: string;
    /** Disables the inner control and blocks toggling. */
    disabled: boolean;
    /** Marks the field as required; an unchecked state then fails validity. */
    required: boolean;
    /** Space-separated id list wired to the control's `aria-describedby`. */
    describedby: string;
    /** Pristine state restored on `<form>` reset; captured after first render. */
    private defaultChecked;
    /** The rendered inner control, used as the validity anchor. */
    protected get control(): HTMLElement | undefined;
    /** True when `required` but not `checked` — the sole constraint. */
    protected get hasError(): boolean;
    /** Human-readable message paired with the `valueMissing` flag. */
    private get validationMessage();
    firstUpdated(changed: PropertyValues): void;
    updated(changed: PropertyValues): void;
    /** Mirrors `hasError` into ElementInternals so the host matches `:invalid`. */
    private syncValidity;
    /** Restores the pristine checked state when the surrounding form resets. */
    protected formResetCallback(): void;
    /** Reflects a disabled ancestor `<fieldset>` onto the control. */
    protected formDisabledCallback(disabled: boolean): void;
    /** Emits the bubbling+composed component event carrying the boolean state. */
    protected emitChange(): void;
}
//# sourceMappingURL=cp-boolean-control.d.ts.map