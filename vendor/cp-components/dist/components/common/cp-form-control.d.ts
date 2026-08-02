import { LitElement, nothing } from 'lit';
import type { PropertyValues, TemplateResult } from 'lit';
/**
 * Shared field styling for the form-associated controls (R4/R7, design.md §5/§8).
 * Uses bridged `--cp-*` tokens for surface/text/accent/danger and the site
 * control-border token `--cb` (not a `--cp-*` token; it inherits through Shadow
 * DOM from `:root`) for the resting outline — all with fallbacks so the controls
 * render standalone. Consumed by both `cp-input` and `cp-textarea`.
 */
export declare const fieldStyles: import("lit").CSSResult;
/**
 * Abstract form-associated control (R4/R7, design.md §5/§8). Owns the
 * ElementInternals lifecycle shared by `cp-input` and `cp-textarea`: it publishes
 * `value` into the enclosing native `<form>` under `name` via
 * `internals.setFormValue`, mirrors constraint state through
 * `internals.setValidity` (custom error when `required` and empty, or when
 * `invalid` is set), and emits bubbling+composed `cp-input`/`cp-change` events.
 * Subclasses supply only the declarative inner control template via
 * {@link renderControl}, keeping the presentation layer free of form logic.
 */
export declare abstract class CpFormControl extends LitElement {
    /** Opts the element into form participation (spec: form-associated custom element). */
    static readonly formAssociated = true;
    /** Per-instance form/validity bridge; created once at construction. */
    protected readonly internals: ElementInternals;
    /** Current control value; submitted under `name` inside a native form. */
    value: string;
    /** Form field name used as the FormData key on submit. */
    name: string;
    /** Visible label text, associated with the inner control via `for`/`id`. */
    label: string;
    /** Disables the inner control and blocks input. */
    disabled: boolean;
    /** Marks the field as required; empty value then fails validity. */
    required: boolean;
    /** Forces the invalid presentation/validity regardless of value. */
    invalid: boolean;
    /** Space-separated id list wired to the control's `aria-describedby`. */
    describedby: string;
    /** Placeholder text for the inner control. */
    placeholder: string;
    /** The rendered inner control, used as the validity anchor. */
    protected get control(): HTMLElement | undefined;
    /** True when the field must report a custom constraint error. */
    private get hasError();
    /** Human-readable message paired with the custom validity flag. */
    private get validationMessage();
    updated(changed: PropertyValues): void;
    /** Mirrors `hasError` into ElementInternals so the host matches `:invalid`. */
    private syncValidity;
    /** Resets to the pristine empty value when the surrounding form resets. */
    protected formResetCallback(): void;
    /** Reflects a disabled ancestor `<fieldset>` onto the control. */
    protected formDisabledCallback(disabled: boolean): void;
    /** Emits a value-carrying, bubbling+composed component event. */
    private emit;
    /** Pulls the live value out of the inner control on each keystroke. */
    protected handleInput: (event: Event) => void;
    /** Re-emits the committed value on `change`. */
    protected handleChange: () => void;
    /** Shared aria wiring for the inner control (id, validity, description). */
    protected controlBindings(): {
        readonly id: string;
        readonly ariaInvalid: 'true' | typeof nothing;
        readonly ariaRequired: 'true' | typeof nothing;
        readonly ariaDescribedby: string | typeof nothing;
    };
    /** Subclass hook: the declarative inner control markup. */
    protected abstract renderControl(): TemplateResult;
    render(): TemplateResult;
}
//# sourceMappingURL=cp-form-control.d.ts.map