var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
/** Stable id wiring the inner control to its `<label>` / validity anchor. */
export const BOOLEAN_CONTROL_ID = 'control';
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
export class CpBooleanControl extends LitElement {
    constructor() {
        super(...arguments);
        /** Per-instance form/validity bridge; created once at construction. */
        this.internals = this.attachInternals();
        /** Checked state; when set, `value` is submitted under `name`. */
        this.checked = false;
        /** Form field name used as the FormData key on submit. */
        this.name = '';
        /** Value submitted under `name` while `checked` (defaults to the HTML idiom `on`). */
        this.value = 'on';
        /** Visible label text, associated with the inner control. */
        this.label = '';
        /** Disables the inner control and blocks toggling. */
        this.disabled = false;
        /** Marks the field as required; an unchecked state then fails validity. */
        this.required = false;
        /** Space-separated id list wired to the control's `aria-describedby`. */
        this.describedby = '';
        /** Pristine state restored on `<form>` reset; captured after first render. */
        this.defaultChecked = false;
    }
    /** Opts the element into form participation (spec: form-associated custom element). */
    static { this.formAssociated = true; }
    /** The rendered inner control, used as the validity anchor. */
    get control() {
        const found = this.renderRoot.querySelector(`#${BOOLEAN_CONTROL_ID}`);
        return found instanceof HTMLElement ? found : undefined;
    }
    /** True when `required` but not `checked` — the sole constraint. */
    get hasError() {
        return this.required && !this.checked;
    }
    /** Human-readable message paired with the `valueMissing` flag. */
    get validationMessage() {
        return this.label ? `${this.label} is required` : 'This field is required';
    }
    firstUpdated(changed) {
        this.defaultChecked = this.checked;
        super.firstUpdated(changed);
    }
    updated(changed) {
        this.internals.setFormValue(this.checked ? this.value : null);
        this.syncValidity();
        super.updated(changed);
    }
    /** Mirrors `hasError` into ElementInternals so the host matches `:invalid`. */
    syncValidity() {
        if (this.hasError) {
            this.internals.setValidity({ valueMissing: true }, this.validationMessage, this.control);
        }
        else {
            this.internals.setValidity({});
        }
    }
    /** Restores the pristine checked state when the surrounding form resets. */
    formResetCallback() {
        this.checked = this.defaultChecked;
    }
    /** Reflects a disabled ancestor `<fieldset>` onto the control. */
    formDisabledCallback(disabled) {
        this.disabled = disabled;
    }
    /** Emits the bubbling+composed component event carrying the boolean state. */
    emitChange() {
        this.dispatchEvent(new CustomEvent('cp-change', {
            bubbles: true,
            composed: true,
            detail: { checked: this.checked },
        }));
    }
}
__decorate([
    property({ type: Boolean })
], CpBooleanControl.prototype, "checked", void 0);
__decorate([
    property({ type: String })
], CpBooleanControl.prototype, "name", void 0);
__decorate([
    property({ type: String })
], CpBooleanControl.prototype, "value", void 0);
__decorate([
    property({ type: String })
], CpBooleanControl.prototype, "label", void 0);
__decorate([
    property({ type: Boolean })
], CpBooleanControl.prototype, "disabled", void 0);
__decorate([
    property({ type: Boolean })
], CpBooleanControl.prototype, "required", void 0);
__decorate([
    property({ type: String })
], CpBooleanControl.prototype, "describedby", void 0);
//# sourceMappingURL=cp-boolean-control.js.map