var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { CpFormControl, fieldStyles } from '../common/cp-form-control.js';
import { isHexColor, normalizeHex, swatchValue } from './hex.js';
/**
 * Form-associated hex color field (R4/R7, design.md §5/§8). Pairs a native
 * `<input type="color">` swatch with a text field for the `#rrggbb` value; editing
 * either one updates {@link value} and re-renders the other, so the two stay in
 * sync. Participates in a real `<form>` through ElementInternals (submits `value`
 * under `name`), and — when `required` or `invalid` is set — reports a custom
 * constraint error for empty or malformed hex. Extends {@link CpFormControl},
 * reusing its label/validity/form lifecycle and adding the twin-control sync.
 *
 * Bridged `--cp-*` tokens carry surface/text/accent/danger (with standalone
 * fallbacks); the resting outline uses the site `--cb` control-border token.
 *
 * @fires cp-input - Bubbling + composed, `detail.value` = live hex on each edit.
 * @fires cp-change - Bubbling + composed, `detail.value` = committed hex.
 */
let CpColorInput = class CpColorInput extends CpFormControl {
    constructor() {
        super(...arguments);
        /** Swatch drives the value directly (native color input yields valid hex). */
        this.onSwatchInput = (event) => {
            const target = event.target;
            if (target instanceof HTMLInputElement) {
                this.commit(normalizeHex(target.value), 'cp-input');
            }
        };
        /** Text field drives the value after normalization; the swatch mirrors it. */
        this.onHexInput = (event) => {
            const target = event.target;
            if (target instanceof HTMLInputElement) {
                this.commit(normalizeHex(target.value), 'cp-input');
            }
        };
        /** Re-emits the committed value on `change` from either control. */
        this.onChange = () => {
            this.dispatchEvent(new CustomEvent('cp-change', {
                bubbles: true,
                composed: true,
                detail: { value: this.value },
            }));
        };
    }
    static { this.styles = [
        fieldStyles,
        css `
      .control-group {
        display: flex;
        gap: var(--cp-spacing-xs, 0.5rem);
        align-items: stretch;
      }

      .swatch {
        inline-size: var(--cp-spacing-xl, 3rem);
        padding: 0;
        border: 1px solid var(--cb, hsl(0 0% 55%));
        border-radius: var(--cp-radius-sm, 0.5rem);
        background: var(--cp-color-surface, hsl(0 0% 98%));
        cursor: pointer;
        transition: border-color var(--cp-transition-fast, 150ms cubic-bezier(0.4, 0, 0.2, 1));
      }

      .swatch:focus-visible {
        outline: 2px solid var(--cp-color-accent, hsl(12 80% 45%));
        outline-offset: 1px;
        border-color: var(--cp-color-accent, hsl(12 80% 45%));
      }

      .swatch[aria-invalid='true'] {
        border-color: var(--cp-color-danger, hsl(0 72% 45%));
      }

      .swatch:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .hex {
        flex: 1;
        min-inline-size: 0;
      }

      @media (prefers-reduced-motion: reduce) {
        .swatch {
          transition: none;
        }
      }
    `,
    ]; }
    /** True when a non-empty value is present but not a valid `#rrggbb` hex. */
    get hasHexFormatError() {
        return (this.required || this.invalid) && this.value !== '' && !isHexColor(this.value);
    }
    /** Sets the value from an edit and re-emits it as a component event. */
    commit(next, type) {
        this.value = next;
        this.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail: { value: this.value } }));
    }
    updated(changed) {
        super.updated(changed);
        if (this.hasHexFormatError) {
            this.internals.setValidity({ patternMismatch: true }, 'Enter a valid hex color, e.g. #2563eb', this.control);
        }
    }
    renderControl() {
        const bindings = this.controlBindings();
        return html `
      <div class="control-group" part="control">
        <input
          id=${bindings.id}
          class="swatch"
          type="color"
          .value=${swatchValue(this.value)}
          ?disabled=${this.disabled}
          aria-invalid=${bindings.ariaInvalid}
          aria-required=${bindings.ariaRequired}
          aria-describedby=${bindings.ariaDescribedby}
          @input=${this.onSwatchInput}
          @change=${this.onChange}
        />
        <input
          class="control hex"
          type="text"
          inputmode="text"
          spellcheck="false"
          autocomplete="off"
          maxlength="7"
          pattern="#[0-9a-fA-F]{6}"
          placeholder=${this.placeholder || '#000000'}
          aria-label=${this.label ? `${this.label} hex value` : 'Hex color value'}
          .value=${this.value}
          ?disabled=${this.disabled}
          ?required=${this.required}
          aria-invalid=${bindings.ariaInvalid}
          aria-required=${bindings.ariaRequired}
          @input=${this.onHexInput}
          @change=${this.onChange}
        />
      </div>
    `;
    }
};
CpColorInput = __decorate([
    customElement('cp-color-input')
], CpColorInput);
export { CpColorInput };
//# sourceMappingURL=cp-color-input.js.map