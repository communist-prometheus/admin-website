var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CpFormControl, fieldStyles } from '../common/cp-form-control.js';
import '../icon/cp-icon.js';
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
let CpSelect = class CpSelect extends CpFormControl {
    constructor() {
        super(...arguments);
        /** Selectable options rendered as native `<option>` elements. */
        this.options = [];
        /** Reads the committed choice out of the native select and republishes it. */
        this.handleSelect = (event) => {
            const target = event.target;
            if (target instanceof HTMLSelectElement) {
                this.value = target.value;
                this.dispatchEvent(new CustomEvent('cp-change', {
                    bubbles: true,
                    composed: true,
                    detail: { value: this.value },
                }));
            }
        };
    }
    static { this.styles = [
        fieldStyles,
        css `
      .select-wrap {
        position: relative;
        display: flex;
      }

      .control {
        appearance: none;
        -webkit-appearance: none;
        width: 100%;
        padding-right: calc(var(--cp-spacing-md, 1.5rem) + 1rem);
        cursor: pointer;
      }

      .chevron {
        position: absolute;
        top: 50%;
        right: var(--cp-spacing-sm, 1rem);
        transform: translateY(-50%);
        pointer-events: none;
        color: var(--cp-color-text-secondary, hsl(0 0% 40%));
      }
    `,
    ]; }
    updated(changed) {
        super.updated(changed);
        const control = this.control;
        if (control instanceof HTMLSelectElement && control.value !== this.value) {
            control.value = this.value;
        }
    }
    renderControl() {
        const bindings = this.controlBindings();
        return html `
      <span class="select-wrap" part="control-wrap">
        <select
          id=${bindings.id}
          class="control"
          part="control"
          ?disabled=${this.disabled}
          ?required=${this.required}
          aria-invalid=${bindings.ariaInvalid}
          aria-required=${bindings.ariaRequired}
          aria-describedby=${bindings.ariaDescribedby}
          @change=${this.handleSelect}
        >
          ${this.placeholder
            ? html `<option value="" disabled ?selected=${this.value === ''}>
                ${this.placeholder}
              </option>`
            : nothing}
          ${this.options.map((option) => html `<option value=${option.value} ?selected=${option.value === this.value}>
                ${option.label}
              </option>`)}
        </select>
        <cp-icon class="chevron" part="chevron" name="chevron-down" size="18"></cp-icon>
      </span>
    `;
    }
};
__decorate([
    property({ type: Array })
], CpSelect.prototype, "options", void 0);
CpSelect = __decorate([
    customElement('cp-select')
], CpSelect);
export { CpSelect };
//# sourceMappingURL=cp-select.js.map