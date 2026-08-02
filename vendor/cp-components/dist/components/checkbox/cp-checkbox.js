var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, css, nothing } from 'lit';
import { customElement } from 'lit/decorators.js';
import { CpBooleanControl, BOOLEAN_CONTROL_ID } from '../common/cp-boolean-control.js';
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
let CpCheckbox = class CpCheckbox extends CpBooleanControl {
    constructor() {
        super(...arguments);
        /** Syncs state from the native input, then republishes the change. */
        this.handleChange = (event) => {
            const target = event.target;
            if (target instanceof HTMLInputElement) {
                this.checked = target.checked;
                this.emitChange();
            }
        };
    }
    static { this.styles = css `
    :host {
      display: block;
    }

    .field {
      display: inline-flex;
      align-items: center;
      gap: var(--cp-spacing-xs, 0.5rem);
      cursor: pointer;
      font-size: 0.875rem;
      color: var(--cp-color-text-primary, hsl(0 0% 13%));
    }

    .native {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }

    .box {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.25rem;
      height: 1.25rem;
      flex: 0 0 auto;
      color: var(--cp-color-on-accent, #fff);
      background: var(--cp-color-surface, hsl(0 0% 98%));
      border: 1px solid var(--cb, hsl(0 0% 55%));
      border-radius: var(--cp-radius-sm, 0.5rem);
      transition: background var(--cp-transition-fast, 150ms cubic-bezier(0.4, 0, 0.2, 1)),
        border-color var(--cp-transition-fast, 150ms cubic-bezier(0.4, 0, 0.2, 1));
    }

    .native:checked + .box {
      background: var(--cp-color-accent, hsl(12 80% 45%));
      border-color: var(--cp-color-accent, hsl(12 80% 45%));
    }

    .native:focus-visible + .box {
      outline: 2px solid var(--cp-color-accent, hsl(12 80% 45%));
      outline-offset: 2px;
    }

    .native[aria-invalid='true'] + .box {
      border-color: var(--cp-color-danger, hsl(0 72% 45%));
    }

    .native:disabled + .box {
      opacity: 0.5;
    }

    .native:disabled ~ .label {
      opacity: 0.5;
    }

    .required-mark {
      color: var(--cp-color-danger, hsl(0 72% 45%));
    }

    @media (prefers-reduced-motion: reduce) {
      .box {
        transition: none;
      }
    }
  `; }
    render() {
        return html `
      <label class="field" part="field">
        <input
          id=${BOOLEAN_CONTROL_ID}
          class="native"
          type="checkbox"
          part="control"
          .checked=${this.checked}
          value=${this.value}
          ?disabled=${this.disabled}
          ?required=${this.required}
          aria-invalid=${this.hasError ? 'true' : nothing}
          aria-describedby=${this.describedby ? this.describedby : nothing}
          @change=${this.handleChange}
        />
        <span class="box" part="box" aria-hidden="true">
          ${this.checked ? html `<cp-icon name="check" size="16"></cp-icon>` : nothing}
        </span>
        <span class="label" part="label">
          ${this.label}${this.required
            ? html `<span class="required-mark" aria-hidden="true"> *</span>`
            : nothing}
        </span>
      </label>
    `;
    }
};
CpCheckbox = __decorate([
    customElement('cp-checkbox')
], CpCheckbox);
export { CpCheckbox };
//# sourceMappingURL=cp-checkbox.js.map