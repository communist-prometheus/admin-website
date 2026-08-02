var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
/**
 * Shared field styling for the form-associated controls (R4/R7, design.md §5/§8).
 * Uses bridged `--cp-*` tokens for surface/text/accent/danger and the site
 * control-border token `--cb` (not a `--cp-*` token; it inherits through Shadow
 * DOM from `:root`) for the resting outline — all with fallbacks so the controls
 * render standalone. Consumed by both `cp-input` and `cp-textarea`.
 */
export const fieldStyles = css `
  :host {
    display: block;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: var(--cp-spacing-xs, 0.5rem);
  }

  label {
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--cp-color-text-primary, hsl(0 0% 13%));
  }

  .required-mark {
    color: var(--cp-color-danger, hsl(0 72% 45%));
  }

  .control {
    font-family: inherit;
    font-size: inherit;
    color: var(--cp-color-text-primary, hsl(0 0% 13%));
    background: var(--cp-color-surface, hsl(0 0% 98%));
    border: 1px solid var(--cb, hsl(0 0% 55%));
    border-radius: var(--cp-radius-sm, 0.5rem);
    padding: var(--cp-spacing-sm, 1rem);
    transition: border-color var(--cp-transition-fast, 150ms cubic-bezier(0.4, 0, 0.2, 1));
  }

  .control:focus-visible {
    outline: 2px solid var(--cp-color-accent, hsl(12 80% 45%));
    outline-offset: 1px;
    border-color: var(--cp-color-accent, hsl(12 80% 45%));
  }

  .control[aria-invalid='true'] {
    border-color: var(--cp-color-danger, hsl(0 72% 45%));
  }

  .control:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (prefers-reduced-motion: reduce) {
    .control {
      transition: none;
    }
  }
`;
/** Stable id/for pair wiring the inner control to its `<label>`. */
const CONTROL_ID = 'control';
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
export class CpFormControl extends LitElement {
    constructor() {
        super(...arguments);
        /** Per-instance form/validity bridge; created once at construction. */
        this.internals = this.attachInternals();
        /** Current control value; submitted under `name` inside a native form. */
        this.value = '';
        /** Form field name used as the FormData key on submit. */
        this.name = '';
        /** Visible label text, associated with the inner control via `for`/`id`. */
        this.label = '';
        /** Disables the inner control and blocks input. */
        this.disabled = false;
        /** Marks the field as required; empty value then fails validity. */
        this.required = false;
        /** Forces the invalid presentation/validity regardless of value. */
        this.invalid = false;
        /** Space-separated id list wired to the control's `aria-describedby`. */
        this.describedby = '';
        /** Placeholder text for the inner control. */
        this.placeholder = '';
        /** Pulls the live value out of the inner control on each keystroke. */
        this.handleInput = (event) => {
            const target = event.target;
            if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
                this.value = target.value;
                this.emit('cp-input');
            }
        };
        /** Re-emits the committed value on `change`. */
        this.handleChange = () => {
            this.emit('cp-change');
        };
    }
    /** Opts the element into form participation (spec: form-associated custom element). */
    static { this.formAssociated = true; }
    /** The rendered inner control, used as the validity anchor. */
    get control() {
        const found = this.renderRoot.querySelector(`#${CONTROL_ID}`);
        return found instanceof HTMLElement ? found : undefined;
    }
    /** True when the field must report a custom constraint error. */
    get hasError() {
        return this.invalid || (this.required && this.value === '');
    }
    /** Human-readable message paired with the custom validity flag. */
    get validationMessage() {
        if (this.required && this.value === '') {
            return this.label ? `${this.label} is required` : 'This field is required';
        }
        return 'Invalid value';
    }
    updated(changed) {
        this.internals.setFormValue(this.value);
        this.syncValidity();
        super.updated(changed);
    }
    /** Mirrors `hasError` into ElementInternals so the host matches `:invalid`. */
    syncValidity() {
        if (this.hasError) {
            this.internals.setValidity({ customError: true }, this.validationMessage, this.control);
        }
        else {
            this.internals.setValidity({});
        }
    }
    /** Resets to the pristine empty value when the surrounding form resets. */
    formResetCallback() {
        this.value = '';
    }
    /** Reflects a disabled ancestor `<fieldset>` onto the control. */
    formDisabledCallback(disabled) {
        this.disabled = disabled;
    }
    /** Emits a value-carrying, bubbling+composed component event. */
    emit(type) {
        this.dispatchEvent(new CustomEvent(type, {
            bubbles: true,
            composed: true,
            detail: { value: this.value },
        }));
    }
    /** Shared aria wiring for the inner control (id, validity, description). */
    controlBindings() {
        return {
            id: CONTROL_ID,
            ariaInvalid: this.hasError ? 'true' : nothing,
            ariaRequired: this.required ? 'true' : nothing,
            ariaDescribedby: this.describedby ? this.describedby : nothing,
        };
    }
    render() {
        return html `
      <div class="field" part="field">
        <label part="label" for=${CONTROL_ID}>
          ${this.label}${this.required
            ? html `<span class="required-mark" aria-hidden="true"> *</span>`
            : nothing}
        </label>
        ${this.renderControl()}
      </div>
    `;
    }
}
__decorate([
    property({ type: String })
], CpFormControl.prototype, "value", void 0);
__decorate([
    property({ type: String })
], CpFormControl.prototype, "name", void 0);
__decorate([
    property({ type: String })
], CpFormControl.prototype, "label", void 0);
__decorate([
    property({ type: Boolean })
], CpFormControl.prototype, "disabled", void 0);
__decorate([
    property({ type: Boolean })
], CpFormControl.prototype, "required", void 0);
__decorate([
    property({ type: Boolean })
], CpFormControl.prototype, "invalid", void 0);
__decorate([
    property({ type: String })
], CpFormControl.prototype, "describedby", void 0);
__decorate([
    property({ type: String })
], CpFormControl.prototype, "placeholder", void 0);
//# sourceMappingURL=cp-form-control.js.map